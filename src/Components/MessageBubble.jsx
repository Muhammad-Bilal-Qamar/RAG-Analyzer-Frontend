import { Bot, User, FileText } from "lucide-react";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
          <Bot size={16} />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl p-5 text-sm leading-relaxed ${
          isUser
            ? "bg-emerald-500/10 text-emerald-100 border border-emerald-500/20 rounded-tr-none"
            : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-sm"
        }`}
      >
        <div className="whitespace-pre-wrap font-sans">{message.content}</div>

        {message.citations && message.citations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-2">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Source Citations
            </div>
            <div className="flex flex-wrap gap-2">
              {message.citations.map((cit, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-2 text-xs flex items-center gap-2 max-w-full"
                >
                  <FileText size={12} className="text-emerald-400 shrink-0" />
                  <span className="text-zinc-300 font-medium truncate">
                    {cit.file_name}
                  </span>
                  <span className="text-zinc-500 font-mono text-[10px]">
                    Pg {cit.page_number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-1">
          <User size={16} />
        </div>
      )}
    </div>
  );
}
