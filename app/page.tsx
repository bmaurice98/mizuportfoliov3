import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono, Space_Grotesk, Syne } from "next/font/google";
import { RecordStore } from "@/components/recordStore/RecordStore";
import { StoreJsonLd } from "@/components/recordStore/StoreJsonLd";
import "@/components/recordStore/recordStore.css";

// Per-record typography. Exposed as CSS variables consumed by themes.ts.
const serif = Fraunces({ subsets: ["latin"], variable: "--font-rs-serif", style: ["normal", "italic"] });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-rs-grotesk" });
const syne = Syne({ subsets: ["latin"], variable: "--font-rs-syne" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-rs-mono" });

export const metadata: Metadata = {
  title: "Dev Mizu Records — Portfolio of Brandon Maurice",
  description:
    "An interactive record store portfolio. Pull a record from the crate, put it on the turntable, and browse projects, experience and contact details.",
};

export default function Home() {
  return (
    <div
      className={`${serif.variable} ${grotesk.variable} ${syne.variable} ${mono.variable}`}
    >
      <RecordStore />
      <StoreJsonLd />
    </div>
  );
}
