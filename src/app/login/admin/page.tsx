import type { Metadata } from "next";
import LoginPage from "@/components/LoginPage";

export const metadata: Metadata = {
  title: "Administrator Login",
  description:
    "Access the NetForge administrator workspace to manage courses, assignments, and member progress.",
};

export default function AdminLoginPage() {
  return <LoginPage role="admin" />;
}