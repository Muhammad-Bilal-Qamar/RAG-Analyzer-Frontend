import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Settings2, Sparkles } from "lucide-react";
import axios from "axios";
import ApiKeyModal from "./ApiKeyModal";
import Sidebar from "./Sidebar";
import DocumentManager from "./DocumentManager";
import MessageBubble from "./MessageBubble";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export default function ChatInterface({ session, supabase }) {
  const [groqKey, setGroqKey] = useState(localStorage.getItem("groq_api_key"));
  const userEmail = session?.user?.email;

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [globalDocuments, setGlobalDocuments] = useState([]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [docScope, setDocScope] = useState("All Documents");
  const [activeDocId, setActiveDocId] = useState(null);
  const [knowledgeMode, setKnowledgeMode] = useState("Auto");

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  const getChatCategory = (createdAt) => {
    if (!createdAt) return "Today";
    const chatDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - chatDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1 ? "Today" : "Previous 7 Days";
  };

  const fetchChats = useCallback(async () => {
    const token = session?.access_token;
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedChats = await Promise.all(
        res.data.map(async (c) => {
          let messages = [];
          try {
            const msgRes = await axios.get(
              `${API_BASE}/chats/${c.id}/messages`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            messages = msgRes.data || [];
          } catch (err) {
            console.error(`Error fetching messages for chat ${c.id}:`, err);
          }

          return {
            id: c.id,
            title: c.title,
            category: getChatCategory(c.created_at),
            boundDocIds: c.bound_doc_ids || [],
            messages: messages,
            created_at: c.created_at,
          };
        }),
      );

      setChats(formattedChats);

      if (formattedChats.length > 0) {
        setActiveChatId((prevId) => prevId || formattedChats[0].id);
      } else {
        await handleNewChat();
      }
    } catch (e) {
      console.error("Error fetching chats:", e);
    } finally {
      setIsAppLoading(false);
    }
  }, [session]);

  const fetchDocuments = useCallback(async () => {
    const token = session?.access_token;
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) setGlobalDocuments(res.data);
    } catch (e) {
      console.error("Error fetching documents:", e);
    }
  }, [session]);

  useEffect(() => {
    if (session?.access_token) {
      fetchChats();
      fetchDocuments();
      const interval = setInterval(fetchDocuments, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchChats, fetchDocuments, session]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, loading]);

  const handleNewChat = async () => {
    const token = session?.access_token;
    try {
      const res = await axios.post(
        `${API_BASE}/chats`,
        { title: "New Agent Session" },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const newChatSession = {
        id: res.data.id,
        title: res.data.title,
        category: "Today",
        boundDocIds: [],
        messages: [],
        created_at: res.data.created_at || new Date().toISOString(),
      };

      setChats((prev) => [newChatSession, ...prev]);
      setActiveChatId(res.data.id);
      setActiveDocId(null);
    } catch (e) {
      console.error("Failed to create chat", e);
    }
  };

  const handleDeleteChat = async (chatId) => {
    const token = session?.access_token;
    try {
      await axios.delete(`${API_BASE}/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const remainingChats = chats.filter((c) => c.id !== chatId);
      setChats(remainingChats);

      if (activeChatId === chatId) {
        if (remainingChats.length > 0) {
          setActiveChatId(remainingChats[0].id);
        } else {
          await handleNewChat();
        }
      }
    } catch (e) {
      console.error("Failed to delete chat session:", e);
    }
  };

  const handleDeleteDocument = async (docId) => {
    const token = session?.access_token;
    try {
      await axios.delete(`${API_BASE}/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGlobalDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (activeDocId === docId) {
        setActiveDocId(null);
      }

      setChats((prev) =>
        prev.map((c) => ({
          ...c,
          boundDocIds: c.boundDocIds.filter((id) => id !== docId),
        })),
      );
    } catch (e) {
      console.error("Failed to delete document:", e);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    if (files.length > 1) {
      alert("Only one document can be uploaded at a time. Please select a single PDF.");
      e.target.value = "";
      return;
    }

    const file = files[0];
    const token = session?.access_token;
    const formData = new FormData();
    formData.append("file", file);
    try {
      if (token) {
        const res = await axios.post(
          `${API_BASE}/documents/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );

        const docId = res.data.document_id;
        const newDoc = {
          id: docId,
          file_name: file.name,
          status: "Processing",
        };
        setGlobalDocuments((prev) => [newDoc, ...prev]);

        const updatedBoundDocs = [...(activeChat?.boundDocIds || []), docId];
        await axios.put(
          `${API_BASE}/chats/${activeChatId}`,
          { bound_doc_ids: updatedBoundDocs },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? { ...c, boundDocIds: updatedBoundDocs }
              : c,
          ),
        );
        setActiveDocId(docId);
        fetchDocuments();
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      // Reset the input so selecting the same file again re-triggers onChange
      e.target.value = "";
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChatId) return;

    const userMessage = { role: "user", content: input };
    const token = session?.access_token;

    const isFirstMessage = activeChat?.messages?.length === 0;
    const chatTitle = isFirstMessage
      ? input.substring(0, 30) + "..."
      : activeChat.title;

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              title: chatTitle,
              messages: [...(c.messages || []), userMessage],
            }
          : c,
      ),
    );

    setInput("");
    setLoading(true);

    if (isFirstMessage) {
      try {
        await axios.put(
          `${API_BASE}/chats/${activeChatId}`,
          { title: chatTitle },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } catch (titleErr) {
        console.error("Error updating chat title:", titleErr);
      }
    }

    const formData = new FormData();
    formData.append("session_id", activeChatId);
    formData.append("query", userMessage.content);
    formData.append(
      "scope",
      docScope === "Current Chat" ? "Current Chat Document" : "All Documents",
    );
    formData.append("knowledge_mode", knowledgeMode);
    if (activeDocId) formData.append("doc_id", activeDocId);

    try {
      if (token && groqKey) {
        const res = await axios.post(`${API_BASE}/chat`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Groq-Api-Key": groqKey,
          },
        });

        const assistantReply = {
          role: "assistant",
          content: res.data.answer,
          citations: res.data.citations,
        };

        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? { ...c, messages: [...c.messages, assistantReply] }
              : c,
          ),
        );
      }
    } catch (err) {
      console.error("Chat Error:", err);
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    role: "assistant",
                    content: "Error processing request. Check connection.",
                  },
                ],
              }
            : c,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const visibleDocuments =
    docScope === "Current Chat"
      ? globalDocuments.filter((d) => activeChat?.boundDocIds?.includes(d.id))
      : globalDocuments;

  if (!groqKey) return <ApiKeyModal onSave={setGroqKey} />;

  if (isAppLoading)
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">
        Loading Workspace Data...
      </div>
    );

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans antialiased overflow-hidden">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        userEmail={userEmail}
        onSignOut={() => supabase.auth.signOut()}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
        <div className="h-16 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <Sparkles size={16} className="text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide text-zinc-300">
              {activeChat?.title || "Agent Workspace"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Settings2 size={14} />
              <span>Engine Mode:</span>
              <select
                value={knowledgeMode}
                onChange={(e) => setKnowledgeMode(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Auto">Auto (Hybrid)</option>
                <option value="Document Only">Strict Document Only</option>
                <option value="Real-World Knowledge">
                  Real-World Knowledge
                </option>
              </select>
            </div>
          </div>
        </div>

        <DocumentManager
          docScope={docScope}
          onScopeChange={setDocScope}
          documents={visibleDocuments}
          activeDocId={activeDocId}
          onSelectDoc={setActiveDocId}
          onDeleteDoc={handleDeleteDocument}
          onUpload={handleFileUpload}
          fileInputRef={fileInputRef}
        />

        <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
          {!activeChat ||
          !activeChat.messages ||
          activeChat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shadow-xl">
                <Sparkles size={24} />
              </div>
              <div className="max-w-sm">
                <h3 className="text-sm font-semibold text-zinc-200">
                  RAG Agent Ready
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Upload a PDF document above or ask questions to search across
                  your knowledge base.
                </p>
              </div>
            </div>
          ) : (
            activeChat.messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))
          )}

          {loading && (
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono py-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Querying Groq engine & writing to DB...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Query ${docScope.toLowerCase()} scope...`}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-2xl py-4 pl-5 pr-14 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-sm transition shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !activeChatId}
              className="absolute right-2.5 top-2.5 bottom-2.5 bg-emerald-500 text-zinc-950 px-3.5 rounded-xl disabled:bg-zinc-800 disabled:text-zinc-600 hover:bg-emerald-400 transition flex items-center justify-center shadow-lg shadow-emerald-500/10"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
