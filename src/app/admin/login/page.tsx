import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#0B0B0C] px-6 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Administration</h1>
        <p className="mt-2 text-sm text-white/60">Accès réservé aux administrateurs et agents.</p>
        <LoginForm />
      </section>
    </main>
  );
}
