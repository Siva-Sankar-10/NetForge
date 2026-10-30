import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AssignmentBuilder from "@/components/admin/AssignmentBuilder";
import { changeAssignmentPublication } from "./actions";

export const metadata = {
  title: "Assignment Management | NetForge",
  description: "Create and allocate practical NetForge assignments.",
};

type PageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

export default async function AdminAssignmentsPage({
  searchParams,
}: PageProps) {
    await connection();
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login/admin");

  const { data: admin, error: adminError } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (
    adminError ||
    !admin ||
    admin.role !== "admin" ||
    admin.status !== "approved"
  ) {
    redirect("/login/admin");
  }

  const [
    { data: members, error: membersError },
    { data: assignments, error: assignmentsError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "member")
      .eq("status", "approved")
      .order("full_name", { ascending: true }),

    supabase
      .from("assignments")
      .select(
        "id, title, description, instructions, due_at, published, created_at, assignment_type, max_score, result_visibility"
      )
      .order("created_at", { ascending: false }),
  ]);

  const memberList = members ?? [];
  const assignmentList = assignments ?? [];

  const publishedCount = assignmentList.filter(
    (assignment) => assignment.published
  ).length;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="site-shell">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D8CCBA] pb-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center border border-[#A95850] font-technical text-sm text-[#A95850]">
              NF
            </span>
            <span>
              <span className="brand block text-2xl leading-none">
                NetForge
              </span>
              <span className="mt-1 block font-technical text-[8px] tracking-wider text-[#756B61]">
                ADMINISTRATOR WORKSPACE
              </span>
            </span>
          </Link>

          <nav className="flex flex-wrap gap-3">
            <Link href="/admin/members" className="button-secondary">
              MEMBERS
            </Link>
            <Link href="/admin/courses" className="button-secondary">
              COURSES
            </Link>
            <Link href="/member" className="button-secondary">
              MEMBER VIEW
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="button-primary">
                SIGN OUT
              </button>
            </form>
          </nav>
        </header>

        <section className="py-10 sm:py-12">
          <p className="eyebrow">PRACTICAL DEVELOPMENT / NF-ADMIN-003</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">
            Assignment control.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756B61]">
            Build practical challenges, create MCQ assessments, design
            multi-question quizzes and distribute them to your members.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="technical-frame p-5">
              <p className="eyebrow">TOTAL ASSIGNMENTS</p>
              <p className="brand mt-3 text-4xl">
                {assignmentsError ? "—" : assignmentList.length}
              </p>
            </article>

            <article className="technical-frame p-5">
              <p className="eyebrow">PUBLISHED</p>
              <p className="brand mt-3 text-4xl">
                {assignmentsError ? "—" : publishedCount}
              </p>
            </article>

            <article className="technical-frame p-5">
              <p className="eyebrow">APPROVED MEMBERS</p>
              <p className="brand mt-3 text-4xl">
                {membersError ? "—" : memberList.length}
              </p>
            </article>
          </div>
        </section>

        {params.message && (
          <div className="mb-5 border border-[#A95850]/40 bg-[#FFF9EF] p-4 text-sm text-[#87423D]">
            {params.message}
          </div>
        )}

        {params.error && (
          <div
            role="alert"
            className="mb-5 border border-[#87423D]/40 bg-[#FFF9EF] p-4 text-sm text-[#87423D]"
          >
            {params.error}
          </div>
        )}

        <section className="technical-frame technical-corner p-5 sm:p-7">
          <p className="eyebrow">ASSESSMENT DESIGN / 01</p>
          <h2 className="mt-3 text-2xl sm:text-3xl">
            Create a new assignment
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#756B61]">
            Choose an assignment format and configure its questions,
            materials, deadline and member allocation.
          </p>

          {membersError ? (
            <p className="mt-6 text-sm text-[#87423D]">
              Approved members could not be loaded. Check your profiles
              read policy before creating an assignment.
            </p>
          ) : (
            <AssignmentBuilder members={memberList} />
          )}
        </section>

        <section className="mt-10">
          <div className="border-b border-[#D8CCBA] pb-5">
            <p className="eyebrow">TASK MONITORING / 02</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">
              Assignment board
            </h2>
          </div>

          {assignmentsError ? (
            <div className="mt-5 border border-[#D8CCBA] bg-[#FFF9EF] p-5 text-sm text-[#87423D]">
              Could not load assignments. Check the assignments table
              and administrator policies.
            </div>
          ) : assignmentList.length === 0 ? (
            <div className="mt-5 border border-dashed border-[#D8CCBA] bg-[#FFF9EF]/70 px-5 py-12 text-center">
              <p className="brand text-2xl">
                No assignments created yet.
              </p>
              <p className="mt-3 text-sm text-[#756B61]">
                Your practical assignment board will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5">
              {assignmentList.map((assignment, index) => (
                <article
                  key={assignment.id}
                  className="technical-frame p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-technical text-[9px] tracking-wider text-[#756B61]">
                      ASSIGNMENT / {String(index + 1).padStart(2, "0")}
                    </p>
                    <span className="font-technical text-[9px] tracking-wider text-[#A95850]">
                      {assignment.published ? "PUBLISHED" : "UNPUBLISHED"}
                    </span>
                  </div>

                  <h3 className="mt-4 text-2xl">{assignment.title}</h3>

                  <p className="mt-2 font-technical text-[10px] tracking-wider text-[#A95850]">
                    TYPE: {assignment.assignment_type.toUpperCase()} · MAXIMUM MARKS: {assignment.max_score}
                  </p>

                  <p className="mt-2 text-sm leading-7 text-[#756B61]">
                    {assignment.description || "Practical NetForge challenge"}
                  </p>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7">
                    {assignment.instructions}
                  </p>

                  <div className="mt-5 border-t border-[#D8CCBA] pt-4">
                    <p className="font-technical text-[9px] tracking-wider text-[#756B61]">
                      DEADLINE:{" "}
                      {new Intl.DateTimeFormat("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(assignment.due_at))}
                    </p>
                  </div>

                  <form action={changeAssignmentPublication} className="mt-4">
                    <input
                      type="hidden"
                      name="assignment_id"
                      value={assignment.id}
                    />
                    <input
                      type="hidden"
                      name="published"
                      value={assignment.published ? "false" : "true"}
                    />
                    <button type="submit" className="button-secondary">
                      {assignment.published ? "UNPUBLISH" : "PUBLISH"}
                    </button>
                  </form>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-10 border-t border-[#D8CCBA] py-6">
          <p className="brand text-lg text-[#A95850]">
            Build Skills. Forge Your Future.
          </p>
          <p className="mt-2 font-technical text-[8px] tracking-wider text-[#756B61]">
            NETFORGE / ADMINISTRATOR ASSIGNMENT CONTROL
          </p>
        </footer>
      </div>
    </main>
  );
}
