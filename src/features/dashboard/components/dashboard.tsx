"use client";

import { useEffect, useState } from "react";

type Stats = {
  ordersToday: number;
  confirmationRate: number;
  deliveredRate: number;
  revenueCod: number;
  byDay: { date: string; count: number }[];
  topWilayas: { wilayaCode: number; count: number }[];
};

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    void fetch("/api/admin/stats").then(async (response) => {
      if (response.ok) setStats(await response.json());
    });
  }, []);

  const cards = stats ? [
    ["Commandes du jour", stats.ordersToday],
    ["Taux de confirmation", `${stats.confirmationRate}%`],
    ["Taux livré", `${stats.deliveredRate}%`],
    ["Revenu COD livré", `${stats.revenueCod.toLocaleString("fr-DZ")} DA`],
  ] : [];

  return (
    <main className="min-h-dvh bg-[#0B0B0C] px-5 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div><p className="text-xs text-[#c8a86b]">SULTAN · ADMIN</p><h1 className="mt-1 text-3xl font-semibold">Vue d&apos;ensemble</h1></div>
          <a href="/admin" className="rounded-lg border border-white/10 px-4 py-2 text-sm">Commandes</a>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-white/8 bg-white/[.03] p-5">
              <p className="text-sm text-white/50">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
        {stats && (
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
            <section className="rounded-xl border border-white/8 p-5">
              <h2 className="font-semibold">Commandes par jour</h2>
              <div className="mt-8 flex h-48 items-end gap-3">
                {stats.byDay.map((day) => (
                  <div key={day.date} className="flex flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-xs text-white/50">{day.count}</span>
                    <div className="w-full rounded-t bg-[#c8a86b]" style={{ height: `${Math.max(8, day.count * 24)}px` }} />
                    <span className="text-[10px] text-white/35">{day.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-xl border border-white/8 p-5">
              <h2 className="font-semibold">Top wilayas</h2>
              <div className="mt-5 grid gap-4">
                {stats.topWilayas.map((item) => (
                  <div key={item.wilayaCode} className="flex justify-between border-b border-white/8 pb-3 text-sm"><span>Wilaya {item.wilayaCode}</span><strong>{item.count}</strong></div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
