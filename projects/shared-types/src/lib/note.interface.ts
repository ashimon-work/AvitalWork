export interface Note {
  id?: string;
  content: string;
  createdAt: string; // Or Date, if your backend provides it as such and you handle it
  // createdBy?: string; // Optional: if you track who created the note
}