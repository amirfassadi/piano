import type { Metadata } from "next";
import { PracticeRoom } from "@/components/practice-room";

export const metadata: Metadata = {
  title: "NUANCE Sample Study No. 1 — Interactive Practice",
  description: "Practice an original four-measure NUANCE piano study with synchronized score, waterfall, keyboard, and synthesized playback.",
};

export default function PracticePage() {
  return <PracticeRoom />;
}
