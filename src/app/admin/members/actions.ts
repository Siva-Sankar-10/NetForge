"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type MembershipActionState = {
  message: string;
  error: boolean;
};

export async function updateMembershipStatus(
  _previousState: MembershipActionState,
  formData: FormData
): Promise<MembershipActionState> {
  const memberId = String(formData.get("memberId") ?? "");
  const requestedStatus = String(formData.get("status") ?? "");

  if (!memberId || !["approved", "rejected"].includes(requestedStatus)) {
    return { message: "Invalid membership action.", error: true };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login/admin");
  }

  const { data: actor } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (actor?.role !== "admin" || actor.status !== "approved") {
    return {
      message: "Only an approved administrator can review memberships.",
      error: true,
    };
  }

  const { data: target, error: targetError } = await supabase
    .from("profiles")
    .select("id, role, status")
    .eq("id", memberId)
    .single();

  if (targetError || !target || target.role !== "member") {
    return { message: "Member account not found.", error: true };
  }

  if (target.status !== "pending") {
    return {
      message: "This membership request has already been reviewed.",
      error: true,
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ status: requestedStatus })
    .eq("id", memberId)
    .eq("status", "pending");

  if (error) {
    return {
      message: "The membership status could not be updated. Check your database policies.",
      error: true,
    };
  }

  revalidatePath("/admin/members");
  revalidatePath("/pending");

  return {
    message:
      requestedStatus === "approved"
        ? "Membership approved."
        : "Membership rejected.",
    error: false,
  };
}