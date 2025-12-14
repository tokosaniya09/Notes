
import { Editor } from "@/features/notes/components/editor";

interface NotePageProps {
  params: {
    id: string;
  };
}

export default function NotePage({ params }: NotePageProps) {
  return (
    <div className="h-full">
      <Editor noteId={params.id} />
    </div>
  );
}
