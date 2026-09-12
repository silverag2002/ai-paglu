import type { Metadata } from "next";
import { allNotes } from "@/lib/content";
import { PageHeader, NoteCard } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Dense revision cheatsheets — tensor shapes, backprop gradients, tokenization gotchas, training stability.",
};

export default function NotesIndex() {
  return (
    <>
      <PageHeader
        label="Notes"
        title="Revision, not explanation"
        intro={
          <>
            These assume you understood it once. They are for the second time — the formulas, the
            shapes, the three things I get wrong every time, stripped of narrative so you can find
            the line you need and leave.
          </>
        }
      />

      <div className="page band-tight">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allNotes.map((n) => (
            <NoteCard key={n.meta.slug} meta={n.meta} />
          ))}
        </div>
      </div>
    </>
  );
}
