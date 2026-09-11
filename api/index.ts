import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import path from 'path';
// @ts-ignore
import YTMusicModule from 'ytmusic-api';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const YTMusic = (YTMusicModule as any)?.default || YTMusicModule;
let ytInstance: any = null;

// Spotify API credentials
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";
let spotifyAccessToken: string | null = null;
let spotifyTokenExpiry: number = 0;

async function getYTMusic() {
  if (!ytInstance) {
    ytInstance = new YTMusic();
    try {
      await ytInstance.initialize();
      console.log("✅ YTMusic API initialized successfully");
    } catch (error) {
      console.error("❌ YTMusic initialization error:", error);
      ytInstance = new YTMusic();
      try {
        await ytInstance.initialize({ cookies: "" });
      } catch (retryError) {
        console.error("❌ YTMusic retry failed:", retryError);
      }
    }
  }
  return ytInstance;
}

// Export the Express app for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Route to feed endpoint
  if (pathname === '/api/yt/feed') {
    try {
      const yt = await getYTMusic();
      
      // Fetch homepage sections (simplified for serverless)
      const homeSections = await yt.getHomeSections?.() || [];
      
      const shelves = homeSections.slice(0, 10).map((section: any, idx: number) => ({
        title: section.title || `Section ${idx + 1}`,
        items: (section.items || []).slice(0, 20).map((item: any) => ({
          id: item.videoId || `item-${Date.now()}-${Math.random()}`,
          videoId: item.videoId,
          title: item.name || item.title || "Unknown",
          artist: item.artist?.name || "Unknown Artist",
          thumbnail: item.thumbnails?.[0]?.url || "",
          duration: item.duration || 180
        }))
      }));

      return res.json({
        success: true,
        data: {
          nowPlayingInitial: shelves[0]?.items[0] || {},
          featured: shelves[0]?.items[1] || {},
          shelves,
          communityPlaylists: []
        }
      });
    } catch (error: any) {
      console.error("Feed error:", error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Route not found
  return res.status(404).json({ error: 'Not found' });
}
