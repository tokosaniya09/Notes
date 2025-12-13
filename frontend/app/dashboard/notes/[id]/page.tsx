
import { Editor } from "@/features/notes/components/editor";

interface NotePageProps {
  params: {
    id: string;
  };
}

export default function NotePage({ params }: NotePageProps) {
  return (
    <div className="h-full px-4 md:px-8 py-6">
      <Editor noteId={params.id} />
    </div>
  );
}
