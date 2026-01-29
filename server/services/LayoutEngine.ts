import yoga, { Node, YogaNode } from 'yoga-layout-prebuilt';
import { FontManager } from './FontManager';
import { WeeklyReport, ReportLayout, CanvasNode } from '../types';
import crypto from 'crypto';

export class LayoutEngine {
  private fontManager: FontManager;

  constructor() {
    this.fontManager = FontManager.getInstance();
  }

  /**
   * Calculates the layout for a Weekly Report.
   * Mature implementation mapping major sections to Yoga nodes.
   */
  public calculateLayout(report: WeeklyReport): ReportLayout {
    const renderableNodes: any[] = [];

    // 1. Create Root Node (Page Container)
    const rootNode = yoga.Node.create();
    const A4_WIDTH_PTS = 595.28; 
    
    rootNode.setWidth(A4_WIDTH_PTS);
    rootNode.setFlexDirection(yoga.FLEX_DIRECTION_COLUMN);
    rootNode.setPadding(yoga.EDGE_ALL, 40); // Standard margin

    // 2. Map Report Sections to Nodes
    
    // Header Section (Project Identity)
    this.addHeader(rootNode, report, renderableNodes);

    // Overview / Executive Summary
    if (report.overview?.executiveSummary) {
        this.addSectionHeader(rootNode, "EXECUTIVE SUMMARY", renderableNodes);
        this.addTextNode(rootNode, report.overview.executiveSummary, {
            fontSize: 10,
            fontFamily: 'Inter',
            marginBottom: 20
        }, renderableNodes);
    }

    // Weather Section
    if (report.overview?.weather && report.overview.weather.length > 0) {
        this.addSectionHeader(rootNode, "WEATHER SUMMARY", renderableNodes);
        report.overview.weather.forEach(day => {
            this.addTextNode(rootNode, `${day.date}: ${day.condition} (H: ${day.tempHigh}° L: ${day.tempLow}°)`, { 
                fontSize: 9, 
                marginBottom: 2 
            }, renderableNodes);
        });
        this.addTextNode(rootNode, "", { marginBottom: 15 }, renderableNodes);
    }

    // Safety Section
    if (report.safety) {
        this.addSectionHeader(rootNode, "SAFETY & HEALTH", renderableNodes);
        if (report.safety.narrative) {
            this.addTextNode(rootNode, report.safety.narrative, { fontSize: 10, marginBottom: 15 }, renderableNodes);
        }
    }

    // Manpower Section
    if (report.resources?.manpower && report.resources.manpower.length > 0) {
        this.addSectionHeader(rootNode, "MANPOWER", renderableNodes);
        report.resources.manpower.forEach(person => {
            const total = Object.values(person.dailyHours).reduce((a, b) => a + b, 0);
            if (total > 0) {
                this.addTextNode(rootNode, `${person.name} (${person.role}): ${total} hrs`, { fontSize: 9, marginBottom: 2 }, renderableNodes);
            }
        });
        this.addTextNode(rootNode, "", { marginBottom: 15 }, renderableNodes);
    }

    // Equipment Section
    if (report.resources?.equipment?.onSite && report.resources.equipment.onSite.length > 0) {
        this.addSectionHeader(rootNode, "EQUIPMENT ON SITE", renderableNodes);
        report.resources.equipment.onSite.forEach(eq => {
            if (eq.status !== 'Demobilized') {
                this.addTextNode(rootNode, `${eq.type} - ${eq.status}`, { fontSize: 9, marginBottom: 2 }, renderableNodes);
            }
        });
        this.addTextNode(rootNode, "", { marginBottom: 15 }, renderableNodes);
    }

    // Progress Section
    if (report.progress?.bidItems && report.progress.bidItems.length > 0) {
        this.addSectionHeader(rootNode, "PROGRESS (KEY BID ITEMS)", renderableNodes);
        report.progress.bidItems.forEach(item => {
            if (item.thisWeekQty > 0 || item.toDateQty > 0) {
                this.addTextNode(rootNode, `${item.itemNumber} ${item.description}: ${item.toDateQty} (To Date)`, { fontSize: 9, marginBottom: 2 }, renderableNodes);
            }
        });
        this.addTextNode(rootNode, "", { marginBottom: 15 }, renderableNodes);
    }

    // Financials
    if (report.financials) {
        this.addSectionHeader(rootNode, "FINANCIAL SUMMARY", renderableNodes);
        const earned = report.financials.summary?.earnedToDate || 0;
        this.addTextNode(rootNode, `Earned to Date: $${earned.toLocaleString()}`, { fontSize: 10, fontWeight: 700, marginBottom: 15 }, renderableNodes);
    }

    // Photos Section
    if (report.photos && report.photos.length > 0) {
        this.addSectionHeader(rootNode, "PROJECT PHOTOS", renderableNodes);
        
        // Simple Grid Logic
        const photoContainer = yoga.Node.create();
        photoContainer.setFlexDirection(yoga.FLEX_DIRECTION_ROW);
        photoContainer.setFlexWrap(yoga.WRAP_WRAP);
        photoContainer.setWidth('100%');
        
        report.photos.slice(0, 6).forEach(photo => {
            const itemWidth = 160; // Approx 3 column grid
            const itemHeight = 120;
            
            this.addImageNode(photoContainer, photo.url, {
                width: itemWidth,
                height: itemHeight,
                marginRight: 10,
                marginBottom: 10
            }, renderableNodes);
        });
        
        rootNode.insertChild(photoContainer, rootNode.getChildCount());
    }

    // 3. Calculate Layout
    rootNode.calculateLayout(A4_WIDTH_PTS, NaN, yoga.DIRECTION_LTR);

    // 4. Extract Geometry and Paginate
    const PAGE_HEIGHT = 841.89; // A4 height in points
    const BOTTOM_MARGIN = 60; // Increased for footer
    const TOP_MARGIN = 60; // Increased for header
    const itemsByPage: Map<number, CanvasNode[]> = new Map();

    renderableNodes.forEach(r => {
        const nodeLayout = r.node.getComputedLayout();
        
        let absX = nodeLayout.left;
        let absY = nodeLayout.top;
        let parent = r.node.getParent();
        
        while (parent) {
            const parentLayout = parent.getComputedLayout();
            absX += parentLayout.left;
            absY += parentLayout.top;
            parent = parent.getParent();
        }

        const usablePageHeight = PAGE_HEIGHT - BOTTOM_MARGIN - TOP_MARGIN;
        const pageIdx = Math.floor(absY / usablePageHeight);
        const yOnPage = absY % usablePageHeight;

        const getNormalizedWeight = (w: any): number => {
            if (typeof w === 'number') return w;
            if (typeof w === 'string') {
                const lw = w.toLowerCase();
                if (lw === 'bold' || lw === '700') return 700;
            }
            return 400;
        };

        const node: CanvasNode = {
            id: r.id || crypto.randomUUID(),
            type: r.type || 'text',
            url: r.url,
            x: absX,
            y: yOnPage + TOP_MARGIN, 
            width: nodeLayout.width,
            height: nodeLayout.height,
            rotation: 0,
            content: r.content,
            style: {
                fontSize: r.style?.fontSize || 11,
                fontColor: r.style?.color || '#000000',
                fontWeight: getNormalizedWeight(r.style?.fontWeight),
                fontFamily: 'Inter' // Force Inter everywhere
            }
        };

        if (!itemsByPage.has(pageIdx)) itemsByPage.set(pageIdx, []);
        itemsByPage.get(pageIdx)!.push(node);
    });

    // 5. Inject Headers and Footers for every page
    const finalPages = [];
    const sortedPageIndices = Array.from(itemsByPage.keys()).sort((a, b) => a - b);
    const totalPages = Math.max(sortedPageIndices.length, 1);

    for (let i = 0; i < totalPages; i++) {
        const pageItems = itemsByPage.get(i) || [];
        const pageId = crypto.randomUUID();
        const jobNum = report.id.split('-')[0].toUpperCase();

        // Header: PROJECT NAME | WEEK ENDING
        pageItems.push({
            id: crypto.randomUUID(),
            type: 'text',
            x: 40,
            y: 25,
            width: A4_WIDTH_PTS - 80,
            height: 20,
            rotation: 0,
            content: `${jobNum} WEEKLY FIELD REPORT — ${report.weekEnding}`,
            style: { fontSize: 9, fontColor: '#1e293b', fontWeight: 700 }
        });

        // Horizontal Line (Visual Polish)
        pageItems.push({
            id: crypto.randomUUID(),
            type: 'text',
            x: 40,
            y: 45,
            width: A4_WIDTH_PTS - 80,
            height: 1,
            rotation: 0,
            content: "____________________________________________________________________________________________________________________________________",
            style: { fontSize: 4, fontColor: '#e2e8f0', fontWeight: 700 }
        });

        // Footer: JOB # | PAGE X of Y | Branding
        pageItems.push({
            id: crypto.randomUUID(),
            type: 'text',
            x: 40,
            y: PAGE_HEIGHT - 35,
            width: A4_WIDTH_PTS - 80,
            height: 20,
            rotation: 0,
            content: `JOB #: ${jobNum} | PAGE ${i + 1} OF ${totalPages} | STUDIO v3.0 ENTERPRISE`,
            style: { fontSize: 8, fontColor: '#64748b', fontWeight: 400 }
        });

        finalPages.push({ id: pageId, items: pageItems });
    }

    // Cleanup
    rootNode.freeRecursive();

    return { pages: finalPages };
  }

  private addHeader(parent: YogaNode, report: WeeklyReport, renderableNodes: any[]) {
      const headerNode = yoga.Node.create();
      headerNode.setFlexDirection(yoga.FLEX_DIRECTION_COLUMN);
      headerNode.setMargin(yoga.EDGE_BOTTOM, 30);
      
      this.addTextNode(headerNode, "WEEKLY FIELD REPORT", { fontSize: 24, fontWeight: 700, color: '#1a365d' }, renderableNodes);
      this.addTextNode(headerNode, `WEEK ENDING: ${report.weekEnding}`, { fontSize: 12, fontWeight: 700, color: '#4a5568', marginTop: 5 }, renderableNodes);
      
      parent.insertChild(headerNode, parent.getChildCount());
  }

  private addSectionHeader(parent: YogaNode, title: string, renderableNodes: any[]) {
      this.addTextNode(parent, title, {
          fontSize: 13,
          fontWeight: 700,
          color: '#2d3748',
          marginBottom: 8,
          backgroundColor: '#f7fafc',
          padding: 4
      }, renderableNodes);
  }

  private addImageNode(parent: YogaNode, url: string, style: any, renderableNodes: any[]) {
      const node = yoga.Node.create();
      node.setWidth(style.width);
      node.setHeight(style.height);
      node.setMargin(yoga.EDGE_RIGHT, style.marginRight || 0);
      node.setMargin(yoga.EDGE_BOTTOM, style.marginBottom || 0);
      
      renderableNodes.push({
          id: crypto.randomUUID(),
          node,
          type: 'image',
          url: url,
          style
      });
      
      parent.insertChild(node, parent.getChildCount());
  }

  private addTextNode(parent: YogaNode, text: string, style: any, renderableNodes: any[]) {
    const node = yoga.Node.create();
    renderableNodes.push({ node, content: text, type: 'text', style });
    
    // Basic Style Mapping
    if (style.marginTop) node.setMargin(yoga.EDGE_TOP, style.marginTop);
    if (style.marginBottom) node.setMargin(yoga.EDGE_BOTTOM, style.marginBottom);
    if (style.padding) node.setPadding(yoga.EDGE_ALL, style.padding);
    
    node.setWidth(style.width || '100%'); 
    
    node.setMeasureFunc((width, widthMode, height, heightMode) => {
        const weightInput = style.fontWeight || 'normal';
        const fontWeight = (typeof weightInput === 'string' ? weightInput.toLowerCase() : weightInput) === 'bold' || weightInput === 700 ? 'Bold' : 'Regular';
        const font = this.fontManager.getFont(style.fontFamily || 'Inter', fontWeight);
        const fontSize = style.fontSize || 12;
        const scale = fontSize / font.unitsPerEm;
        const lineHeight = fontSize * 1.3; 

        const availableWidth = widthMode === yoga.MEASURE_MODE_UNDEFINED ? Infinity : width;
        
        const words = text.split(/\s+/);
        let lines = text.length > 0 ? 1 : 0;
        let currentLineWidth = 0;
        let maxLineWidth = 0;

        words.forEach((word, index) => {
            const wordLayout = font.layout(word + (index < words.length - 1 ? ' ' : ''));
            const wordWidth = wordLayout.glyphs.reduce((sum: number, glyph: any) => sum + glyph.advanceWidth, 0) * scale;

            if (currentLineWidth + wordWidth > availableWidth && currentLineWidth > 0) {
                lines++;
                maxLineWidth = Math.max(maxLineWidth, currentLineWidth);
                currentLineWidth = wordWidth;
            } else {
                currentLineWidth += wordWidth;
            }
        });
        
        maxLineWidth = Math.max(maxLineWidth, currentLineWidth);

        const calculatedHeight = lines * lineHeight + (style.padding * 2 || 0);
        const calculatedWidth = widthMode === yoga.MEASURE_MODE_EXACTLY ? width : maxLineWidth + (style.padding * 2 || 0);

        return { width: calculatedWidth, height: calculatedHeight };
    });

    parent.insertChild(node, parent.getChildCount());
  }
}
