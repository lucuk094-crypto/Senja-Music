# 🚀 Deploy Senja Musik ke Vercel

## Langkah-Langkah Deploy

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Deploy via Vercel Dashboard (Recommended)

1. **Buka [Vercel Dashboard](https://vercel.com)**
2. **Klik "Add New Project"**
3. **Import dari GitHub:**
   - Pilih repository: `lucuk094-crypto/Senja-Music`
   - Klik "Import"

4. **Configure Project:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Environment Variables:**
   Tambahkan di Vercel Dashboard → Settings → Environment Variables:
   
   ```
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   ```

6. **Klik "Deploy"**

### 3. Deploy via CLI (Alternative)

```bash
# Login ke Vercel
vercel login

# Deploy
vercel

# Deploy ke production
vercel --prod
```

## 📝 Environment Variables

Pastikan set environment variables berikut di Vercel:

| Variable | Description | Required |
|----------|-------------|----------|
| `SPOTIFY_CLIENT_ID` | Spotify API Client ID | Optional |
| `SPOTIFY_CLIENT_SECRET` | Spotify API Secret | Optional |

## 🔧 Troubleshooting

### Build Error
Jika terjadi error saat build:
```bash
# Test build locally
npm run build

# Check vercel logs
vercel logs
```

### API Not Working
- Pastikan API routes ada di folder `/api`
- Check Vercel Function Logs di dashboard

### Font Tidak Load
- Font Google akan auto-load dari CDN
- Tidak perlu konfigurasi tambahan

## 🌐 Custom Domain

1. Buka Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records sesuai instruksi Vercel

## ⚡ Performance

Vercel otomatis akan:
- ✅ Enable CDN global
- ✅ Compress assets (Gzip/Brotli)
- ✅ Optimize images
- ✅ Serverless functions auto-scale

## 📊 Monitoring

View analytics di:
- Vercel Dashboard → Analytics
- Real-time logs → Dashboard → Logs

## 🔄 Auto Deploy

Setiap push ke branch `main` akan otomatis trigger deployment baru!

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel akan auto-deploy dalam ~2 menit! 🚀
