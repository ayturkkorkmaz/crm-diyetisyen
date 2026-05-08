"use client"

import { useSyncExternalStore } from "react"
import { demoDanisanlar, demoRandevular, demoDiyetPlanlari, demoOlcumler, demoOdemeler } from "./demo-data"
import type { Danisan, Randevu, DiyetPlani, Olcum, Odeme } from "./types"

type Listener = () => void

interface State {
  danisanlar: Danisan[]
  randevular: Randevu[]
  diyetPlanlari: DiyetPlani[]
  olcumler: Olcum[]
  odemeler: Odeme[]
}

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}

function saveLS<T>(key: string, data: T) {
  if (typeof window === "undefined") return
  try { localStorage.setItem(key, JSON.stringify(data)) } catch { }
}

function syncServer(patch: Partial<State>) {
  fetch("/api/store/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  }).catch(() => { })
}

let state: State = {
  danisanlar: demoDanisanlar,
  randevular: demoRandevular,
  diyetPlanlari: demoDiyetPlanlari,
  olcumler: demoOlcumler,
  odemeler: demoOdemeler,
}
let initialized = false
const listeners = new Set<Listener>()

function notify(next: State) {
  state = next
  listeners.forEach(l => l())
}

function hydrate() {
  if (initialized) return
  initialized = true

  const danisanlar = loadLS("crm_danisanlar", demoDanisanlar)
  const hamRandevular = loadLS("crm_randevular", demoRandevular)
  const hamDiyetPlanlari = loadLS("crm_diyet_planlari", demoDiyetPlanlari)
  const hamOlcumler = loadLS("crm_olcumler", demoOlcumler)
  const hamOdemeler = loadLS("crm_odemeler", demoOdemeler)

  // Silinmiş danışanların verilerini temizle
  const ids = new Set(danisanlar.map(d => d.id))
  const randevular = hamRandevular.filter(r => ids.has(r.danisan_id))
  const diyetPlanlari = hamDiyetPlanlari.filter(p => ids.has(p.danisan_id))
  const olcumler = hamOlcumler.filter(o => ids.has(o.danisan_id))
  const odemeler = hamOdemeler.filter(o => ids.has(o.danisan_id))

  if (randevular.length !== hamRandevular.length) saveLS("crm_randevular", randevular)
  if (diyetPlanlari.length !== hamDiyetPlanlari.length) saveLS("crm_diyet_planlari", diyetPlanlari)
  if (olcumler.length !== hamOlcumler.length) saveLS("crm_olcumler", olcumler)
  if (odemeler.length !== hamOdemeler.length) saveLS("crm_odemeler", odemeler)

  state = { danisanlar, randevular, diyetPlanlari, olcumler, odemeler }
  syncServer(state)
}

export const crmStore = {
  // ── Danışan ───────────────────────────────────────────────────────────────
  addDanisan(d: Danisan) {
    const danisanlar = [...state.danisanlar, d]
    saveLS("crm_danisanlar", danisanlar)
    syncServer({ danisanlar })
    notify({ ...state, danisanlar })
  },

  updateDanisan(updated: Danisan) {
    const danisanlar = state.danisanlar.map(d => d.id === updated.id ? updated : d)
    saveLS("crm_danisanlar", danisanlar)
    syncServer({ danisanlar })
    notify({ ...state, danisanlar })
  },

  deleteDanisan(id: string) {
    const danisanlar = state.danisanlar.filter(d => d.id !== id)
    const randevular = state.randevular.filter(r => r.danisan_id !== id)
    const diyetPlanlari = state.diyetPlanlari.filter(p => p.danisan_id !== id)
    const olcumler = state.olcumler.filter(o => o.danisan_id !== id)
    const odemeler = state.odemeler.filter(o => o.danisan_id !== id)
    saveLS("crm_danisanlar", danisanlar)
    saveLS("crm_randevular", randevular)
    saveLS("crm_diyet_planlari", diyetPlanlari)
    saveLS("crm_olcumler", olcumler)
    saveLS("crm_odemeler", odemeler)
    syncServer({ danisanlar, randevular, diyetPlanlari, olcumler, odemeler })
    notify({ danisanlar, randevular, diyetPlanlari, olcumler, odemeler })
  },

  // ── Ödeme ─────────────────────────────────────────────────────────────────
  addOdeme(o: Odeme) {
    const odemeler = [...state.odemeler, o]
    saveLS("crm_odemeler", odemeler)
    syncServer({ odemeler })
    notify({ ...state, odemeler })
  },

  // ── Ölçüm ─────────────────────────────────────────────────────────────────
  addOlcum(o: Olcum) {
    const olcumler = [...state.olcumler, o]
    saveLS("crm_olcumler", olcumler)
    syncServer({ olcumler })
    notify({ ...state, olcumler })
  },

  // ── Randevu ───────────────────────────────────────────────────────────────
  addRandevu(r: Randevu) {
    const randevular = [...state.randevular, r]
    saveLS("crm_randevular", randevular)
    syncServer({ randevular })
    notify({ ...state, randevular })
  },

  updateRandevuDurum(id: string, durum: Randevu["durum"]) {
    const randevular = state.randevular.map(r => r.id === id ? { ...r, durum } : r)
    saveLS("crm_randevular", randevular)
    syncServer({ randevular })
    notify({ ...state, randevular })
  },

  // ── Subscribe ─────────────────────────────────────────────────────────────
  subscribe(l: Listener) {
    listeners.add(l)
    return () => listeners.delete(l)
  },

  getSnapshot(): State { return state },
}

// ── React Hook'ları ───────────────────────────────────────────────────────────
export function useDanisanlar(): Danisan[] {
  hydrate()
  return useSyncExternalStore(
    l => crmStore.subscribe(l),
    () => crmStore.getSnapshot().danisanlar,
    () => demoDanisanlar,
  )
}

export function useRandevular(): Randevu[] {
  hydrate()
  return useSyncExternalStore(
    l => crmStore.subscribe(l),
    () => crmStore.getSnapshot().randevular,
    () => demoRandevular,
  )
}

export function useDiyetPlanlari(): DiyetPlani[] {
  hydrate()
  return useSyncExternalStore(
    l => crmStore.subscribe(l),
    () => crmStore.getSnapshot().diyetPlanlari,
    () => demoDiyetPlanlari,
  )
}

export function useOlcumler(): Olcum[] {
  hydrate()
  return useSyncExternalStore(
    l => crmStore.subscribe(l),
    () => crmStore.getSnapshot().olcumler,
    () => demoOlcumler,
  )
}

export function useOdemeler(): Odeme[] {
  hydrate()
  return useSyncExternalStore(
    l => crmStore.subscribe(l),
    () => crmStore.getSnapshot().odemeler,
    () => demoOdemeler,
  )
}
