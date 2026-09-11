/**
 * categories.js
 * Konfigurasi mapping tiap judul section ke search query untuk YouTube Music API.
 * Sesuai instruksi #3: memudahkan penambahan dan pengeditan query kategori di masa mendatang.
 */

export const CURATED_COLLECTIONS_MAPPING = {
  "hot-dangdut": "dangdut hits terbaru",
  "hot-koplo": "dangdut koplo terpopuler",
  "pop-indonesia": "lagu pop indonesia terbaru",
  "hits-zaman-now": "hits indonesia terkini",
  "kemarau-chill": "lagu indie santai mood cerah",
  "rock-sepanjang-masa": "rock indonesia legendaris",
};

export const CURATED_COLLECTIONS_CONFIG = [
  {
    id: "hot-dangdut",
    title: "Hot Dangdut",
    subtitle: "dangdut hits terbaru",
    query: "dangdut hits terbaru",
    badge: "DANGDUT HITS",
    icon: "headset",
    description: "Deretan lagu dangdut terpopuler dan paling membahana saat ini",
  },
  {
    id: "hot-koplo",
    title: "Hot Koplo",
    subtitle: "dangdut koplo terpopuler",
    query: "dangdut koplo terpopuler",
    badge: "KOPLO HITS",
    icon: "graphic_eq",
    description: "Irama gendang koplo energik yang mengguncang panggung musik",
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

export const HOME_SECTION_QUERIES = {
  featuredHero: {
    id: "featured-hero",
    title: "Daily Acoustic Mix",
    subtitle: "Daily Acoustic Mix",
    badge: "KHUSUS UNTUKMU",
    query: "lagu pop indie senja akustik indonesia terbaik",
  },
  keepListening: {
    id: "keep-listening",
    title: "Keep Listening",
    query: "lagu akustik indonesia santai hits",
  },
  kemarauChill: {
    id: "kemarau-chill",
    title: "Kemarau Chill",
    subtitle: "lagu indie santai mood cerah",
    query: "lagu indie santai mood cerah",
  },
  similarArtist: {
    id: "similar-artist",
    artistName: "Nadin Amizah",
    title: "Similar to Nadin Amizah",
    fallbackQuery: "Nadin Amizah lagu terbaik acoustic",
  },
};

export const GENRE_CATEGORIES = {
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
