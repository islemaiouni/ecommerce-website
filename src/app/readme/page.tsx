import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Database, MonitorPlay, Rocket, ShieldCheck, Terminal } from "lucide-react";

export const metadata: Metadata = {
  title: "README — SULTAN",
  description: "Guide d'installation, de configuration et d'utilisation du projet SULTAN.",
};

const setupSteps = [
  {
    icon: MonitorPlay,
    title: "Démarrer sur Windows",
    description: "Ouvrez PowerShell dans le dossier du projet puis installez les dépendances.",
    code: "cd C:\\Users\\is\\Desktop\\ecommerce-website\nnpm install\nnpm run dev",
  },
  {
    icon: Database,
    title: "Configurer Supabase",
    description: "Copiez .env.example vers .env.local, puis ajoutez l'URL du projet, la clé anon et le service-role réservé au serveur.",
    code: "NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon\nSUPABASE_SERVICE_ROLE_KEY=votre-cle-service-role",
  },
  {
    icon: ShieldCheck,
    title: "Créer les tables",
    description: "Exécutez les migrations dans l'éditeur SQL Supabase, dans cet ordre.",
    code: "supabase/migrations/202611190001_phase1_schema.sql\nsupabase/migrations/202611190002_stock_and_profile.sql\nsupabase/seed.sql",
  },
  {
    icon: Rocket,
    title: "Accéder à l'administration",
    description: "Créez un utilisateur Supabase Auth puis ajoutez son UUID dans admin_profiles avec le rôle admin ou agent.",
    code: "insert into public.admin_profiles (id, role, full_name)\nvalues ('UUID-DE-L-UTILISATEUR', 'admin', 'Propriétaire');",
  },
];

export default function ReadmePage() {
  return (
    <main className="min-h-dvh bg-[#0B0B0C] text-[#F4F1E8]">
      <header className="border-b border-white/8">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 lg:px-0">
          <Link href="/" className="font-serif text-xl tracking-[.28em]">SULTAN</Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-white/60 hover:text-[#c8a86b]">
            <ArrowLeft size={16} /> Boutique
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-14 lg:px-0">
        <p className="text-xs uppercase tracking-[.35em] text-[#c8a86b]">Documentation</p>
        <h1 className="mt-4 font-serif text-5xl">README</h1>
        <p className="mt-5 max-w-2xl leading-7 text-white/60">
          Guide rapide pour démarrer, configurer et vérifier le projet SULTAN sur votre ordinateur Windows.
        </p>

        <section className="mt-12 grid gap-5">
          {setupSteps.map(({ icon: Icon, title, description, code }) => (
            <article key={title} className="grid gap-5 rounded-xl border border-white/10 bg-white/[.025] p-5 md:grid-cols-[52px_1fr] md:p-7">
              <div className="grid size-11 place-items-center rounded-full border border-[#c8a86b]/30 text-[#c8a86b]">
                <Icon size={20} />
              </div>
              <div>
                <h2 className="font-serif text-2xl">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/55">{description}</p>
                <pre className="mt-5 overflow-x-auto rounded-lg border border-white/8 bg-black/40 p-4 text-xs leading-6 text-[#dac18c]"><code>{code}</code></pre>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3">
            <Terminal size={20} className="text-[#c8a86b]" />
            <h2 className="font-serif text-2xl">Tests et production</h2>
          </div>
          <pre className="mt-5 overflow-x-auto rounded-lg border border-white/8 bg-black/40 p-4 text-xs leading-6 text-[#dac18c]"><code>{`npm test\nnpm run lint\nnpm run build\nnpm start`}</code></pre>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["Boutique", "http://127.0.0.1:3000/"],
            ["Connexion admin", "http://127.0.0.1:3000/admin/login"],
            ["Tableau admin", "http://127.0.0.1:3000/admin"],
          ].map(([label, url]) => (
            <a key={label} href={url} className="rounded-lg border border-white/10 p-4 transition hover:border-[#c8a86b]/50">
              <p className="text-sm text-white/45">{label}</p>
              <p className="mt-2 break-all text-xs text-[#c8a86b]">{url}</p>
            </a>
          ))}
        </section>

        <p className="mt-12 text-xs leading-5 text-white/35">
          Ne publiez jamais SUPABASE_SERVICE_ROLE_KEY dans le navigateur ou dans NEXT_PUBLIC_*.
          Pour envoyer sur Vercel, définissez les variables d&apos;environnement dans les paramètres du projet.
        </p>
      </div>
    </main>
  );
}
