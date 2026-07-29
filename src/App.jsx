import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Login from "./Components/Login.jsx";
import ChatInterface from "./Components/ChatInterface.jsx";
import { Sparkles } from "lucide-react";

// Initialize Supabase Client using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
          <Sparkles size={24} />
        </div>
        <p className="text-xs font-mono text-zinc-500">
          Initializing Enterprise RAG Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans">
      {!session ? (
        <Login supabase={supabase} />
      ) : (
        <ChatInterface session={session} supabase={supabase} />
      )}
    </div>
  );
}
