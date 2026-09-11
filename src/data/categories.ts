export interface MusicCategory {
  id: string;
  name: string;
  query: string;
  description: string;
  gradient?: string;
  icon?: string;
}

export const MUSIC_CATEGORIES: MusicCategory[] = [
  {
    id: "pop-indonesia",
    name: "Pop Indonesia",
    query: "lagu pop indonesia terbaru",
    description: "Pop Indonesia terbaru dan hits",
    gradient: "from-pink-600/30 to-purple-950/40",
    icon: "music_note",
  },
  {
    id: "dangdut-koplo",
    name: "Dangdut Koplo",
    query: "dangdut koplo terbaru",
    description: "Dangdut koplo terpopuler dengan irama energik",
    gradient: "from-orange-600/30 to-red-950/40",
    icon: "graphic_eq",
  },
  {
    id: "hits-zaman-now",
    name: "Hits Zaman Now",
    query: "hits indonesia terkini",
    description: "Hits Indonesia terkini dan trending",
    gradient: "from-emerald-600/30 to-teal-950/40",
    icon: "trending_up",
  },
  {
    id: "kemarau-chill",
    name: "Kemarau Chill",
    query: "lagu indie santai mood cerah",
    description: "Lagu indie santai mood cerah dan hangat",
    gradient: "from-yellow-600/30 to-amber-950/40",
    icon: "wb_sunny",
  },
  {
    id: "rock-sepanjang-masa",
    name: "Rock Sepanjang Masa",
    query: "rock indonesia legendaris",
    description: "Rock Indonesia legendaris lintas dekade",
    gradient: "from-red-600/30 to-zinc-950/40",
    icon: "electric_bolt",
  },
  {
    id: "indie-senja",
    name: "Indie Senja",
    query: "lagu indie senja indonesia akustik",
    description: "Alunan akustik dan folk syahdu saat matahari terbenam",
    gradient: "from-amber-600/30 to-orange-950/40",
    icon: "wb_twilight",
  },
  {
    id: "akustik-nusantara",
    name: "Akustik Nusantara",
    query: "akustik indonesia terbaik petikan gitar",
    description: "Petikan gitar hangat musisi tanah air",
    gradient: "from-emerald-600/30 to-teal-950/40",
    icon: "music_note",
  },
  {
    id: "pop-hits",
    name: "Pop Hits Indonesia",
    query: "lagu pop indonesia terpopuler 2024",
    description: "Lagu pop Indonesia paling ramai diputar",
    gradient: "from-rose-600/30 to-pink-950/40",
    icon: "trending_up",
  },
  {
    id: "lofi-chill",
    name: "Lo-Fi & Santai",
    query: "lofi hip hop chill beats relax focus",
    description: "Irama santai untuk menemani fokus dan rehat",
    gradient: "from-blue-600/30 to-indigo-900/40",
    icon: "headphones",
  },
  {
    id: "galau-rintik",
    name: "Lagu Galau & Hujan",
    query: "lagu galau indonesia rintik hujan sedih",
    description: "Melodi menyayat hati pengiring rasa rindu",
    gradient: "from-cyan-600/30 to-slate-900/40",
    icon: "water_drop",
  },
  {
    id: "fokus-coding",
    name: "Fokus & Coding Flow",
    query: "deep focus instrumental music coding",
    description: "Alunan instrumen pemicu konsentrasi maksimal",
    gradient: "from-violet-600/30 to-purple-950/40",
    icon: "terminal",
  },
  {
    id: "rock-alternatif",
    name: "Rock & Alternatif",
    query: "indonesian alternative rock hits",
    description: "Energi distorsi dan riff legendaris band lokal",
    gradient: "from-red-600/30 to-zinc-950/40",
    icon: "electric_bolt",
  },
  {
    id: "rnb-soul",
    name: "R&B & Soul Senja",
    query: "indonesia rnb soul vibes santai",
    description: "Groove lembut dan vokal penuh penghayatan",
    gradient: "from-fuchsia-600/30 to-violet-950/40",
    icon: "graphic_eq",
  },
  {
    id: "nostalgia-emas",
    name: "Nostalgia 90an - 2000an",
    query: "lagu nostalgia indonesia 90an 2000an",
    description: "Lagu kenangan emas musisi legendaris",
    gradient: "from-yellow-600/30 to-amber-950/40",
    icon: "radio",
  },
];
