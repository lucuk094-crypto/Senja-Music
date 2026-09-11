// Premium & Elegant Fonts Collection for Senja Musik
// Mix of Google Fonts and system fonts

export interface FontOption {
  name: string;
  displayName: string;
  category: "serif" | "sans-serif" | "mono" | "display" | "handwriting";
  googleFont?: string; // Google Fonts import URL
  fallback: string; // CSS font-family fallback
  preview: string; // Sample text
}

export const FONT_OPTIONS: FontOption[] = [
  // Sans-Serif Elegant
  {
    name: "Inter",
    displayName: "Inter (Default)",
    category: "sans-serif",
    googleFont: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap",
    fallback: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    preview: "Modern & Clean"
  },
  {
    name: "Sora",
    displayName: "Sora",
    category: "sans-serif",
    googleFont: "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap",
    fallback: "'Sora', sans-serif",
    preview: "Futuristic"
  },
  {
    name: "Outfit",
    displayName: "Outfit",
    category: "sans-serif",
    googleFont: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap",
    fallback: "'Outfit', sans-serif",
    preview: "Round & Friendly"
  },
  {
    name: "Manrope",
    displayName: "Manrope",
    category: "sans-serif",
    googleFont: "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap",
    fallback: "'Manrope', sans-serif",
    preview: "Geometric"
  },
  {
    name: "Plus Jakarta Sans",
    displayName: "Plus Jakarta Sans",
    category: "sans-serif",
    googleFont: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap",
    fallback: "'Plus Jakarta Sans', sans-serif",
    preview: "Indonesian Pride"
  },
  {
    name: "Poppins",
    displayName: "Poppins",
    category: "sans-serif",
    googleFont: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap",
    fallback: "'Poppins', sans-serif",
    preview: "Trendy & Popular"
  },
  {
    name: "Raleway",
    displayName: "Raleway",
    category: "sans-serif",
    googleFont: "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800;900&display=swap",
    fallback: "'Raleway', sans-serif",
    preview: "Elegant & Thin"
  },
  
  // Serif Elegant
  {
    name: "Playfair Display",
    displayName: "Playfair Display",
    category: "serif",
    googleFont: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap",
    fallback: "'Playfair Display', serif",
    preview: "Classic Luxury"
  },
  {
    name: "Cormorant Garamond",
    displayName: "Cormorant Garamond",
    category: "serif",
    googleFont: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap",
    fallback: "'Cormorant Garamond', serif",
    preview: "Editorial Elegance"
  },
  {
    name: "EB Garamond",
    displayName: "EB Garamond",
    category: "serif",
    googleFont: "https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700;800&display=swap",
    fallback: "'EB Garamond', serif",
    preview: "Renaissance"
  },
  {
    name: "Lora",
    displayName: "Lora",
    category: "serif",
    googleFont: "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap",
    fallback: "'Lora', serif",
    preview: "Warm & Readable"
  },
  
  // Display Fonts
  {
    name: "Lexend",
    displayName: "Lexend",
    category: "display",
    googleFont: "https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap",
    fallback: "'Lexend', sans-serif",
    preview: "Readability Optimized"
  },
  {
    name: "Righteous",
    displayName: "Righteous",
    category: "display",
    googleFont: "https://fonts.googleapis.com/css2?family=Righteous&display=swap",
    fallback: "'Righteous', sans-serif",
    preview: "Bold & Retro"
  },
  {
    name: "Archivo Black",
    displayName: "Archivo Black",
    category: "display",
    googleFont: "https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap",
    fallback: "'Archivo Black', sans-serif",
    preview: "Heavy Impact"
  },
  {
    name: "Space Grotesk",
    displayName: "Space Grotesk",
    category: "display",
    googleFont: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap",
    fallback: "'Space Grotesk', sans-serif",
    preview: "Tech & Space"
  },
  {
    name: "Bebas Neue",
    displayName: "Bebas Neue",
    category: "display",
    googleFont: "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap",
    fallback: "'Bebas Neue', sans-serif",
    preview: "All Caps Power"
  },
  
  // Handwriting / Script
  {
    name: "Pacifico",
    displayName: "Pacifico",
    category: "handwriting",
    googleFont: "https://fonts.googleapis.com/css2?family=Pacifico&display=swap",
    fallback: "'Pacifico', cursive",
    preview: "Surf Script"
  },
  {
    name: "Caveat",
    displayName: "Caveat",
    category: "handwriting",
    googleFont: "https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap",
    fallback: "'Caveat', cursive",
    preview: "Handwritten Notes"
  },
  {
    name: "Dancing Script",
    displayName: "Dancing Script",
    category: "handwriting",
    googleFont: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap",
    fallback: "'Dancing Script', cursive",
    preview: "Flowing Cursive"
  },
  
  // Monospace
  {
    name: "JetBrains Mono",
    displayName: "JetBrains Mono",
    category: "mono",
    googleFont: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap",
    fallback: "'JetBrains Mono', monospace",
    preview: "Code Style"
  },
  {
    name: "Fira Code",
    displayName: "Fira Code",
    category: "mono",
    googleFont: "https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap",
    fallback: "'Fira Code', monospace",
    preview: "Developer Favorite"
  },
  
  // System Fonts (No Google Font needed)
  {
    name: "SF Pro Display",
    displayName: "SF Pro Display (iOS/Mac)",
    category: "sans-serif",
    fallback: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    preview: "Apple System"
  },
  {
    name: "Segoe UI",
    displayName: "Segoe UI (Windows)",
    category: "sans-serif",
    fallback: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    preview: "Windows Native"
  },
];

// Function to load Google Font dynamically
export function loadGoogleFont(font: FontOption) {
  if (!font.googleFont) return;
  
  // Check if already loaded
  const existing = document.querySelector(`link[href="${font.googleFont}"]`);
  if (existing) return;
  
  // Create link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = font.googleFont;
  document.head.appendChild(link);
}

// Apply font to document
export function applyFont(fontName: string) {
  const font = FONT_OPTIONS.find(f => f.name === fontName);
  if (!font) return;
  
  // Load Google Font if needed
  loadGoogleFont(font);
  
  // Apply to document
  document.documentElement.style.fontFamily = font.fallback;
  document.body.style.fontFamily = font.fallback;
}
