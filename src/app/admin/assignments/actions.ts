
"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AssignmentType = "scenario" | "mcq" | "quiz";
type QuestionType = "single_select" | "true_false";

type QuestionInput = {
  question_text: string;
  question_type: QuestionType;
  points: number;
  options: string[];
  correct_index: number;
};

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login/admin");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (
    error ||
    !profile ||
    profile.role !== "admin" ||
    profile.status !== "approved"
  ) {
    redirect("/login/admin");
  }

  return { supabase, user };
}

function finish(message: string, isError = false): never {
  const key = isError ? "error" : "message";
  redirect(
    `/admin/assignments?${key}=${encodeURIComponent(message)}`
  );
}

function parseQuestions(value: FormDataEntryValue | null): QuestionInput[] {
  if (typeof value !== "string" || !value.trim()) return [];

  const parsed: unknown = JSON.parse(value);

  if (!Array.isArray(parsed)) {
    throw new Error("Invalid question data.");
  }

  return parsed as QuestionInput[];
}

function validateQuestions(
  questions: QuestionInput[],
  assignmentType: AssignmentType
) {
  if (assignmentType === "scenario") return 0;

  if (assignmentType === "mcq" && questions.length !== 1) {
    throw new Error("An MCQ assignment must contain exactly one question.");
  }

  if (assignmentType === "quiz" && questions.length < 2) {
    throw new Error("A quiz must contain at least two questions.");
  }

  if (questions.length > 50) {
    throw new Error("A quiz cannot contain more than 50 questions.");
  }

  let totalMarks = 0;

  for (const question of questions) {
    if (
      typeof question.question_text !== "string" ||
      !question.question_text.trim() ||
      question.question_text.length > 2000
    ) {
      throw new Error("Every question needs valid question text.");
    }

    if (
      !["single_select", "true_false"].includes(
        question.question_type
      )
    ) {
      throw new Error("Unsupported question format.");
    }

    if (
      !Number.isFinite(question.points) ||
      question.points <= 0 ||
      question.points > 1000
    ) {
      throw new Error("Question marks must be between 0 and 1,000.");
    }

    const expectedOptions =
      question.question_type === "true_false" ? 2 : 4;

    if (
      !Array.isArray(question.options) ||
      question.options.length !== expectedOptions ||
      question.options.some(
        (option) =>
          typeof option !== "string" ||
          !option.trim() ||
          option.length > 500
      )
    ) {
      throw new Error("Every question must have valid answer options.");
    }

    if (
      !Number.isInteger(question.correct_index) ||
      question.correct_index < 0 ||
      question.correct_index >= question.options.length
    ) {
      throw new Error("Select one correct answer for every question.");
    }

    if (question.question_type === "true_false") {
      const normalized = question.options.map((option) =>
        option.trim().toLowerCase()
      );

      if (
        normalized[0] !== "true" ||
        normalized[1] !== "false"
      ) {
        throw new Error("True/False options are invalid.");
      }
    }

    totalMarks += question.points;
  }

  return totalMarks;
}

function getSafeFileExtension(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  const allowed = [
    "pkt",
    "pka",
    "pdf",
    "zip",
    "txt",
    "png",
    "jpg",
    "jpeg",
  ];

  return allowed.includes(extension) ? extension : null;
}

export async function createAssignment(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();
  const dueAtInput = String(formData.get("due_at_utc") ?? "").trim();
  const assignmentType = String(
    formData.get("assignment_type") ?? "scenario"
  ) as AssignmentType;
  const resultVisibility = String(
    formData.get("result_visibility") ?? "admin_only"
  );
  const assignToAll = formData.get("assign_to_all") === "on";

  const memberIds = [
    ...new Set(
      formData
        .getAll("member_ids")
        .map((value) => String(value).trim())
        .filter(Boolean)
    ),
  ];

  if (!title || title.length > 150) {
    finish("Enter an assignment title of up to 150 characters.", true);
  }

  if (!instructions || instructions.length > 10000) {
    finish(
      "Instructions are required and must be under 10,000 characters.",
      true
    );
  }

  if (description.length > 2000) {
    finish("The description must be under 2,000 characters.", true);
  }

  if (!["scenario", "mcq", "quiz"].includes(assignmentType)) {
    finish("Choose a valid assignment format.", true);
  }

  if (!["admin_only", "immediate"].includes(resultVisibility)) {
    finish("Choose a valid result visibility setting.", true);
  }

  const dueDate = new Date(dueAtInput);

  if (
    !dueAtInput ||
    Number.isNaN(dueDate.getTime()) ||
    dueDate.getTime() <= Date.now()
  ) {
    finish("Choose a valid future deadline.", true);
  }

  if (!assignToAll && memberIds.length === 0) {
    finish(
      "Select at least one member or choose all approved members.",
      true
    );
  }

  if (!assignToAll) {
    const { data: validMembers, error: memberError } = await supabase
      .from("profiles")
      .select("id")
      .in("id", memberIds)
      .eq("role", "member")
      .eq("status", "approved");

    if (
      memberError ||
      !validMembers ||
      validMembers.length !== memberIds.length
    ) {
      finish(
        "One or more selected members are invalid or not approved.",
        true
      );
    }
  }

  let questions: QuestionInput[] = [];
  let calculatedMarks = 0;

  if (assignmentType !== "scenario") {
    try {
      questions = parseQuestions(formData.get("questions_json"));
      calculatedMarks = validateQuestions(questions, assignmentType);
    } catch (error) {
      finish(
        error instanceof Error
          ? error.message
          : "Question validation failed.",
        true
      );
    }
  }

  const submittedMaxScore = Number(formData.get("max_score"));
  const maxScore =
    assignmentType === "scenario"
      ? submittedMaxScore
      : calculatedMarks;

  if (
    !Number.isFinite(maxScore) ||
    maxScore <= 0 ||
    maxScore > 10000
  ) {
    finish("Enter a valid maximum score.", true);
  }

  if (
    assignmentType !== "scenario" &&
    Math.abs(maxScore - calculatedMarks) > 0.001
  ) {
    finish("The question marks could not be verified.", true);
  }

  const uploadedFile = formData.get("assignment_file");
  let file: File | null = null;

  if (uploadedFile instanceof File && uploadedFile.size > 0) {
    file = uploadedFile;

    if (file.size > 25 * 1024 * 1024) {
      finish("The attachment must be 25 MB or smaller.", true);
    }

    if (!getSafeFileExtension(file.name)) {
      finish(
        "Unsupported file. Use PKT, PKA, PDF, ZIP, TXT, PNG or JPG.",
        true
      );
    }

    if (assignmentType !== "scenario") {
      finish("Attachments are currently supported for scenario assignments.", true);
    }
  }

  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .insert({
      title,
      description: description || null,
      instructions,
      due_at: dueDate.toISOString(),
      assignment_type: assignmentType,
      max_score: maxScore,
      result_visibility: resultVisibility,
      published: false,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (assignmentError || !assignment) {
    finish(
      "Assignment creation failed. Check your database columns and administrator policies.",
      true
    );
  }

  const assignmentId = assignment.id;
  let uploadedPath: string | null = null;

  async function rollback() {
    if (uploadedPath) {
      await supabase.storage
        .from("assignment-files")
        .remove([uploadedPath]);
    }

    await supabase
      .from("assignments")
      .delete()
      .eq("id", assignmentId);
  }

  if (file) {
    const extension = getSafeFileExtension(file.name);

    if (!extension) {
      await rollback();
      finish("The attachment extension is not supported.", true);
    }

    uploadedPath = `${user.id}/${assignmentId}/${randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("assignment-files")
      .upload(uploadedPath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      await rollback();
      finish(
        "The assignment was created, but its attachment could not be uploaded. Check the private storage bucket and policies.",
        true
      );
    }

    const { error: fileUpdateError } = await supabase
      .from("assignments")
      .update({ attachment_path: uploadedPath })
      .eq("id", assignmentId);

    if (fileUpdateError) {
      await rollback();
      finish("Could not link the uploaded resource to the assignment.", true);
    }
  }

  if (!assignToAll) {
    const targets = memberIds.map((memberId) => ({
      assignment_id: assignmentId,
      member_id: memberId,
    }));

    const { error: targetError } = await supabase
      .from("assignment_targets")
      .insert(targets);

    if (targetError) {
      await rollback();
      finish(
        "Member allocation failed. The assignment was not published.",
        true
      );
    }
  }

  if (assignmentType !== "scenario") {
    for (let index = 0; index < questions.length; index += 1) {
      const question = questions[index];

      const { data: savedQuestion, error: questionError } = await supabase
        .from("assignment_questions")
        .insert({
          assignment_id: assignmentId,
          question_text: question.question_text.trim(),
          question_type: question.question_type,
          points: question.points,
          position: index + 1,
        })
        .select("id")
        .single();

      if (questionError || !savedQuestion) {
        await rollback();
        finish(
          "A question could not be saved. The assignment was not published.",
          true
        );
      }

      const optionRows = question.options.map((option, optionIndex) => ({
        question_id: savedQuestion.id,
        option_text: option.trim(),
        position: optionIndex + 1,
      }));

      const { data: savedOptions, error: optionError } = await supabase
        .from("assignment_question_options")
        .insert(optionRows)
        .select("id, position");

      if (optionError || !savedOptions || savedOptions.length !== optionRows.length) {
        await rollback();
        finish(
          "Question options could not be saved. The assignment was not published.",
          true
        );
      }

      const correctOption = savedOptions.find(
        (option) => option.position === question.correct_index + 1
      );

      if (!correctOption) {
        await rollback();
        finish(
          "The correct answer could not be saved. The assignment was not published.",
          true
        );
      }

      const { error: answerKeyError } = await supabase
        .from("assignment_answer_keys")
        .insert({
          question_id: savedQuestion.id,
          option_id: correctOption.id,
        });

      if (answerKeyError) {
        await rollback();
        finish(
          "The answer key could not be saved. The assignment was not published.",
          true
        );
      }
    }
  }

  const { error: publishError } = await supabase
    .from("assignments")
    .update({ published: true })
    .eq("id", assignmentId);

  if (publishError) {
    await rollback();
    finish(
      "The assignment could not be published. The incomplete draft was removed.",
      true
    );
  }

  revalidatePath("/admin/assignments");
  revalidatePath("/member");

  finish("Assignment created and published successfully.");
}

export async function changeAssignmentPublication(formData: FormData) {
  const { supabase } = await requireAdmin();

  const assignmentId = String(
    formData.get("assignment_id") ?? ""
  ).trim();
  const requested = String(formData.get("published") ?? "");

  if (!assignmentId || !["true", "false"].includes(requested)) {
    finish("Invalid publication request.", true);
  }

  const { error } = await supabase
    .from("assignments")
    .update({ published: requested === "true" })
    .eq("id", assignmentId);

  if (error) {
    finish("Could not change assignment publication status.", true);
  }

  revalidatePath("/admin/assignments");
  revalidatePath("/member");

  finish(
    requested === "true"
      ? "Assignment published."
      : "Assignment unpublished."
  );
}
