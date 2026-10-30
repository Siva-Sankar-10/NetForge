
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login/admin");
  }

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

function cycleRedirect(message: string, error = false): never {
  const parameter = error ? "error" : "message";

  redirect(
    `/admin/cycles?${parameter}=${encodeURIComponent(message)}`
  );
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

const validStatuses = [
  "draft",
  "active",
  "review",
  "completed",
] as const;

type CycleStatus = (typeof validStatuses)[number];

export async function createTrainingCycle(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const startsOn = String(formData.get("starts_on") ?? "");
  const endsOn = String(formData.get("ends_on") ?? "");
  const reviewUntil = String(formData.get("review_until") ?? "");

  if (!title || title.length > 120) {
    cycleRedirect(
      "Enter a cycle title of up to 120 characters.",
      true
    );
  }

  if (
    !isValidDate(startsOn) ||
    !isValidDate(endsOn) ||
    !isValidDate(reviewUntil)
  ) {
    cycleRedirect("Enter valid cycle dates.", true);
  }

  if (endsOn < startsOn) {
    cycleRedirect(
      "The cycle end date must be on or after its start date.",
      true
    );
  }

  if (reviewUntil < endsOn) {
    cycleRedirect(
      "The review deadline must be on or after the cycle end date.",
      true
    );
  }

  const { error } = await supabase
    .from("training_cycles")
    .insert({
      title,
      starts_on: startsOn,
      ends_on: endsOn,
      review_until: reviewUntil,
      published: false,
      status: "draft",
      created_by: user.id,
    });

  if (error) {
    console.error("Training cycle creation failed:", error);

    cycleRedirect(
      "Could not create the training cycle. Check the database policies and try again.",
      true
    );
  }

  revalidatePath("/admin/cycles");
  revalidatePath("/member");

  cycleRedirect("Training cycle created as a draft.");
}

export async function setTrainingCyclePublished(
  formData: FormData
) {
  const { supabase } = await requireAdmin();

  const cycleId = String(formData.get("cycle_id") ?? "").trim();
  const publishedValue = String(
    formData.get("published") ?? ""
  );

  if (
    !cycleId ||
    !["true", "false"].includes(publishedValue)
  ) {
    cycleRedirect("Invalid publication request.", true);
  }

  const published = publishedValue === "true";

  const { error } = await supabase
    .from("training_cycles")
    .update({ published })
    .eq("id", cycleId);

  if (error) {
    console.error("Training cycle publication failed:", error);

    cycleRedirect(
      "Could not change the publication status.",
      true
    );
  }

  revalidatePath("/admin/cycles");
  revalidatePath("/member");

  cycleRedirect(
    published
      ? "Training cycle published."
      : "Training cycle unpublished."
  );
}

export async function setTrainingCycleStatus(
  formData: FormData
) {
  const { supabase } = await requireAdmin();

  const cycleId = String(formData.get("cycle_id") ?? "").trim();
  const statusValue = String(formData.get("status") ?? "");

  if (
    !cycleId ||
    !validStatuses.includes(statusValue as CycleStatus)
  ) {
    cycleRedirect("Invalid training cycle status.", true);
  }

  const { error } = await supabase
    .from("training_cycles")
    .update({ status: statusValue as CycleStatus })
    .eq("id", cycleId);

  if (error) {
    console.error("Training cycle status update failed:", error);

    cycleRedirect(
      "Could not update the training cycle status.",
      true
    );
  }

  revalidatePath("/admin/cycles");
  revalidatePath("/member");

  cycleRedirect("Training cycle status updated.");
}
