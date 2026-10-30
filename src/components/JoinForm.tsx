"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function JoinForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }

    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/pending`;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        router.replace("/pending");
        router.refresh();
        return;
      }

      setError(
        "Your registration was submitted. Check your email for the verification link. After verifying your email, your NetForge membership will remain pending until an administrator approves it."
      );
      setPassword("");
      setConfirmation("");
    } catch {
      setError(
        "Registration could not be completed. Check your connection and Supabase configuration, then try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="site-shell">
        <header className="flex items-center justify-between gap-4 border-b border-[#D8CCBA] pb-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center border border-[#A95850] font-technical text-sm text-[#A95850]">
              NF
            </span>
            <span>
              <span className="brand block text-2xl leading-none">NetForge</span>
              <span className="mt-1 block font-technical text-[8px] tracking-[0.12em] text-[#756B61]">
                NETWORKING &amp; IT CLUB
              </span>
            </span>
          </Link>
          <Link href="/" className="font-technical text-[10px] text-[#756B61] hover:text-[#87423D]">
            BACK TO HOME
          </Link>
        </header>

        <section className="mx-auto grid max-w-5xl gap-6 py-8 sm:py-12 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="technical-frame technical-corner flex flex-col justify-between p-6 sm:p-8">
            <div>
              <p className="eyebrow">COMMUNITY ONBOARDING / NF-001</p>
              <h1 className="mt-6 text-4xl leading-tight sm:text-5xl">
                A place to learn by doing.
              </h1>
              <p className="mt-5 text-sm leading-7 text-[#756B61]">
                Join NetForge to explore networking, work on practical
                assignments, and develop your technical portfolio.
              </p>
            </div>

            <div className="mt-10 border-t border-[#D8CCBA] pt-5">
              <p className="font-technical text-[10px] tracking-[0.08em] text-[#87423D]">
                HOW MEMBERSHIP WORKS
              </p>
              <ol className="mt-4 space-y-4">
                {[
                  ["01", "Create your account"],
                  ["02", "Verify your email"],
                  ["03", "Wait for administrator approval"],
                  ["04", "Access your member workspace"],
                ].map(([number, label]) => (
                  <li key={number} className="flex items-start gap-3">
                    <span className="font-technical text-xs text-[#A95850]">
                      {number}
                    </span>
                    <span className="text-sm text-[#756B61]">{label}</span>
                  </li>
                ))}
              </ol>
              <p className="brand mt-7 text-lg text-[#A95850]">
                Build Skills. Forge Your Future.
              </p>
            </div>
          </aside>

          <section className="technical-frame technical-corner p-6 sm:p-8">
            <p className="eyebrow">NEW MEMBER REGISTRATION</p>
            <h2 className="mt-4 text-3xl sm:text-4xl">Join the community.</h2>
            <p className="mt-3 text-sm leading-7 text-[#756B61]">
              Complete the form below. Membership stays pending until an
              administrator reviews your request.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="fullName" className="mb-2 block font-technical text-[10px] tracking-[0.08em]">
                  FULL NAME
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Enter your full name"
                  className="min-h-12 w-full border border-[#D8CCBA] bg-[#F3EBDD] px-4 text-sm placeholder:text-[#9A8D7F] focus:border-[#A95850] focus:outline-none focus:ring-1 focus:ring-[#A95850]"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block font-technical text-[10px] tracking-[0.08em]">
                  EMAIL ADDRESS
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="min-h-12 w-full border border-[#D8CCBA] bg-[#F3EBDD] px-4 text-sm placeholder:text-[#9A8D7F] focus:border-[#A95850] focus:outline-none focus:ring-1 focus:ring-[#A95850]"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block font-technical text-[10px] tracking-[0.08em]">
                  CREATE PASSWORD
                </label>
                <div className="flex min-h-12 border border-[#D8CCBA] bg-[#F3EBDD] focus-within:border-[#A95850] focus-within:ring-1 focus-within:ring-[#A95850]">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    className="min-w-0 flex-1 bg-transparent px-4 text-sm placeholder:text-[#9A8D7F] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="px-4 font-technical text-[9px] text-[#756B61] hover:text-[#87423D]"
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmation" className="mb-2 block font-technical text-[10px] tracking-[0.08em]">
                  CONFIRM PASSWORD
                </label>
                <input
                  id="confirmation"
                  name="confirmation"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder="Re-enter your password"
                  className="min-h-12 w-full border border-[#D8CCBA] bg-[#F3EBDD] px-4 text-sm placeholder:text-[#9A8D7F] focus:border-[#A95850] focus:outline-none focus:ring-1 focus:ring-[#A95850]"
                />
              </div>

              {error && (
                <p
                  role="status"
                  aria-live="polite"
                  className="border border-[#D8CCBA] border-l-2 border-l-[#A95850] bg-[#F3EBDD] p-3 text-xs leading-6 text-[#756B61]"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "SUBMITTING REGISTRATION..." : "REQUEST MEMBERSHIP"}
                {!busy && <span aria-hidden="true">↗</span>}
              </button>

              <p className="text-xs leading-6 text-[#756B61]">
                Registration does not grant immediate access. Your account
                must be verified and approved by a NetForge administrator.
              </p>
            </form>

            <div className="mt-7 border-t border-[#D8CCBA] pt-5 text-center">
              <p className="text-xs text-[#756B61]">
                Already registered?{" "}
                <Link href="/login/member" className="font-technical text-[10px] text-[#87423D] underline underline-offset-4">
                  MEMBER LOGIN
                </Link>
              </p>
            </div>
          </section>
        </section>

        <footer className="border-t border-[#D8CCBA] py-4">
          <p className="font-technical text-[9px] tracking-[0.08em] text-[#756B61]">
            NETFORGE / COMMUNITY ACCESS
          </p>
        </footer>
      </div>
    </main>
  );
}