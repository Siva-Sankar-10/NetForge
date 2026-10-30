
"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createAssignment } from "@/app/admin/assignments/actions";

type Member = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type QuestionType = "single_select" | "true_false";

type QuestionDraft = {
  id: string;
  question_text: string;
  question_type: QuestionType;
  points: number;
  options: string[];
  correct_index: number;
};

function createQuestion(): QuestionDraft {
  return {
    id: crypto.randomUUID(),
    question_text: "",
    question_type: "single_select",
    points: 10,
    options: ["", "", "", ""],
    correct_index: 0,
  };
}

const inputClass =
  "w-full border border-[#D8CCBA] bg-[#FFF9EF] px-4 py-3 text-sm text-[#252321] outline-none focus:border-[#A95850]";

const labelClass =
  "mb-2 block font-technical text-[10px] tracking-wider text-[#756B61]";

export default function AssignmentBuilder({
  members,
}: {
  members: Member[];
}) {
  const [assignmentType, setAssignmentType] = useState<
    "scenario" | "mcq" | "quiz"
  >("scenario");
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    createQuestion(),
  ]);
  const [assignToAll, setAssignToAll] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [deadlineUtc, setDeadlineUtc] = useState("");

  const totalMarks = useMemo(
    () =>
      questions.reduce(
        (total, question) =>
          total + (Number.isFinite(question.points) ? question.points : 0),
        0
      ),
    [questions]
  );

  function updateQuestion(
    id: string,
    updates: Partial<QuestionDraft>
  ) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === id ? { ...question, ...updates } : question
      )
    );
  }

  function updateOption(
    questionId: string,
    optionIndex: number,
    value: string
  ) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option, index) =>
                index === optionIndex ? value : option
              ),
            }
          : question
      )
    );
  }

  function changeQuestionType(
    questionId: string,
    type: QuestionType
  ) {
    setQuestions((current) =>
      current.map((question) => {
        if (question.id !== questionId) return question;

        return {
          ...question,
          question_type: type,
          options:
            type === "true_false"
              ? ["True", "False"]
              : ["", "", "", ""],
          correct_index: 0,
        };
      })
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const deadlineInput = form.elements.namedItem(
      "deadline_local"
    ) as HTMLInputElement | null;
    const deadlineField = form.elements.namedItem(
      "due_at_utc"
    ) as HTMLInputElement | null;

    if (!deadlineInput?.value || !deadlineField) {
      event.preventDefault();
      window.alert("Choose an assignment deadline.");
      return;
    }

    const date = new Date(deadlineInput.value);

    if (Number.isNaN(date.getTime())) {
      event.preventDefault();
      window.alert("Enter a valid deadline.");
      return;
    }

    deadlineField.value = date.toISOString();

    if (assignmentType !== "scenario") {
      const requiredCount = assignmentType === "mcq" ? 1 : 2;

      if (questions.length < requiredCount) {
        event.preventDefault();
        window.alert(
          assignmentType === "mcq"
            ? "An MCQ assignment needs one question."
            : "A quiz needs at least two questions."
        );
        return;
      }

      for (const question of questions) {
        if (!question.question_text.trim()) {
          event.preventDefault();
          window.alert("Every question needs question text.");
          return;
        }

        if (
          !Number.isFinite(question.points) ||
          question.points <= 0
        ) {
          event.preventDefault();
          window.alert("Every question must have positive marks.");
          return;
        }

        if (
          question.options.some((option) => !option.trim())
        ) {
          event.preventDefault();
          window.alert("Fill in every answer option.");
          return;
        }
      }

      const questionsField = form.elements.namedItem(
        "questions_json"
      ) as HTMLInputElement | null;

      if (questionsField) {
        questionsField.value = JSON.stringify(
          questions.map((question) => ({
            question_text: question.question_text.trim(),
            question_type: question.question_type,
            points: question.points,
            options: question.options.map((option) => option.trim()),
            correct_index: question.correct_index,
          }))
        );
      }
    }
  }

  return (
    <form
      action={createAssignment}
      onSubmit={handleSubmit}
      className="mt-6 grid gap-6"
    >
      <input type="hidden" name="due_at_utc" />
      <input type="hidden" name="questions_json" />

      <section>
        <label htmlFor="assignment-type" className={labelClass}>
          ASSIGNMENT FORMAT
        </label>

        <select
          id="assignment-type"
          name="assignment_type"
          value={assignmentType}
          onChange={(event) => {
            const value = event.target.value as
              | "scenario"
              | "mcq"
              | "quiz";

            setAssignmentType(value);
            setQuestions([createQuestion()]);
          }}
          className={inputClass}
        >
          <option value="scenario">
            Scenario / Packet Tracer practical
          </option>
          <option value="mcq">MCQ assessment</option>
          <option value="quiz">Multiple-question quiz</option>
        </select>

        <p className="mt-2 text-xs leading-5 text-[#756B61]">
          {assignmentType === "scenario"
            ? "Give members a practical networking task and optionally attach a Packet Tracer file."
            : assignmentType === "mcq"
              ? "Create one question with answer options and one correct answer."
              : "Build a quiz with multiple questions and automatic scoring."}
        </p>
      </section>

      <section>
        <label htmlFor="assignment-title" className={labelClass}>
          ASSIGNMENT TITLE
        </label>
        <input
          id="assignment-title"
          name="title"
          required
          maxLength={150}
          placeholder="Example: Configure a VLAN-based network"
          className={inputClass}
        />
      </section>

      <section>
        <label htmlFor="assignment-description" className={labelClass}>
          SHORT DESCRIPTION
        </label>
        <textarea
          id="assignment-description"
          name="description"
          rows={3}
          maxLength={2000}
          placeholder="Briefly describe the challenge..."
          className={inputClass}
        />
      </section>

      <section>
        <label htmlFor="assignment-instructions" className={labelClass}>
          TASK INSTRUCTIONS
        </label>
        <textarea
          id="assignment-instructions"
          name="instructions"
          required
          rows={7}
          maxLength={10000}
          placeholder={
            "1. Read the scenario.\n2. Complete the task.\n3. Explain your solution.\n4. Submit your work."
          }
          className={`${inputClass} leading-7`}
        />
      </section>

      {assignmentType === "scenario" ? (
        <section className="border border-[#D8CCBA] bg-[#FFF9EF] p-4 sm:p-5">
          <p className={labelClass}>PRACTICAL RESOURCE FILE</p>
          <label
            htmlFor="assignment-file"
            className="block cursor-pointer border border-dashed border-[#A95850]/60 p-5 text-center"
          >
            <span className="brand block text-xl text-[#A95850]">
              Attach a resource
            </span>
            <span className="mt-2 block text-xs leading-5 text-[#756B61]">
              Packet Tracer .pkt, PDF, ZIP, TXT, PNG or JPG. Maximum 25 MB.
            </span>
            <input
              id="assignment-file"
              name="assignment_file"
              type="file"
              accept=".pkt,.pka,.pdf,.zip,.txt,.png,.jpg,.jpeg"
              className="mt-4 block w-full text-xs"
            />
          </label>
          <p className="mt-3 text-xs text-[#756B61]">
            The resource is stored in a private Supabase bucket.
          </p>
        </section>
      ) : (
        <section className="border border-[#D8CCBA] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className={labelClass}>
                {assignmentType === "mcq"
                  ? "MCQ QUESTION"
                  : "QUIZ QUESTIONS"}
              </p>
              <p className="text-xs text-[#756B61]">
                Add questions, options, marks and the correct answer.
              </p>
            </div>
            <div className="text-right">
              <p className={labelClass}>TOTAL MARKS</p>
              <p className="brand text-2xl text-[#A95850]">
                {totalMarks}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5">
            {questions.map((question, questionIndex) => (
              <article
                key={question.id}
                className="border border-[#D8CCBA] bg-[#FFF9EF] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-technical text-[10px] tracking-wider text-[#A95850]">
                    QUESTION {String(questionIndex + 1).padStart(2, "0")}
                  </p>

                  {assignmentType === "quiz" &&
                    questions.length > 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          setQuestions((current) =>
                            current.filter(
                              (item) => item.id !== question.id
                            )
                          )
                        }
                        className="font-technical text-[9px] tracking-wider text-[#87423D]"
                      >
                        REMOVE
                      </button>
                    )}
                </div>

                <label className={`${labelClass} mt-4`}>
                  QUESTION TEXT
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={2000}
                  value={question.question_text}
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      question_text: event.target.value,
                    })
                  }
                  placeholder="Enter your networking question..."
                  className={inputClass}
                />

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>QUESTION FORMAT</label>
                    <select
                      value={question.question_type}
                      onChange={(event) =>
                        changeQuestionType(
                          question.id,
                          event.target.value as QuestionType
                        )
                      }
                      className={inputClass}
                    >
                      <option value="single_select">
                        Multiple choice
                      </option>
                      <option value="true_false">True / False</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>MARKS</label>
                    <input
                      type="number"
                      min="0.5"
                      max="1000"
                      step="0.5"
                      required
                      value={question.points}
                      onChange={(event) =>
                        updateQuestion(question.id, {
                          points: Number(event.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <p className={labelClass}>ANSWER OPTIONS</p>
                  <div className="grid gap-3">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={`${question.id}-${optionIndex}`}
                        className="flex items-center gap-3"
                      >
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correct_index === optionIndex}
                          onChange={() =>
                            updateQuestion(question.id, {
                              correct_index: optionIndex,
                            })
                          }
                          aria-label={`Mark option ${optionIndex + 1} as correct`}
                          className="h-4 w-4 accent-[#A95850]"
                        />
                        <input
                          value={option}
                          readOnly={question.question_type === "true_false"}
                          onChange={(event) =>
                            updateOption(
                              question.id,
                              optionIndex,
                              event.target.value
                            )
                          }
                          aria-label={`Answer option ${optionIndex + 1}`}
                          className={inputClass}
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-[#756B61]">
                    Select the radio button beside the correct answer.
                  </p>
                </div>
              </article>
            ))}
          </div>

          {assignmentType === "quiz" && (
            <button
              type="button"
              onClick={() =>
                setQuestions((current) => [
                  ...current,
                  createQuestion(),
                ])
              }
              className="button-secondary mt-5"
            >
              ADD QUESTION
            </button>
          )}
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="assignment-deadline" className={labelClass}>
            SUBMISSION DEADLINE
          </label>
          <input
            id="assignment-deadline"
            name="deadline_local"
            type="datetime-local"
            required
            className={inputClass}
          />
          <p className="mt-2 text-xs text-[#756B61]">
            The deadline is converted from your browser's local time.
          </p>
        </div>

        <div>
          <label htmlFor="result-visibility" className={labelClass}>
            RESULT VISIBILITY
          </label>
          <select
            id="result-visibility"
            name="result_visibility"
            defaultValue="admin_only"
            className={inputClass}
          >
            <option value="admin_only">
              Admin releases results manually
            </option>
            <option value="immediate">
              Show result immediately after submission
            </option>
          </select>
          <p className="mt-2 text-xs text-[#756B61]">
            Scenario submissions still require admin evaluation.
          </p>
        </div>
      </section>

      
<section>
  <label htmlFor="max-score" className={labelClass}>
    MAXIMUM MARKS
  </label>

  {assignmentType === "scenario" ? (
    <input
      id="max-score"
      name="max_score"
      type="number"
      min="1"
      max="10000"
      step="0.5"
      required
      defaultValue={100}
      className={inputClass}
    />
  ) : (
    <input
      id="max-score"
      name="max_score"
      type="number"
      min="1"
      max="10000"
      step="0.5"
      required
      value={totalMarks}
      readOnly
      className={inputClass}
    />
  )}

  {assignmentType !== "scenario" && (
    <p className="mt-2 text-xs text-[#756B61]">
      For MCQ and quiz, maximum marks are calculated from the question marks.
    </p>
  )}
</section>


      <section className="border-t border-[#D8CCBA] pt-5">
        <p className={labelClass}>ASSIGNMENT DISTRIBUTION</p>

        <label className="mt-4 flex items-start gap-3 border border-[#D8CCBA] bg-[#FFF9EF] p-4">
          <input
            type="checkbox"
            name="assign_to_all"
            checked={assignToAll}
            onChange={(event) => setAssignToAll(event.target.checked)}
            className="mt-1 accent-[#A95850]"
          />
          <span>
            <span className="block text-sm">
              Assign to all approved members
            </span>
            <span className="mt-1 block text-xs leading-5 text-[#756B61]">
              All currently approved members will be able to access this assignment.
            </span>
          </span>
        </label>

        {!assignToAll && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {members.map((member) => {
              const checked = selectedMembers.includes(member.id);

              return (
                <label
                  key={member.id}
                  className="flex items-start gap-3 border border-[#D8CCBA] bg-[#FFF9EF] p-3"
                >
                  <input
                    type="checkbox"
                    name="member_ids"
                    value={member.id}
                    checked={checked}
                    onChange={(event) => {
                      setSelectedMembers((current) =>
                        event.target.checked
                          ? [...current, member.id]
                          : current.filter((id) => id !== member.id)
                      );
                    }}
                    className="mt-1 accent-[#A95850]"
                  />
                  <span className="min-w-0">
                    <span className="block break-words text-sm">
                      {member.full_name || "Unnamed member"}
                    </span>
                    <span className="mt-1 block break-all text-xs text-[#756B61]">
                      {member.email}
                    </span>
                  </span>
                </label>
              );
            })}
            {members.length === 0 && (
              <p className="text-sm text-[#756B61]">
                No approved members are available.
              </p>
            )}
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D8CCBA] pt-5">
        <p className="max-w-md text-xs leading-5 text-[#756B61]">
          The assignment will be published only after its content and member allocation are saved.
        </p>
        <button type="submit" className="button-primary">
          CREATE AND PUBLISH
        </button>
      </div>
    </form>
  );
}
