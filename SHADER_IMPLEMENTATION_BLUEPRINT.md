# Shader Implementation Blueprint

## Overview
This document outlines the exact structure and implementation pattern used for Blue Wave that should be replicated for all other shaders (Ether, Shooting Stars, Wavy Lines).

## Folder Structure Template

```
src/
├── shaders/
│   ├── blue-wave/                    ← EXAMPLE (completed)
│   │   ├── BlueWavePage.tsx          ← Main shader page component
│   │   └── BlueWaveRadio.tsx         ← Radio player component
│   ├── ether/                        ← TO BE CREATED
│   │   ├── EtherPage.tsx             ← Needs creation
│   │   └── EtherRadio.tsx            ← Needs creation
│   ├── shooting-stars/               ← TO BE CREATED
│   │   ├── ShootingStarsPage.tsx     ← Needs creation
│   │   └── ShootingStarsRadio.tsx    ← Needs creation
│   └── wavy-lines/                   ← TO BE CREATED
│       ├── WavyLinesPage.tsx         ← Needs creation
│       └── WavyLinesRadio.tsx        ← Needs creation
├── components/
│   ├── BWEmbed.tsx                   ← Blue Wave embed (template for others)
│   ├── EtherEmbed.tsx                ← TO BE CREATED
│   ├── ShootingStarsEmbed.tsx        ← TO BE CREATED
│   ├── WavyLinesEmbed.tsx            ← TO BE CREATED
│   └── [OLD FILES TO REMOVE]
│       ├── Shader2Page.tsx           ← DELETE (replace with EtherPage.tsx)
│       ├── Shader3Page.tsx           ← DELETE (replace with ShootingStarsPage.tsx)
│       └── Shader4Page.tsx           ← DELETE (replace with WavyLinesPage.tsx)
```

## Implementation Steps for Each Shader

### Step 1: Create Shader-Specific Folder
Create folder: `src/shaders/{shader-name}/`

### Step 2: Create Main Page Component
File: `{ShaderName}Page.tsx`

**Template Structure:**
```tsx
import { useState, useEffect } from "react";
import { ShaderCanvas } from "../../components/ShaderCanvas";
import { {ShaderName}Embed } from "../../components/{ShaderName}Embed";
import { {ShaderName}Radio } from "./{ShaderName}Radio";
import { motion } from "framer-motion";

export default function {ShaderName}Page() {
  const [canvasSize, setCanvasSize] = useState(250);

  // Set dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Responsive canvas sizing
  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const maxSize = Math.min(viewportWidth - 80, viewportHeight - 80);
      const size = Math.max(250, Math.min(maxSize, 500));
      setCanvasSize(size);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Shader Display */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative flex-shrink-0"
      >
        <ShaderCanvas
          size={canvasSize}
          shaderId={SHADER_ID_NUMBER}
        />
        
        {/* Radio Player */}
        <{ShaderName}Radio canvasSize={canvasSize} />
      </motion.div>

      {/* Embed Code Display */}
      <{ShaderName}Embed shaderId={SHADER_ID_NUMBER} />
    </div>
  );
}
```

### Step 3: Create Radio Player Component
File: `{ShaderName}Radio.tsx`

**Key Features (copy from BlueWaveRadio.tsx):**
- Same SoundCloud integration
- Same styled-components structure
- Same enhanced visualizer animation
- Same responsive design
- Update color scheme to match shader theme

**Required Updates:**
1. Component name: `{ShaderName}Radio`
2. CSS class prefix: `{shader-abbreviation}-` (e.g., `et-`, `ss-`, `wl-`)
3. Color scheme: Match shader's primary colors
4. Size: 280x320px (desktop), responsive for mobile

### Step 4: Create Embed Component
File: `{ShaderName}Embed.tsx`

**Template Structure:**
```tsx
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Copy, Check } from "lucide-react";

interface {ShaderName}EmbedProps {
  shaderId: number;
}

export const {ShaderName}Embed = ({ shaderId }: {ShaderName}EmbedProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const baseUrl = "https://musarty.com";
  
  const embedCodes = [
    {
      title: "Long Embed Code", 
      code: `<iframe src="${baseUrl}/shader{shaderId}.html" width="100%" height="500" frameborder="0" style="background: transparent; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); max-width: 500px; min-height: 400px;" allowfullscreen loading="lazy"></iframe>`
    },
    {
      title: "Short Embed Code",
      code: `<iframe src="${baseUrl}/shader{shaderId}.html" width="100%" height="400" frameborder="0" style="background: transparent; max-width: 500px;" loading="lazy"></iframe>`
    },
    {
      title: "URL Only",
      code: `${baseUrl}/{shader-route}`
    }
  ];

  // Copy function and return JSX (same as BWEmbed)
  
  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-[120px]">
      <h2 className="text-white text-2xl font-bold mb-8 text-center">Embed Code for {SHADER_DISPLAY_NAME}</h2>
      {/* Rest same as BWEmbed */}
    </div>
  );
};
```

### Step 5: Update Routing
File: `src/main.tsx`

**Add new routes:**
```tsx
import EtherPage from "./shaders/ether/EtherPage.tsx";
import ShootingStarsPage from "./shaders/shooting-stars/ShootingStarsPage.tsx";
import WavyLinesPage from "./shaders/wavy-lines/WavyLinesPage.tsx";

// In Routes:
<Route path="/ether" element={<EtherPage />} />
<Route path="/shooting-stars" element={<ShootingStarsPage />} />
<Route path="/wavy-lines" element={<WavyLinesPage />} />
```

### Step 6: Update Grid Navigation
File: `src/components/GridPage.tsx`

**Update Links:**
```tsx
// Replace Shader2Page with EtherPage
<Link to="/ether">
// Replace Shader3Page with ShootingStarsPage  
<Link to="/shooting-stars">
// Replace Shader4Page with WavyLinesPage
<Link to="/wavy-lines">
```

## Shader-Specific Mappings

| Shader Name | ID | Route | Colors | Abbreviation |
|-------------|----|---------|---------|----|
| Blue Wave | 1 | `/BW-Radio-Widget` | #1afbf0, #da00ff | `bw` |
| Ether | 2 | `/ether` | Purple/Blue theme | `et` |
| Shooting Stars | 3 | `/shooting-stars` | Gold/Orange theme | `ss` |
| Wavy Lines | 4 | `/wavy-lines` | Green/Teal theme | `wl` |

## Files to Delete After Migration

1. `src/components/Shader2Page.tsx` → Replace with `src/shaders/ether/EtherPage.tsx`
2. `src/components/Shader3Page.tsx` → Replace with `src/shaders/shooting-stars/ShootingStarsPage.tsx`
3. `src/components/Shader4Page.tsx` → Replace with `src/shaders/wavy-lines/WavyLinesPage.tsx`

## Key Requirements

### Radio Player Features (All Shaders)
- ✅ 280x320px size (desktop), responsive mobile
- ✅ Enhanced equalizer (65px height, dynamic animation)
- ✅ SoundCloud integration
- ✅ Proper mobile responsiveness
- ✅ Unique color scheme per shader
- ✅ Stable container (no layout shifting)

### Page Features (All Shaders)
- ✅ Dark mode enabled
- ✅ Responsive canvas sizing
- ✅ 120px spacing before embed section
- ✅ Proper shader name in embed title
- ✅ Motion animations
- ✅ Back navigation (if needed)

### Embed Features (All Shaders)
- ✅ Proper shader name in title
- ✅ Three embed options (Long, Short, URL)
- ✅ Copy functionality
- ✅ Correct URLs and routes
- ✅ 120px top margin

## Implementation Priority

1. **Ether** (Shader 2) - Purple/Blue theme
2. **Shooting Stars** (Shader 3) - Gold/Orange theme  
3. **Wavy Lines** (Shader 4) - Green/Teal theme

Each implementation should follow this exact blueprint to ensure consistency and eliminate duplicates.