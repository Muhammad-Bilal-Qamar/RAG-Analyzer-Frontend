import {
  MessageSquare,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Clock,
  Layers,
  Trash2,
} from "lucide-react";

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isCollapsed,
  onToggleCollapse,
  userEmail,
  onSignOut,
}) {
  const todayChats = chats.filter((c) => c.category === "Today");
  const pastChats = chats.filter((c) => c.category === "Previous 7 Days");

  return (
    <aside
      className={`bg-zinc-950 border-r border-zinc-800/80 flex flex-col transition-all duration-300 relative ${
        isCollapsed ? "w-16" : "w-72"
      }`}
    >
      <div className="h-16 border-b border-zinc-800/80 flex items-center justify-between px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
              <Layers size={16} />
            </div>
            <span className="font-semibold text-sm text-zinc-100 tracking-tight">
              RAG
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition"
        >
          {isCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      <div className="p-3">
        <button
          onClick={onNewChat}
          className={`w-full bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 py-2.5 rounded-xl font-medium text-xs transition flex items-center justify-center gap-2 ${
            isCollapsed ? "px-0" : "px-4"
          }`}
        >
          <Plus size={16} />
          {!isCollapsed && <span>New Session</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        <div>
          {!isCollapsed && todayChats.length > 0 && (
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
              <Clock size={12} /> Today
            </div>
          )}
          <div className="space-y-1">
            {todayChats.map((chat) => (
              <div
                key={chat.id}
                className={`group w-full rounded-xl text-xs transition flex items-center justify-between px-2.5 py-2.5 ${
                  activeChatId === chat.id
                    ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                }`}
              >
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className="flex items-center gap-2.5 flex-1 text-left truncate"
                >
                  <MessageSquare
                    size={14}
                    className={
                      activeChatId === chat.id
                        ? "text-emerald-400 shrink-0"
                        : "text-zinc-500 shrink-0"
                    }
                  />
                  {!isCollapsed && (
                    <span className="truncate">{chat.title}</span>
                  )}
                </button>
                {!isCollapsed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 rounded transition"
                    title="Delete Chat"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          {!isCollapsed && pastChats.length > 0 && (
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
              <Clock size={12} /> Previous 7 Days
            </div>
          )}
          <div className="space-y-1">
            {pastChats.map((chat) => (
              <div
                key={chat.id}
                className={`group w-full rounded-xl text-xs transition flex items-center justify-between px-2.5 py-2.5 ${
                  activeChatId === chat.id
                    ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                }`}
              >
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className="flex items-center gap-2.5 flex-1 text-left truncate"
                >
                  <MessageSquare
                    size={14}
                    className={
                      activeChatId === chat.id
                        ? "text-emerald-400 shrink-0"
                        : "text-zinc-500 shrink-0"
                    }
                  />
                  {!isCollapsed && (
                    <span className="truncate">{chat.title}</span>
                  )}
                </button>
                {!isCollapsed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 rounded transition"
                    title="Delete Chat"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-zinc-800/80 flex items-center justify-between text-xs bg-zinc-950">
        {!isCollapsed && (
          <div className="truncate text-zinc-400 font-medium max-w-[170px]">
            {userEmail || "user@enterprise.ai"}
          </div>
        )}
        <button
          onClick={onSignOut}
          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
