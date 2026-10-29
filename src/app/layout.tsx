
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Special_Elite } from "next/font/google";
import "./globals.css";

const typewriter = Special_Elite({
  variable: "--font-typewriter",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const terminal = JetBrains_Mono({
  variable: "--font-terminal",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NetForge — Build Skills. Forge Your Future.",
    template: "%s | NetForge",
  },
  description:
    "A practical networking and IT learning club for developing technical skills, building projects, and tracking your progress.",
  applicationName: "NetForge",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F3EBDD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${typewriter.variable} ${terminal.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
