# 🎵 Cara Kerja Senja Musik - Versi Simpel

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Buka: **http://localhost:3000**

---

## 💡 Cara Kerja (3 Langkah)

### 1️⃣ **Cari Lagu** 
- Ketik di search → Server ambil data dari **YouTube Music**
- Pakai library `ytmusic-api` (gratis, gak perlu API key)

### 2️⃣ **Putar Musik**
- Click lagu → Pakai **YouTube IFrame Player** (embed video YouTube)
- Audio streaming langsung dari YouTube (gratis)

### 3️⃣ **Lihat Lirik**
- Otomatis ambil dari **LRCLIB API** (database lirik publik, gratis)
- Lirik sinkron dengan waktu lagu

---

## 🎯 Yang Penting Aja

### Data Musik dari mana?
```
YouTube Music → ytmusic-api → Server → App
```

### Audio dari mana?
```
YouTube Video → IFrame Player → Streaming Audio
```

### Lirik dari mana?
```
LRCLIB.net → Public API → Lyrics with timestamps
```

---

## ✅ Kelebihan

- ✅ **GRATIS** - Gak perlu API key apapun
- ✅ **SIMPEL** - Install → Run → Done
- ✅ **LENGKAP** - Semua fitur sudah jalan
- ✅ **CEPAT** - Ada caching otomatis

---

## 📁 File Penting

```
server.ts              ← Backend (ambil data dari YouTube Music)
PlayerContext.tsx      ← Player (putar musik pakai YouTube)
musicApi.ts           ← API calls (search, detail, dll)
```

---

## 🎮 Cara Pakai

1. **Search lagu** → Type di search box
2. **Play lagu** → Click thumbnail atau tombol play
3. **Next/Previous** → Tekan N/P atau click tombol
4. **Lihat lirik** → Click icon lyrics
5. **Buat playlist** → Masuk Library → Create New
6. **Lihat stats** → Tab Stats untuk lihat riwayat

---

## 🔧 Troubleshooting

**Musik gak bisa play?**
→ Video mungkin restricted, coba lagu lain

**Search kosong?**
→ Cek internet, restart server

**Lirik gak ada?**
→ Normal, gak semua lagu punya lirik di database

---

## 🎉 Selesai!

Itu aja! Aplikasi udah jalan lengkap:
- ✅ Search musik
- ✅ Play dari YouTube
- ✅ Lirik sinkron
- ✅ Playlist
- ✅ Statistics
- ✅ Dan 15 fitur lainnya

**Gak ribet, semua otomatis!** 🚀
