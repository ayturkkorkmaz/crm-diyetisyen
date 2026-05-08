export interface Besin {
  ad: string
  kalori: number       // kcal (varsayılan porsiyon için)
  porsiyon: string     // "1 adet", "100g", "1 kase" vb.
  kategori: string
}

export const besinler: Besin[] = [

  // ════════════════════════════════════════════════════
  // YUMURTA
  // ════════════════════════════════════════════════════
  { ad: 'Haşlanmış yumurta', kalori: 78, porsiyon: '1 adet (50g)', kategori: 'Yumurta' },
  { ad: 'Sahanda yumurta', kalori: 92, porsiyon: '1 adet', kategori: 'Yumurta' },
  { ad: 'Omlet (2 yumurta)', kalori: 184, porsiyon: '1 porsiyon', kategori: 'Yumurta' },
  { ad: 'Menemen (2 yumurta)', kalori: 210, porsiyon: '1 porsiyon', kategori: 'Yumurta' },
  { ad: 'Çılbır', kalori: 195, porsiyon: '1 porsiyon', kategori: 'Yumurta' },
  { ad: 'Sucuklu yumurta', kalori: 280, porsiyon: '1 porsiyon', kategori: 'Yumurta' },
  { ad: 'Ispanaklı omlet', kalori: 170, porsiyon: '1 porsiyon', kategori: 'Yumurta' },

  // ════════════════════════════════════════════════════
  // SÜT ÜRÜNLERİ
  // ════════════════════════════════════════════════════
  { ad: 'Beyaz peynir', kalori: 75, porsiyon: '30g (1 ince dilim)', kategori: 'Süt Ürünleri' },
  { ad: 'Kaşar peyniri', kalori: 110, porsiyon: '30g (1 dilim)', kategori: 'Süt Ürünleri' },
  { ad: 'Yoğurt (%2 yağlı)', kalori: 60, porsiyon: '150g (1 kase)', kategori: 'Süt Ürünleri' },
  { ad: 'Yoğurt (tam yağlı)', kalori: 90, porsiyon: '150g (1 kase)', kategori: 'Süt Ürünleri' },
  { ad: 'Süzme yoğurt', kalori: 100, porsiyon: '150g (1 kase)', kategori: 'Süt Ürünleri' },
  { ad: 'Meyveli yoğurt', kalori: 130, porsiyon: '125g (1 kap)', kategori: 'Süt Ürünleri' },
  { ad: 'Süt (%2)', kalori: 102, porsiyon: '240ml (1 bardak)', kategori: 'Süt Ürünleri' },
  { ad: 'Süt (tam yağlı)', kalori: 149, porsiyon: '240ml (1 bardak)', kategori: 'Süt Ürünleri' },
  { ad: 'Kefir', kalori: 99, porsiyon: '240ml (1 bardak)', kategori: 'Süt Ürünleri' },
  { ad: 'Lor peyniri', kalori: 72, porsiyon: '100g', kategori: 'Süt Ürünleri' },
  { ad: 'Çökelek', kalori: 65, porsiyon: '100g', kategori: 'Süt Ürünleri' },
  { ad: 'Labne peyniri', kalori: 70, porsiyon: '2 yemek kaşığı (30g)', kategori: 'Süt Ürünleri' },
  { ad: 'Mozzarella peyniri', kalori: 85, porsiyon: '30g', kategori: 'Süt Ürünleri' },
  { ad: 'Cheddar peyniri', kalori: 120, porsiyon: '30g', kategori: 'Süt Ürünleri' },
  { ad: 'Dil peyniri', kalori: 80, porsiyon: '30g', kategori: 'Süt Ürünleri' },
  { ad: 'Çedar eritme peyniri', kalori: 90, porsiyon: '1 dilim (18g)', kategori: 'Süt Ürünleri' },
  { ad: 'Krem peynir', kalori: 100, porsiyon: '2 yemek kaşığı (30g)', kategori: 'Süt Ürünleri' },
  { ad: 'Dondurma (vanilyalı)', kalori: 200, porsiyon: '2 top (100g)', kategori: 'Süt Ürünleri' },
  { ad: 'Dondurma (çikolatalı)', kalori: 220, porsiyon: '2 top (100g)', kategori: 'Süt Ürünleri' },
  { ad: 'Muhallebi (sade)', kalori: 160, porsiyon: '1 kase (150g)', kategori: 'Süt Ürünleri' },
  { ad: 'Sütlaç', kalori: 180, porsiyon: '1 kase (150g)', kategori: 'Süt Ürünleri' },

  // ════════════════════════════════════════════════════
  // ET & TAVUK
  // ════════════════════════════════════════════════════
  { ad: 'Izgara tavuk göğsü', kalori: 165, porsiyon: '150g', kategori: 'Et & Tavuk' },
  { ad: 'Haşlanmış tavuk göğsü', kalori: 150, porsiyon: '150g', kategori: 'Et & Tavuk' },
  { ad: 'Tavuk sote', kalori: 210, porsiyon: '1 porsiyon (150g)', kategori: 'Et & Tavuk' },
  { ad: 'Tavuk ızgara but', kalori: 190, porsiyon: '1 adet (150g)', kategori: 'Et & Tavuk' },
  { ad: 'Tavuk şiş', kalori: 200, porsiyon: '1 porsiyon (150g)', kategori: 'Et & Tavuk' },
  { ad: 'Tavuk çorbası', kalori: 80, porsiyon: '1 kase (250ml)', kategori: 'Et & Tavuk' },
  { ad: 'Fırın tavuk', kalori: 240, porsiyon: '1 but (200g)', kategori: 'Et & Tavuk' },
  { ad: 'Tavuk sarma', kalori: 210, porsiyon: '1 porsiyon', kategori: 'Et & Tavuk' },
  { ad: 'Kızartma tavuk (nugget)', kalori: 280, porsiyon: '6 adet (100g)', kategori: 'Et & Tavuk' },
  { ad: 'Kızartma tavuk (kanat)', kalori: 260, porsiyon: '2 adet (100g)', kategori: 'Et & Tavuk' },
  { ad: 'Kızartma tavuk but', kalori: 320, porsiyon: '1 adet (120g)', kategori: 'Et & Tavuk' },
  { ad: 'Tavuk döner', kalori: 280, porsiyon: '1 porsiyon (150g)', kategori: 'Et & Tavuk' },
  { ad: 'Kıyma (yağsız)', kalori: 215, porsiyon: '100g', kategori: 'Et & Tavuk' },
  { ad: 'Köfte (2 adet)', kalori: 180, porsiyon: '2 orta boy', kategori: 'Et & Tavuk' },
  { ad: 'Izgara köfte', kalori: 200, porsiyon: '2 adet (100g)', kategori: 'Et & Tavuk' },
  { ad: 'Terbiyeli köfte', kalori: 220, porsiyon: '1 porsiyon', kategori: 'Et & Tavuk' },
  { ad: 'Dana biftek', kalori: 230, porsiyon: '150g', kategori: 'Et & Tavuk' },
  { ad: 'Kuzu pirzola', kalori: 250, porsiyon: '2 adet (150g)', kategori: 'Et & Tavuk' },
  { ad: 'Hindi göğsü (ızgara)', kalori: 135, porsiyon: '150g', kategori: 'Et & Tavuk' },
  { ad: 'Sucuk', kalori: 250, porsiyon: '2 dilim (30g)', kategori: 'Et & Tavuk' },
  { ad: 'Sucuk (az yağlı)', kalori: 170, porsiyon: '2 dilim (30g)', kategori: 'Et & Tavuk' },
  { ad: 'Pastırma', kalori: 70, porsiyon: '3 ince dilim (30g)', kategori: 'Et & Tavuk' },
  { ad: 'Kavurma', kalori: 280, porsiyon: '100g', kategori: 'Et & Tavuk' },
  { ad: 'Şiş kebap', kalori: 280, porsiyon: '1 porsiyon (200g)', kategori: 'Et & Tavuk' },
  { ad: 'Adana kebap', kalori: 320, porsiyon: '1 porsiyon', kategori: 'Et & Tavuk' },
  { ad: 'Urfa kebap', kalori: 300, porsiyon: '1 porsiyon', kategori: 'Et & Tavuk' },
  { ad: 'Patlıcan kebabı', kalori: 200, porsiyon: '1 porsiyon', kategori: 'Et & Tavuk' },
  { ad: 'Et döner', kalori: 350, porsiyon: '1 porsiyon (150g)', kategori: 'Et & Tavuk' },
  { ad: 'İskender kebap', kalori: 450, porsiyon: '1 porsiyon', kategori: 'Et & Tavuk' },
  { ad: 'Döner (dürüm)', kalori: 480, porsiyon: '1 adet', kategori: 'Et & Tavuk' },
  { ad: 'Hamburger köfte', kalori: 240, porsiyon: '1 adet (100g)', kategori: 'Et & Tavuk' },

  // ════════════════════════════════════════════════════
  // BALIK & DENİZ ÜRÜNLERİ
  // ════════════════════════════════════════════════════
  { ad: 'Somon (ızgara)', kalori: 208, porsiyon: '150g', kategori: 'Balık' },
  { ad: 'Levrek (ızgara)', kalori: 140, porsiyon: '150g', kategori: 'Balık' },
  { ad: 'Hamsi (ızgara)', kalori: 175, porsiyon: '100g (8-10 adet)', kategori: 'Balık' },
  { ad: 'Hamsi tava', kalori: 220, porsiyon: '100g', kategori: 'Balık' },
  { ad: 'Ton balığı (su içinde)', kalori: 120, porsiyon: '100g (yarım kutu)', kategori: 'Balık' },
  { ad: 'Ton balığı (yağlı)', kalori: 190, porsiyon: '100g', kategori: 'Balık' },
  { ad: 'Çipura (ızgara)', kalori: 145, porsiyon: '150g', kategori: 'Balık' },
  { ad: 'Palamut (ızgara)', kalori: 160, porsiyon: '150g', kategori: 'Balık' },
  { ad: 'Karides (haşlanmış)', kalori: 85, porsiyon: '100g', kategori: 'Balık' },
  { ad: 'Midye (haşlanmış)', kalori: 70, porsiyon: '10 adet (100g)', kategori: 'Balık' },
  { ad: 'Midye tava', kalori: 250, porsiyon: '10 adet (100g)', kategori: 'Balık' },
  { ad: 'Balık tava', kalori: 280, porsiyon: '150g', kategori: 'Balık' },
  { ad: 'Balık burger', kalori: 380, porsiyon: '1 adet', kategori: 'Balık' },

  // ════════════════════════════════════════════════════
  // TAHIL & EKMEK
  // ════════════════════════════════════════════════════
  { ad: 'Tam buğday ekmek', kalori: 70, porsiyon: '1 dilim (30g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Çavdar ekmeği', kalori: 65, porsiyon: '1 dilim (30g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Beyaz ekmek', kalori: 80, porsiyon: '1 dilim (30g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Kepek ekmeği', kalori: 60, porsiyon: '1 dilim (30g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Pide', kalori: 280, porsiyon: '1 adet (130g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Simit', kalori: 230, porsiyon: '1 adet (100g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Açma', kalori: 280, porsiyon: '1 adet (80g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Poğaça (peynirli)', kalori: 260, porsiyon: '1 adet (80g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Poğaça (zeytinli)', kalori: 240, porsiyon: '1 adet (80g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Kruvasan', kalori: 230, porsiyon: '1 adet (60g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Bazlama', kalori: 200, porsiyon: '1 adet (80g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Lavaş', kalori: 160, porsiyon: '1 adet (60g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Yufka', kalori: 150, porsiyon: '1 kat (50g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Hamburger ekmeği', kalori: 200, porsiyon: '1 adet (80g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Pilav (beyaz pirinç)', kalori: 130, porsiyon: '1 kepçe (100g pişmiş)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Pilav (sade bulgur)', kalori: 115, porsiyon: '1 kepçe (100g pişmiş)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Makarna (beyaz)', kalori: 170, porsiyon: '100g pişmiş', kategori: 'Tahıl & Ekmek' },
  { ad: 'Makarna (tam buğday)', kalori: 155, porsiyon: '100g pişmiş', kategori: 'Tahıl & Ekmek' },
  { ad: 'Spagetti bolonez', kalori: 350, porsiyon: '1 porsiyon (250g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Makarna (kremalı)', kalori: 420, porsiyon: '1 porsiyon (250g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Yulaf ezmesi', kalori: 150, porsiyon: '40g (5 yemek kaşığı)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Granola', kalori: 200, porsiyon: '50g (4 yemek kaşığı)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Mısır gevreği (şekerli)', kalori: 160, porsiyon: '40g (1 kase)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Müsli', kalori: 170, porsiyon: '50g', kategori: 'Tahıl & Ekmek' },
  { ad: 'Galeta', kalori: 25, porsiyon: '1 adet (7g)', kategori: 'Tahıl & Ekmek' },
  { ad: 'Kinoa (pişmiş)', kalori: 120, porsiyon: '100g', kategori: 'Tahıl & Ekmek' },
  { ad: 'Mısır ekmeği', kalori: 90, porsiyon: '1 dilim (35g)', kategori: 'Tahıl & Ekmek' },

  // ════════════════════════════════════════════════════
  // BAKLAGİL
  // ════════════════════════════════════════════════════
  { ad: 'Haşlanmış nohut', kalori: 140, porsiyon: '1 kase (100g)', kategori: 'Baklagil' },
  { ad: 'Haşlanmış kuru fasulye', kalori: 127, porsiyon: '1 kase (100g)', kategori: 'Baklagil' },
  { ad: 'Yeşil mercimek (haşlanmış)', kalori: 116, porsiyon: '100g', kategori: 'Baklagil' },
  { ad: 'Kuru fasulye (zeytinyağlı)', kalori: 160, porsiyon: '1 kase', kategori: 'Baklagil' },
  { ad: 'Barbunya pilaki', kalori: 155, porsiyon: '1 kase', kategori: 'Baklagil' },
  { ad: 'Nohut (zeytinyağlı)', kalori: 170, porsiyon: '1 kase', kategori: 'Baklagil' },
  { ad: 'Hummus', kalori: 70, porsiyon: '2 yemek kaşığı (30g)', kategori: 'Baklagil' },
  { ad: 'Bakla (haşlanmış)', kalori: 110, porsiyon: '100g', kategori: 'Baklagil' },
  { ad: 'Bezelye (haşlanmış)', kalori: 70, porsiyon: '100g', kategori: 'Baklagil' },

  // ════════════════════════════════════════════════════
  // SEBZE
  // ════════════════════════════════════════════════════
  { ad: 'Brokoli (haşlanmış)', kalori: 35, porsiyon: '1 kase (100g)', kategori: 'Sebze' },
  { ad: 'Ispanak (haşlanmış)', kalori: 23, porsiyon: '100g', kategori: 'Sebze' },
  { ad: 'Havuç (çiğ)', kalori: 41, porsiyon: '1 orta boy (80g)', kategori: 'Sebze' },
  { ad: 'Domates', kalori: 22, porsiyon: '1 orta boy (120g)', kategori: 'Sebze' },
  { ad: 'Salatalık', kalori: 16, porsiyon: '1 orta boy (130g)', kategori: 'Sebze' },
  { ad: 'Biber (dolmalık)', kalori: 20, porsiyon: '1 adet (80g)', kategori: 'Sebze' },
  { ad: 'Sivri biber', kalori: 15, porsiyon: '2 adet (80g)', kategori: 'Sebze' },
  { ad: 'Kabak (haşlanmış)', kalori: 18, porsiyon: '100g', kategori: 'Sebze' },
  { ad: 'Patlıcan (ızgara)', kalori: 25, porsiyon: '100g', kategori: 'Sebze' },
  { ad: 'Karnabahar (haşlanmış)', kalori: 25, porsiyon: '100g', kategori: 'Sebze' },
  { ad: 'Yeşil fasulye (haşlanmış)', kalori: 31, porsiyon: '100g', kategori: 'Sebze' },
  { ad: 'Enginar (zeytinyağlı)', kalori: 95, porsiyon: '1 porsiyon', kategori: 'Sebze' },
  { ad: 'Karışık yeşil salata', kalori: 25, porsiyon: '1 kase', kategori: 'Sebze' },
  { ad: 'Çoban salatası', kalori: 80, porsiyon: '1 kase', kategori: 'Sebze' },
  { ad: 'Cacık', kalori: 55, porsiyon: '1 kase (150ml)', kategori: 'Sebze' },
  { ad: 'Semizotu salatası', kalori: 30, porsiyon: '1 kase', kategori: 'Sebze' },
  { ad: 'Roka salatası', kalori: 20, porsiyon: '1 kase', kategori: 'Sebze' },
  { ad: 'Marul', kalori: 15, porsiyon: '2 büyük yaprak (50g)', kategori: 'Sebze' },
  { ad: 'Kırmızı lahana salatası', kalori: 40, porsiyon: '1 kase', kategori: 'Sebze' },
  { ad: 'Mantar (sote)', kalori: 35, porsiyon: '100g', kategori: 'Sebze' },
  { ad: 'Soğan (çiğ)', kalori: 40, porsiyon: '1 orta boy (110g)', kategori: 'Sebze' },
  { ad: 'Sarımsak', kalori: 15, porsiyon: '3 diş (10g)', kategori: 'Sebze' },
  { ad: 'Patates (haşlanmış)', kalori: 87, porsiyon: '1 orta boy (130g)', kategori: 'Sebze' },
  { ad: 'Tatlı patates (fırında)', kalori: 103, porsiyon: '1 orta boy (130g)', kategori: 'Sebze' },
  { ad: 'Mısır (haşlanmış)', kalori: 90, porsiyon: '1 koçan (100g)', kategori: 'Sebze' },

  // ════════════════════════════════════════════════════
  // MEYVE
  // ════════════════════════════════════════════════════
  { ad: 'Elma', kalori: 72, porsiyon: '1 orta boy (130g)', kategori: 'Meyve' },
  { ad: 'Muz', kalori: 89, porsiyon: '1 orta boy (100g)', kategori: 'Meyve' },
  { ad: 'Portakal', kalori: 62, porsiyon: '1 orta boy (130g)', kategori: 'Meyve' },
  { ad: 'Mandalina', kalori: 45, porsiyon: '2 adet (100g)', kategori: 'Meyve' },
  { ad: 'Kivi', kalori: 42, porsiyon: '1 adet (75g)', kategori: 'Meyve' },
  { ad: 'Çilek', kalori: 40, porsiyon: '1 kase (120g)', kategori: 'Meyve' },
  { ad: 'Üzüm', kalori: 67, porsiyon: '1 avuç (100g)', kategori: 'Meyve' },
  { ad: 'Kayısı', kalori: 48, porsiyon: '3 adet (100g)', kategori: 'Meyve' },
  { ad: 'Armut', kalori: 57, porsiyon: '1 orta boy (120g)', kategori: 'Meyve' },
  { ad: 'Şeftali', kalori: 58, porsiyon: '1 orta boy (150g)', kategori: 'Meyve' },
  { ad: 'Erik', kalori: 46, porsiyon: '3 adet (100g)', kategori: 'Meyve' },
  { ad: 'Karpuz', kalori: 30, porsiyon: '1 dilim (200g)', kategori: 'Meyve' },
  { ad: 'Kavun', kalori: 34, porsiyon: '1 dilim (200g)', kategori: 'Meyve' },
  { ad: 'Nar', kalori: 83, porsiyon: '1 orta boy (200g)', kategori: 'Meyve' },
  { ad: 'Kiraz', kalori: 63, porsiyon: '1 avuç (100g)', kategori: 'Meyve' },
  { ad: 'Vişne', kalori: 50, porsiyon: '1 avuç (100g)', kategori: 'Meyve' },
  { ad: 'Ahududu', kalori: 52, porsiyon: '1 kase (120g)', kategori: 'Meyve' },
  { ad: 'Yaban mersini', kalori: 57, porsiyon: '1 kase (120g)', kategori: 'Meyve' },
  { ad: 'İncir (taze)', kalori: 74, porsiyon: '2 adet (100g)', kategori: 'Meyve' },
  { ad: 'İncir (kuru)', kalori: 249, porsiyon: '3 adet (40g)', kategori: 'Meyve' },
  { ad: 'Kuru kayısı', kalori: 195, porsiyon: '8 adet (40g)', kategori: 'Meyve' },
  { ad: 'Kuru üzüm', kalori: 130, porsiyon: '2 yemek kaşığı (30g)', kategori: 'Meyve' },
  { ad: 'Hurma', kalori: 80, porsiyon: '2 adet (30g)', kategori: 'Meyve' },
  { ad: 'Ananas', kalori: 50, porsiyon: '1 dilim (100g)', kategori: 'Meyve' },
  { ad: 'Mango', kalori: 65, porsiyon: '½ orta boy (100g)', kategori: 'Meyve' },
  { ad: 'Greyfurt', kalori: 52, porsiyon: '½ adet (120g)', kategori: 'Meyve' },

  // ════════════════════════════════════════════════════
  // KURUYEMIŞ & TOHUM
  // ════════════════════════════════════════════════════
  { ad: 'Badem', kalori: 87, porsiyon: '15 adet (28g)', kategori: 'Kuruyemiş' },
  { ad: 'Ceviz', kalori: 98, porsiyon: '4-5 yarım (28g)', kategori: 'Kuruyemiş' },
  { ad: 'Fındık', kalori: 90, porsiyon: '15 adet (14g)', kategori: 'Kuruyemiş' },
  { ad: 'Kaju', kalori: 95, porsiyon: '10 adet (28g)', kategori: 'Kuruyemiş' },
  { ad: 'Antep fıstığı', kalori: 80, porsiyon: '20 adet kabuklu (28g)', kategori: 'Kuruyemiş' },
  { ad: 'Kabak çekirdeği', kalori: 80, porsiyon: '2 yemek kaşığı (20g)', kategori: 'Kuruyemiş' },
  { ad: 'Ay çekirdeği', kalori: 85, porsiyon: '2 yemek kaşığı (20g)', kategori: 'Kuruyemiş' },
  { ad: 'Keten tohumu', kalori: 55, porsiyon: '1 yemek kaşığı (10g)', kategori: 'Kuruyemiş' },
  { ad: 'Chia tohumu', kalori: 49, porsiyon: '1 yemek kaşığı (12g)', kategori: 'Kuruyemiş' },
  { ad: 'Susam', kalori: 52, porsiyon: '1 yemek kaşığı (10g)', kategori: 'Kuruyemiş' },
  { ad: 'Fındık ezmesi (Nutella)', kalori: 200, porsiyon: '2 yemek kaşığı (37g)', kategori: 'Kuruyemiş' },
  { ad: 'Fıstık ezmesi', kalori: 94, porsiyon: '1 yemek kaşığı (16g)', kategori: 'Kuruyemiş' },

  // ════════════════════════════════════════════════════
  // YAĞ & SOS
  // ════════════════════════════════════════════════════
  { ad: 'Zeytinyağı', kalori: 90, porsiyon: '1 yemek kaşığı (10ml)', kategori: 'Yağ & Sos' },
  { ad: 'Tereyağı', kalori: 72, porsiyon: '1 tatlı kaşığı (10g)', kategori: 'Yağ & Sos' },
  { ad: 'Avokado', kalori: 120, porsiyon: '½ adet (75g)', kategori: 'Yağ & Sos' },
  { ad: 'Zeytin (siyah)', kalori: 60, porsiyon: '10 adet (40g)', kategori: 'Yağ & Sos' },
  { ad: 'Zeytin (yeşil)', kalori: 50, porsiyon: '10 adet (40g)', kategori: 'Yağ & Sos' },
  { ad: 'Tahin', kalori: 90, porsiyon: '1 yemek kaşığı (15g)', kategori: 'Yağ & Sos' },
  { ad: 'Mayonez', kalori: 90, porsiyon: '1 yemek kaşığı (15g)', kategori: 'Yağ & Sos' },
  { ad: 'Ketçap', kalori: 20, porsiyon: '1 yemek kaşığı (15g)', kategori: 'Yağ & Sos' },
  { ad: 'Hardal', kalori: 10, porsiyon: '1 tatlı kaşığı (10g)', kategori: 'Yağ & Sos' },
  { ad: 'Ranch sosu', kalori: 70, porsiyon: '1 yemek kaşığı (15g)', kategori: 'Yağ & Sos' },
  { ad: 'Acı sos', kalori: 5, porsiyon: '1 tatlı kaşığı', kategori: 'Yağ & Sos' },
  { ad: 'Soya sosu', kalori: 10, porsiyon: '1 yemek kaşığı (15ml)', kategori: 'Yağ & Sos' },
  { ad: 'Bal', kalori: 64, porsiyon: '1 tatlı kaşığı (21g)', kategori: 'Yağ & Sos' },
  { ad: 'Pekmez', kalori: 70, porsiyon: '1 yemek kaşığı (21g)', kategori: 'Yağ & Sos' },
  { ad: 'Reçel', kalori: 55, porsiyon: '1 yemek kaşığı (20g)', kategori: 'Yağ & Sos' },

  // ════════════════════════════════════════════════════
  // ÇORBA
  // ════════════════════════════════════════════════════
  { ad: 'Kırmızı mercimek çorbası', kalori: 130, porsiyon: '1 kase (250ml)', kategori: 'Çorba' },
  { ad: 'Ezogelin çorbası', kalori: 120, porsiyon: '1 kase (250ml)', kategori: 'Çorba' },
  { ad: 'Tarhana çorbası', kalori: 100, porsiyon: '1 kase (250ml)', kategori: 'Çorba' },
  { ad: 'Domates çorbası', kalori: 80, porsiyon: '1 kase (250ml)', kategori: 'Çorba' },
  { ad: 'Sebze çorbası', kalori: 70, porsiyon: '1 kase (250ml)', kategori: 'Çorba' },
  { ad: 'Tavuk çorbası', kalori: 80, porsiyon: '1 kase (250ml)', kategori: 'Çorba' },
  { ad: 'Yayla çorbası', kalori: 110, porsiyon: '1 kase (250ml)', kategori: 'Çorba' },
  { ad: 'Kremalı mantar çorbası', kalori: 140, porsiyon: '1 kase (250ml)', kategori: 'Çorba' },
  { ad: 'İşkembe çorbası', kalori: 120, porsiyon: '1 kase (250ml)', kategori: 'Çorba' },
  { ad: 'Paça çorbası', kalori: 130, porsiyon: '1 kase (250ml)', kategori: 'Çorba' },

  // ════════════════════════════════════════════════════
  // TÜRK YEMEKLERİ
  // ════════════════════════════════════════════════════
  { ad: 'Kuru fasulye (yemek)', kalori: 230, porsiyon: '1 porsiyon tabak', kategori: 'Türk Yemekleri' },
  { ad: 'İmam bayıldı', kalori: 180, porsiyon: '1 porsiyon', kategori: 'Türk Yemekleri' },
  { ad: 'Karnıyarık', kalori: 240, porsiyon: '1 porsiyon', kategori: 'Türk Yemekleri' },
  { ad: 'Patlıcan musakka', kalori: 220, porsiyon: '1 porsiyon', kategori: 'Türk Yemekleri' },
  { ad: 'Hünkar beğendi', kalori: 320, porsiyon: '1 porsiyon', kategori: 'Türk Yemekleri' },
  { ad: 'Etli güveç', kalori: 260, porsiyon: '1 porsiyon', kategori: 'Türk Yemekleri' },
  { ad: 'Ali nazik', kalori: 260, porsiyon: '1 porsiyon', kategori: 'Türk Yemekleri' },
  { ad: 'İzmir köfte', kalori: 280, porsiyon: '1 porsiyon', kategori: 'Türk Yemekleri' },
  { ad: 'Dolma (biber, zeytinyağlı)', kalori: 180, porsiyon: '3 adet', kategori: 'Türk Yemekleri' },
  { ad: 'Yaprak sarma (zeytinyağlı)', kalori: 160, porsiyon: '4 adet', kategori: 'Türk Yemekleri' },
  { ad: 'Yaprak sarma (etli)', kalori: 220, porsiyon: '4 adet', kategori: 'Türk Yemekleri' },
  { ad: 'Kabak mücver', kalori: 130, porsiyon: '2 adet', kategori: 'Türk Yemekleri' },
  { ad: 'Türlü (sebze)', kalori: 130, porsiyon: '1 porsiyon', kategori: 'Türk Yemekleri' },
  { ad: 'Zeytinyağlı taze fasulye', kalori: 90, porsiyon: '1 porsiyon', kategori: 'Türk Yemekleri' },
  { ad: 'Zeytinyağlı ıspanak', kalori: 110, porsiyon: '1 porsiyon', kategori: 'Türk Yemekleri' },
  { ad: 'Lahmacun', kalori: 230, porsiyon: '1 adet', kategori: 'Türk Yemekleri' },
  { ad: 'Pide (kaşarlı)', kalori: 380, porsiyon: '1 adet', kategori: 'Türk Yemekleri' },
  { ad: 'Pide (kıymalı)', kalori: 420, porsiyon: '1 adet', kategori: 'Türk Yemekleri' },
  { ad: 'Pide (sucuklu)', kalori: 450, porsiyon: '1 adet', kategori: 'Türk Yemekleri' },
  { ad: 'Gözleme (peynirli)', kalori: 280, porsiyon: '1 adet', kategori: 'Türk Yemekleri' },
  { ad: 'Gözleme (patatesli)', kalori: 260, porsiyon: '1 adet', kategori: 'Türk Yemekleri' },
  { ad: 'Börek (ıspanaklı)', kalori: 220, porsiyon: '1 dilim', kategori: 'Türk Yemekleri' },
  { ad: 'Börek (peynirli)', kalori: 250, porsiyon: '1 dilim', kategori: 'Türk Yemekleri' },
  { ad: 'Börek (kıymalı)', kalori: 280, porsiyon: '1 dilim', kategori: 'Türk Yemekleri' },
  { ad: 'Mantı', kalori: 300, porsiyon: '1 porsiyon', kategori: 'Türk Yemekleri' },
  { ad: 'Kavurmalı pilav', kalori: 350, porsiyon: '1 porsiyon', kategori: 'Türk Yemekleri' },

  // ════════════════════════════════════════════════════
  // FAST FOOD & HAZIR YEMEK
  // ════════════════════════════════════════════════════
  { ad: 'Hamburger (sade)', kalori: 350, porsiyon: '1 adet (150g)', kategori: 'Fast Food' },
  { ad: 'Hamburger (çift katlı)', kalori: 540, porsiyon: '1 adet (230g)', kategori: 'Fast Food' },
  { ad: 'Cheeseburger', kalori: 400, porsiyon: '1 adet (160g)', kategori: 'Fast Food' },
  { ad: 'Big Mac benzeri burger', kalori: 550, porsiyon: '1 adet (200g)', kategori: 'Fast Food' },
  { ad: 'Whopper benzeri burger', kalori: 650, porsiyon: '1 adet (270g)', kategori: 'Fast Food' },
  { ad: 'Chicken burger', kalori: 450, porsiyon: '1 adet (180g)', kategori: 'Fast Food' },
  { ad: 'Patates kızartması (küçük)', kalori: 230, porsiyon: '1 küçük (70g)', kategori: 'Fast Food' },
  { ad: 'Patates kızartması (orta)', kalori: 340, porsiyon: '1 orta (110g)', kategori: 'Fast Food' },
  { ad: 'Patates kızartması (büyük)', kalori: 490, porsiyon: '1 büyük (154g)', kategori: 'Fast Food' },
  { ad: 'Pizza (margarita, 2 dilim)', kalori: 500, porsiyon: '2 dilim (200g)', kategori: 'Fast Food' },
  { ad: 'Pizza (karışık, 2 dilim)', kalori: 580, porsiyon: '2 dilim (200g)', kategori: 'Fast Food' },
  { ad: 'Pizza (sucuklu, 2 dilim)', kalori: 620, porsiyon: '2 dilim (200g)', kategori: 'Fast Food' },
  { ad: 'Pizza (vejetaryen, 2 dilim)', kalori: 460, porsiyon: '2 dilim (200g)', kategori: 'Fast Food' },
  { ad: 'Hot dog', kalori: 290, porsiyon: '1 adet', kategori: 'Fast Food' },
  { ad: 'Kızartma karides (fast food)', kalori: 300, porsiyon: '1 porsiyon (100g)', kategori: 'Fast Food' },
  { ad: 'Soğan halkası', kalori: 300, porsiyon: '1 porsiyon (90g)', kategori: 'Fast Food' },
  { ad: 'Tavuk wrap', kalori: 380, porsiyon: '1 adet', kategori: 'Fast Food' },
  { ad: 'Dürüm (tavuk)', kalori: 420, porsiyon: '1 adet', kategori: 'Fast Food' },
  { ad: 'Dürüm (et)', kalori: 480, porsiyon: '1 adet', kategori: 'Fast Food' },
  { ad: 'Sandviç (ton balıklı)', kalori: 280, porsiyon: '1 adet', kategori: 'Fast Food' },
  { ad: 'Sandviç (hindi)', kalori: 250, porsiyon: '1 adet', kategori: 'Fast Food' },
  { ad: 'Sandviç (peynirli)', kalori: 320, porsiyon: '1 adet', kategori: 'Fast Food' },
  { ad: 'Tost (kaşarlı)', kalori: 280, porsiyon: '1 adet', kategori: 'Fast Food' },
  { ad: 'Tost (karışık)', kalori: 330, porsiyon: '1 adet', kategori: 'Fast Food' },
  { ad: 'Tavuk döner dürüm', kalori: 480, porsiyon: '1 adet', kategori: 'Fast Food' },
  { ad: 'Et döner dürüm', kalori: 550, porsiyon: '1 adet', kategori: 'Fast Food' },
  { ad: 'Hazır çorba (paket)', kalori: 60, porsiyon: '1 porsiyon (200ml)', kategori: 'Fast Food' },

  // ════════════════════════════════════════════════════
  // ATIŞTIRIMLIK & CIPS
  // ════════════════════════════════════════════════════
  { ad: 'Cips (patates, sade)', kalori: 150, porsiyon: '1 küçük paket (30g)', kategori: 'Atıştırmalık' },
  { ad: 'Cips (patates, büyük paket)', kalori: 500, porsiyon: '1 büyük paket (100g)', kategori: 'Atıştırmalık' },
  { ad: 'Mısır cipsi (Doritos tarzı)', kalori: 140, porsiyon: '1 küçük paket (28g)', kategori: 'Atıştırmalık' },
  { ad: 'Patlak mısır (popcorn, tuzlu)', kalori: 110, porsiyon: '2 kase (30g)', kategori: 'Atıştırmalık' },
  { ad: 'Patlak mısır (karamel)', kalori: 150, porsiyon: '2 kase (30g)', kategori: 'Atıştırmalık' },
  { ad: 'Kraker (sade)', kalori: 70, porsiyon: '5 adet (20g)', kategori: 'Atıştırmalık' },
  { ad: 'Bisküvi (sade)', kalori: 80, porsiyon: '4 adet (20g)', kategori: 'Atıştırmalık' },
  { ad: 'Bisküvi (kremalı)', kalori: 110, porsiyon: '3 adet (20g)', kategori: 'Atıştırmalık' },
  { ad: 'Grisini', kalori: 45, porsiyon: '3 adet (15g)', kategori: 'Atıştırmalık' },
  { ad: 'Çikolata kaplı gofret', kalori: 130, porsiyon: '1 adet (30g)', kategori: 'Atıştırmalık' },
  { ad: 'Çubuk kraker', kalori: 50, porsiyon: '10 adet (15g)', kategori: 'Atıştırmalık' },
  { ad: 'Yer fıstığı (tuzlu)', kalori: 165, porsiyon: '1 avuç (28g)', kategori: 'Atıştırmalık' },
  { ad: 'Mısır (cins, tuzlu)', kalori: 120, porsiyon: '1 avuç (30g)', kategori: 'Atıştırmalık' },
  { ad: 'Rice cake (pirinç keki)', kalori: 35, porsiyon: '1 adet (9g)', kategori: 'Atıştırmalık' },
  { ad: 'Protein bar', kalori: 190, porsiyon: '1 adet (55g)', kategori: 'Atıştırmalık' },
  { ad: 'Granola bar', kalori: 190, porsiyon: '1 adet (47g)', kategori: 'Atıştırmalık' },

  // ════════════════════════════════════════════════════
  // ÇİKOLATA & ŞEKERLEME
  // ════════════════════════════════════════════════════
  { ad: 'Bitter çikolata (%70)', kalori: 170, porsiyon: '3 kare (30g)', kategori: 'Çikolata & Şekerleme' },
  { ad: 'Sütlü çikolata', kalori: 160, porsiyon: '3 kare (30g)', kategori: 'Çikolata & Şekerleme' },
  { ad: 'Beyaz çikolata', kalori: 175, porsiyon: '3 kare (30g)', kategori: 'Çikolata & Şekerleme' },
  { ad: 'Çikolata bar (Snickers tarzı)', kalori: 280, porsiyon: '1 adet (57g)', kategori: 'Çikolata & Şekerleme' },
  { ad: 'Çikolata bar (Twix tarzı)', kalori: 280, porsiyon: '1 adet (56g)', kategori: 'Çikolata & Şekerleme' },
  { ad: 'Gummy ayı şekeri', kalori: 130, porsiyon: '1 avuç (40g)', kategori: 'Çikolata & Şekerleme' },
  { ad: 'Lokum', kalori: 120, porsiyon: '3 adet (40g)', kategori: 'Çikolata & Şekerleme' },
  { ad: 'Helva (tahin)', kalori: 170, porsiyon: '1 dilim (40g)', kategori: 'Çikolata & Şekerleme' },
  { ad: 'Akide şekeri', kalori: 60, porsiyon: '2 adet (15g)', kategori: 'Çikolata & Şekerleme' },

  // ════════════════════════════════════════════════════
  // TATLI & PASTA
  // ════════════════════════════════════════════════════
  { ad: 'Baklava', kalori: 300, porsiyon: '1 dilim (60g)', kategori: 'Tatlı & Pasta' },
  { ad: 'Kadayıf', kalori: 280, porsiyon: '1 porsiyon', kategori: 'Tatlı & Pasta' },
  { ad: 'Revani', kalori: 250, porsiyon: '1 dilim', kategori: 'Tatlı & Pasta' },
  { ad: 'Kazandibi', kalori: 220, porsiyon: '1 dilim', kategori: 'Tatlı & Pasta' },
  { ad: 'Kabak tatlısı', kalori: 200, porsiyon: '1 porsiyon', kategori: 'Tatlı & Pasta' },
  { ad: 'Aşure', kalori: 180, porsiyon: '1 kase', kategori: 'Tatlı & Pasta' },
  { ad: 'Profiterol', kalori: 280, porsiyon: '3 adet', kategori: 'Tatlı & Pasta' },
  { ad: 'Cheesecake dilimi', kalori: 350, porsiyon: '1 dilim (120g)', kategori: 'Tatlı & Pasta' },
  { ad: 'Çikolatalı kek dilimi', kalori: 380, porsiyon: '1 dilim (100g)', kategori: 'Tatlı & Pasta' },
  { ad: 'Pasta (yaş, 1 dilim)', kalori: 320, porsiyon: '1 dilim (100g)', kategori: 'Tatlı & Pasta' },
  { ad: 'Brownie', kalori: 240, porsiyon: '1 kare (60g)', kategori: 'Tatlı & Pasta' },
  { ad: 'Muffin (çikolatalı)', kalori: 350, porsiyon: '1 büyük (120g)', kategori: 'Tatlı & Pasta' },
  { ad: 'Donut (glazed)', kalori: 250, porsiyon: '1 adet (60g)', kategori: 'Tatlı & Pasta' },
  { ad: 'Waffle (sade)', kalori: 300, porsiyon: '1 adet (75g)', kategori: 'Tatlı & Pasta' },
  { ad: 'Waffle (çikolata soslu)', kalori: 430, porsiyon: '1 adet', kategori: 'Tatlı & Pasta' },
  { ad: 'Krep (sade)', kalori: 150, porsiyon: '1 adet (60g)', kategori: 'Tatlı & Pasta' },
  { ad: 'Krep (nutellalı)', kalori: 350, porsiyon: '1 adet', kategori: 'Tatlı & Pasta' },
  { ad: 'Pancake (3 adet)', kalori: 350, porsiyon: '3 küçük', kategori: 'Tatlı & Pasta' },
  { ad: 'Tiramisu', kalori: 310, porsiyon: '1 dilim', kategori: 'Tatlı & Pasta' },
  { ad: 'Panna cotta', kalori: 220, porsiyon: '1 porsiyon (150g)', kategori: 'Tatlı & Pasta' },
  { ad: 'Çilek tatlısı (yaş pasta)', kalori: 290, porsiyon: '1 dilim', kategori: 'Tatlı & Pasta' },
  { ad: 'Elmalı turta', kalori: 320, porsiyon: '1 dilim (120g)', kategori: 'Tatlı & Pasta' },
  { ad: 'Limonlu tart', kalori: 280, porsiyon: '1 dilim', kategori: 'Tatlı & Pasta' },

  // ════════════════════════════════════════════════════
  // İÇECEK (ALKOLSÜZ)
  // ════════════════════════════════════════════════════
  { ad: 'Su', kalori: 0, porsiyon: '1 bardak (240ml)', kategori: 'İçecek' },
  { ad: 'Çay (şekersiz)', kalori: 2, porsiyon: '1 bardak (200ml)', kategori: 'İçecek' },
  { ad: 'Çay (1 kesme şekerli)', kalori: 22, porsiyon: '1 bardak (200ml)', kategori: 'İçecek' },
  { ad: 'Türk kahvesi (şekersiz)', kalori: 10, porsiyon: '1 fincan (60ml)', kategori: 'İçecek' },
  { ad: 'Türk kahvesi (orta şekerli)', kalori: 30, porsiyon: '1 fincan (60ml)', kategori: 'İçecek' },
  { ad: 'Filtre kahve (siyah)', kalori: 5, porsiyon: '1 kupa (240ml)', kategori: 'İçecek' },
  { ad: 'Sütlü kahve (latte)', kalori: 150, porsiyon: '1 büyük kupa (480ml)', kategori: 'İçecek' },
  { ad: 'Cappuccino', kalori: 90, porsiyon: '1 kupa (240ml)', kategori: 'İçecek' },
  { ad: 'Frappe / soğuk kahve', kalori: 180, porsiyon: '1 büyük (480ml)', kategori: 'İçecek' },
  { ad: 'Ayran', kalori: 60, porsiyon: '240ml (1 bardak)', kategori: 'İçecek' },
  { ad: 'Kefir', kalori: 99, porsiyon: '240ml (1 bardak)', kategori: 'İçecek' },
  { ad: 'Portakal suyu (taze)', kalori: 112, porsiyon: '1 bardak (240ml)', kategori: 'İçecek' },
  { ad: 'Nar suyu', kalori: 134, porsiyon: '1 bardak (240ml)', kategori: 'İçecek' },
  { ad: 'Elma suyu (kutu)', kalori: 120, porsiyon: '1 kutu (200ml)', kategori: 'İçecek' },
  { ad: 'Şeftali nektarı', kalori: 110, porsiyon: '1 kutu (200ml)', kategori: 'İçecek' },
  { ad: 'Bitki çayı (şekersiz)', kalori: 2, porsiyon: '1 bardak (240ml)', kategori: 'İçecek' },
  { ad: 'Limonata (taze)', kalori: 80, porsiyon: '1 bardak (240ml)', kategori: 'İçecek' },
  { ad: 'Smoothie (muz-çilek)', kalori: 180, porsiyon: '1 bardak (300ml)', kategori: 'İçecek' },
  { ad: 'Protein shake', kalori: 160, porsiyon: '1 porsiyon (300ml)', kategori: 'İçecek' },

  // ════════════════════════════════════════════════════
  // GAZLI & ŞEKERLI İÇECEK
  // ════════════════════════════════════════════════════
  { ad: 'Kola (330ml kutu)', kalori: 139, porsiyon: '1 kutu (330ml)', kategori: 'Gazlı İçecek' },
  { ad: 'Kola (500ml şişe)', kalori: 210, porsiyon: '1 şişe (500ml)', kategori: 'Gazlı İçecek' },
  { ad: 'Kola (1 lt)', kalori: 420, porsiyon: '1 litre', kategori: 'Gazlı İçecek' },
  { ad: 'Diyet kola (0 kalori)', kalori: 1, porsiyon: '1 kutu (330ml)', kategori: 'Gazlı İçecek' },
  { ad: 'Sprite / 7UP (330ml)', kalori: 130, porsiyon: '1 kutu (330ml)', kategori: 'Gazlı İçecek' },
  { ad: 'Fanta portakal (330ml)', kalori: 145, porsiyon: '1 kutu (330ml)', kategori: 'Gazlı İçecek' },
  { ad: 'Gazoz', kalori: 120, porsiyon: '1 şişe (250ml)', kategori: 'Gazlı İçecek' },
  { ad: 'Enerji içeceği (250ml)', kalori: 110, porsiyon: '1 kutu (250ml)', kategori: 'Gazlı İçecek' },
  { ad: 'Meyve suyu (kutu, hazır)', kalori: 120, porsiyon: '1 kutu (200ml)', kategori: 'Gazlı İçecek' },
  { ad: 'Soğuk çay (şişe)', kalori: 110, porsiyon: '1 şişe (330ml)', kategori: 'Gazlı İçecek' },
  { ad: 'Spor içeceği (Gatorade tarzı)', kalori: 80, porsiyon: '1 şişe (500ml)', kategori: 'Gazlı İçecek' },

  // ════════════════════════════════════════════════════
  // ALKOLLÜ İÇECEK
  // ════════════════════════════════════════════════════
  { ad: 'Bira (330ml)', kalori: 153, porsiyon: '1 kutu/şişe (330ml)', kategori: 'Alkollü İçecek' },
  { ad: 'Bira (500ml)', kalori: 230, porsiyon: '1 büyük (500ml)', kategori: 'Alkollü İçecek' },
  { ad: 'Şarap (kırmızı, 1 kadeh)', kalori: 125, porsiyon: '1 kadeh (150ml)', kategori: 'Alkollü İçecek' },
  { ad: 'Şarap (beyaz, 1 kadeh)', kalori: 120, porsiyon: '1 kadeh (150ml)', kategori: 'Alkollü İçecek' },
  { ad: 'Rakı (tek)', kalori: 80, porsiyon: '1 tek (45ml)', kategori: 'Alkollü İçecek' },
  { ad: 'Votka (tek)', kalori: 97, porsiyon: '1 tek (45ml)', kategori: 'Alkollü İçecek' },
  { ad: 'Viski (tek)', kalori: 105, porsiyon: '1 tek (45ml)', kategori: 'Alkollü İçecek' },
  { ad: 'Gin-tonik', kalori: 175, porsiyon: '1 bardak (250ml)', kategori: 'Alkollü İçecek' },

  // ════════════════════════════════════════════════════
  // KAHVALTI ÜRÜNLERİ
  // ════════════════════════════════════════════════════
  { ad: 'Tahin pekmez', kalori: 200, porsiyon: '2 yemek kaşığı', kategori: 'Kahvaltı' },
  { ad: 'Granola (sütle)', kalori: 300, porsiyon: '1 kase', kategori: 'Kahvaltı' },
  { ad: 'Meyve kasesi', kalori: 150, porsiyon: '1 kase', kategori: 'Kahvaltı' },
  { ad: 'Avokado tost', kalori: 280, porsiyon: '1 dilim ekmek + ½ avokado', kategori: 'Kahvaltı' },
  { ad: 'Pancake (3 adet, akçaağaç şuruplu)', kalori: 450, porsiyon: '3 adet', kategori: 'Kahvaltı' },
  { ad: 'French toast', kalori: 280, porsiyon: '2 dilim', kategori: 'Kahvaltı' },
  { ad: 'Yulaf (sütlü)', kalori: 210, porsiyon: '1 kase (200ml süt + 40g yulaf)', kategori: 'Kahvaltı' },
  { ad: 'Overnight oats', kalori: 250, porsiyon: '1 kase', kategori: 'Kahvaltı' },

  // ════════════════════════════════════════════════════
  // SALATA (HAZIR / RESTORAN)
  // ════════════════════════════════════════════════════
  { ad: 'Sezar salatası', kalori: 250, porsiyon: '1 büyük tabak', kategori: 'Salata' },
  { ad: 'Ton balıklı salata', kalori: 200, porsiyon: '1 tabak', kategori: 'Salata' },
  { ad: 'Akdeniz salatası', kalori: 180, porsiyon: '1 tabak', kategori: 'Salata' },
  { ad: 'Tavuklu salata', kalori: 230, porsiyon: '1 tabak', kategori: 'Salata' },
  { ad: 'Kinoa salatası', kalori: 220, porsiyon: '1 tabak', kategori: 'Salata' },
  { ad: 'Mercimek salatası', kalori: 190, porsiyon: '1 tabak', kategori: 'Salata' },
  { ad: 'Coleslaw', kalori: 150, porsiyon: '1 kase', kategori: 'Salata' },
  { ad: 'Tabule salatası', kalori: 160, porsiyon: '1 kase', kategori: 'Salata' },

  // ════════════════════════════════════════════════════
  // HAZIR & PAKET YEMEK
  // ════════════════════════════════════════════════════
  { ad: 'Hazır noodle (paket)', kalori: 380, porsiyon: '1 paket (85g)', kategori: 'Hazır Yemek' },
  { ad: 'Konserve fasulye', kalori: 120, porsiyon: '½ kutu (200g)', kategori: 'Hazır Yemek' },
  { ad: 'Konserve mısır', kalori: 90, porsiyon: '½ kutu (140g)', kategori: 'Hazır Yemek' },
  { ad: 'Konserve domates', kalori: 40, porsiyon: '½ kutu (200g)', kategori: 'Hazır Yemek' },
  { ad: 'Dondurulmuş pizza', kalori: 740, porsiyon: '½ pizza (250g)', kategori: 'Hazır Yemek' },
  { ad: 'Hazır lazanya', kalori: 380, porsiyon: '1 porsiyon (270g)', kategori: 'Hazır Yemek' },
  { ad: 'Hazır köfte (donmuş)', kalori: 240, porsiyon: '4 adet (100g)', kategori: 'Hazır Yemek' },
  { ad: 'Sosisli sandviç', kalori: 290, porsiyon: '1 adet', kategori: 'Hazır Yemek' },
  { ad: 'Sosis (ızgara)', kalori: 180, porsiyon: '2 adet (60g)', kategori: 'Hazır Yemek' },
  { ad: 'Salam', kalori: 80, porsiyon: '2 dilim (30g)', kategori: 'Hazır Yemek' },

  // ════════════════════════════════════════════════════
  // TATLANDIRICI & EKLENTI
  // ════════════════════════════════════════════════════
  { ad: 'Şeker', kalori: 45, porsiyon: '1 yemek kaşığı (12g)', kategori: 'Tatlandırıcı' },
  { ad: 'Esmer şeker', kalori: 45, porsiyon: '1 yemek kaşığı (12g)', kategori: 'Tatlandırıcı' },
  { ad: 'Stevia (sıfır kalori)', kalori: 0, porsiyon: '1 paket', kategori: 'Tatlandırıcı' },
  { ad: 'Bal', kalori: 64, porsiyon: '1 tatlı kaşığı (21g)', kategori: 'Tatlandırıcı' },
  { ad: 'Akçaağaç şurubu', kalori: 52, porsiyon: '1 yemek kaşığı (20ml)', kategori: 'Tatlandırıcı' },
  { ad: 'Reçel', kalori: 55, porsiyon: '1 yemek kaşığı (20g)', kategori: 'Tatlandırıcı' },

]

/** Türkçe karakterleri normalize eder (arama için) */
function normalizeTR(metin: string): string {
  return metin
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
}

/** Adı eşleştirip kalori + porsiyon döner — kelime bazlı tam eşleşme */
export function besinAra(sorgu: string): Besin[] {
  if (!sorgu.trim()) return []
  const sorguKelimeleri = normalizeTR(sorgu.trim()).split(/\s+/).filter(Boolean)

  return besinler
    .filter(b => {
      // Besin adını kelimelerine böl (boşluk, parantez, virgül, tire, slash)
      const besinKelimeleri = normalizeTR(b.ad).split(/[\s()\[\],\-\/\\%]+/).filter(Boolean)
      // Her sorgu kelimesi, besin kelimelerinden birinin başında olmalı
      return sorguKelimeleri.every(sk =>
        besinKelimeleri.some(bk => bk.startsWith(sk))
      )
    })
    .slice(0, 10)
}

/** Tam eşleşme varsa o besini döner */
export function besinBul(ad: string): Besin | undefined {
  return besinler.find(b => b.ad.toLowerCase() === ad.toLowerCase().trim())
}
