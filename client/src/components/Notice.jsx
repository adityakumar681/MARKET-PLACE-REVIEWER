import { AlertCircle, X } from "lucide-react";
export default function Notice({ error, onClose }) {
  return error ? <div className="mb-5 flex items-start justify-between gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><span className="flex gap-2"><AlertCircle size={17} />{error}</span>{onClose && <button onClick={onClose} aria-label="Dismiss notification"><X size={16} /></button>}</div> : null;
}
