import type { Metadata } from "next";
import JoinForm from "@/components/JoinForm";

export const metadata: Metadata = {
  title: "Join NetForge",
  description:
    "Create a NetForge community account and request membership approval.",
};

export default function JoinPage() {
  return <JoinForm />;
}