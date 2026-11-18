import type { Metadata } from "next";

const title = "Experience & Tech Stack | Dev Mizu";
const description =
  "Work history and core tech stack of Brandon Maurice, a full-stack engineer working with React, Next.js, TypeScript, Node.js, and cloud infrastructure.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/experience" },
  openGraph: { title, description, url: "/experience", type: "website" },
  twitter: { card: "summary", title, description },
};

export default function ExperienceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col relative antialiased">
      {children}
    </div>
  );
}
