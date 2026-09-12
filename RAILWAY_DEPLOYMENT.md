# 🚂 Deploy Backend ke Railway

## Kenapa Railway?
- ✅ **Always-On** (bukan serverless, YTMusic API bisa jalan)
- ✅ **$5/month** (500GB bandwidth, 512MB RAM)
- ✅ **Auto SSL/HTTPS**
- ✅ **Auto Deploy dari GitHub**
- ✅ **Zero Config** (railway.json optional)

---

## 📋 Langkah-Langkah Deploy

### **Step 1: Buat Account Railway**

1. Buka: **https://railway.app**
2. Klik **"Login with GitHub"**
3. Authorize Railway
4. Dapatkan $5 free trial credit

### **Step 2: Deploy Project**

1. **New Project**
   - Klik "New Project" di dashboard
   - Pilih "Deploy from GitHub repo"
   - Authorize akses ke `Senja-Music` repository
   - Klik repository name

2. **Railway Auto-Detect:**
   ```
   ✓ Node.js detected
   ✓ package.json found
   ✓ Port 3000 assigned
   ```

3. **Configure Build (PENTING!):**
   
   Klik **Settings** → **Deploy**:
   
   ```
   Build Command:
   npm install && npm run build
   
   Start Command:
   npm run start
   
   Watch Paths:
   server.ts
   src/**
   package.json
   ```

### **Step 3: Environment Variables**

Klik **Variables** tab, tambahkan:

```env
NODE_ENV=production
PORT=3000
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_secret
```

**Cara dapat Spotify credentials:**
1. Buka https://developer.spotify.com/dashboard
2. Create App
3. Copy Client ID & Secret

### **Step 4: Generate Domain**

Railway akan auto-generate domain:
```
https://senja-musik-production.up.railway.app
```

Atau bisa custom:
1. Klik **Settings** → **Domains**
2. Generate Domain atau add custom domain

### **Step 5: Update Vercel Frontend**

Di Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_BASE_URL=https://your-app.railway.app
```

Redeploy Vercel (atau tunggu auto-deploy).

---

## 🔧 Troubleshooting Railway

### Build Error: "Cannot find module 'tsx'"

Fix: Update `package.json`:
```json
{
  "scripts": {
    "build": "vite build && tsc server.ts --outDir dist",
    "start": "node dist/server.js"
  }
}
```

### Port Error

Railway auto-assign PORT. Update `server.ts`:
```typescript
const PORT = process.env.PORT || 3000;
```

### YTMusic API Timeout

Increase timeout di Railway:
- Settings → Deploy → Healthcheck Grace Period: 300s

---

## 💰 Pricing

### Railway Free Trial:
- $5 credit (gratis)
- ~500 jam usage
- Cukup untuk testing

### Railway Hobby Plan: $5/month
- 500GB bandwidth
- 512MB RAM
- 8GB storage
- Unlimited projects

### Vercel: FREE
- Frontend hosting
- 100GB bandwidth
- Unlimited deploys

**Total: $5/month** untuk full-stack app with real YTMusic data! 🎉

---

## 🔄 Auto-Deploy Setup

Railway sudah auto-deploy setiap push ke GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway akan otomatis rebuild & redeploy! ⚡

---

## 📊 Monitor Performance

Railway Dashboard:
- **Metrics** tab: CPU, RAM, Network usage
- **Logs** tab: Real-time server logs
- **Deployments** tab: Deploy history

---

## 🌐 Custom Domain (Optional)

### Gunakan Domain Sendiri:

1. **Railway Settings → Domains → Custom Domain**
2. Add: `api.senjamusik.com`
3. Update DNS Records:
   ```
   Type: CNAME
   Name: api
   Value: your-app.railway.app
   ```
4. Wait 5-10 minutes untuk propagation

---

## 🆚 Alternative: Render.com

Jika Railway penuh, coba **Render**:

1. Buka: https://render.com
2. New → Web Service
3. Connect GitHub → Senja-Music
4. Settings:
   ```
   Build: npm install && npm run build
   Start: npm run start
   ```
5. Free tier: 750 hours/month (cukup!)

---

## ✅ Testing

Setelah deploy, test API:

```bash
# Test feed endpoint
curl https://your-app.railway.app/api/yt/feed

# Should return JSON with shelves
```

Browser test:
```
https://your-app.railway.app/api/yt/feed
```

Jika return JSON → **SUCCESS!** ✅

---

## 🎯 Final Architecture

```
[User Browser]
     ↓
[Vercel - Frontend React]
     ↓ API Calls
[Railway - Backend Express + YTMusic]
     ↓
[YouTube Music API]
```

**Cost:**
- Vercel: FREE
- Railway: $5/month
- **Total: $5/month** 💰

---

## 🚀 Ready to Deploy!

1. ✅ Push code to GitHub (sudah done)
2. 🚂 Deploy di Railway (5 menit)
3. 🔗 Update VITE_API_BASE_URL di Vercel
4. ✨ DONE - Real YTMusic data! 🎵

Questions? Railway Discord: https://discord.gg/railway
