
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

function courseUrlIsValid(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function courseRedirect(message: string, error = false): never {
  const parameter = error ? "error" : "message";
  redirect(`/admin/courses?${parameter}=${encodeURIComponent(message)}`);
}

export async function createCourse(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const resourceUrl = String(formData.get("resource_url") ?? "").trim();

  if (!title || title.length > 120) {
    courseRedirect("Enter a course title of up to 120 characters.", true);
  }

  if (description.length > 2000) {
    courseRedirect("The description must be under 2,000 characters.", true);
  }

  if (!courseUrlIsValid(resourceUrl)) {
    courseRedirect("Enter a valid HTTP or HTTPS resource URL.", true);
  }

  const { error } = await supabase.from("courses").insert({
    title,
    description: description || null,
    resource_url: resourceUrl,
    published: false,
    created_by: user.id,
  });

  if (error) {
    courseRedirect("Course creation failed. Check the database policies and try again.", true);
  }

  revalidatePath("/admin/courses");
  revalidatePath("/member");

  courseRedirect("Course created. Publish it when it is ready.");
}

export async function updateCourse(formData: FormData) {
  const { supabase } = await requireAdmin();

  const courseId = String(formData.get("course_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const resourceUrl = String(formData.get("resource_url") ?? "").trim();

  if (!courseId || !title || title.length > 120) {
    courseRedirect("Invalid course details. Check the title and try again.", true);
  }

  if (description.length > 2000) {
    courseRedirect("The description must be under 2,000 characters.", true);
  }

  if (!courseUrlIsValid(resourceUrl)) {
    courseRedirect("Enter a valid HTTP or HTTPS resource URL.", true);
  }

  const { error } = await supabase
    .from("courses")
    .update({
      title,
      description: description || null,
      resource_url: resourceUrl,
    })
    .eq("id", courseId);

  if (error) {
    courseRedirect("Course update failed. Check the database policies and try again.", true);
  }

  revalidatePath("/admin/courses");
  revalidatePath("/member");

  courseRedirect("Course details updated.");
}

export async function setCoursePublished(formData: FormData) {
  const { supabase } = await requireAdmin();

  const courseId = String(formData.get("course_id") ?? "").trim();
  const publishedValue = String(formData.get("published") ?? "");

  if (!courseId || !["true", "false"].includes(publishedValue)) {
    courseRedirect("Invalid publication request.", true);
  }

  const published = publishedValue === "true";

  const { error } = await supabase
    .from("courses")
    .update({ published })
    .eq("id", courseId);

  if (error) {
    courseRedirect("The publication status could not be changed.", true);
  }

  revalidatePath("/admin/courses");
  revalidatePath("/member");

  courseRedirect(
    published ? "Course published successfully." : "Course unpublished."
  );
}

export async function deleteCourse(formData: FormData) {
  const { supabase } = await requireAdmin();

  const courseId = String(formData.get("course_id") ?? "").trim();

  if (!courseId) {
    courseRedirect("Invalid course selection.", true);
  }

  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId);

  if (error) {
    courseRedirect(
      "Course could not be deleted. It may have existing completion records.",
      true
    );
  }

  revalidatePath("/admin/courses");
  revalidatePath("/member");

  courseRedirect("Course deleted.");
}
