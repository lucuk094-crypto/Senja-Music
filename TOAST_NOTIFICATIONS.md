# 🔔 Toast Notification System

## Overview
Sistem notifikasi real-time untuk memberi feedback visual kepada user tentang status aplikasi, kesalahan, dan informasi penting lainnya.

## Komponen

### 1. **Toast.tsx**
File: `src/components/Toast.tsx`

**Single toast component** dengan:
- ✅ Auto-dismiss setelah duration tertentu (default: 4 detik)
- ✅ Manual close button
- ✅ 4 tipe pesan: success, error, warning, info
- ✅ Icon yang sesuai dengan tipe
- ✅ Animasi slide-in dari atas
- ✅ Color-coded border & background

**Props:**
```typescript
interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}
```

---

### 2. **ToastContainer.tsx**
File: `src/components/ToastContainer.tsx`

**Container untuk multiple toasts**, di-render di `App.tsx` dengan posisi:
- Fixed position: `top-4` dari layar
- z-index: `100` (di atas semua elemen)
- Max width: `380px`
- Stacking: Multiple toasts muncul vertikal dengan gap 8px

---

### 3. **PlayerContext Integration**
File: `src/context/PlayerContext.tsx`

**State Management:**
```typescript
const [toasts, setToasts] = useState<ToastMessage[]>([]);
```

**Functions Exposed:**
```typescript
showToast(type, title, message, duration?): void
dismissToast(id): void
```

**Usage Example:**
```typescript
showToast("error", "Lagu Tidak Dapat Diputar", "Video tidak tersedia. Mencoba lagu berikutnya...");
showToast("success", "Berhasil", "Lagu ditambahkan ke playlist.");
showToast("warning", "Peringatan", "Koneksi internet lambat.");
showToast("info", "Informasi", "Menggunakan mode offline.");
```

---

## Error Notifications Implemented

### 1. **YouTube Player Initialization Errors**
**Location:** `PlayerContext.tsx` lines ~400-420

**Triggers:**
- ❌ Gagal load YouTube IFrame API script
- ❌ Gagal inisialisasi YT.Player object
- ❌ Error setelah max retries (3x)

**Toast Messages:**
```typescript
// Script load failure
showToast("error", "Gagal Memuat API", "Tidak dapat memuat YouTube API. Periksa koneksi internet Anda.");

// Init failure with retry
showToast("error", "Kesalahan Inisialisasi Player", "Gagal memuat YouTube player. Mencoba lagi...");

// Max retries exceeded
showToast("error", "Player Tidak Dapat Dimuat", "Tidak dapat menginisialisasi music player. Refresh halaman atau periksa koneksi.");
```

---

### 2. **YouTube Player Playback Errors**
**Location:** `PlayerContext.tsx` onError handler

**Error Codes & Messages:**

| Code | Arti | Toast Title | Toast Message |
|------|------|-------------|---------------|
| 2 | Invalid parameter | Parameter Tidak Valid | ID video tidak valid. Mencoba lagu berikutnya... |
| 5 | HTML5 player error | Kesalahan Player | Terjadi kesalahan HTML5 player. Mencoba lagi... |
| 100 | Video not found | Lagu Tidak Ditemukan | Video tidak tersedia. Mencoba lagu berikutnya... |
| 101 | Embed not allowed | Lagu Tidak Dapat Diputar | Video tidak dapat diputar di sini. Melewati ke lagu berikutnya... |
| 150 | Embed restricted | Lagu Tidak Dapat Diputar | Video tidak dapat diputar di sini. Melewati ke lagu berikutnya... |

**Auto Recovery:**
- Error 100/101/150 → Skip ke lagu berikutnya setelah 1 detik
- Max 3 retries, jika exceeded → Stop playback + toast error

---

### 3. **Feed Loading Errors**
**Location:** `PlayerContext.tsx` useEffect feed fetch

**Trigger:**
- ❌ Gagal fetch dari `/api/yt/feed`
- ❌ Network error
- ❌ Server error

**Toast Message:**
```typescript
showToast("error", "Gagal Memuat Katalog", "Tidak dapat memuat daftar lagu. Periksa koneksi internet Anda.");
```

---

## Design Specs

### Colors
```css
success: bg-green-500/20 border-green-500/40 text-green-400
error:   bg-red-500/20 border-red-500/40 text-red-400
warning: bg-yellow-500/20 border-yellow-500/40 text-yellow-400
info:    bg-blue-500/20 border-blue-500/40 text-blue-400
```

### Icons (Material Symbols)
```typescript
success: "check_circle"
error:   "error"
warning: "warning"
info:    "info"
```

### Animation
```css
animate-in slide-in-from-top-4 fade-in duration-300
```

### Timing
- Default duration: **4000ms** (4 detik)
- Slide animation: **300ms**
- Auto-dismiss via setTimeout
- Manual dismiss via close button

---

## Usage in Other Components

Untuk menampilkan toast dari component lain:

```typescript
import { usePlayer } from "../context/PlayerContext";

const MyComponent = () => {
  const { showToast } = usePlayer();
  
  const handleAction = () => {
    try {
      // ... some action
      showToast("success", "Berhasil", "Aksi berhasil dilakukan!");
    } catch (error) {
      showToast("error", "Gagal", "Terjadi kesalahan saat melakukan aksi.");
    }
  };
  
  return <button onClick={handleAction}>Do Something</button>;
};
```

---

## Future Enhancements

### 1. Toast Queue Management
- Limit max 3 toasts visible at once
- Older toasts auto-dismiss when new ones arrive

### 2. Action Buttons
- Add "Retry" button for error toasts
- Add "Undo" button for destructive actions

### 3. Sound Effects
- Optional sound for error/success toasts
- Can be toggled in settings

### 4. Persistent Toasts
- Some toasts don't auto-dismiss (duration: -1)
- User must manually close

### 5. Toast History
- Keep log of all toasts shown
- Accessible via "Notifications" page

---

## Files Modified

1. ✅ `src/context/PlayerContext.tsx` - Added toast state & functions
2. ✅ `src/App.tsx` - Added ToastContainer component
3. ✅ `src/components/Toast.tsx` - Created toast component
4. ✅ `src/components/ToastContainer.tsx` - Created container
5. ✅ `src/context/PlayerContext.tsx` - Integrated error handling

---

## Testing Checklist

- [x] Toast muncul saat YouTube API gagal load
- [x] Toast muncul saat video tidak dapat diputar (error 100/101/150)
- [x] Toast muncul saat gagal fetch feed
- [x] Toast auto-dismiss setelah 4 detik
- [x] Toast dapat di-close manual dengan tombol X
- [x] Multiple toasts stack vertikal dengan spacing yang benar
- [x] Icon dan warna sesuai dengan tipe toast
- [x] Animasi slide-in smooth

---

**Status:** ✅ **IMPLEMENTED & READY FOR USE**

Last Updated: 2024
