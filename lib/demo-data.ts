import type { Danisan, Olcum, Randevu, DiyetPlani, Odeme, DashboardIstatistik } from './types'

export const demoDanisanlar: Danisan[] = [
  {
    id: 'd1', created_at: '2024-01-10T10:00:00Z', kayit_tarihi: '2024-01-10',
    ad: 'Ayşe', soyad: 'Kaya', email: 'ayse.kaya@gmail.com', telefon: '+90 532 111 2233',
    dogum_tarihi: '1990-05-15', cinsiyet: 'kadin', boy_cm: 165,
    baslangic_kilo: 78, hedef_kilo: 62, hedef_turu: 'kilo_verme', durum: 'aktif',
    alerjiler: ['Laktoz'], hastaliklar: ['Hipotiroid'],
    notlar: 'Düzenli spor yapıyor, haftada 3 gün yürüyüş.',
  },
  {
    id: 'd2', created_at: '2024-01-15T10:00:00Z', kayit_tarihi: '2024-01-15',
    ad: 'Mehmet', soyad: 'Demir', email: 'mehmet.demir@gmail.com', telefon: '+90 542 222 3344',
    dogum_tarihi: '1985-09-20', cinsiyet: 'erkek', boy_cm: 178,
    baslangic_kilo: 95, hedef_kilo: 82, hedef_turu: 'kilo_verme', durum: 'aktif',
    alerjiler: [], hastaliklar: ['Tip 2 Diyabet', 'Hipertansiyon'],
    notlar: 'İnsülin direnci var, düşük glisemik diyet uygulanıyor.',
  },
  {
    id: 'd3', created_at: '2024-02-01T10:00:00Z', kayit_tarihi: '2024-02-01',
    ad: 'Zeynep', soyad: 'Arslan', email: 'zeynep.arslan@gmail.com', telefon: '+90 505 333 4455',
    dogum_tarihi: '1995-03-08', cinsiyet: 'kadin', boy_cm: 162,
    baslangic_kilo: 55, hedef_kilo: 60, hedef_turu: 'kilo_alma', durum: 'aktif',
    alerjiler: ['Gluten'], hastaliklar: [],
    notlar: 'Çölyak hastası, glutensiz beslenme zorunlu.',
  },
  {
    id: 'd4', created_at: '2024-02-10T10:00:00Z', kayit_tarihi: '2024-02-10',
    ad: 'Ali', soyad: 'Yıldız', email: 'ali.yildiz@gmail.com', telefon: '+90 535 444 5566',
    dogum_tarihi: '1992-12-25', cinsiyet: 'erkek', boy_cm: 175,
    baslangic_kilo: 72, hedef_kilo: 78, hedef_turu: 'kas_kazanimi', durum: 'aktif',
    alerjiler: [], hastaliklar: [],
    notlar: 'Düzenli fitness yapıyor, yüksek protein diyeti.',
  },
  {
    id: 'd5', created_at: '2024-02-20T10:00:00Z', kayit_tarihi: '2024-02-20',
    ad: 'Fatma', soyad: 'Şahin', email: 'fatma.sahin@gmail.com', telefon: '+90 545 555 6677',
    dogum_tarihi: '1978-07-14', cinsiyet: 'kadin', boy_cm: 158,
    baslangic_kilo: 88, hedef_kilo: 70, hedef_turu: 'kilo_verme', durum: 'aktif',
    alerjiler: ['Yumurta'], hastaliklar: ['Kolesterol', 'Gut'],
    notlar: 'Düşük pürin diyeti uygulanıyor.',
  },
  {
    id: 'd6', created_at: '2024-03-05T10:00:00Z', kayit_tarihi: '2024-03-05',
    ad: 'Burak', soyad: 'Çelik', email: 'burak.celik@gmail.com', telefon: '+90 555 666 7788',
    dogum_tarihi: '2000-11-30', cinsiyet: 'erkek', boy_cm: 182,
    baslangic_kilo: 68, hedef_kilo: 75, hedef_turu: 'kilo_alma', durum: 'beklemede',
    alerjiler: [], hastaliklar: [],
  },
  {
    id: 'd7', created_at: '2024-03-15T10:00:00Z', kayit_tarihi: '2024-03-15',
    ad: 'Elif', soyad: 'Güneş', email: 'elif.gunes@gmail.com', telefon: '+90 532 777 8899',
    dogum_tarihi: '1988-04-22', cinsiyet: 'kadin', boy_cm: 170,
    baslangic_kilo: 68, hedef_kilo: 65, hedef_turu: 'koruma', durum: 'pasif',
    alerjiler: [], hastaliklar: [],
    notlar: 'Hedefine ulaştı, bakım programına alındı.',
  },
  {
    id: 'd8', created_at: '2024-04-01T10:00:00Z', kayit_tarihi: '2024-04-01',
    ad: 'Selin', soyad: 'Öztürk', email: 'selin.ozturk@gmail.com', telefon: '+90 542 888 9900',
    dogum_tarihi: '1996-08-18', cinsiyet: 'kadin', boy_cm: 160,
    baslangic_kilo: 82, hedef_kilo: 68, hedef_turu: 'kilo_verme', durum: 'aktif',
    alerjiler: ['Fındık', 'Fıstık'], hastaliklar: ['PCOS'],
    notlar: 'PCOS diyeti uygulanıyor, düşük karbonhidrat.',
  },
]

export const demoOlcumler: Olcum[] = [
  // Ayşe ölçümleri
  { id: 'o1', danisan_id: 'd1', tarih: '2024-01-10', kilo_kg: 78, bmi: 28.7, yag_orani: 34, kas_orani: 28, bel_cm: 86, kalca_cm: 102 },
  { id: 'o2', danisan_id: 'd1', tarih: '2024-02-10', kilo_kg: 75.2, bmi: 27.6, yag_orani: 32.5, kas_orani: 29, bel_cm: 83, kalca_cm: 100 },
  { id: 'o3', danisan_id: 'd1', tarih: '2024-03-10', kilo_kg: 72.8, bmi: 26.8, yag_orani: 31, kas_orani: 30, bel_cm: 80, kalca_cm: 98 },
  { id: 'o4', danisan_id: 'd1', tarih: '2024-04-10', kilo_kg: 70.5, bmi: 25.9, yag_orani: 29.5, kas_orani: 31, bel_cm: 78, kalca_cm: 96 },
  { id: 'o5', danisan_id: 'd1', tarih: '2024-05-05', kilo_kg: 68.3, bmi: 25.1, yag_orani: 28, kas_orani: 32, bel_cm: 76, kalca_cm: 94 },
  // Mehmet ölçümleri
  { id: 'o6', danisan_id: 'd2', tarih: '2024-01-15', kilo_kg: 95, bmi: 30.0, yag_orani: 28, kas_orani: 38, bel_cm: 102, kalca_cm: 108 },
  { id: 'o7', danisan_id: 'd2', tarih: '2024-02-15', kilo_kg: 92.5, bmi: 29.2, yag_orani: 26.5, kas_orani: 39, bel_cm: 99, kalca_cm: 106 },
  { id: 'o8', danisan_id: 'd2', tarih: '2024-03-15', kilo_kg: 90.1, bmi: 28.4, yag_orani: 25, kas_orani: 40, bel_cm: 96, kalca_cm: 104 },
  { id: 'o9', danisan_id: 'd2', tarih: '2024-04-15', kilo_kg: 87.8, bmi: 27.7, yag_orani: 23.5, kas_orani: 41, bel_cm: 93, kalca_cm: 102 },
]

export const demoRandevular: Randevu[] = [
  { id: 'r1', danisan_id: 'd1', danisan: demoDanisanlar[0], tarih: '2026-05-05', saat: '09:00', sure_dk: 60, tur: 'İlk Görüşme', durum: 'planlandi', ucret: 500 },
  { id: 'r2', danisan_id: 'd2', danisan: demoDanisanlar[1], tarih: '2026-05-05', saat: '10:30', sure_dk: 45, tur: 'Takip', durum: 'planlandi', ucret: 350 },
  { id: 'r3', danisan_id: 'd3', danisan: demoDanisanlar[2], tarih: '2026-05-05', saat: '13:00', sure_dk: 60, tur: 'Takip', durum: 'planlandi', ucret: 350 },
  { id: 'r4', danisan_id: 'd4', danisan: demoDanisanlar[3], tarih: '2026-05-06', saat: '09:30', sure_dk: 45, tur: 'Ölçüm', durum: 'planlandi', ucret: 300 },
  { id: 'r5', danisan_id: 'd5', danisan: demoDanisanlar[4], tarih: '2026-05-06', saat: '11:00', sure_dk: 60, tur: 'Takip', durum: 'planlandi', ucret: 350 },
  { id: 'r6', danisan_id: 'd8', danisan: demoDanisanlar[7], tarih: '2026-05-07', saat: '14:00', sure_dk: 60, tur: 'İlk Görüşme', durum: 'planlandi', ucret: 500 },
  { id: 'r7', danisan_id: 'd1', danisan: demoDanisanlar[0], tarih: '2026-04-21', saat: '09:00', sure_dk: 60, tur: 'Takip', durum: 'tamamlandi', ucret: 350 },
  { id: 'r8', danisan_id: 'd2', danisan: demoDanisanlar[1], tarih: '2026-04-22', saat: '10:30', sure_dk: 45, tur: 'Takip', durum: 'tamamlandi', ucret: 350 },
  { id: 'r9', danisan_id: 'd6', danisan: demoDanisanlar[5], tarih: '2026-04-25', saat: '15:00', sure_dk: 60, tur: 'İlk Görüşme', durum: 'gelmedi', ucret: 500 },
  { id: 'r10', danisan_id: 'd7', danisan: demoDanisanlar[6], tarih: '2026-04-28', saat: '11:00', sure_dk: 30, tur: 'Kontrol', durum: 'iptal', ucret: 200 },
]

export const demoDiyetPlanlari: DiyetPlani[] = [
  {
    id: 'dp1', danisan_id: 'd1', danisan: demoDanisanlar[0],
    baslik: 'Ayşe Kaya — Kilo Verme Programı',
    baslangic_tarihi: '2024-01-10', bitis_tarihi: '2024-07-10',
    gunluk_kalori_hedefi: 1400, aktif: true,
    notlar: 'Hipotiroid gözetilerek düşük karbonhidrat, yüksek protein.',
    haftalik_plan: [
      {
        gun: 'Pazartesi',
        toplam_kalori: 1380,
        ogunler: [
          { ad: 'Kahvaltı', saat: '08:00', toplam_kalori: 320, items: [{ ad: 'Yulaf ezmesi', miktar: '60g', kalori: 220 }, { ad: 'Muz', miktar: '1 adet', kalori: 90 }, { ad: 'Badem sütü', miktar: '200ml', kalori: 30 }] },
          { ad: 'Ara Öğün 1', saat: '10:30', toplam_kalori: 150, items: [{ ad: 'Elma', miktar: '1 adet', kalori: 80 }, { ad: 'Badem', miktar: '15g', kalori: 90 }] },
          { ad: 'Öğle', saat: '13:00', toplam_kalori: 450, items: [{ ad: 'Izgara tavuk göğsü', miktar: '150g', kalori: 250 }, { ad: 'Bulgur pilavı', miktar: '80g', kalori: 120 }, { ad: 'Mevsim salatası', miktar: '1 porsiyon', kalori: 80 }] },
          { ad: 'Ara Öğün 2', saat: '16:00', toplam_kalori: 120, items: [{ ad: 'Yoğurt', miktar: '150g', kalori: 90 }, { ad: 'Tarçın', miktar: '1 çay kaşığı', kalori: 6 }] },
          { ad: 'Akşam', saat: '19:00', toplam_kalori: 380, items: [{ ad: 'Somon', miktar: '130g', kalori: 230 }, { ad: 'Buharda brokoli', miktar: '150g', kalori: 55 }, { ad: 'Zeytinyağı', miktar: '1 tatlı kaşığı', kalori: 90 }] },
        ],
      },
      {
        gun: 'Salı',
        toplam_kalori: 1420,
        ogunler: [
          { ad: 'Kahvaltı', saat: '08:00', toplam_kalori: 280, items: [{ ad: 'Mercimek çorbası', miktar: '1 kase', kalori: 180 }, { ad: 'Tam buğday ekmek', miktar: '1 dilim', kalori: 80 }] },
          { ad: 'Ara Öğün 1', saat: '10:30', toplam_kalori: 160, items: [{ ad: 'Ceviz', miktar: '20g', kalori: 130 }, { ad: 'Üzüm', miktar: '50g', kalori: 35 }] },
          { ad: 'Öğle', saat: '13:00', toplam_kalori: 480, items: [{ ad: 'Etli nohut', miktar: '1 kase', kalori: 320 }, { ad: 'Cacık', miktar: '100g', kalori: 60 }, { ad: 'Salata', miktar: '1 porsiyon', kalori: 60 }] },
          { ad: 'Ara Öğün 2', saat: '16:00', toplam_kalori: 130, items: [{ ad: 'Ayran', miktar: '200ml', kalori: 80 }, { ad: 'Tam tahıl bisküvi', miktar: '2 adet', kalori: 70 }] },
          { ad: 'Akşam', saat: '19:00', toplam_kalori: 370, items: [{ ad: 'Sebzeli omlet', miktar: '2 yumurta', kalori: 200 }, { ad: 'Çoban salatası', miktar: '1 porsiyon', kalori: 90 }, { ad: 'Zeytinyağı', miktar: '1 tatlı kaşığı', kalori: 80 }] },
        ],
      },
    ],
  },
  {
    id: 'dp2', danisan_id: 'd2', danisan: demoDanisanlar[1],
    baslik: 'Mehmet Demir — Diyabet Diyet Programı',
    baslangic_tarihi: '2024-01-15',
    gunluk_kalori_hedefi: 1800, aktif: true,
    notlar: 'Düşük glisemik indeksli besinler, 3 ana 2 ara öğün.',
    haftalik_plan: [
      {
        gun: 'Pazartesi',
        toplam_kalori: 1790,
        ogunler: [
          { ad: 'Kahvaltı', saat: '07:30', toplam_kalori: 400, items: [{ ad: 'Tam tahıl ekmek', miktar: '2 dilim', kalori: 160 }, { ad: 'Beyaz peynir', miktar: '60g', kalori: 150 }, { ad: 'Domates, salatalık', miktar: '1 porsiyon', kalori: 60 }] },
          { ad: 'Ara Öğün 1', saat: '10:30', toplam_kalori: 200, items: [{ ad: 'Elma', miktar: '1 adet', kalori: 80 }, { ad: 'Ceviz', miktar: '20g', kalori: 130 }] },
          { ad: 'Öğle', saat: '13:00', toplam_kalori: 550, items: [{ ad: 'Izgara köfte', miktar: '150g', kalori: 300 }, { ad: 'Bulgur pilavı', miktar: '60g', kalori: 90 }, { ad: 'Yoğurtlu salata', miktar: '1 porsiyon', kalori: 120 }] },
          { ad: 'Ara Öğün 2', saat: '16:30', toplam_kalori: 180, items: [{ ad: 'Yoğurt', miktar: '200g', kalori: 120 }, { ad: 'Tarçın', miktar: 'az', kalori: 5 }] },
          { ad: 'Akşam', saat: '19:30', toplam_kalori: 460, items: [{ ad: 'Mercimek köftesi', miktar: '10 adet', kalori: 280 }, { ad: 'Mevsim salatası', miktar: '1 porsiyon', kalori: 80 }, { ad: 'Zeytinyağı', miktar: '1 yemek kaşığı', kalori: 120 }] },
        ],
      },
    ],
  },
]

export const demoOdemeler: Odeme[] = [
  { id: 'od1', danisan_id: 'd1', danisan: demoDanisanlar[0], tarih: '2026-04-21', tutar: 350, aciklama: 'Takip seansı', durum: 'odendi', odeme_yontemi: 'kart' },
  { id: 'od2', danisan_id: 'd2', danisan: demoDanisanlar[1], tarih: '2026-04-22', tutar: 350, aciklama: 'Takip seansı', durum: 'odendi', odeme_yontemi: 'nakit' },
  { id: 'od3', danisan_id: 'd3', danisan: demoDanisanlar[2], tarih: '2026-04-15', tutar: 500, aciklama: 'İlk görüşme', durum: 'odendi', odeme_yontemi: 'havale' },
  { id: 'od4', danisan_id: 'd4', danisan: demoDanisanlar[3], tarih: '2026-04-20', tutar: 300, aciklama: 'Ölçüm seansı', durum: 'odendi', odeme_yontemi: 'kart' },
  { id: 'od5', danisan_id: 'd5', danisan: demoDanisanlar[4], tarih: '2026-05-01', tutar: 350, aciklama: 'Mayıs takip seansı', durum: 'bekliyor', odeme_yontemi: undefined },
  { id: 'od6', danisan_id: 'd8', danisan: demoDanisanlar[7], tarih: '2026-05-07', tutar: 500, aciklama: 'İlk görüşme', durum: 'bekliyor', odeme_yontemi: undefined },
  { id: 'od7', danisan_id: 'd1', danisan: demoDanisanlar[0], tarih: '2026-03-21', tutar: 350, aciklama: 'Mart takip seansı', durum: 'odendi', odeme_yontemi: 'kart' },
  { id: 'od8', danisan_id: 'd2', danisan: demoDanisanlar[1], tarih: '2026-03-15', tutar: 350, aciklama: 'Mart takip seansı', durum: 'gecikti', odeme_yontemi: undefined },
]

export const demoDashboardIstatistik: DashboardIstatistik = {
  toplam_danisan: demoDanisanlar.length,
  aktif_danisan: demoDanisanlar.filter(d => d.durum === 'aktif').length,
  bugunki_randevu: demoRandevular.filter(r => r.tarih === '2026-05-05' && r.durum === 'planlandi').length,
  bu_ay_gelir: demoOdemeler.filter(o => o.durum === 'odendi' && o.tarih.startsWith('2026-04')).reduce((s, o) => s + o.tutar, 0),
  ortalama_kilo_kaybi: 2.8,
  bekleyen_odeme: demoOdemeler.filter(o => o.durum !== 'odendi').reduce((s, o) => s + o.tutar, 0),
}
