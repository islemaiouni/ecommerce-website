"use client";

import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Languages,
} from "lucide-react";

const wilayas = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Bejaia","Biskra","Bechar","Blida","Bouira",
  "Tamanrasset","Tebessa","Tlemcen","Tiaret","Tizi Ouzou","Alger","Djelfa","Jijel","Setif","Saida",
  "Skikda","Sidi Bel Abbes","Annaba","Guelma","Constantine","Medea","Mostaganem","Msila","Mascara",
  "Ouargla","Oran","El Bayadh","Illizi","Bordj Bou Arreridj","Boumerdes","El Tarf","Tindouf",
  "Tissemsilt","El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Ain Defla","Naama","Ain Temouchent",
  "Ghardaia","Relizane","Timimoun","Bordj Badji Mokhtar","Ouled Djellal","Beni Abbes","In Salah",
  "In Guezzam","Touggourt","Djanet","El Mghair","El Meniaa",
];

const products = [
  {
    id: "2e4f6f84-9d75-4f9e-8d48-111111111111",
    name: "Sultan Noir",
    ar: "سلطان نوير",
    type: "Boisé · Cuir · Oud",
    price: 6500,
    variantId: "a1111111-1111-4111-8111-111111111111",
  },
  {
    id: "2e4f6f84-9d75-4f9e-8d48-222222222222",
    name: "Royal Oud",
    ar: "رويال عود",
    type: "Safran · Oud · Musc",
    price: 7200,
    variantId: "a2222222-2222-4222-8222-222222222222",
  },
];

function Bottle({ dark = false }: { dark?: boolean }) {
  return (
    <div className="relative mx-auto aspect-[4/5] max-h-[520px] w-full max-w-[420px]">
      <div className="absolute inset-12 rounded-full bg-[#c8a86b]/15 blur-3xl" />
      <div className={`absolute inset-x-[24%] bottom-[8%] h-[58%] rounded-[22%] border ${dark ? "border-white/15 bg-gradient-to-b from-[#242424] to-black" : "border-[#c8a86b]/30 bg-gradient-to-b from-[#4b402d] to-[#131313]"} shadow-[0_30px_70px_rgba(0,0,0,.65)]`}>
        <div className="absolute left-1/2 top-[-19%] h-[22%] w-[54%] -translate-x-1/2 rounded-t-md border border-white/10 bg-black">
          <div className="absolute left-1/2 top-[-18%] h-[24%] w-[58%] -translate-x-1/2 rounded-t-sm bg-[#c8a86b]" />
        </div>
        <div className="absolute inset-x-[12%] top-[32%] border-y border-[#c8a86b]/50 py-5 text-center">
          <p className="font-serif text-[clamp(18px,4vw,28px)] tracking-[.22em] text-[#f4f1e8]">SULTAN</p>
          <p className="mt-1 text-[8px] tracking-[.35em] text-[#c8a86b]">EXTRAIT</p>
        </div>
      </div>
    </div>
  );
}

export function Storefront() {
  const [locale, setLocale] = useState<"fr" | "ar">("fr");
  const [deliveryType, setDeliveryType] = useState<"home" | "bureau">("home");
  const [wilayaCode, setWilayaCode] = useState(16);
  const [variantId, setVariantId] = useState(products[0].variantId);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ orderNumber: string; total: number } | null>(null);
  const [error, setError] = useState("");

  const selectedProduct = products.find((product) => product.variantId === variantId) ?? products[0];
  const shipping = useMemo(() => (deliveryType === "home" ? ([16, 31, 25, 9, 35].includes(wilayaCode) ? 600 : 900) : ([16, 31, 25, 9, 35].includes(wilayaCode) ? 400 : 650)), [deliveryType, wilayaCode]);
  const total = selectedProduct.price * quantity + shipping;

  function changeLocale() {
    const next = locale === "fr" ? "ar" : "fr";
    setLocale(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.get("customerName"),
          phone: form.get("phone"),
          wilayaCode,
          commune: form.get("commune"),
          address: form.get("address"),
          deliveryType,
          variantId,
          quantity,
          honeypot: form.get("website"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Une erreur est survenue.");
      setConfirmation({ orderNumber: data.orderNumber, total: data.totals.totalDzd });
      const analytics = window as unknown as {
        fbq?: (event: string, name: string, payload?: Record<string, unknown>) => void;
        ttq?: { track?: (name: string, payload?: Record<string, unknown>) => void };
      };
      analytics.fbq?.("track", "Purchase", {
        value: data.totals.totalDzd,
        currency: "DZD",
        content_name: selectedProduct.name,
      });
      analytics.ttq?.track?.("CompletePayment", {
        value: data.totals.totalDzd,
        currency: "DZD",
        content_name: selectedProduct.name,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="overflow-hidden bg-[#0B0B0C] text-[#F4F1E8]">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/8 bg-[#0B0B0C]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-10">
          <a href="#" className="font-serif text-xl tracking-[.32em]">SULTAN</a>
          <nav className="hidden items-center gap-8 text-sm text-white/65 md:flex">
            <a href="#collection" className="hover:text-[#c8a86b]">Collection</a>
            <a href="#order" className="hover:text-[#c8a86b]">Commander</a>
            <a href="#faq" className="hover:text-[#c8a86b]">FAQ</a>
          </nav>
          <button onClick={changeLocale} className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs" aria-label="Changer de langue">
            <Languages size={15} /> {locale === "fr" ? "العربية" : "FR"}
          </button>
        </div>
      </header>

      <section className="relative min-h-[780px] pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(200,168,107,.12),transparent_26%),linear-gradient(120deg,#0B0B0C_20%,#151412_100%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 md:min-h-[720px] md:grid-cols-[1fr_1.05fr] lg:px-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="pt-8 md:pt-0">
            <p className="mb-5 text-xs uppercase tracking-[.38em] text-[#c8a86b]">Extrait de parfum · Algérie</p>
            <h1 className="font-serif text-5xl leading-[.92] sm:text-6xl lg:text-[86px]">
              L&apos;empreinte<br /><span className="italic text-[#c8a86b]">du Sultan.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/65">
              Une présence boisée, profonde et incontestable. Conçu pour les hommes qui ne passent jamais inaperçus.
            </p>
            <div className="mt-8 flex items-end gap-5">
              <div>
                <p className="text-xs text-white/45">À partir de</p>
                <p className="mt-1 text-3xl font-semibold">6 500 <span className="text-sm text-[#c8a86b]">DA</span></p>
              </div>
              <a href="#order" className="flex h-14 items-center gap-3 rounded-sm bg-[#c8a86b] px-6 text-sm font-semibold text-[#0B0B0C] transition hover:bg-[#dac18c]">
                Commander <ArrowRight size={17} />
              </a>
            </div>
            <p className="mt-4 text-xs text-white/45">Paiement à la livraison · Livraison 48–72h</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .9, delay: .15 }}>
            <Bottle />
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-white/[.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
          {[
            [PackageCheck, "Paiement à la livraison"],
            [Truck, "Les 58 wilayas"],
            [BadgeCheck, "Produit authentique"],
            [ShieldCheck, "Livraison 48–72h"],
          ].map(([Icon, label]) => (
            <div key={String(label)} className="flex items-center gap-3 border-white/8 px-4 py-5 text-xs md:border-e md:px-8">
              <Icon size={18} className="shrink-0 text-[#c8a86b]" />
              <span>{String(label)}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="collection" className="mx-auto max-w-7xl px-5 py-24 lg:px-10">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[.35em] text-[#c8a86b]">La collection</p>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl">Deux signatures.</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {products.map((product, index) => (
            <article key={product.id} className="group border border-white/8 bg-[#111113] p-5 sm:p-7">
              <div className="overflow-hidden bg-[radial-gradient(circle_at_center,rgba(200,168,107,.12),transparent_55%)]">
                <Bottle dark={index === 1} />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-[#c8a86b]">{product.type}</p>
                  <h3 className="mt-2 font-serif text-3xl">{product.name}</h3>
                  <p className="mt-2 text-sm text-white/55">{product.price.toLocaleString("fr-DZ")} DA · 50 ml</p>
                </div>
                <button
                  onClick={() => { setVariantId(product.variantId); document.getElementById("order")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="grid size-12 place-items-center rounded-full border border-[#c8a86b]/40 text-[#c8a86b] transition group-hover:bg-[#c8a86b] group-hover:text-black"
                  aria-label={`Commander ${product.name}`}
                >
                  <ShoppingBag size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/8 bg-[#f4f1e8] text-[#111113]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[.35em] text-[#9c7b43]">Composition</p>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl">Une signature mémorable.</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              ["Tête", "Bergamote · Poivre noir"],
              ["Cœur", "Cuir · Encens"],
              ["Fond", "Oud · Ambre"],
            ].map(([title, notes]) => (
              <div key={title} className="border-s border-[#111113]/15 ps-5">
                <p className="text-xs uppercase tracking-[.25em] text-[#9c7b43]">{title}</p>
                <p className="mt-3 font-serif text-xl">{notes}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-10">
        <p className="text-center text-xs uppercase tracking-[.35em] text-[#c8a86b]">Avis clients</p>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {[
            ["★★★★★", "Le parfum tient toute la journée. Emballage parfait.", "Yacine · Alger"],
            ["★★★★★", "Très élégant, j’ai reçu mon colis en 2 jours.", "Sofiane · Oran"],
            ["★★★★★", "Le Sultan Noir est exactement comme je l’espérais.", "Amine · Constantine"],
          ].map(([stars, quote, author]) => (
            <blockquote key={author} className="border border-white/8 p-6">
              <p className="text-[#c8a86b]">{stars}</p>
              <p className="mt-5 leading-7 text-white/80">“{quote}”</p>
              <footer className="mt-6 text-xs text-white/45">{author}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section id="order" className="mx-auto max-w-5xl px-5 pb-28 lg:px-10">
        <div className="rounded-sm border border-white/10 bg-[#111113] p-5 sm:p-8">
          {confirmation ? (
            <div className="py-12 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#c8a86b] text-[#0B0B0C]"><BadgeCheck size={30} /></div>
              <h2 className="mt-6 font-serif text-4xl">Commande confirmée</h2>
              <p className="mt-3 text-white/60">Votre numéro : <strong className="text-[#c8a86b]">{confirmation.orderNumber}</strong></p>
              <p className="mt-2 text-sm text-white/45">Total à payer : {confirmation.total.toLocaleString("fr-DZ")} DA</p>
            </div>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[.35em] text-[#c8a86b]">Commander maintenant</p>
              <h2 className="mt-3 font-serif text-4xl">Finalisez votre commande</h2>
              <form onSubmit={submitOrder} className="mt-8 grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-white/70">Nom complet
                  <input name="customerName" required minLength={2} className="h-12 rounded-sm border border-white/10 bg-black/30 px-4 text-white outline-none focus:border-[#c8a86b]" />
                </label>
                <label className="grid gap-2 text-sm text-white/70">Téléphone
                  <input name="phone" required placeholder="05XX XX XX XX" className="h-12 rounded-sm border border-white/10 bg-black/30 px-4 text-white outline-none focus:border-[#c8a86b]" />
                </label>
                <label className="grid gap-2 text-sm text-white/70">Wilaya
                  <select value={wilayaCode} onChange={(event) => setWilayaCode(Number(event.target.value))} className="h-12 rounded-sm border border-white/10 bg-[#18181a] px-4 text-white outline-none">
                    {wilayas.map((name, index) => <option key={name} value={index + 1}>{String(index + 1).padStart(2, "0")} — {name}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-white/70">Commune
                  <input name="commune" required minLength={2} className="h-12 rounded-sm border border-white/10 bg-black/30 px-4 text-white outline-none focus:border-[#c8a86b]" />
                </label>
                <label className="grid gap-2 text-sm text-white/70 md:col-span-2">Adresse
                  <input name="address" required minLength={5} className="h-12 rounded-sm border border-white/10 bg-black/30 px-4 text-white outline-none focus:border-[#c8a86b]" />
                </label>
                <fieldset className="grid gap-2 text-sm text-white/70">
                  <legend>Type de livraison</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {(["home", "bureau"] as const).map((type) => (
                      <button type="button" key={type} onClick={() => setDeliveryType(type)} className={`h-12 rounded-sm border ${deliveryType === type ? "border-[#c8a86b] bg-[#c8a86b]/10 text-[#c8a86b]" : "border-white/10 text-white/60"}`}>
                        {type === "home" ? "À domicile" : "Bureau"}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="grid gap-2 text-sm text-white/70">
                  <legend>Parfum & quantité</legend>
                  <div className="grid grid-cols-[1fr_88px] gap-2">
                    <select value={variantId} onChange={(event) => setVariantId(event.target.value)} className="h-12 rounded-sm border border-white/10 bg-[#18181a] px-3 text-white">
                      {products.map((product) => <option key={product.variantId} value={product.variantId}>{product.name} · 50 ml</option>)}
                    </select>
                    <input type="number" min={1} max={10} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} className="h-12 rounded-sm border border-white/10 bg-black/30 px-3 text-white" aria-label="Quantité" />
                  </div>
                </fieldset>
                <div className="hidden" aria-hidden="true">
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </div>
                {error && <p className="md:col-span-2 text-sm text-red-300">{error}</p>}
                <div className="md:col-span-2 border-t border-white/8 pt-5">
                  <div className="mb-4 flex justify-between text-sm text-white/60"><span>Sous-total</span><span>{(selectedProduct.price * quantity).toLocaleString("fr-DZ")} DA</span></div>
                  <div className="mb-5 flex justify-between text-sm text-white/60"><span>Livraison</span><span>{shipping.toLocaleString("fr-DZ")} DA</span></div>
                  <div className="mb-5 flex items-end justify-between"><span className="text-sm">Total à payer</span><strong className="text-3xl text-[#c8a86b]">{total.toLocaleString("fr-DZ")} DA</strong></div>
                  <button disabled={submitting} className="flex h-14 w-full items-center justify-center gap-3 rounded-sm bg-[#c8a86b] font-semibold text-[#0B0B0C] disabled:opacity-60">
                    {submitting ? "Validation..." : "Confirmer ma commande"} <ArrowRight size={18} />
                  </button>
                  <p className="mt-3 text-center text-xs text-white/45">Paiement en espèces à la réception</p>
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      <section id="faq" className="border-t border-white/8 px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-serif text-3xl">Questions fréquentes</h2>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              ["Livraison", "Partout en Algérie sous 48 à 72 heures selon votre wilaya."],
              ["Paiement", "Aucun paiement en ligne : vous réglez en espèces à la livraison."],
              ["Retour", "Contactez-nous rapidement en cas de problème ou de produit endommagé."],
            ].map(([title, copy]) => (
              <div key={title} className="border border-white/8 p-5">
                <h3 className="font-semibold text-[#c8a86b]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8 px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-serif text-xl tracking-[.28em] text-white">SULTAN</p><p className="mt-2 text-xs">Parfums d&apos;exception · Algérie</p></div>
          <div className="flex items-center gap-4">
            <a href="tel:+213555000000" className="flex items-center gap-2 hover:text-[#c8a86b]"><Headphones size={16} /> Nous appeler</a>
            <a href="https://wa.me/213555000000" className="rounded-full border border-[#c8a86b]/40 px-4 py-2 text-[#c8a86b]">WhatsApp</a>
            <a href="/readme" className="hover:text-[#c8a86b]">README</a>
          </div>
        </div>
      </footer>

      <a href="#order" className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-between border-t border-[#c8a86b]/20 bg-[#0B0B0C]/95 px-5 backdrop-blur md:hidden">
        <div><p className="text-[10px] text-white/50">Commander</p><p className="font-semibold">{selectedProduct.price.toLocaleString("fr-DZ")} DA</p></div>
        <span className="flex h-11 items-center gap-2 rounded-sm bg-[#c8a86b] px-5 text-sm font-semibold text-black">Commander <ArrowRight size={16} /></span>
      </a>
    </main>
  );
}
