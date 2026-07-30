import {
  FileText,
  Upload,
  CheckCircle,
  Clock,
  Database,
  Folder,
  Trash2,
} from "lucide-react";

export default function DocumentManager({
  docScope,
  onScopeChange,
  documents,
  activeDocId,
  onSelectDoc,
  onDeleteDoc,
  onUpload,
  fileInputRef,
}) {
  return (
    <div className="border-b border-zinc-800/80 bg-zinc-900/40 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => onScopeChange("Current Chat")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              docScope === "Current Chat"
                ? "bg-zinc-900 text-emerald-400 border border-zinc-800 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Folder size={14} /> Current Chat Session
          </button>
          <button
            onClick={() => onScopeChange("All Documents")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              docScope === "All Documents"
                ? "bg-zinc-900 text-emerald-400 border border-zinc-800 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Database size={14} /> Global Knowledge Base
          </button>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf"
            onChange={onUpload}
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 px-4 py-2 rounded-xl text-xs font-medium transition shadow-sm"
          >
            <Upload size={14} /> Upload Knowledge PDF (1 file)
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
        {documents.length === 0 ? (
          <div className="text-xs text-zinc-500 italic py-1">
            No documents attached to this context scope.
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectDoc(doc.id)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-xl border text-xs cursor-pointer whitespace-nowrap transition ${
                activeDocId === doc.id
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <FileText
                size={14}
                className={
                  activeDocId === doc.id ? "text-emerald-400" : "text-zinc-500"
                }
              />
              <span className="font-medium max-w-[140px] truncate">
                {doc.file_name}
              </span>
              {doc.status === "Indexed" ? (
                <CheckCircle size={12} className="text-emerald-400" />
              ) : (
                <Clock size={12} className="text-amber-400 animate-spin" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDoc(doc.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 rounded transition ml-1"
                title="Delete Document"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
