/**
 * Yemek fotoğrafı analiz motoru
 * HuggingFace nateraw/food modeli ile yemek tanıma + besin değeri hesaplama
 */

export interface BesinDegeri {
  yemek: string
  yemekEn: string
  kalori: number
  protein: number   // gram
  karbonhidrat: number // gram
  yag: number      // gram
  lif?: number     // gram
  porsiyonGr: number
  guven: number    // 0-100
}

// Food-101 kategorileri → Türkçe isim + 100g besin değerleri
const YEMEK_VERITABANI: Record<string, Omit<BesinDegeri, 'guven' | 'yemekEn'>> = {
  apple_pie:          { yemek: 'Elmalı Turta',      kalori: 200, protein: 2.3, karbonhidrat: 34, yag: 11, porsiyonGr: 125 },
  baby_back_ribs:     { yemek: 'Kaburga',            kalori: 292, protein: 22, karbonhidrat: 0,  yag: 22, porsiyonGr: 200 },
  baklava:            { yemek: 'Baklava',             kalori: 428, protein: 6,  karbonhidrat: 52, yag: 22, porsiyonGr: 80  },
  beef_carpaccio:     { yemek: 'Carpaccio',           kalori: 141, protein: 20, karbonhidrat: 0,  yag: 7,  porsiyonGr: 100 },
  beef_tartare:       { yemek: 'Steak Tartare',       kalori: 155, protein: 21, karbonhidrat: 2,  yag: 7,  porsiyonGr: 150 },
  beet_salad:         { yemek: 'Pancar Salatası',     kalori: 74,  protein: 3,  karbonhidrat: 13, yag: 2,  lif: 3, porsiyonGr: 150 },
  bibimbap:           { yemek: 'Bibimbap',            kalori: 175, protein: 8,  karbonhidrat: 27, yag: 4,  porsiyonGr: 300 },
  bread_pudding:      { yemek: 'Ekmek Pudingi',       kalori: 225, protein: 6,  karbonhidrat: 34, yag: 7,  porsiyonGr: 150 },
  breakfast_burrito:  { yemek: 'Kahvaltı Burrito',    kalori: 215, protein: 10, karbonhidrat: 22, yag: 10, porsiyonGr: 200 },
  bruschetta:         { yemek: 'Bruschetta',           kalori: 140, protein: 5,  karbonhidrat: 22, yag: 4,  porsiyonGr: 100 },
  caesar_salad:       { yemek: 'Sezar Salatası',      kalori: 160, protein: 7,  karbonhidrat: 8,  yag: 12, porsiyonGr: 200 },
  cannoli:            { yemek: 'Cannoli',              kalori: 300, protein: 6,  karbonhidrat: 35, yag: 16, porsiyonGr: 100 },
  caprese_salad:      { yemek: 'Caprese Salata',       kalori: 180, protein: 11, karbonhidrat: 4,  yag: 13, porsiyonGr: 200 },
  carrot_cake:        { yemek: 'Havuçlu Kek',          kalori: 415, protein: 5,  karbonhidrat: 56, yag: 21, porsiyonGr: 100 },
  ceviche:            { yemek: 'Ceviche',              kalori: 80,  protein: 14, karbonhidrat: 5,  yag: 1,  porsiyonGr: 150 },
  cheesecake:         { yemek: 'Cheesecake',           kalori: 321, protein: 5,  karbonhidrat: 26, yag: 23, porsiyonGr: 120 },
  cheese_plate:       { yemek: 'Peynir Tabağı',        kalori: 350, protein: 22, karbonhidrat: 2,  yag: 29, porsiyonGr: 100 },
  chicken_curry:      { yemek: 'Tavuk Köri',           kalori: 170, protein: 18, karbonhidrat: 8,  yag: 7,  porsiyonGr: 250 },
  chicken_quesadilla: { yemek: 'Tavuk Quesadilla',     kalori: 210, protein: 15, karbonhidrat: 20, yag: 8,  porsiyonGr: 180 },
  chicken_wings:      { yemek: 'Tavuk Kanadı',         kalori: 290, protein: 27, karbonhidrat: 0,  yag: 19, porsiyonGr: 150 },
  chocolate_cake:     { yemek: 'Çikolatalı Kek',       kalori: 389, protein: 5,  karbonhidrat: 52, yag: 19, porsiyonGr: 100 },
  chocolate_mousse:   { yemek: 'Çikolata Mousse',      kalori: 264, protein: 5,  karbonhidrat: 26, yag: 16, porsiyonGr: 100 },
  churros:            { yemek: 'Churros',              kalori: 375, protein: 5,  karbonhidrat: 48, yag: 18, porsiyonGr: 100 },
  clam_chowder:       { yemek: 'İstiridye Çorbası',    kalori: 118, protein: 6,  karbonhidrat: 13, yag: 5,  porsiyonGr: 250 },
  club_sandwich:      { yemek: 'Kulüp Sandviç',        kalori: 280, protein: 20, karbonhidrat: 28, yag: 10, porsiyonGr: 250 },
  crab_cakes:         { yemek: 'Yengeç Köftesi',       kalori: 175, protein: 15, karbonhidrat: 9,  yag: 9,  porsiyonGr: 150 },
  creme_brulee:       { yemek: 'Crème Brûlée',         kalori: 338, protein: 5,  karbonhidrat: 33, yag: 21, porsiyonGr: 150 },
  croque_madame:      { yemek: 'Croque Madame',        kalori: 320, protein: 18, karbonhidrat: 24, yag: 17, porsiyonGr: 200 },
  cup_cakes:          { yemek: 'Cupcake',              kalori: 380, protein: 4,  karbonhidrat: 54, yag: 17, porsiyonGr: 80  },
  deviled_eggs:       { yemek: 'Dolma Yumurta',        kalori: 145, protein: 10, karbonhidrat: 1,  yag: 11, porsiyonGr: 100 },
  donuts:             { yemek: 'Donut',                kalori: 452, protein: 5,  karbonhidrat: 51, yag: 25, porsiyonGr: 80  },
  dumplings:          { yemek: 'Manti / Dumpling',     kalori: 180, protein: 9,  karbonhidrat: 26, yag: 5,  porsiyonGr: 200 },
  edamame:            { yemek: 'Edamame',              kalori: 121, protein: 11, karbonhidrat: 9,  yag: 5,  lif: 5, porsiyonGr: 150 },
  eggs_benedict:      { yemek: 'Eggs Benedict',        kalori: 269, protein: 13, karbonhidrat: 15, yag: 18, porsiyonGr: 200 },
  escargots:          { yemek: 'Salyangoz',            kalori: 90,  protein: 16, karbonhidrat: 2,  yag: 2,  porsiyonGr: 100 },
  falafel:            { yemek: 'Falafel',              kalori: 333, protein: 13, karbonhidrat: 32, yag: 18, lif: 5, porsiyonGr: 150 },
  filet_mignon:       { yemek: 'Fileto Mignon',        kalori: 271, protein: 29, karbonhidrat: 0,  yag: 17, porsiyonGr: 180 },
  fish_and_chips:     { yemek: 'Balık & Patates',      kalori: 232, protein: 16, karbonhidrat: 27, yag: 7,  porsiyonGr: 300 },
  foie_gras:          { yemek: 'Foie Gras',            kalori: 462, protein: 12, karbonhidrat: 5,  yag: 44, porsiyonGr: 80  },
  french_fries:       { yemek: 'Patates Kızartması',   kalori: 312, protein: 3,  karbonhidrat: 41, yag: 15, porsiyonGr: 150 },
  french_onion_soup:  { yemek: 'Soğan Çorbası',        kalori: 87,  protein: 5,  karbonhidrat: 10, yag: 3,  porsiyonGr: 300 },
  french_toast:       { yemek: 'Fransız Tostu',        kalori: 230, protein: 8,  karbonhidrat: 26, yag: 11, porsiyonGr: 150 },
  fried_calamari:     { yemek: 'Kalamari',             kalori: 175, protein: 14, karbonhidrat: 11, yag: 8,  porsiyonGr: 150 },
  fried_rice:         { yemek: 'Kızartılmış Pilav',    kalori: 163, protein: 5,  karbonhidrat: 27, yag: 4,  porsiyonGr: 200 },
  frozen_yogurt:      { yemek: 'Dondurulmuş Yoğurt',  kalori: 127, protein: 3,  karbonhidrat: 26, yag: 2,  porsiyonGr: 150 },
  garlic_bread:       { yemek: 'Sarımsaklı Ekmek',     kalori: 300, protein: 7,  karbonhidrat: 38, yag: 14, porsiyonGr: 100 },
  gnocchi:            { yemek: 'Gnocchi',              kalori: 130, protein: 3,  karbonhidrat: 27, yag: 1,  porsiyonGr: 200 },
  greek_salad:        { yemek: 'Yunan Salatası',       kalori: 100, protein: 4,  karbonhidrat: 7,  yag: 7,  lif: 2, porsiyonGr: 200 },
  grilled_cheese_sandwich: { yemek: 'Peynirli Tost',  kalori: 378, protein: 16, karbonhidrat: 29, yag: 22, porsiyonGr: 150 },
  grilled_salmon:     { yemek: 'Izgaralı Somon',       kalori: 208, protein: 28, karbonhidrat: 0,  yag: 11, porsiyonGr: 180 },
  guacamole:          { yemek: 'Guacamole',            kalori: 160, protein: 2,  karbonhidrat: 9,  yag: 15, lif: 7, porsiyonGr: 100 },
  gyoza:              { yemek: 'Gyoza',                kalori: 193, protein: 9,  karbonhidrat: 24, yag: 6,  porsiyonGr: 150 },
  hamburger:          { yemek: 'Hamburger',            kalori: 295, protein: 17, karbonhidrat: 24, yag: 14, porsiyonGr: 200 },
  hot_and_sour_soup:  { yemek: 'Ekşili Acılı Çorba',  kalori: 55,  protein: 3,  karbonhidrat: 8,  yag: 1,  porsiyonGr: 300 },
  hot_dog:            { yemek: 'Sosisli Sandviç',      kalori: 280, protein: 11, karbonhidrat: 25, yag: 15, porsiyonGr: 150 },
  huevos_rancheros:   { yemek: 'Huevos Rancheros',     kalori: 195, protein: 9,  karbonhidrat: 20, yag: 9,  porsiyonGr: 200 },
  hummus:             { yemek: 'Humus',                kalori: 177, protein: 8,  karbonhidrat: 20, yag: 9,  lif: 6, porsiyonGr: 100 },
  ice_cream:          { yemek: 'Dondurma',             kalori: 207, protein: 4,  karbonhidrat: 24, yag: 11, porsiyonGr: 100 },
  lobster_bisque:     { yemek: 'Istakoz Çorbası',      kalori: 98,  protein: 8,  karbonhidrat: 7,  yag: 4,  porsiyonGr: 250 },
  lobster_roll_sandwich: { yemek: 'Istakoz Sandviç',   kalori: 284, protein: 19, karbonhidrat: 25, yag: 11, porsiyonGr: 200 },
  macaroni_and_cheese: { yemek: 'Makarna & Peynir',    kalori: 164, protein: 7,  karbonhidrat: 24, yag: 5,  porsiyonGr: 250 },
  macarons:           { yemek: 'Makaron',              kalori: 390, protein: 5,  karbonhidrat: 62, yag: 15, porsiyonGr: 60  },
  miso_soup:          { yemek: 'Miso Çorbası',         kalori: 40,  protein: 3,  karbonhidrat: 5,  yag: 1,  porsiyonGr: 240 },
  mussels:            { yemek: 'Midye',                kalori: 86,  protein: 12, karbonhidrat: 4,  yag: 2,  porsiyonGr: 200 },
  nachos:             { yemek: 'Nachos',               kalori: 346, protein: 9,  karbonhidrat: 36, yag: 19, porsiyonGr: 150 },
  omelette:           { yemek: 'Omlet',                kalori: 154, protein: 11, karbonhidrat: 1,  yag: 12, porsiyonGr: 150 },
  onion_rings:        { yemek: 'Soğan Halkası',        kalori: 411, protein: 5,  karbonhidrat: 41, yag: 26, porsiyonGr: 100 },
  oysters:            { yemek: 'İstiridye',            kalori: 69,  protein: 8,  karbonhidrat: 4,  yag: 2,  porsiyonGr: 100 },
  pad_thai:           { yemek: 'Pad Thai',             kalori: 181, protein: 9,  karbonhidrat: 27, yag: 5,  porsiyonGr: 300 },
  paella:             { yemek: 'Paella',               kalori: 154, protein: 12, karbonhidrat: 18, yag: 4,  porsiyonGr: 300 },
  pancakes:           { yemek: 'Krep / Pancake',       kalori: 227, protein: 6,  karbonhidrat: 38, yag: 7,  porsiyonGr: 150 },
  panna_cotta:        { yemek: 'Panna Cotta',          kalori: 230, protein: 4,  karbonhidrat: 22, yag: 15, porsiyonGr: 150 },
  peking_duck:        { yemek: 'Pekin Ördeği',         kalori: 337, protein: 19, karbonhidrat: 0,  yag: 29, porsiyonGr: 150 },
  pho:                { yemek: 'Pho Çorbası',          kalori: 90,  protein: 7,  karbonhidrat: 13, yag: 1,  porsiyonGr: 400 },
  pizza:              { yemek: 'Pizza',                kalori: 266, protein: 11, karbonhidrat: 33, yag: 10, porsiyonGr: 200 },
  pork_chop:          { yemek: 'Domuz Pirzolası',      kalori: 231, protein: 26, karbonhidrat: 0,  yag: 14, porsiyonGr: 180 },
  poutine:            { yemek: 'Poutine',              kalori: 256, protein: 8,  karbonhidrat: 30, yag: 12, porsiyonGr: 250 },
  prime_rib:          { yemek: 'Kaburga Biftek',       kalori: 300, protein: 24, karbonhidrat: 0,  yag: 22, porsiyonGr: 200 },
  pulled_pork_sandwich: { yemek: 'Çekme Domuz Sandviç', kalori: 302, protein: 22, karbonhidrat: 28, yag: 10, porsiyonGr: 250 },
  ramen:              { yemek: 'Ramen',                kalori: 130, protein: 7,  karbonhidrat: 19, yag: 2,  porsiyonGr: 400 },
  ravioli:            { yemek: 'Ravioli',              kalori: 230, protein: 9,  karbonhidrat: 36, yag: 5,  porsiyonGr: 200 },
  red_velvet_cake:    { yemek: 'Red Velvet Kek',       kalori: 408, protein: 4,  karbonhidrat: 56, yag: 19, porsiyonGr: 100 },
  risotto:            { yemek: 'Risotto',              kalori: 166, protein: 5,  karbonhidrat: 25, yag: 5,  porsiyonGr: 300 },
  samosa:             { yemek: 'Samosa',               kalori: 308, protein: 6,  karbonhidrat: 30, yag: 18, porsiyonGr: 100 },
  sashimi:            { yemek: 'Sashimi',              kalori: 127, protein: 20, karbonhidrat: 0,  yag: 5,  porsiyonGr: 150 },
  scallops:           { yemek: 'Deniz Tarağı',         kalori: 137, protein: 24, karbonhidrat: 5,  yag: 3,  porsiyonGr: 150 },
  seaweed_salad:      { yemek: 'Deniz Yosunu Salatası', kalori: 70, protein: 2,  karbonhidrat: 11, yag: 2,  lif: 3, porsiyonGr: 100 },
  shrimp_and_grits:   { yemek: 'Karides & Mısır Lapası', kalori: 218, protein: 16, karbonhidrat: 22, yag: 8, porsiyonGr: 250 },
  spaghetti_bolognese: { yemek: 'Spagetti Bolonez',    kalori: 208, protein: 12, karbonhidrat: 28, yag: 6,  porsiyonGr: 300 },
  spaghetti_carbonara: { yemek: 'Spagetti Karbonara',  kalori: 240, protein: 11, karbonhidrat: 29, yag: 9,  porsiyonGr: 300 },
  spring_rolls:       { yemek: 'Bahar Rulo',           kalori: 120, protein: 3,  karbonhidrat: 17, yag: 5,  porsiyonGr: 100 },
  steak:              { yemek: 'Biftek',               kalori: 271, protein: 26, karbonhidrat: 0,  yag: 18, porsiyonGr: 200 },
  strawberry_shortcake: { yemek: 'Çilekli Kek',        kalori: 246, protein: 4,  karbonhidrat: 36, yag: 10, porsiyonGr: 120 },
  sushi:              { yemek: 'Suşi',                 kalori: 143, protein: 6,  karbonhidrat: 27, yag: 1,  porsiyonGr: 150 },
  tacos:              { yemek: 'Taco',                 kalori: 226, protein: 9,  karbonhidrat: 27, yag: 9,  porsiyonGr: 150 },
  takoyaki:           { yemek: 'Takoyaki',             kalori: 196, protein: 7,  karbonhidrat: 22, yag: 9,  porsiyonGr: 150 },
  tiramisu:           { yemek: 'Tiramisu',             kalori: 240, protein: 5,  karbonhidrat: 23, yag: 15, porsiyonGr: 100 },
  tuna_tartare:       { yemek: 'Ton Balığı Tartare',   kalori: 130, protein: 22, karbonhidrat: 2,  yag: 4,  porsiyonGr: 150 },
  waffles:            { yemek: 'Waffle',               kalori: 291, protein: 8,  karbonhidrat: 37, yag: 13, porsiyonGr: 150 },
}

export async function yemekAnalizEt(imageBuffer: Buffer): Promise<BesinDegeri | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  if (!apiKey) throw new Error('HUGGINGFACE_API_KEY eksik')

  // HuggingFace Inference API — nateraw/food (Food-101 classifier)
  const response = await fetch(
    'https://api-inference.huggingface.co/models/nateraw/food',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer,
    }
  )

  if (!response.ok) {
    // Model uyuyor olabilir (cold start), 503 döner
    if (response.status === 503) {
      throw new Error('Model şu an hazırlanıyor, 20 saniye sonra tekrar deneyin')
    }
    throw new Error(`HuggingFace API hatası: ${response.status}`)
  }

  const sonuclar = await response.json() as Array<{ label: string; score: number }>

  if (!sonuclar || sonuclar.length === 0) return null

  const enIyi = sonuclar[0]
  const besinData = YEMEK_VERITABANI[enIyi.label]

  if (!besinData) {
    // Tanınan yemek DB'de yok — ham label döndür
    return {
      yemek: enIyi.label.replace(/_/g, ' '),
      yemekEn: enIyi.label.replace(/_/g, ' '),
      kalori: 0,
      protein: 0,
      karbonhidrat: 0,
      yag: 0,
      porsiyonGr: 100,
      guven: Math.round(enIyi.score * 100),
    }
  }

  return {
    ...besinData,
    yemekEn: enIyi.label.replace(/_/g, ' '),
    guven: Math.round(enIyi.score * 100),
  }
}

export function besinMesajiOlustur(analiz: BesinDegeri): string {
  const guvenMetni = analiz.guven >= 80 ? '✅' : analiz.guven >= 50 ? '⚠️' : '❓'

  if (analiz.kalori === 0) {
    return (
      `${guvenMetni} *${analiz.yemek}* tespit edildi\n` +
      `Güven: %${analiz.guven}\n\n` +
      `Bu yemek için besin değeri veritabanımda bilgi yok. Diyetisyeniniz sizinle paylaşacak.`
    )
  }

  const satirlar = [
    `${guvenMetni} *${analiz.yemek}* tespit edildi (≈${analiz.porsiyonGr}g porsiyon)`,
    ``,
    `📊 *Tahmini Besin Değerleri*`,
    `🔥 Kalori: *${analiz.kalori} kcal*`,
    `💪 Protein: ${analiz.protein}g`,
    `🌾 Karbonhidrat: ${analiz.karbonhidrat}g`,
    `🫒 Yağ: ${analiz.yag}g`,
  ]

  if (analiz.lif) satirlar.push(`🌿 Lif: ${analiz.lif}g`)

  satirlar.push(``)
  satirlar.push(`_Güven: %${analiz.guven} | Değerler tahminidir_`)

  if (analiz.guven < 50) {
    satirlar.push(``)
    satirlar.push(`⚠️ Fotoğraf net değil, lütfen tekrar çekin.`)
  }

  return satirlar.join('\n')
}
