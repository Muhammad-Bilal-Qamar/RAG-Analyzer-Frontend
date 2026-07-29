import { useState } from "react";
import { Key, ArrowRight, ShieldCheck } from "lucide-react";

export default function ApiKeyModal({ onSave }) {
  const [key, setKey] = useState("");

  const handleSave = () => {
    if (key.startsWith("gsk_")) {
      localStorage.setItem("groq_api_key", key);
      onSave(key);
    } else {
      alert("Invalid key format. Groq keys typically start with 'gsk_'");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Key size={22} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">
              API Key Required
            </h3>
            <p className="text-xs text-zinc-400">Groq LLM Engine Connection</p>
          </div>
        </div>

        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          To enable local agent inference, please provide a free Groq API Key.
          Your key is stored strictly within your browser's local storage.
        </p>

        <a
          href="https://console.groq.com/keys"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium hover:text-emerald-300 transition mb-6"
        >
          <ShieldCheck size={14} /> Get your key from Groq Console{" "}
          <ArrowRight size={12} />
        </a>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="gsk_..."
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-mono placeholder:text-zinc-600 transition"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <button
            onClick={handleSave}
            className="w-full bg-emerald-500 text-zinc-950 py-3 rounded-xl font-medium text-sm hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
          >
            Authenticate & Launch
          </button>
        </div>
      </div>
    </div>
  );
}
