import { UrunYorumlari } from "../apps/urun-yorumlari/UrunYorumlari";
import { Sergileme }     from "../apps/sergileme/Sergileme";

/**
 * APP REGISTRY
 * Yeni bir app eklemek için: src/apps/<klasör> altına oluştur,
 * import et ve aşağıdaki listeye ekle. Portal otomatik gösterir.
 *
 * Alanlar:
 *  - id          : URL slug (`/urun-yorumlari`)
 *  - name        : Tam isim (portal kartı, navbar)
 *  - shortName   : Kısa isim (navbar küçük ekranda)
 *  - icon        : Emoji
 *  - description : Portal kartında gözükecek açıklama
 *  - color       : Vurgu rengi (kart border hover, vb.)
 *  - component   : React component
 *  - adminOnly   : (opsiyonel) true → sadece admin görür
 *  - hidden      : (opsiyonel) true → portal kartında gizle, sadece direkt URL ile aç
 */
export const APPS = [
  {
    id: "urun-yorumlari",
    name: "Ürün Yorumları",
    shortName: "Yorumlar",
    icon: "📦",
    description: "Belirli bir ürün hakkında satış performansı, fiyat, müşteri geri bildirimi ve stok notları paylaşın.",
    color: "#4d7cfe",
    component: UrunYorumlari,
  },
  {
    id: "sergileme",
    name: "Sergileme Galerisi",
    shortName: "Sergileme",
    icon: "🖼️",
    description: "Başarılı reyon düzenlemelerini ve kombinasyon fikirlerini fotoğraflarla paylaşın. Diğer mağazaların sergilemelerini keşfedin.",
    color: "#22c55e",
    component: Sergileme,
  },
];

export const getApp = (id) => APPS.find(a => a.id === id);
