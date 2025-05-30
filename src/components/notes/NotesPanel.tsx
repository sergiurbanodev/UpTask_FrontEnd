import { Task } from "@/types/index";
import AddNoteForm from "./AddNoteForm";
import NoteDetails from "./NoteDetails";

type NotesPanelProps = {
  notes: Task["notes"];
};
export default function NotesPanel({ notes }: NotesPanelProps) {
  return (
    <>
      <AddNoteForm />

      <div className="divide-y divide-gray-300 mt-4">
        {notes.length ? (
          <>
            <p className="font-bold text-2xl text-slate-600 my-5">Notes:</p>
            {notes.map((note) => (
              <NoteDetails key={note._id} note={note} />
            ))}
          </>
        ) : (
          <p className="text-gray-500 text-center pt-3">No notes yet</p>
        )}
      </div>
    </>
  );
}
