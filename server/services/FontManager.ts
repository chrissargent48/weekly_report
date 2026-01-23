// @ts-ignore
import fontkit from 'fontkit';
import path from 'path';
import fs from 'fs';

export class FontManager {
  private static instance: FontManager;
  private fontCache: Map<string, fontkit.Font> = new Map();
  // Default path to fonts in the client public directory
  private fontsDir: string = path.join(process.cwd(), 'client', 'public', 'fonts');

  private constructor() {}

  public static getInstance(): FontManager {
    if (!FontManager.instance) {
      FontManager.instance = new FontManager();
    }
    return FontManager.instance;
  }

  /**
   * Retrieves a font object from the cache or loads it from disk.
   * @param family Font family name (e.g. 'Inter')
   * @param weight Font weight/style (e.g. 'Regular', 'Bold')
   */
  public getFont(family: string, weight: string = 'Regular'): fontkit.Font {
    const key = `${family}-${weight}`;
    
    if (this.fontCache.has(key)) {
      return this.fontCache.get(key)!;
    }

    try {
        // Try to construct filename patterns
        // Common patterns: Inter-Regular.ttf, Inter-Bold.ttf
        const filename = `${family}-${weight}.ttf`;
        const fontPath = path.join(this.fontsDir, filename);

        if (!fs.existsSync(fontPath)) {
            // Fallback: Try looking for just the family if weight is Regular
            if (weight === 'Regular') {
                const altPath = path.join(this.fontsDir, `${family}.ttf`);
                if (fs.existsSync(altPath)) {
                    return this.loadFontFromFile(key, altPath);
                }
            }

            // Fallback to System Fonts (Windows)
            const sysFontPath = path.join('C:\\Windows\\Fonts', `${family}.ttf`);
            if (fs.existsSync(sysFontPath)) {
                 return this.loadFontFromFile(key, sysFontPath);
            }
            
            // Hard fallback for "Inter" -> Arial
            if (family === 'Inter') {
                const arialPath = path.join('C:\\Windows\\Fonts', 'arial.ttf');
                if (fs.existsSync(arialPath)) {
                    console.warn(`[FontManager] Inter not found, using Arial fallback.`);
                    return this.loadFontFromFile(key, arialPath);
                }
            }

            console.warn(`[FontManager] Font file not found: ${fontPath}`);
            throw new Error(`Font not found: ${filename}`);
        }

        return this.loadFontFromFile(key, fontPath);
    } catch (error) {
        console.error(`[FontManager] Error loading font ${key}:`, error);
        throw error;
    }
  }

  private loadFontFromFile(key: string, filepath: string): fontkit.Font {
      const font = fontkit.openSync(filepath);
      this.fontCache.set(key, font);
      return font;
  }
}
