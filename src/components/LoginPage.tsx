"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type LoginRole = "member" | "admin";

const roleContent = {
  member: {
    code: "WORKSPACE / MEMBER",
    title: "Your next skill starts here.",
    description: "Continue your learning, complete assignments, and build your technical portfolio.",
    heading: "Welcome back.",
    subheading: "Sign in to check your membership and access your workspace.",
    button: "SIGN IN TO MEMBER SPACE",
    alternate: "Are you new to NetForge?",
    alternateLabel: "Join the community",
    alternateHref: "/join",
  },
  admin: {
    code: "WORKSPACE / ADMINISTRATOR",
    title: "Build a stronger learning community.",
    description: "Manage course allocations, review assignments, and support member development.",
    heading: "Administrator access.",
    subheading: "Sign in with your authorized administrator account.",
    button: "SIGN IN TO ADMIN SPACE",
    alternate: "Are you a member?",
    alternateLabel: "Member login",
    alternateHref: "/login/member",
  },
} satisfies Record<LoginRole, Record<string, string>>;

export default function LoginPage({ role }: { role: LoginRole }) {
  const router = useRouter();
  const content = roleContent[role];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        setMessage("Sign-in failed. Check your credentials and email verification, then try again.");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        await supabase.auth.signOut();
        setMessage("We could not verify your account. Please sign in again.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setMessage("Your NetForge profile could not be found. Contact an administrator.");
        return;
      }

      if (profile.status !== "approved") {
        router.replace("/pending");
        router.refresh();
        return;
      }

      if (role === "admin" && profile.role !== "admin") {
        await supabase.auth.signOut();
        setMessage("This account does not have administrator permissions.");
        return;
      }

      if (role === "member" && profile.role !== "member") {
        router.replace("/admin/members");
        router.refresh();
        return;
      }

      router.replace("/member");
      router.refresh();
    } catch {
      setMessage("Unable to connect to NetForge authentication. Check your Supabase configuration.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[1180px] flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-[#D8CCBA] pb-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center border border-[#A95850] font-technical text-sm text-[#A95850]">NF</span>
            <span>
              <span className="brand block text-2xl leading-none">NetForge</span>
              <span className="mt-1 block font-technical text-[8px] tracking-[0.12em] text-[#756B61]">NETWORKING &amp; IT CLUB</span>
            </span>
          </Link>
          <Link href="/" className="font-technical text-[10px] text-[#756B61] hover:text-[#87423D]">BACK TO HOME</Link>
        </header>

        <section className="grid flex-1 items-stretch gap-6 py-7 sm:py-10 lg:grid-cols-[1fr_0.9fr] lg:gap-10">
          <aside className="technical-frame technical-corner flex flex-col justify-between p-6 sm:p-9 lg:p-10">
            <div>
              <p className="eyebrow">{content.code}</p>
              <h1 className="mt-7 max-w-lg text-4xl leading-tight sm:text-5xl">{content.title}</h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-[#756B61]">{content.description}</p>
            </div>
            <div className="mt-10">
              <div className="network-panel technical-corner p-5">
                <svg viewBox="0 0 420 190" role="img" aria-label="Animated NetForge network diagram" className="block h-auto w-full">
                  <g className="network-line">
                    <path d="M210 52 V78" />
                    <path d="M210 111 V130 H75 V145" />
                    <path d="M210 130 V145" />
                    <path d="M210 130 H345 V145" />
                  </g>
                  <g transform="translate(177 12)">
                    <rect width="66" height="40" rx="2" className="network-node" />
                    <path d="M15 12 H51 M15 20 H51 M15 28 H51" stroke="#A95850" strokeWidth="2" />
                  </g>
                  <g transform="translate(174 78)">
                    <rect width="72" height="33" rx="2" className="network-node" />
                    {Array.from({ length: 5 }, (_, i) => <circle key={i} cx={15 + i * 11} cy="17" r="2.5" fill="#A95850" />)}
                  </g>
                  {[75, 210, 345].map((x, i) => (
                    <g key={x} transform={`translate(${x - 20} 145)`}>
                      <rect width="40" height="29" rx="1" className="network-node" />
                      <path d="M10 35 H30 M20 29 V35" stroke="#A95850" strokeWidth="1.5" fill="none" />
                      <text x="20" y="48" textAnchor="middle" fill="#E7D6C1" fontSize="9">{`PC-0${i + 1}`}</text>
                    </g>
                  ))}
                  <circle className="network-packet" r="3"><animateMotion dur="2.6s" repeatCount="indefinite" path="M210 52 V78" /></circle>
                  <circle className="network-packet" r="3"><animateMotion dur="3.4s" repeatCount="indefinite" path="M210 111 V130 H75 V145" /></circle>
                  <circle className="network-packet" r="3"><animateMotion dur="3s" repeatCount="indefinite" path="M210 111 V130 H345 V145" /></circle>
                </svg>
                <p className="mt-3 border-t border-white/15 pt-3 font-technical text-[9px] text-[#B9AA98]">NETWORK TOPOLOGY / SIMULATED</p>
              </div>
              <p className="brand mt-6 text-lg text-[#A95850]">Build Skills. Forge Your Future.</p>
            </div>
          </aside>

          <section className="technical-frame technical-corner flex flex-col justify-center p-6 sm:p-9 lg:p-10">
            <p className="eyebrow">AUTHENTICATION / {role === "admin" ? "02" : "01"}</p>
            <h2 className="mt-4 text-3xl sm:text-4xl">{content.heading}</h2>
            <p className="mt-3 text-sm leading-7 text-[#756B61]">{content.subheading}</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="login-email" className="mb-2 block font-technical text-[10px] tracking-[0.08em]">EMAIL ADDRESS</label>
                <input id="login-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="min-h-12 w-full border border-[#D8CCBA] bg-[#F3EBDD] px-4 text-sm placeholder:text-[#9A8D7F] focus:border-[#A95850] focus:outline-none focus:ring-1 focus:ring-[#A95850]" />
              </div>
              <div>
                <label htmlFor="login-password" className="mb-2 block font-technical text-[10px] tracking-[0.08em]">PASSWORD</label>
                <div className="flex min-h-12 border border-[#D8CCBA] bg-[#F3EBDD] focus-within:border-[#A95850] focus-within:ring-1 focus-within:ring-[#A95850]">
                  <input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="min-w-0 flex-1 bg-transparent px-4 text-sm placeholder:text-[#9A8D7F] focus:outline-none" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="px-4 font-technical text-[9px] text-[#756B61] hover:text-[#87423D]}">{showPassword ? "HIDE" : "SHOW"}</button>
                </div>
              </div>

              {message && <p role="status" aria-live="polite" className="border border-[#D8CCBA] border-l-2 border-l-[#A95850] bg-[#F3EBDD] p-3 text-xs leading-6 text-[#756B61]">{message}</p>}

              <button type="submit" disabled={busy} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
                {busy ? "VERIFYING ACCOUNT..." : content.button}
                {!busy && <span aria-hidden="true">↗</span>}
              </button>
              <p className="text-center text-[10px] leading-5 text-[#756B61]">Access depends on your verified account and approved membership role.</p>
            </form>

            <div className="my-7 flex items-center gap-4">
              <span className="h-px flex-1 bg-[#D8CCBA]" />
              <span className="font-technical text-[9px] text-[#756B61]">NETFORGE ACCESS</span>
              <span className="h-px flex-1 bg-[#D8CCBA]" />
            </div>
            <p className="text-center text-xs leading-6 text-[#756B61]">
              {content.alternate}{" "}
              <Link href={content.alternateHref} className="font-technical text-[10px] text-[#87423D] underline underline-offset-4">{content.alternateLabel}</Link>
            </p>
          </section>
        </section>

        <footer className="border-t border-[#D8CCBA] py-4">
          <p className="font-technical text-[9px] tracking-[0.08em] text-[#756B61]">NETFORGE / AUTHENTICATED WORKSPACE</p>
        </footer>
      </div>
    </main>
  );
}