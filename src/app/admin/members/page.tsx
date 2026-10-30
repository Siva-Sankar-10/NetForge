
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MembershipReviewForm from "@/components/MembershipReviewForm";

export const metadata = {
  title: "Member Approval | NetForge",
  description: "Review NetForge community membership requests.",
};

function AdminMembersLoading() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="site-shell">
        <header className="border-b border-[#D8CCBA] pb-5">
          <p className="brand text-2xl">NetForge</p>
          <p className="mt-1 font-technical text-[8px] tracking-wider text-[#756B61]">
            ADMINISTRATOR WORKSPACE
          </p>
        </header>

        <section className="animate-pulse py-12">
          <div className="h-3 w-48 bg-[#D8CCBA]/60" />
          <div className="mt-5 h-12 w-72 max-w-full bg-[#D8CCBA]/60" />

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="technical-frame h-28 bg-[#FFF9EF] p-5"
              >
                <div className="h-3 w-28 bg-[#D8CCBA]/60" />
                <div className="mt-5 h-7 w-20 bg-[#D8CCBA]/60" />
              </div>
            ))}
          </div>
        </section>

        <div className="technical-frame h-64 animate-pulse bg-[#FFF9EF] p-6">
          <div className="h-5 w-52 bg-[#D8CCBA]/60" />
          <div className="mt-8 h-12 w-full bg-[#D8CCBA]/40" />
          <div className="mt-4 h-12 w-full bg-[#D8CCBA]/40" />
        </div>
      </div>
    </main>
  );
}

async function AdminMembersContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login/admin");
  }

  const { data: adminProfile, error: adminError } = await supabase
    .from("profiles")
    .select("role, status, full_name")
    .eq("id", user.id)
    .single();

  if (
    adminError ||
    !adminProfile ||
    adminProfile.role !== "admin" ||
    adminProfile.status !== "approved"
  ) {
    redirect("/login/admin");
  }

  const { data: members, error: membersError } = await supabase
    .from("profiles")
    .select("id, email, full_name, status, created_at")
    .eq("role", "member")
    .order("created_at", { ascending: false });

  const allMembers = members ?? [];

  const pendingMembers = allMembers.filter(
    (member) => member.status === "pending"
  );

  const approvedMembers = allMembers.filter(
    (member) => member.status === "approved"
  );

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/+$/,
    ""
  );

  const onboardingUrl = configuredSiteUrl
    ? `${configuredSiteUrl}/join`
    : null;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="site-shell">
        <header className="flex flex-col justify-between gap-4 border-b border-[#D8CCBA] pb-5 sm:flex-row sm:items-center">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center border border-[#A95850] font-technical text-sm text-[#A95850]">
              NF
            </span>

            <span>
              <span className="brand block text-2xl leading-none">
                NetForge
              </span>
              <span className="mt-1 block font-technical text-[8px] tracking-[0.12em] text-[#756B61]">
                ADMINISTRATOR WORKSPACE
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap gap-3">
            <Link href="/" className="button-secondary">
              PUBLIC HOME
            </Link>
          <Link href="/admin/courses" className="button-secondary">
  MANAGE COURSES
</Link>
<Link href="/admin/assignments" className="button-secondary">
  ASSIGNMENTS
</Link>
<Link href="/admin/cycles" className="button-secondary">
  TRAINING CYCLES
</Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="button-primary">
                SIGN OUT
              </button>
            </form>
          </div>
        </header>

        <section className="py-9 sm:py-12">
          <p className="eyebrow">
            MEMBERSHIP CONTROL / NF-ADMIN-001
          </p>

          <h1 className="mt-4 text-4xl sm:text-5xl">
            Review membership.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#756B61]">
            Review new registrations before granting access to the NetForge
            member workspace. Only approved administrators can use these
            controls.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="technical-frame p-5">
              <p className="eyebrow">PENDING REQUESTS</p>
              <p className="brand mt-3 text-4xl">
                {membersError ? "—" : pendingMembers.length}
              </p>
            </article>

            <article className="technical-frame p-5">
              <p className="eyebrow">APPROVED MEMBERS</p>
              <p className="brand mt-3 text-4xl">
                {membersError ? "—" : approvedMembers.length}
              </p>
            </article>

            <article className="technical-frame p-5">
              <p className="eyebrow">SIGNED-IN ADMIN</p>
              <p className="mt-3 break-words text-sm">
                {adminProfile.full_name || user.email}
              </p>
            </article>
          </div>
        </section>

        <section className="technical-frame technical-corner p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-3 border-b border-[#D8CCBA] pb-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">REGISTRATION QUEUE</p>
              <h2 className="mt-3 text-2xl sm:text-3xl">
                Pending applications
              </h2>
            </div>

            <span className="font-technical text-[10px] text-[#756B61]">
              {membersError
                ? "UNAVAILABLE"
                : `${pendingMembers.length} AWAITING REVIEW`}
            </span>
          </div>

          {membersError ? (
            <div className="py-8">
              <p className="text-sm leading-7 text-[#87423D]">
                We could not load the membership list. Check that the
                onboarding SQL migration has been applied and that your
                account is an approved administrator.
              </p>
            </div>
          ) : pendingMembers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="brand text-2xl">
                No pending applications.
              </p>

              <p className="mt-3 text-sm text-[#756B61]">
                New registration requests will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#D8CCBA]">
              {pendingMembers.map((member) => (
                <article
                  key={member.id}
                  className="grid gap-4 py-6 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <p className="break-words text-lg">
                      {member.full_name || "Name not provided"}
                    </p>

                    <p className="mt-1 break-all text-sm text-[#756B61]">
                      {member.email}
                    </p>

                    <p className="mt-2 font-technical text-[9px] tracking-[0.06em] text-[#756B61]">
                      REGISTERED{" "}
                      {new Intl.DateTimeFormat("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC",
                      }).format(new Date(member.created_at))}
                    </p>
                  </div>

                  <MembershipReviewForm memberId={member.id} />
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 border border-[#D8CCBA] bg-[#FFF9EF]/75 p-5">
          <p className="eyebrow">SHARED ONBOARDING LINK</p>

          <p className="mt-2 text-sm leading-7 text-[#756B61]">
            Share your deployed NetForge website address followed by{" "}
            <code>/join</code>. New accounts remain pending until an
            administrator approves them.
          </p>

          <p className="mt-3 break-all font-technical text-xs text-[#87423D]">
            {onboardingUrl ||
              "Set NEXT_PUBLIC_SITE_URL to display your public onboarding link."}
          </p>
        </section>

        <footer className="mt-8 border-t border-[#D8CCBA] py-5">
          <p className="brand text-lg text-[#A95850]">
            Build Skills. Forge Your Future.
          </p>
        </footer>
      </div>
    </main>
  );
}

export default function AdminMembersPage() {
  return (
    <Suspense fallback={<AdminMembersLoading />}>
      <AdminMembersContent />
    </Suspense>
  );
}
