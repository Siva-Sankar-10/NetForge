
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import {
  createTrainingCycle,
  setTrainingCyclePublished,
  setTrainingCycleStatus,
} from "./actions";

export const metadata = {
  title: "Training Cycle Management | NetForge",
  description: "Create and manage monthly NetForge training cycles.",
};

type PageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

type TrainingCycle = {
  id: string;
  title: string;
  starts_on: string;
  ends_on: string;
  review_until: string;
  published: boolean;
  status: string;
  created_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function statusClass(status: string) {
  switch (status) {
    case "active":
      return "border-[#A95850]/60 text-[#87423D]";
    case "review":
      return "border-[#756B61]/50 text-[#756B61]";
    case "completed":
      return "border-[#D8CCBA] text-[#756B61]";
    default:
      return "border-[#D8CCBA] text-[#756B61]";
  }
}

export default async function AdminCyclesPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login/admin");
  }

  const { data: admin, error: adminError } = await supabase
    .from("profiles")
    .select("role, status, full_name")
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

  const { data: cycles, error: cyclesError } = await supabase
    .from("training_cycles")
    .select(
      "id, title, starts_on, ends_on, review_until, published, status, created_at"
    )
    .order("starts_on", { ascending: false });

  const cycleList = (cycles ?? []) as TrainingCycle[];

  const publishedCount = cycleList.filter(
    (cycle) => cycle.published
  ).length;

  const activeCount = cycleList.filter(
    (cycle) => cycle.status === "active"
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

            <Link href="/admin/assignments" className="button-secondary">
              ASSIGNMENTS
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
          <p className="eyebrow">
            TRAINING MANAGEMENT / NF-ADMIN-003
          </p>

          <h1 className="mt-4 text-4xl sm:text-5xl">
            Monthly training cycles.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756B61]">
            Organize NetForge training into monthly cycles.
            Prepare courses and assessments, publish the cycle
            when it is ready, and preserve performance history
            across training periods.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="technical-frame p-5">
              <p className="eyebrow">TOTAL CYCLES</p>
              <p className="brand mt-3 text-4xl">
                {cyclesError ? "—" : cycleList.length}
              </p>
            </article>

            <article className="technical-frame p-5">
              <p className="eyebrow">PUBLISHED CYCLES</p>
              <p className="brand mt-3 text-4xl">
                {cyclesError ? "—" : publishedCount}
              </p>
            </article>

            <article className="technical-frame p-5">
              <p className="eyebrow">ACTIVE CYCLES</p>
              <p className="brand mt-3 text-4xl">
                {cyclesError ? "—" : activeCount}
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
          <div className="border-b border-[#D8CCBA] pb-5">
            <p className="eyebrow">NEW TRAINING PERIOD / 01</p>

            <h2 className="mt-3 text-2xl sm:text-3xl">
              Create a training cycle
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#756B61]">
              Define the training period and give members a review
              window after the cycle ends.
            </p>
          </div>

          <form action={createTrainingCycle} className="mt-6 grid gap-5">
            <div>
              <label
                htmlFor="cycle-title"
                className="mb-2 block font-technical text-[10px] tracking-wider text-[#756B61]"
              >
                CYCLE TITLE
              </label>

              <input
                id="cycle-title"
                name="title"
                required
                maxLength={120}
                placeholder="Example: NetForge — November 2026"
                className="w-full border border-[#D8CCBA] bg-[#FFF9EF] px-4 py-3 text-sm text-[#252321]"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="cycle-start"
                  className="mb-2 block font-technical text-[10px] tracking-wider text-[#756B61]"
                >
                  START DATE
                </label>

                <input
                  id="cycle-start"
                  name="starts_on"
                  type="date"
                  required
                  className="w-full border border-[#D8CCBA] bg-[#FFF9EF] px-4 py-3 text-sm text-[#252321]"
                />
              </div>

              <div>
                <label
                  htmlFor="cycle-end"
                  className="mb-2 block font-technical text-[10px] tracking-wider text-[#756B61]"
                >
                  END DATE
                </label>

                <input
                  id="cycle-end"
                  name="ends_on"
                  type="date"
                  required
                  className="w-full border border-[#D8CCBA] bg-[#FFF9EF] px-4 py-3 text-sm text-[#252321]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="cycle-review"
                className="mb-2 block font-technical text-[10px] tracking-wider text-[#756B61]"
              >
                REVIEW DEADLINE
              </label>

              <input
                id="cycle-review"
                name="review_until"
                type="date"
                required
                className="w-full border border-[#D8CCBA] bg-[#FFF9EF] px-4 py-3 text-sm text-[#252321]"
              />

              <p className="mt-2 text-xs leading-5 text-[#756B61]">
                Members and administrators can use this period
                to review completed work before the cycle is closed.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D8CCBA] pt-5">
              <p className="text-xs text-[#756B61]">
                New cycles are created as unpublished drafts.
              </p>

              <button type="submit" className="button-primary">
                CREATE CYCLE
              </button>
            </div>
          </form>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#D8CCBA] pb-5">
            <div>
              <p className="eyebrow">TRAINING PERIOD CONTROL / 02</p>
              <h2 className="mt-3 text-2xl sm:text-3xl">
                Training cycle library
              </h2>
            </div>

            <p className="font-technical text-[9px] tracking-wider text-[#756B61]">
              {cycleList.length} CYCLES
            </p>
          </div>

          {cyclesError ? (
            <div className="mt-5 border border-[#D8CCBA] bg-[#FFF9EF] p-5 text-sm leading-7 text-[#87423D]">
              Could not load training cycles. Check that the
              training_cycles table and its administrator database
              policies are configured correctly.
            </div>
          ) : cycleList.length === 0 ? (
            <div className="mt-5 border border-[#D8CCBA] bg-[#FFF9EF] px-5 py-12 text-center">
              <p className="brand text-2xl">
                No training cycles created yet.
              </p>

              <p className="mt-3 text-sm text-[#756B61]">
                Create your first monthly training cycle using
                the form above.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5">
              {cycleList.map((cycle, index) => (
                <article
                  key={cycle.id}
                  className="technical-frame p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8CCBA] pb-4">
                    <p className="font-technical text-[9px] tracking-wider text-[#756B61]">
                      TRAINING CYCLE /{" "}
                      {String(index + 1).padStart(2, "0")}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`border px-3 py-1 font-technical text-[9px] tracking-wider ${statusClass(cycle.status)}`}
                      >
                        {cycle.status.toUpperCase()}
                      </span>

                      <span className="border border-[#D8CCBA] px-3 py-1 font-technical text-[9px] tracking-wider text-[#756B61]">
                        {cycle.published ? "PUBLISHED" : "UNPUBLISHED"}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-5 text-2xl">
                    {cycle.title}
                  </h3>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="eyebrow">START DATE</p>
                      <p className="mt-2 text-sm">
                        {formatDate(cycle.starts_on)}
                      </p>
                    </div>

                    <div>
                      <p className="eyebrow">END DATE</p>
                      <p className="mt-2 text-sm">
                        {formatDate(cycle.ends_on)}
                      </p>
                    </div>

                    <div>
                      <p className="eyebrow">REVIEW DEADLINE</p>
                      <p className="mt-2 text-sm">
                        {formatDate(cycle.review_until)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-4 border-t border-[#D8CCBA] pt-5 sm:flex-row sm:items-end sm:justify-between">
                    <form
                      action={setTrainingCycleStatus}
                      className="flex flex-wrap items-end gap-3"
                    >
                      <input
                        type="hidden"
                        name="cycle_id"
                        value={cycle.id}
                      />

                      <div>
                        <label
                          htmlFor={`status-${cycle.id}`}
                          className="mb-2 block font-technical text-[9px] tracking-wider text-[#756B61]"
                        >
                          CYCLE STATUS
                        </label>

                        <select
                          id={`status-${cycle.id}`}
                          name="status"
                          defaultValue={cycle.status}
                          className="border border-[#D8CCBA] bg-[#FFF9EF] px-3 py-3 text-sm text-[#252321]"
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="review">Review</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="button-secondary"
                      >
                        UPDATE STATUS
                      </button>
                    </form>

                    <form action={setTrainingCyclePublished}>
                      <input
                        type="hidden"
                        name="cycle_id"
                        value={cycle.id}
                      />

                      <input
                        type="hidden"
                        name="published"
                        value={cycle.published ? "false" : "true"}
                      />

                      <button
                        type="submit"
                        className="button-primary"
                      >
                        {cycle.published
                          ? "UNPUBLISH CYCLE"
                          : "PUBLISH CYCLE"}
                      </button>
                    </form>
                  </div>
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
            NETFORGE / MONTHLY TRAINING CONTROL
          </p>
        </footer>
      </div>
    </main>
  );
}
