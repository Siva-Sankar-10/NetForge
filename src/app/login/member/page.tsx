import type { Metadata } from "next";
import LoginPage from "@/components/LoginPage";

export const metadata: Metadata = {
  title: "Member Login",
  description:
    "Sign in to your NetForge member workspace to access learning, assignments, and project progress.",
};

export default function MemberLoginPage() {
  return <LoginPage role="member" />;
}