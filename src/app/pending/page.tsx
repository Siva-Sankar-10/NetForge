import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Membership Status",
};

export default async function PendingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login/member");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, role, status")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return (
      <main className="site-shell py-16">
        <section className="technical-frame technical-corner mx-auto max-w-xl p-8">
          <p className="eyebrow">MEMBERSHIP / PROFILE CHECK</p>
          <h1 className="mt-4 text-3xl">Your profile is not ready yet.</h1>
          <p className="mt-4 text-sm leading-7 text-[#756B61]">
            We could not load your membership profile. Please try again later
            or contact your NetForge administrator.
          </p>
          <Link className="button-secondary mt-6" href="/login/member">
            RETURN TO LOGIN
          </Link>
        </section>
      </main>
    );
  }

  if (profile.status === "approved") {
    redirect(profile.role === "admin" ? "/admin/members" : "/member");
  }

  const rejected = profile.status === "rejected";

  return (
    <main className="min-h-screen px-4 py-10">
      <section className="technical-frame technical-corner mx-auto mt-10 max-w-2xl p-6 sm:p-10">
        <p className="eyebrow">NETFORGE / MEMBERSHIP REVIEW</p>
        <div className="mt-6 flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#A95850] font-technical text-lg text-[#A95850]">
            {rejected ? "!" : "…"}
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl">
              {rejected ? "Membership not approved." : "Your request is under review."}
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#756B61]">
              {rejected
                ? "Your NetForge membership request has not been approved. Please contact a club administrator if you believe this is a mistake."
                : `Welcome${profile.full_name ? `, ${profile.full_name}` : ""}. Your account has been created, but a NetForge administrator must approve your membership before you can enter the member workspace.`}
            </p>
          </div>
        </div>

        {!rejected && (
          <div className="mt-8 border border-[#D8CCBA] bg-[#FFF9EF] p-5">
            <p className="font-technical text-[10px] tracking-[0.08em] text-[#87423D]">
              CURRENT STATUS
            </p>
            <p className="brand mt-2 text-2xl">Pending approval</p>
            <p className="mt-2 text-xs leading-6 text-[#756B61]">
              You can sign in again later to check whether your access has
              been approved.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <form action="/auth/signout" method="post">
            <button type="submit" className="button-secondary">
              SIGN OUT
            </button>
          </form>
          <Link href="/" className="button-primary">
            NETFORGE HOME
          </Link>
        </div>
      </section>
    </main>
  );
}