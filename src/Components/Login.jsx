import { useState } from "react";
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  LogIn,
} from "lucide-react";

export default function Login({ supabase }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let response;
      if (isRegister) {
        response = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
      } else {
        response = await supabase.auth.signInWithPassword({ email, password });
      }

      if (response.error) {
        setError(response.error.message);
      } else if (isRegister) {
        alert("Registration successful! Check your email for verification.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
            {isRegister ? "Create Agent Account" : "Enterprise AI Access"}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {isRegister
              ? "Get started with context-aware RAG analysis"
              : "Sign in to access your intelligent document workspace"}
          </p>
        </div>

        <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`py-2 text-xs font-medium rounded-lg transition flex items-center justify-center gap-1.5 ${
              !isRegister
                ? "bg-zinc-900 text-emerald-400 border border-zinc-800 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <LogIn size={14} /> Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`py-2 text-xs font-medium rounded-lg transition flex items-center justify-center gap-1.5 ${
              isRegister
                ? "bg-zinc-900 text-emerald-400 border border-zinc-800 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <UserPlus size={14} /> Register
          </button>
        </div>

        {error && (
          <div className="mb-6 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-3.5 text-zinc-500"
              />
              <input
                type="email"
                placeholder="name@company.com"
                required
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-3.5 text-zinc-500"
              />
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-zinc-950 py-3 rounded-xl font-medium text-sm hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 mt-2 disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                <span>
                  {isRegister ? "Create Account" : "Access Workspace"}
                </span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800/80 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Secured with Supabase Authentication & Role Validation</span>
        </div>
      </div>
    </div>
  );
}
