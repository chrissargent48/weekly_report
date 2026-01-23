import yoga, { Node, YogaNode } from 'yoga-layout-prebuilt';
import { FontManager } from './FontManager';
import { WeeklyReport, ReportLayout, CanvasNode } from '../types';

export class LayoutEngine {
  private fontManager: FontManager;

  constructor() {
    this.fontManager = FontManager.getInstance();
  }

  /**
   * Calculates the layout for a Weekly Report.
   * This is a simplified implementation for Phase 2 proof-of-concept.
   * It currently treats the report as a single column list of sections.
   */
  public calculateLayout(report: WeeklyReport): ReportLayout {
    // 1. Create Root Node (Page)
    // For now, assuming single page or continuous flow for calculation
    const rootNode = yoga.Node.create();
    const A4_WIDTH_PTS = 595.28;  // 210mm
    // const A4_HEIGHT_PTS = 841.89; // 297mm - not strictly limiting height for continuous flow calculation

    rootNode.setWidth(A4_WIDTH_PTS);
    // rootNode.setHeight(A4_HEIGHT_PTS); // Let it grow for now to measure total content
    rootNode.setFlexDirection(yoga.FLEX_DIRECTION_COLUMN);
    rootNode.setPadding(yoga.EDGE_ALL, 20); // Basic page padding

    // 2. Map Report Sections to Nodes
    // We'll iterate through report data and create nodes.
    // Ideally this would follow the same structure as the React component tree.
    
    // Example: Header
    this.addTextNode(rootNode, report.overview.executiveSummary, {
        fontSize: 12,
        fontFamily: 'Inter',
        marginBottom: 10
    });

    // Example: Weather (Iterate days)
    if (report.overview.weather) {
      report.overview.weather.forEach(day => {
          this.addTextNode(rootNode, `Date: ${day.date} - ${day.condition}`, { fontSize: 10, fontFamily: 'Inter' });
      });
    }

    // 3. Calculate Layout
    rootNode.calculateLayout(A4_WIDTH_PTS, NaN, yoga.DIRECTION_LTR);

    // 4. Extract Geometry
    const layout = this.extractLayout(rootNode);

    // Cleanup
    rootNode.freeRecursive();

    return layout;
  }

  private addTextNode(parent: YogaNode, text: string, style: any) {
    const node = yoga.Node.create();
    
    // Basic Style Mapping
    node.setMargin(yoga.EDGE_BOTTOM, style.marginBottom || 0);
    node.setWidth(style.width || '100%'); // Default to full width of parent
    
    // Measure Function
    node.setMeasureFunc((width, widthMode, height, heightMode) => {
        const font = this.fontManager.getFont(style.fontFamily || 'Inter', 'Regular');
        const fontSize = style.fontSize || 12;
        
        // Fontkit measurement
        const layout = font.layout(text);
        
        // Calculate text width/height wrapping to 'width'
        // This is a simplification. Fontkit + manual line breaking is complex.
        // For wrapping, we strictly need to sum glyph advances and break lines.
        // For this Phase 2 Proof of Concept, we will use a naive width estimation 
        // or a very basic line-breaker if fontkit doesn't support width constraints directly (it doesn't, it just shapes).
        
        // Basic naive line breaking for PoC: 
        // Total text width / container width = lines.
        
        const totalWidth = layout.glyphs.reduce((sum: number, glyph: any) => sum + glyph.advanceWidth, 0) 
                           * (fontSize / font.unitsPerEm);
        
        // If width is undefined (auto), we return the natural width
        const availableWidth = widthMode === yoga.MEASURE_MODE_UNDEFINED ? Infinity : width;
        
        const lines = Math.ceil(totalWidth / availableWidth);
        const lineHeight = fontSize * 1.2; // roughly 1.2em line height
        
        const calculatedHeight = lines * lineHeight;
        const calculatedWidth = lines > 1 ? availableWidth : totalWidth;

        return { width: calculatedWidth, height: calculatedHeight };
    });

    parent.insertChild(node, parent.getChildCount());
    // Marking dirty is usually needed if we change data, but here we just created it.
  }

  private extractLayout(root: YogaNode): ReportLayout {
      // Traverse tree and build ReportLayout
      // This is a placeholder since ReportLayout structure in Shared is page-based 
      // but here we just have a single yoga tree.
      
      // We will Flatten the tree into "Pages" (just one for now) with absolute coordinates.
      
      const items: CanvasNode[] = [];
      
      const traverse = (node: YogaNode, xOffset: number, yOffset: number) => {
          const layout = node.getComputedLayout();
          const absX = xOffset + layout.left;
          const absY = yOffset + layout.top;
          
          items.push({
              id: 'node-' + Math.random().toString(36).substr(2, 9),
              type: 'text', // simplification
              x: absX,
              y: absY,
              width: layout.width,
              height: layout.height,
              rotation: 0
          });

          for (let i = 0; i < node.getChildCount(); i++) {
              traverse(node.getChild(i), absX, absY);
          }
      }

      traverse(root, 0, 0);

      return {
          pages: [{
              id: 'page-1',
              items: items
          }]
      };
  }
}
