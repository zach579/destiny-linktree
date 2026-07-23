"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Incorrect email or password.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-24 px-5">
      <div className="bg-surface border border-borderCol rounded-2xl p-7 text-center">
        <Lock size={22} className="text-brass mx-auto mb-2.5" />
        <div className="font-display text-xl mb-1">Control Room</div>
        <div className="text-sm text-muted mb-5">Sign in to manage all three campuses.</div>
        <form onSubmit={handleLogin} className="flex flex-col gap-2.5">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="px-3 py-2.5 rounded-lg bg-bg border border-borderCol text-ink outline-none"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="px-3 py-2.5 rounded-lg bg-bg border border-borderCol text-ink outline-none"
          />
          {error && <div className="text-clay text-xs">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1.5 px-3 py-2.5 rounded-lg bg-brass text-[#1A1408] font-semibold"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
