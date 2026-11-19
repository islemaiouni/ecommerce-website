"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/infrastructure/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const supabase = createBrowserSupabase();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (authError) {
      setError("Identifiants incorrects.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-4">
      <label className="grid gap-2 text-sm text-white/65">Email
        <input name="email" type="email" required className="h-12 rounded-lg border border-white/10 bg-black/30 px-4 outline-none focus:border-[#c8a86b]" />
      </label>
      <label className="grid gap-2 text-sm text-white/65">Mot de passe
        <input name="password" type="password" required className="h-12 rounded-lg border border-white/10 bg-black/30 px-4 outline-none focus:border-[#c8a86b]" />
      </label>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button disabled={loading} className="mt-2 h-12 rounded-lg bg-[#c8a86b] font-semibold text-black disabled:opacity-60">
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
