import { ProjectConfig } from '../../../../types';
import { PrintConfig } from '../../config/printConfig.types';
import { WeeklyReport } from '../../../../types';
import { BRAND_COLORS } from './pdfStyles';
import { Content } from 'pdfmake/interfaces';

// --- IMAGE HELPERS ---

export async function ensureReportImagesAreSafe(report: WeeklyReport): Promise<WeeklyReport> {
    // Deep clone to avoid mutating original
    const safeReport = JSON.parse(JSON.stringify(report)) as WeeklyReport;
    
    // Process all photos in the photos array
    if (safeReport.photos && safeReport.photos.length > 0) {
        safeReport.photos = await Promise.all(safeReport.photos.map(async (photo) => {
            if (photo.url && !photo.url.startsWith('data:')) {
                try {
                    const base64 = await imgUrlToBase64(photo.url);
                    return { ...photo, url: base64 };
                } catch (e) {
                    console.error(`Failed to convert image ${photo.url} to base64:`, e);
                    return photo; // Return original on failure
                }
            }
            return photo;
        }));
    }
    
    return safeReport;
}

export async function imgUrlToBase64(url: string): Promise<string> {
    console.log(`[PDF] Converting image: ${url}`);
    try {
        // Create an image element to load the image
        const img = new Image();
        img.crossOrigin = 'Anonymous';  // Allow cross-origin if needed
        img.src = url;

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = (e) => reject(new Error(`Image load failed for ${url}`));
        });

        // Resize config
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
        } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
        }

        // Draw to canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Export to base64 (JPEG 0.8 quality to save space)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        return dataUrl;

    } catch (e) {
        console.error(`[PDF] Conversion failed for ${url}:`, e);
        // Fallback to direct blob fetch for ${url}
        try {
            console.warn(`[PDF] Fallback to direct blob fetch for ${url}`);
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (err2) {
             console.error(`[PDF] Fallback also failed:`, err2);
             throw err2;
        }
    }
}

export function buildLogoContent(config: ProjectConfig, options: PrintConfig): Content {
    if (config.identity.logoUrl && config.identity.logoUrl.startsWith('data:')) {
        const scale = (options.logoScale || 100) / 100;
        const width = 150 * scale;
        
        return {
            image: config.identity.logoUrl,
            width,
            alignment: options.logoAlign || 'center',
            margin: [0, 0, 0, 20],
        };
    }
    return {
        text: config.identity.projectName.charAt(0),
        fontSize: 40, bold: true, color: BRAND_COLORS.primary,
        alignment: 'center', margin: [0, 20, 0, 20],
    };
}
