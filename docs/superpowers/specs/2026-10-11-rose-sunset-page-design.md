# Gül Yağmuru Gün Batımı Sayfası — Tasarım

Tarih: 2026-10-11

## Amaç

Tek sayfalık, etkileşimli bir web sitesi. Açılışta yukarıdan güller yağar, en son kırmızı bir gül düşüp ekranda kalır. Tüm sahne, gün batımında bir plajda öndeki gülle birlikte aşağı doğru düşüyormuş gibi hissettirir. Ekranda bir yazı ve iki buton vardır:

- **Yeşil buton:** konfeti patlar, yazı değişir.
- **Kırmızı buton:** tıklanmaya çalışılınca yeri değişir (kaçar).

Sayfa bir kişiye gösterilmek için kullanılacak (klasik "evet / hayır" sayfası). Tüm yazılar placeholder olarak gelir, sahibi kendi metniyle değiştirecek.

## Kapsam dışı

Backend, veritabanı, kullanıcı hesabı, analitik, çoklu sayfa. Gerçek fotoğraf kullanılmaz; plaj ve güller SVG/CSS ile çizilir.

## Gereksinimler

1. **Mobil ve masaüstünde eşit kalitede çalışmalı.** Bu bir başlangıç gereksinimi, sonradan eklenecek bir şey değil.
2. Tüm metinler tek dosyada (`src/lib/content.ts`) tutulur.
3. Açılış animasyonu: güller yağar, kırmızı gül en son düşüp kalır, sonra yazı ve butonlar belirir.
4. "Düşüyormuş" hissi: arka plan katmanları yavaşça yukarı kayar, öndeki gül sabit kalır.
5. Yeşil buton: konfeti + yazı değişimi + kırmızı buton kaybolur.
6. Kırmızı buton: yaklaşınca veya dokununca/basınca ekranda başka yere kaçar.
7. `prefers-reduced-motion` açıksa gül yağmuru ve parallax atlanır, sayfa son halinde açılır.

## Teknik karar

Stack: Next.js (App Router), Tailwind CSS, TypeScript strict (`any` yok), pnpm. Konfeti için `canvas-confetti`. Test için vitest. Sahne SVG/CSS katmanları, güller ayrı SVG elemanları (CSS animasyonu), kalıcı etkileşim DOM'da.

Reddedilen yaklaşımlar: tek canvas (yine de DOM overlay gerektirir, gereksiz karmaşık), Three.js (bu iş için aşırı).

Tailwind v4 notu: JS'in yazdığı `transform` ile Tailwind'in ayrık `translate-*` özellikleri çarpılır. Kaçan butonun konumu yalnızca CSS değişkeni (`--x`, `--y`) üzerinden, Tailwind `translate` sınıflarıyla verilir; JS hiçbir yerde `style.transform` yazmaz. Inline `style` kullanılmaz; değişkenler `ref.style.setProperty` ile atanır.

## Dosyalar

| Dosya | Sorumluluk |
|---|---|
| `src/lib/content.ts` | Tüm yazılar (placeholder) |
| `src/lib/dodge.ts` | Kaçan butonun yeni konumunu seçen saf fonksiyon |
| `src/components/Scene.tsx` | Gün batımı gökyüzü, güneş, deniz, kum (SVG/CSS katmanları) |
| `src/components/RoseRain.tsx` | Yağan güller |
| `src/components/HeroRose.tsx` | En son düşüp kalan kırmızı gül |
| `src/components/ChoiceButtons.tsx` | Yazı ve iki buton |
| `src/app/page.tsx` | Parçaları birleştirir, açılış aşamalarını yönetir |

## Placeholder metinler (`content.ts`)

- Soru: "Soru metni buraya"
- Yeşil buton: "Yeşil buton"
- Kırmızı buton: "Kırmızı buton"
- Sonuç (yeşile basınca): "Sonuç metni buraya"

## Açılış akışı

Aşamalar: `raining` → `landing` → `ready` → `accepted`.

1. `raining` (~4 sn): rastgele boyut, hız, sallanma ve gecikmeyle güller yağar. Ekrandan çıkan güller DOM'dan kaldırılır.
2. `landing`: kırmızı gül en son düşer, alt-orta bölgeye yerleşir.
3. `ready`: yazı ve butonlar yavaşça belirir. Parallax yavaşça sürer.
4. `accepted`: yeşile basıldıktan sonraki durum.

Yağan gül sayısı ekran genişliğine göre ölçeklenir (dar ekranda daha az, örn. ~14; geniş ekranda ~30) ki düşük donanımlı telefonlar takılmasın. Animasyonlar yalnızca `transform` ve `opacity` kullanır.

## Mobil ve masaüstü gereksinimleri

- **Viewport:** yükseklik için `100dvh` (mobil tarayıcı adres çubuğu zıplamasını önler); `viewport` meta etiketi ve `viewport-fit=cover` ile `env(safe-area-inset-*)` boşlukları.
- **Sahne ölçekleme:** SVG `preserveAspectRatio="xMidYMax slice"`; dikey telefonda, yatay telefonda ve geniş masaüstünde güneş/ufuk oranı bozulmaz.
- **Dokunma hedefi:** butonlar en az 44×44 px.
- **Girdi bağımsızlığı:** hiçbir davranış hover'a bağımlı değil. Kırmızı buton için fare yaklaşımı yalnızca `pointerType === "mouse"` iken, dokunmada `pointerdown` tetikler. Hover ile duraklayan/değişen hiçbir şey yok.
- **Kaçma sınırı:** yeni konum görünür viewport içinde (`dvh` ve güvenli alan dahil) kalır; yazıyla ve yeşil butonla çakışmaz; mevcut konumdan belirgin uzaklıkta seçilir.
- **Yön değişimi / yeniden boyutlandırma:** `resize` / `orientationchange` sonrası kırmızı buton ekran dışında kalmaz, yeniden konumlanır.
- **Metin:** akıcı yazı boyutu (`clamp`); küçük ekranda taşma ve kesilme yok.
- **Doğrulama boyutları:** 390×844 (dikey telefon), 844×390 (yatay telefon), 768×1024 (tablet), 1440×900 (masaüstü).

## Butonlar

- **Yeşil:** `canvas-confetti` ihtiyaç anında dinamik import edilir. Konfeti patlar, yazı sonuç metnine döner, kırmızı buton kaybolur. Klavyeyle (Enter/Space) çalışır.
- **Kırmızı:** fare yaklaşınca (~90 px) veya dokunma/`pointerdown` ile `dodge.ts`'in verdiği yeni konuma geçer. Konuma geçiş kısa bir CSS geçişiyle animasyonlanır. Klavye odağı alırsa da kaçar (şaka sayfası; bilinçli tercih).

## Hata ve kenar durumları

- `canvas-confetti` yüklenemezse (dinamik import try/catch içinde) yazı yine de değişir; konfeti olmadan akış devam eder. Hata kullanıcıya gösterilmez, konsola da log bırakılmaz (production'a `console.*` gitmez).
- Çok hızlı üst üste basma: kaçma animasyonu sürerken gelen yeni tetik, mevcut hedefi yenisiyle değiştirir; durum tutarsız kalmaz.
- Yeşile basılırken `reduced-motion` açıksa konfeti yerine yazı değişimi yeterli.

## Test

- `dodge.ts` vitest ile birim testlenir (test önce yazılır): sonuç viewport içinde, yasak bölgelerle (yazı, yeşil buton) çakışmıyor, mevcut konumdan en az eşik kadar uzak, çok küçük viewport'ta bile geçerli bir sonuç dönüyor.
- Görsel/etkileşim doğrulaması Playwright ile yukarıdaki dört boyutta: ekran görüntüsü, kırmızı butonun fare ve dokunmada kaçması, yeşil butonla yazı değişimi ve konfeti.
- `pnpm build` ve `pnpm lint` yeşil olmadan iş bitti denmez.

## Varsayımlar

- Yeşile basınca kırmızı butonun kaybolması (sahibi itiraz etmedi).
- Gül ve plaj SVG ile çizilir, fotoğraf kullanılmaz.
- Proje kökü `myLo/`; `git init` sahibi tarafından açıkça onaylandı.
