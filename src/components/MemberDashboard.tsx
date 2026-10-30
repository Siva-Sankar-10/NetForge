
"use client";

import Link from "next/link";
import { useState } from "react";

type Course = {
  id: string;
  title: string;
  description: string | null;
  resource_url: string;
  created_at: string;
};

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  assignment_type: "scenario" | "mcq" | "quiz";
  attachment_path: string | null;
  max_score: number;
  result_visibility: "admin_only" | "immediate";
  due_at: string | null;
  created_at: string;
};

type MemberDashboardProps = {
  fullName: string;
  courses: Course[];
  coursesError: boolean;
  assignments: Assignment[];
  assignmentsError: boolean;
};

const attendanceUrl = "https://cse-ccc.vercel.app/attendance";

const assignmentTypeDetails = {
  scenario: {
    label: "SCENARIO / PACKET TRACER",
    description: "Practical networking challenge",
  },
  mcq: {
    label: "MULTIPLE CHOICE",
    description: "Test your networking knowledge",
  },
  quiz: {
    label: "KNOWLEDGE QUIZ",
    description: "Complete the assigned quiz",
  },
};

function formatDate(date: string | null) {
  if (!date) return "No deadline";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isPastDeadline(date: string | null) {
  return date ? new Date(date).getTime() < Date.now() : false;
}

function getFirstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || "Member";
}

export default function MemberDashboard({
  fullName,
  courses,
  coursesError,
  assignments,
  assignmentsError,
}: MemberDashboardProps) {
  const [activeSection, setActiveSection] = useState("overview");

  const firstName = getFirstName(fullName);

  const practicalCount = assignments.filter(
    (assignment) => assignment.assignment_type === "scenario"
  ).length;

  const mcqCount = assignments.filter(
    (assignment) => assignment.assignment_type === "mcq"
  ).length;

  const quizCount = assignments.filter(
    (assignment) => assignment.assignment_type === "quiz"
  ).length;

  const navigationItems = [
    { id: "overview", number: "01", label: "Overview" },
    { id: "courses", number: "02", label: "Courses" },
    { id: "assignments", number: "03", label: "Assignments" },
    { id: "performance", number: "04", label: "Performance" },
  ];

  return (
    <main className="min-h-screen bg-[#F3EBDD] px-4 py-6 text-[#252321] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="border-b border-[#D8CCBA] pb-5">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <Link href="/member" className="group">
              <p className="font-[var(--font-typewriter)] text-3xl font-bold tracking-tight">
                NETFORGE<span className="text-[#A95850]">.</span>
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#756B61]">
                Build Skills. Forge Your Future.
              </p>
            </Link>

            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#756B61]">
                  Workspace status
                </p>
                <p className="mt-1 text-xs font-semibold text-[#47704D]">
                  SESSION ACTIVE
                </p>
              </div>

              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="border border-[#D8CCBA] px-4 py-2 text-xs uppercase tracking-wider transition hover:border-[#A95850] hover:bg-[#A95850] hover:text-[#FFF9EF]"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* WELCOME */}
        <section className="border-b border-[#D8CCBA] py-12 sm:py-16">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#A95850]">
            NETFORGE MEMBER WORKSPACE / 2026
          </p>

          <h1 className="mt-5 font-[var(--font-typewriter)] text-4xl leading-tight sm:text-5xl">
            Welcome back,
            <br />
            <span className="text-[#A95850]">{firstName}.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#756B61]">
            Your learning workspace is ready. Continue your courses, complete
            practical assignments, and build your networking skills one step
            at a time.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="border border-[#B8C8B2] bg-[#E6EDE1] px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#47704D]">
              Membership approved
            </span>
            <span className="border border-[#D8CCBA] bg-[#FFF9EF] px-3 py-2 text-[10px] uppercase tracking-widest text-[#756B61]">
              Member access
            </span>
          </div>
        </section>

        {/* SUMMARY CARDS */}
        <section className="grid gap-4 border-b border-[#D8CCBA] py-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-[#D8CCBA] bg-[#FFF9EF] p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#756B61]">
              Available courses
            </p>
            <p className="mt-4 font-[var(--font-typewriter)] text-4xl">
              {courses.length.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-[#756B61]">Learning resources</p>
          </div>

          <div className="border border-[#D8CCBA] bg-[#FFF9EF] p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#756B61]">
              Total assignments
            </p>
            <p className="mt-4 font-[var(--font-typewriter)] text-4xl">
              {assignments.length.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-[#756B61]">Assigned activities</p>
          </div>

          <div className="border border-[#D8CCBA] bg-[#FFF9EF] p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#756B61]">
              Practical labs
            </p>
            <p className="mt-4 font-[var(--font-typewriter)] text-4xl">
              {practicalCount.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-[#756B61]">Scenario assignments</p>
          </div>

          <div className="border border-[#D8CCBA] bg-[#FFF9EF] p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#756B61]">
              MCQ / Quiz
            </p>
            <p className="mt-4 font-[var(--font-typewriter)] text-4xl">
              {(mcqCount + quizCount).toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-[#756B61]">
              Knowledge assessments
            </p>
          </div>
        </section>

        {/* ATTENDANCE - ALWAYS VISIBLE */}
        <section className="my-8 border border-[#D8CCBA] bg-[#FFF9EF] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#A95850]">
                MEMBER SERVICE / ATTENDANCE
              </p>

              <h2 className="mt-3 font-[var(--font-typewriter)] text-2xl">
                Session attendance
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#756B61]">
                Access the NetForge attendance portal to check your
                participation in club sessions.
              </p>
            </div>

            <a
              href={attendanceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#A95850] bg-[#A95850] px-5 py-3 text-xs uppercase tracking-widest text-[#FFF9EF] transition hover:bg-[#87423D]"
            >
              Open attendance portal →
            </a>
          </div>
        </section>

        {/* NAVIGATION */}
        <nav className="flex flex-wrap gap-2 border-b border-[#D8CCBA] py-5">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-2 border px-4 py-3 text-[10px] uppercase tracking-wider transition ${
                activeSection === item.id
                  ? "border-[#A95850] bg-[#A95850] text-[#FFF9EF]"
                  : "border-[#D8CCBA] bg-[#FFF9EF] text-[#756B61] hover:border-[#A95850]"
              }`}
            >
              <span>{item.number}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* OVERVIEW */}
        {activeSection === "overview" && (
          <section className="py-10">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#A95850]">
                  YOUR WORKSPACE
                </p>
                <h2 className="mt-3 font-[var(--font-typewriter)] text-3xl">
                  Learning overview
                </h2>
              </div>

              <p className="text-xs text-[#756B61]">
                Your current learning activities
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => setActiveSection("courses")}
                className="technical-frame bg-[#FFF9EF] p-6 text-left transition hover:-translate-y-1 hover:border-[#A95850]"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#A95850]">
                  01 / LEARN
                </p>
                <h3 className="mt-8 font-[var(--font-typewriter)] text-2xl">
                  Community Courses
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#756B61]">
                  Explore the learning resources allocated to your account.
                </p>
                <p className="mt-7 text-xs uppercase tracking-widest text-[#A95850]">
                  Explore courses →
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("assignments")}
                className="technical-frame bg-[#FFF9EF] p-6 text-left transition hover:-translate-y-1 hover:border-[#A95850]"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#A95850]">
                  02 / PRACTICE
                </p>
                <h3 className="mt-8 font-[var(--font-typewriter)] text-2xl">
                  Assignments
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#756B61]">
                  Work on Packet Tracer scenarios, multiple-choice questions,
                  and quizzes.
                </p>
                <p className="mt-7 text-xs uppercase tracking-widest text-[#A95850]">
                  View assignments →
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("performance")}
                className="technical-frame bg-[#FFF9EF] p-6 text-left transition hover:-translate-y-1 hover:border-[#A95850]"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#A95850]">
                  03 / IMPROVE
                </p>
                <h3 className="mt-8 font-[var(--font-typewriter)] text-2xl">
                  Performance
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#756B61]">
                  Follow your progress, assessment results, and achievements.
                </p>
                <p className="mt-7 text-xs uppercase tracking-widest text-[#A95850]">
                  View performance →
                </p>
              </button>
            </div>
          </section>
        )}

        {/* COURSES */}
        {activeSection === "courses" && (
          <section className="py-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#A95850]">
              LEARNING MATERIAL / 01
            </p>

            <h2 className="mt-3 font-[var(--font-typewriter)] text-3xl">
              Community courses
            </h2>

            <p className="mt-3 text-sm text-[#756B61]">
              Courses published by your NetForge administrators.
            </p>

            {coursesError ? (
              <div className="mt-8 border border-[#D8CCBA] bg-[#FFF9EF] p-6">
                <p className="text-sm text-[#A95850]">
                  We could not load your courses. Please refresh the page.
                </p>
              </div>
            ) : courses.length === 0 ? (
              <div className="mt-8 border border-dashed border-[#D8CCBA] bg-[#FFF9EF] p-10 text-center">
                <p className="font-[var(--font-typewriter)] text-xl">
                  No courses available yet.
                </p>
                <p className="mt-3 text-sm text-[#756B61]">
                  Your administrators have not published any courses.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course, index) => (
                  <article
                    key={course.id}
                    className="technical-frame bg-[#FFF9EF] p-6"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#A95850]">
                      COURSE / {(index + 1).toString().padStart(2, "0")}
                    </p>

                    <h3 className="mt-6 font-[var(--font-typewriter)] text-xl">
                      {course.title}
                    </h3>

                    <p className="mt-3 min-h-12 text-sm leading-6 text-[#756B61]">
                      {course.description || "No course description provided."}
                    </p>

                    <a
                      href={course.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-block border-b border-[#A95850] pb-1 text-xs uppercase tracking-widest text-[#A95850] hover:text-[#87423D]"
                    >
                      Open learning resource →
                    </a>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ASSIGNMENTS */}
        {activeSection === "assignments" && (
          <section className="py-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#A95850]">
                  PRACTICAL LEARNING / 02
                </p>

                <h2 className="mt-3 font-[var(--font-typewriter)] text-3xl">
                  Your assignments
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#756B61]">
                  Complete the activities assigned to you. Each assignment
                  contains its own instructions, materials, and submission
                  requirements.
                </p>
              </div>

              <span className="border border-[#D8CCBA] bg-[#FFF9EF] px-4 py-2 text-xs text-[#756B61]">
                {assignments.length} available
              </span>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {[
                { label: "Practical", count: practicalCount },
                { label: "MCQ", count: mcqCount },
                { label: "Quiz", count: quizCount },
              ].map((item) => (
                <span
                  key={item.label}
                  className="border border-[#D8CCBA] bg-[#FFF9EF] px-3 py-2 text-[10px] uppercase tracking-widest text-[#756B61]"
                >
                  {item.label}: {item.count}
                </span>
              ))}
            </div>

            {assignmentsError ? (
              <div className="mt-8 border border-[#D8CCBA] bg-[#FFF9EF] p-6">
                <p className="text-sm text-[#A95850]">
                  Assignments could not be loaded. Please refresh the page.
                </p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="mt-8 border border-dashed border-[#D8CCBA] bg-[#FFF9EF] px-6 py-16 text-center">
                <p className="font-[var(--font-typewriter)] text-2xl">
                  No assignments yet.
                </p>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756B61]">
                  When an administrator publishes an assignment for you, it
                  will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                {assignments.map((assignment, index) => {
                  const type =
                    assignmentTypeDetails[assignment.assignment_type] ??
                    assignmentTypeDetails.scenario;

                  const overdue = isPastDeadline(assignment.due_at);

                  return (
                    <article
                      key={assignment.id}
                      className="technical-frame bg-[#FFF9EF] p-6 sm:p-7"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="border border-[#D8CCBA] bg-[#F3EBDD] px-3 py-2 text-[10px] uppercase tracking-widest text-[#756B61]">
                          {type.label}
                        </span>

                        <span className="text-[10px] uppercase tracking-widest text-[#756B61]">
                          TASK / {(index + 1).toString().padStart(2, "0")}
                        </span>
                      </div>

                      <h3 className="mt-7 font-[var(--font-typewriter)] text-2xl">
                        {assignment.title}
                      </h3>

                      <p className="mt-3 min-h-12 text-sm leading-6 text-[#756B61]">
                        {assignment.description || type.description}
                      </p>

                      <div className="mt-6 grid grid-cols-2 gap-3 border-y border-[#D8CCBA] py-4">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-[#756B61]">
                            Maximum marks
                          </p>

                          <p className="mt-2 font-[var(--font-typewriter)] text-xl">
                            {assignment.max_score}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-[#756B61]">
                            Deadline
                          </p>

                          <p className="mt-2 text-xs leading-5">
                            {formatDate(assignment.due_at)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <span
                          className={`text-[10px] uppercase tracking-widest ${
                            overdue ? "text-[#A95850]" : "text-[#47704D]"
                          }`}
                        >
                          {overdue ? "Deadline passed" : "Available"}
                        </span>

                        <Link
                          href={`/member/assignments/${assignment.id}`}
                          className="border border-[#A95850] bg-[#A95850] px-5 py-3 text-[10px] uppercase tracking-widest text-[#FFF9EF] transition hover:bg-[#87423D]"
                        >
                          Open assignment →
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* PERFORMANCE */}
        {activeSection === "performance" && (
          <section className="py-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#A95850]">
              MEMBER DEVELOPMENT / 03
            </p>

            <h2 className="mt-3 font-[var(--font-typewriter)] text-3xl">
              Performance and progress
            </h2>

            <div className="mt-8 border border-[#D8CCBA] bg-[#FFF9EF] p-7 sm:p-10">
              <p className="font-[var(--font-typewriter)] text-2xl">
                Your progress is being prepared.
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756B61]">
                This section will display your evaluated assignment scores,
                completed courses, performance points, and leaderboard
                position once those features are connected.
              </p>

              <div className="mt-8 h-2 overflow-hidden bg-[#E8DFD1]">
                <div className="h-full w-0 bg-[#A95850]" />
              </div>

              <p className="mt-3 text-[10px] uppercase tracking-widest text-[#756B61]">
                Progress tracking integration pending
              </p>
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#D8CCBA] py-7">
          <div>
            <p className="font-[var(--font-typewriter)] text-lg">
              NETFORGE<span className="text-[#A95850]">.</span>
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-widest text-[#756B61]">
              Build Skills. Forge Your Future.
            </p>
          </div>

          <p className="text-[10px] uppercase tracking-widest text-[#756B61]">
            Member workspace / 2026
          </p>
        </footer>
      </div>
    </main>
  );
}
