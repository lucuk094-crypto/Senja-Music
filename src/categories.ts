/**
 * categories.ts / categories.js
 * File konfigurasi mapping judul section ke search query YouTube Music API.
 * Memudahkan penambahan, pengeditan, atau penyesuaian kata kunci pencarian setiap section di aplikasi.
 */

export interface SectionCategoryConfig {
  id: string;
  title: string;
  query: string;
  subtitle?: string;
  badge?: string;
  icon?: string;
  description?: string;
}

/**
 * Mapping koleksi hits kurasi khusus yang diminta pengguna:
 */
export const CURATED_COLLECTIONS_MAPPING: Record<string, string> = {
  "pop-indonesia": "lagu pop indonesia terbaru",
  "hits-zaman-now": "hits indonesia terkini",
  "kemarau-chill": "lagu indie santai mood cerah",
  "rock-sepanjang-masa": "rock indonesia legendaris",
};

/**
 * Metadata lengkap untuk koleksi hits khusus
 */
export const CURATED_COLLECTIONS_CONFIG: SectionCategoryConfig[] = [
  {
    id: "pop-indonesia",
    title: "Pop Indonesia",
    subtitle: "lagu pop indonesia terbaru",
    query: "lagu pop indonesia terbaru",
    badge: "POP HITS",
    icon: "music_note",
    description: "Lagu pop Indonesia terbaru dan terpopuler",
  },
  {
    id: "pop-indonesia",
    title: "Pop Indonesia",
    subtitle: "lagu pop indonesia terbaru",
    query: "lagu pop indonesia terbaru",
    badge: "POP INDONESIA",
    icon: "music_note",
    description: "Kompilasi lagu pop Indonesia terkini dari musisi papan atas",
  },
  {
    id: "hits-zaman-now",
    title: "Hits Zaman Now",
    subtitle: "hits indonesia terkini",
    query: "hits indonesia terkini",
    badge: "TRENDING NOW",
    icon: "trending_up",
    description: "Lagu-lagu viral yang sedang ramai dibicarakan dan diputar di mana-mana",
  },
  {
    id: "kemarau-chill",
    title: "Kemarau Chill",
    subtitle: "lagu indie santai mood cerah",
    query: "lagu indie santai mood cerah",
    badge: "CHILL VIBES",
    icon: "wb_sunny",
    description: "Alunan akustik dan indie bernuansa cerah pengiring sore yang damai",
  },
  {
    id: "rock-sepanjang-masa",
    title: "Rock Sepanjang Masa",
    subtitle: "rock indonesia legendaris",
    query: "rock indonesia legendaris",
    badge: "ROCK LEGEND",
    icon: "electric_bolt",
    description: "Lagu rock legendaris tanah air yang abadi melintasi zaman",
  },
];

/**
 * Mapping khusus untuk setiap section di Halaman Home
 */
export const HOME_SECTION_QUERIES = {
  // Hero Featured Mix di bagian atas Home
  featuredHero: {
    id: "featured-hero",
    title: "Daily Acoustic Mix",
    subtitle: "Daily Acoustic Mix",
    badge: "KHUSUS UNTUKMU",
    query: "lagu pop indie senja akustik indonesia terbaik",
  },

  // Section 1: Keep Listening (Lagu-lagu favorit yang sering diputar)
  keepListening: {
    id: "keep-listening",
    title: "Keep Listening",
    query: "lagu akustik indonesia santai hits",
  },

  // Section 2: Kemarau Chill (Suasana Menyenangkan & Lagu-lagu Ceria)
  kemarauChill: {
    id: "kemarau-chill",
    title: "Kemarau Chill",
    subtitle: "lagu indie santai mood cerah",
    query: "lagu indie santai mood cerah",
  },

  // Section 3: Similar to Artist (Artis acuan)
  similarArtist: {
    id: "similar-artist",
    artistName: "Nadin Amizah",
    title: "Similar to Nadin Amizah",
    // Fallback query jika endpoint related artist belum tersedia di API backend
    fallbackQuery: "Nadin Amizah lagu terbaik acoustic",
  },
};

/**
 * Mapping umum untuk kategori & genre yang bisa digunakan di seluruh halaman (Explore, Home, dsb.)
 */
export const GENRE_CATEGORIES: Record<string, SectionCategoryConfig> = {
  "Dangdut Hits": {
    id: "dangdut-hits",
    title: "Dangdut Hits",
    query: "dangdut hits terbaru",
  },
  "Pop": {
    id: "pop",
    title: "Pop Indonesia",
    query: "lagu pop indonesia terpopuler 2024",
  },
  "Rilis Baru": {
    id: "rilis-baru",
    title: "Rilis Baru",
    query: "lagu indonesia rilis baru terbaru",
  },
  "Indie Senja": {
    id: "indie-senja",
    title: "Indie Senja",
    query: "lagu indie senja indonesia akustik",
  },
  "Akustik Nusantara": {
    id: "akustik-nusantara",
    title: "Akustik Nusantara",
    query: "akustik indonesia terbaik petikan gitar",
  },
  "Lo-Fi & Santai": {
    id: "lofi-chill",
    title: "Lo-Fi & Santai",
    query: "lofi hip hop chill beats relax focus",
  },
  "Lagu Galau": {
    id: "lagu-galau",
    title: "Lagu Galau & Hujan",
    query: "lagu galau indonesia rintik hujan sedih",
  },
  "Fokus & Coding": {
    id: "fokus-coding",
    title: "Fokus & Coding Flow",
    query: "deep focus instrumental music coding",
  },
  "Rock & Alternatif": {
    id: "rock-alternatif",
    title: "Rock & Alternatif",
    query: "indonesian alternative rock hits",
  },
};

export default {
  HOME_SECTION_QUERIES,
  GENRE_CATEGORIES,
};
