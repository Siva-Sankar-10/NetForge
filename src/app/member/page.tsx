
import { Suspense } from "react";
import { redirect } from "next/navigation";
import MemberDashboard from "@/components/MemberDashboard";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Member Workspace | NetForge",
  description: "Your NetForge community learning workspace.",
};

function MemberDashboardLoading() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="site-shell">
        <div className="animate-pulse border-b border-[#D8CCBA] pb-5">
          <div className="h-8 w-40 bg-[#D8CCBA]/60" />
        </div>

        <section className="py-16">
          <div className="h-3 w-48 bg-[#D8CCBA]/60" />
          <div className="mt-6 h-12 max-w-lg bg-[#D8CCBA]/60" />
          <div className="mt-4 h-4 max-w-xl bg-[#D8CCBA]/40" />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="technical-frame h-52 animate-pulse bg-[#FFF9EF] p-6"
              >
                <div className="h-3 w-24 bg-[#D8CCBA]/60" />
                <div className="mt-10 h-7 w-36 bg-[#D8CCBA]/60" />
                <div className="mt-5 h-3 w-full bg-[#D8CCBA]/40" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

async function MemberDashboardContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login/member");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, status")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/pending");
  }

  if (profile.status !== "approved") {
    redirect("/pending");
  }

  if (profile.role === "admin") {
    redirect("/admin/members");
  }

  if (profile.role !== "member") {
    redirect("/login/member");
  }

  const [
    { data: courses, error: coursesError },
    { data: assignments, error: assignmentsError },
  ] = await Promise.all([
    supabase
      .from("courses")
      .select("id, title, description, resource_url, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false }),

    supabase
      .from("assignments")
      .select(
        "id, title, description, instructions, assignment_type, attachment_path, max_score, result_visibility, due_at, created_at"
      )
      .eq("published", true)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <MemberDashboard
      fullName={profile.full_name || ""}
      courses={courses ?? []}
      coursesError={Boolean(coursesError)}
      assignments={assignments ?? []}
      assignmentsError={Boolean(assignmentsError)}
    />
  );
}

export default function MemberWorkspacePage() {
  return (
    <Suspense fallback={<MemberDashboardLoading />}>
      <MemberDashboardContent />
    </Suspense>
  );
}
