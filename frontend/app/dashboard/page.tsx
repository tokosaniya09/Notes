
import { NotesList } from "@/features/notes/components/notes-list";
import { FadeIn } from "@/components/motion/fade-in";

export default function DashboardPage() {
  return (
    <FadeIn>
      <NotesList />
    </FadeIn>
  );
}
