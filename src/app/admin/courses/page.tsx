
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createCourse,
  updateCourse,
  setCoursePublished,
  deleteCourse,
} from "./actions";

export const metadata = {
  title: "Course Management | NetForge",
  description: "Create and manage NetForge community courses.",
};

type PageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

export default async function AdminCoursesPage({
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

  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select(
      "id, title, description, resource_url, published, created_at"
    )
    .order("created_at", { ascending: false });

  const courseList = courses ?? [];
  const publishedCount = courseList.filter(
    (course) => course.published
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

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/members" className="button-secondary">
              MEMBERS
            </Link>
            <Link href="/member" className="button-secondary">
              MEMBER VIEW
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="button-primary">
                SIGN OUT
              </button>
            </form>
          </div>
        </header>

        <section className="py-10 sm:py-12">
          <p className="eyebrow">LEARNING MANAGEMENT / NF-ADMIN-002</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">
            Course management.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756B61]">
            Create learning resources for the NetForge community. New
            courses remain unpublished until you choose to make them
            available to approved members.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="technical-frame p-5">
              <p className="eyebrow">TOTAL COURSES</p>
              <p className="brand mt-3 text-4xl">
                {coursesError ? "—" : courseList.length}
              </p>
            </article>
            <article className="technical-frame p-5">
              <p className="eyebrow">PUBLISHED</p>
              <p className="brand mt-3 text-4xl">
                {coursesError ? "—" : publishedCount}
              </p>
            </article>
            <article className="technical-frame p-5">
              <p className="eyebrow">SIGNED-IN ADMIN</p>
              <p className="mt-3 break-words text-sm">
                {admin.full_name || user.email}
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
            <p className="eyebrow">NEW LEARNING RESOURCE / 01</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">
              Add a course
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#756B61]">
              Add a title, a short explanation and a link to the learning
              resource.
            </p>
          </div>

          <form action={createCourse} className="mt-6 grid gap-5">
            <div>
              <label
                htmlFor="new-course-title"
                className="mb-2 block font-technical text-[10px] tracking-wider text-[#756B61]"
              >
                COURSE TITLE
              </label>
              <input
                id="new-course-title"
                name="title"
                required
                maxLength={120}
                placeholder="Example: Networking Fundamentals"
                className="w-full border border-[#D8CCBA] bg-[#FFF9EF] px-4 py-3 text-sm text-[#252321]"
              />
            </div>

            <div>
              <label
                htmlFor="new-course-description"
                className="mb-2 block font-technical text-[10px] tracking-wider text-[#756B61]"
              >
                DESCRIPTION
              </label>
              <textarea
                id="new-course-description"
                name="description"
                rows={4}
                maxLength={2000}
                placeholder="Explain what members will learn..."
                className="w-full resize-y border border-[#D8CCBA] bg-[#FFF9EF] px-4 py-3 text-sm leading-6 text-[#252321]"
              />
            </div>

            <div>
              <label
                htmlFor="new-course-url"
                className="mb-2 block font-technical text-[10px] tracking-wider text-[#756B61]"
              >
                RESOURCE URL
              </label>
              <input
                id="new-course-url"
                name="resource_url"
                type="url"
                required
                placeholder="https://..."
                className="w-full border border-[#D8CCBA] bg-[#FFF9EF] px-4 py-3 text-sm text-[#252321]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D8CCBA] pt-5">
              <p className="text-xs text-[#756B61]">
                New courses are saved as unpublished.
              </p>
              <button type="submit" className="button-primary">
                CREATE COURSE
              </button>
            </div>
          </form>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#D8CCBA] pb-5">
            <div>
              <p className="eyebrow">RESOURCE CONTROL / 02</p>
              <h2 className="mt-3 text-2xl sm:text-3xl">
                Course library
              </h2>
            </div>
            <p className="font-technical text-[9px] tracking-wider text-[#756B61]">
              {courseList.length} COURSES
            </p>
          </div>

          {coursesError ? (
            <div className="mt-5 border border-[#D8CCBA] bg-[#FFF9EF] p-5 text-sm leading-7 text-[#87423D]">
              Could not load courses. Check that the courses table and
              administrator database policies are configured correctly.
            </div>
          ) : courseList.length === 0 ? (
            <div className="mt-5 border border-[#D8CCBA] bg-[#FFF9EF] px-5 py-12 text-center">
              <p className="brand text-2xl">No courses created yet.</p>
              <p className="mt-3 text-sm text-[#756B61]">
                Use the form above to add your first community learning
                resource.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5">
              {courseList.map((course, index) => (
                <article
                  key={course.id}
                  className="technical-frame p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8CCBA] pb-4">
                    <p className="font-technical text-[9px] tracking-wider text-[#756B61]">
                      COURSE / {String(index + 1).padStart(2, "0")}
                    </p>
                    <span
                      className={`border px-3 py-1 font-technical text-[9px] tracking-wider ${
                        course.published
                          ? "border-[#A95850]/50 text-[#87423D]"
                          : "border-[#D8CCBA] text-[#756B61]"
                      }`}
                    >
                      {course.published ? "PUBLISHED" : "UNPUBLISHED"}
                    </span>
                  </div>

                  <form action={updateCourse} className="mt-5 grid gap-4">
                    <input
                      type="hidden"
                      name="course_id"
                      value={course.id}
                    />

                    <div>
                      <label className="mb-2 block font-technical text-[9px] tracking-wider text-[#756B61]">
                        COURSE TITLE
                      </label>
                      <input
                        name="title"
                        required
                        maxLength={120}
                        defaultValue={course.title}
                        className="w-full border border-[#D8CCBA] bg-[#FFF9EF] px-3 py-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-technical text-[9px] tracking-wider text-[#756B61]">
                        DESCRIPTION
                      </label>
                      <textarea
                        name="description"
                        rows={3}
                        maxLength={2000}
                        defaultValue={course.description ?? ""}
                        className="w-full resize-y border border-[#D8CCBA] bg-[#FFF9EF] px-3 py-3 text-sm leading-6"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-technical text-[9px] tracking-wider text-[#756B61]">
                        RESOURCE URL
                      </label>
                      <input
                        name="resource_url"
                        type="url"
                        required
                        defaultValue={course.resource_url}
                        className="w-full border border-[#D8CCBA] bg-[#FFF9EF] px-3 py-3 text-sm"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D8CCBA] pt-4">
                      <a
                        href={course.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link text-xs"
                      >
                        OPEN RESOURCE
                      </a>
                      <button type="submit" className="button-secondary">
                        SAVE CHANGES
                      </button>
                    </div>
                  </form>

                  <div className="mt-4 flex flex-wrap gap-3 border-t border-[#D8CCBA] pt-4">
                    <form action={setCoursePublished}>
                      <input
                        type="hidden"
                        name="course_id"
                        value={course.id}
                      />
                      <input
                        type="hidden"
                        name="published"
                        value={course.published ? "false" : "true"}
                      />
                      <button type="submit" className="button-primary">
                        {course.published ? "UNPUBLISH COURSE" : "PUBLISH COURSE"}
                      </button>
                    </form>

                    <form action={deleteCourse}>
                      <input
                        type="hidden"
                        name="course_id"
                        value={course.id}
                      />
                      <button
                        type="submit"
                        className="button-secondary"
                      >
                        DELETE
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
            NETFORGE / ADMINISTRATOR COURSE CONTROL
          </p>
        </footer>
      </div>
    </main>
  );
}
