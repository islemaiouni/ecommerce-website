"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabase } from "@/infrastructure/supabase/browser";
import { Download, Phone, Search, Truck, X } from "lucide-react";

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  wilaya_code: number;
  commune: string;
  address: string;
  delivery_type: "home" | "bureau";
  status: string;
  subtotal_dzd: number;
  shipping_dzd: number;
  total_dzd: number;
  tracking_number: string | null;
  created_at: string;
};

const statuses = ["all","new","calling","confirmed","sent_to_delivery","shipped","delivered","no_answer","cancelled","returned"];

export function OrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [toast, setToast] = useState("");

  async function load() {
    const response = await fetch("/api/admin/orders");
    if (response.ok) setOrders(await response.json());
  }

  useEffect(() => {
    void load();
    const supabase = createBrowserSupabase();
    const channel = supabase.channel("admin-orders").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      (payload) => {
        setToast("Une commande a été mise à jour");
        if (payload.eventType === "INSERT") {
          setOrders((current) => [payload.new as Order, ...current]);
        } else if (payload.eventType === "UPDATE") {
          setOrders((current) => current.map((order) => order.id === payload.new.id ? payload.new as Order : order));
        }
        window.setTimeout(() => setToast(""), 3500);
      },
    ).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  const visible = useMemo(() => orders.filter((order) =>
    (status === "all" || order.status === status) &&
    (!search || `${order.customer_name} ${order.customer_phone}`.toLowerCase().includes(search.toLowerCase())),
  ), [orders, status, search]);

  async function changeStatus(order: Order, nextStatus: string) {
    const response = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (response.ok) void load();
  }

  async function sendToDelivery(order: Order) {
    const response = await fetch(`/api/admin/orders/${order.id}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerCode: "mock" }),
    });
    if (response.ok) {
      setToast("Commande envoyée au livreur");
      window.setTimeout(() => setToast(""), 3500);
      void load();
    } else {
      const data = await response.json();
      setToast(data.error ?? "Envoi impossible");
      window.setTimeout(() => setToast(""), 3500);
    }
  }

  return (
    <main className="min-h-dvh bg-[#0B0B0C] text-white">
      {toast && <div className="fixed end-5 top-20 z-50 rounded-lg border border-[#c8a86b]/30 bg-[#171717] px-4 py-3 text-sm shadow-2xl">{toast}</div>}
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#0B0B0C]/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between">
          <div><p className="text-xs text-[#c8a86b]">SULTAN</p><h1 className="text-xl font-semibold">Commandes</h1></div>
          <button onClick={() => { window.location.href = "/api/admin/orders/export"; }} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm"><Download size={15} /> CSV</button>
        </div>
      </header>
      <div className="mx-auto max-w-[1500px] px-5 py-6">
        <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
          {statuses.map((value) => (
            <button key={value} onClick={() => setStatus(value)} className={`shrink-0 rounded-full px-4 py-2 text-xs ${status === value ? "bg-[#c8a86b] text-black" : "border border-white/10 text-white/60"}`}>
              {value === "all" ? "Toutes" : value} <span className="ms-1 opacity-60">{value === "all" ? orders.length : orders.filter((order) => order.status === value).length}</span>
            </button>
          ))}
        </div>
        <label className="mb-4 flex h-11 max-w-md items-center gap-3 rounded-lg border border-white/10 px-3 text-white/50">
          <Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom ou téléphone..." className="w-full bg-transparent outline-none text-white" />
        </label>
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-white/[.03] text-left text-xs text-white/45">
              <tr><th className="p-4">Commande</th><th>Client</th><th>Wilaya</th><th>Livraison</th><th>Total</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order.id} className="border-t border-white/8 hover:bg-white/[.02]">
                  <td className="p-4"><button onClick={() => setSelected(order)} className="font-semibold text-[#c8a86b]">{order.order_number}</button><p className="mt-1 text-xs text-white/40">{new Date(order.created_at).toLocaleString("fr-DZ")}</p></td>
                  <td><p>{order.customer_name}</p><p className="mt-1 text-xs text-white/45">{order.customer_phone}</p></td>
                  <td>{order.wilaya_code}</td>
                  <td>{order.delivery_type === "home" ? "À domicile" : "Bureau"}</td>
                  <td>{order.total_dzd.toLocaleString("fr-DZ")} DA</td>
                  <td><span className="rounded-full bg-white/5 px-3 py-1.5 text-xs">{order.status}</span></td>
                  <td className="pe-4"><button onClick={() => setSelected(order)} className="rounded-md border border-white/10 px-3 py-2 text-xs">Ouvrir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selected && (
        <aside className="fixed inset-y-0 end-0 z-40 w-full max-w-md border-s border-white/10 bg-[#111113] p-6 shadow-2xl">
          <div className="flex items-start justify-between"><div><p className="text-xs text-[#c8a86b]">{selected.order_number}</p><h2 className="mt-1 text-2xl font-semibold">{selected.customer_name}</h2></div><button onClick={() => setSelected(null)}><X /></button></div>
          <div className="mt-8 grid gap-4 text-sm">
            <a href={`tel:${selected.customer_phone}`} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#c8a86b] font-semibold text-black"><Phone size={16} /> Appeler</a>
            <div className="rounded-lg border border-white/8 p-4"><p className="text-xs text-white/45">Adresse</p><p className="mt-2">{selected.address}</p><p className="mt-1 text-white/60">{selected.commune} · Wilaya {selected.wilaya_code}</p></div>
            <div className="flex justify-between border-b border-white/8 pb-4"><span className="text-white/50">Sous-total</span><strong>{selected.subtotal_dzd.toLocaleString("fr-DZ")} DA</strong></div>
            <div className="flex justify-between border-b border-white/8 pb-4"><span className="text-white/50">Livraison</span><strong>{selected.shipping_dzd.toLocaleString("fr-DZ")} DA</strong></div>
            <div className="flex justify-between text-lg"><span>Total</span><strong className="text-[#c8a86b]">{selected.total_dzd.toLocaleString("fr-DZ")} DA</strong></div>
            {selected.tracking_number && <div className="rounded-lg border border-[#c8a86b]/20 p-4"><p className="text-xs text-white/45">Suivi</p><p className="mt-2 font-mono text-[#c8a86b]">{selected.tracking_number}</p></div>}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => changeStatus(selected,"confirmed")} className="h-11 rounded-lg bg-[#c8a86b] text-sm font-semibold text-black">Confirmer</button>
              <button onClick={() => changeStatus(selected,"no_answer")} className="h-11 rounded-lg border border-white/10 text-sm">Pas de réponse</button>
              <button onClick={() => changeStatus(selected,"cancelled")} className="h-11 rounded-lg border border-red-400/20 text-sm text-red-300">Annuler</button>
              <button onClick={() => sendToDelivery(selected)} className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#c8a86b]/30 text-sm text-[#c8a86b]"><Truck size={15} /> Livraison</button>
            </div>
          </div>
        </aside>
      )}
    </main>
  );
}
