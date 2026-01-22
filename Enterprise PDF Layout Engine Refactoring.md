# **Enterprise Refactoring and Stabilization of a Dual-Render PDF Layout Engine**

## **Executive Summary**

The modern enterprise reporting landscape demands a convergence of interactive web-based editing and high-fidelity, print-ready output. The "Weekly Report Builder" application described in the query operates at this precise intersection, leveraging Electron for local-first capabilities, React for the user interface, and @react-pdf/renderer for document generation. However, the current "dual-render" architecture—where a client-side HTML/Tailwind view attempts to mirror a server-side Yoga/PDF render—has introduced significant technical debt manifested as "Visual Drift," synchronization failures, and potential data integrity risks.

This report provides an exhaustive technical analysis of the existing system, identifying the root causes of divergence between the DOM (Document Object Model) and the PDF layout engine. It proposes a transition from a reactive architecture (where the PDF attempts to mimic the DOM) to an authoritative architecture (where a headless layout engine dictates the geometry of both the viewport and the print output). Furthermore, it addresses critical infrastructure concerns regarding type safety across IPC (Inter-Process Communication) boundaries, atomic file persistence to prevent data corruption, and the establishment of robust guardrails for multi-agent development environments. The following comprehensive analysis outlines the path to upgrading this application to enterprise-grade stability, ensuring 100% visual parity and data reliability.

## **1\. Visual Drift Analysis: The Divergence of Rendering Engines**

The phenomenon of "Visual Drift"—where the HTML preview shows a page break or text wrap that differs from the final PDF output—is not merely a cosmetic inconvenience. It is a fundamental symptom of conflicting layout algorithms, coordinate systems, and text rendering engines. The current application relies on a custom script, calculatePageMap.ts, to bridge the gap between the browser's Blink rendering engine (handling HTML/Tailwind) and the Yoga layout engine (powering @react-pdf). This approach is inherently fragile because it assumes that two distinct mathematical models will produce identical results given the same input. The analysis below details precisely why this assumption fails.

### **1.1. The CSS Box Model vs. Yoga Layout Engine**

At the core of the layout discrepancy is the difference between the W3C standard CSS Box Model used by web browsers and the Flexbox implementation provided by Yoga. While Yoga aims to implement Flexbox, it is strictly a subset and deviates in default behaviors that are critical for pixel-perfect parity.

#### **1.1.1. Box Sizing and Dimensions**

Web browsers typically default to box-sizing: content-box (unless reset), whereas Yoga operates strictly on a model analogous to box-sizing: border-box. In the standard CSS model, the width of an element is calculated as the width of the content area, with padding and borders added externally. In Yoga, specified dimensions include padding and borders. If the calculatePageMap.ts script measures an element using offsetHeight in the DOM, it captures the border-box height. However, if any styles applied via Tailwind (e.g., p-4 for padding) are interpreted differently by the PDF renderer due to nesting context, the content area available for text reflow changes.

Crucially, Yoga's handling of specific properties differs from the web standard. For instance, Yoga defaults flex-direction to column and flex-shrink to 0, whereas the web defaults to row and 1, respectively. If the shared styling logic does not explicitly define every single flex property, the browser will fall back to its defaults and Yoga to its own, leading to immediate structural divergence.

#### **1.1.2. Absolute Positioning Context**

A frequent point of failure identified in layout engines is the calculation of absolute positioning. In standard CSS, position: absolute removes an element from the flow and positions it relative to its nearest positioned ancestor (an element with position anything other than static). Yoga has historically struggled with this behavior, sometimes calculating offsets against the padding box of the parent rather than the content box, or behaving differently depending on whether the parent has a defined dimension.

Recent updates to Yoga (version 3.0+) have introduced flags to align more closely with web standards, such as UseWebDefaults. However, @react-pdf/renderer often bundles specific, sometimes older, versions of Yoga (e.g., matching React Native releases). If the application uses a version of @react-pdf that relies on an older Yoga binary, and calculatePageMap.ts assumes standard CSS absolute positioning, elements like headers, footers, or floating watermarks will drift significantly in the PDF output.

#### **1.1.3. The "Float" Discrepancy**

It is vital to note that Yoga does not support non-flex layout properties such as float or display: grid (though Grid support is in development). Tailwind CSS heavily utilizes standard block flow and floats for certain utility classes. If the HTML editor uses any Tailwind class that relies on float (e.g., for wrapping text around an image), @react-pdf will simply ignore it or render it as a standard flex item, completely breaking the layout structure.

### **1.2. The Typography Mismatch: Textkit vs. HarfBuzz**

The most insidious source of visual drift is text rendering. The height of a text block is non-deterministic across different engines because line wrapping depends on the precise accumulation of glyph widths.

| Feature | Browser (Blink/Chromium) | @react-pdf (Textkit/Fontkit) | Impact on Drift |
| :---- | :---- | :---- | :---- |
| **Font Engine** | Skia / HarfBuzz | Fontkit (JavaScript) | Different kerning pairs and ligature substitutions. |
| **Line Breaking** | Complex heuristics (greedy/Knuth-Plass variations) | Basic greedy algorithm | A word fitting on line 1 in HTML may drop to line 2 in PDF. |
| **Hyphenation** | Dictionary-based (OS dependent) | Rule-based or None | Different break points change paragraph height. |
| **Letter Spacing** | Floating point pixel precision | Point-based precision | Accumulation of rounding errors over long paragraphs. |

The browser uses HarfBuzz for text shaping, which handles complex scripts and kerning with extreme precision, often utilizing OS-level font fallbacks. @react-pdf uses fontkit, a pure JavaScript implementation. Even if the exact same .ttf file is provided to both, the calculation of "Advance Width" for glyphs can differ by fractions of a pixel.

**The "Widow" Effect:**

Consider a paragraph that ends with a single word on the last line (a widow). In the HTML preview, the browser's shaping engine might calculate the text width as 499.8px, fitting exactly within a 500px container. The calculatePageMap.ts script measures this as 10 lines of text. In the PDF engine, fontkit might calculate the width as 500.1px due to slightly different kerning addition. This forces the last word onto a new line (the 11th line).

* **Result:** The PDF section is now height 11 \* lineHeight, whereas the PageMap allocated space for 10 \* lineHeight. The entire subsequent content of the report shifts down by one line. Over a 20-page report, this error accumulates, causing page breaks to occur in the middle of images or headers.

### **1.3. Coordinate System and Resolution (DPI/PPI)**

The calculatePageMap.ts script attempts to measure DOM elements in pixels and translate them to PDF points. This conversion is fraught with ambiguity.

* **PDF Unit:** The standard PDF unit is the Desktop Publishing Point (pt), where ![][image1].  
* **CSS Unit:** The standard CSS pixel (px) is defined as ![][image2].

Therefore, the conversion factor should theoretically be constant:

![][image3]  
However, this fails in practice due to **Device Pixel Ratio (DPR)**. On a high-DPI (Retina) screen, window.devicePixelRatio might be 2.0 or 3.0. When calculatePageMap.ts calls getBoundingClientRect(), it retrieves values affected by the browser's current zoom level and the screen's DPI setting. Unless the script explicitly normalizes these values against window.devicePixelRatio and the current browser zoom factor, the measurements will vary depending on the developer's monitor. A developer on a 4K screen might see a perfect layout, while a user on a 1080p screen experiences broken pagination.

Furthermore, @react-pdf allows setting a custom DPI for the document, which defaults to 72 but can be overridden. If the HTML preview CSS assumes 96 DPI (standard web) and the PDF renderer assumes 72 DPI, all images and containers will be scaled incorrectly unless a global scaling factor is perfectly applied.

## **2\. Type Divergence Audit: Preventing Silent Data Loss**

The transition from the "Dashboard" (Client) to the "Print Studio" (Server/Renderer) involves serializing complex JavaScript objects, often passing them via Electron's IPC (Inter-Process Communication) or storing them in local files. A major risk identified is "Silent Data Loss," where schema mismatches result in data being stripped without warning.

### **2.1. The Schism Between Client and Server Types**

In the current repository structure, client/src/types.ts likely contains the definitions used by the React components, while server/types.ts contains the definitions for the PDF generation logic.

* **Client Types:** Tend to be "rich." They include UI state (e.g., isHovered, isEditing), temporary form values, and potentially circular references used for navigation.  
* **Server Types:** Tend to be "pure." They strictly define the structure required for the PDF (e.g., text, imageSrc, styles).

**The Failure Mechanism:**

When a user updates a report, they modify the state defined by Client Types. When they click "Print," this object is serialized (JSON.stringify) and sent to the renderer. If a developer adds a new feature—say, a "Caption" field for images—to client/src/types.ts but forgets to add it to server/types.ts or the serialization whitelist, the JSON payload effectively drops the caption. The PDF renders without errors, but the caption is missing. This is "silent" because no crash occurs.

### **2.2. Unification Plan: The Authoritative Schema Strategy**

To resolve this, the application must move to a **Single Point of Truth (SPOT)** for data definitions. This should be implemented as a shared internal package or folder that both Client and Server import from. However, TypeScript interfaces alone are insufficient because they vanish at runtime. The solution is to use a runtime validation library like **Zod**.

#### **2.2.1. Shared Zod Schemas**

Instead of manually writing TypeScript interfaces, define the schema using Zod. This allows for parsing, validation, and type inference from a single source.

**Proposed Structure (packages/shared/src/schemas.ts):**

TypeScript

import { z } from 'zod';

// Base style schema shared by both engines  
export const StyleSchema \= z.object({  
  fontSize: z.number().min(6).max(100),  
  fontFamily: z.enum(),  
  color: z.string().regex(/^\#\[0-9a-fA-F\]{6}$/),  
  // Strict alignment options supported by both Tailwind and Yoga  
  textAlign: z.enum(\['left', 'right', 'center', 'justify'\]),  
});

// The atomic unit of the report  
export const SectionSchema \= z.object({  
  id: z.string().uuid(),  
  type: z.enum(\['text', 'image', 'table', 'spacer'\]),  
  content: z.string(), // Text content or Image URL  
  styles: StyleSchema,  
  layout: z.object({  
    height: z.number(), // The calculated height from the layout engine  
    pageBreakBefore: z.boolean().default(false),  
  }).optional(),  
  metadata: z.record(z.string(), z.unknown()).optional(),  
});

// The full report document  
export const ReportSchema \= z.object({  
  title: z.string(),  
  sections: z.array(SectionSchema),  
  version: z.number(),  
  updatedAt: z.string().datetime(),  
});

// Infer TypeScript types from the schema  
export type Section \= z.infer\<typeof SectionSchema\>;  
export type Report \= z.infer\<typeof ReportSchema\>;

#### **2.2.2. Implementation in Data Flow**

1. **Dashboard (Write Side):** When the user saves or navigates to the Print Studio, the data object is passed through ReportSchema.parse(data). If the client state contains extra UI fields (like isHighlighting), Zod will strip them (if configured with .strip()) or throw an error if essential data is malformed.  
2. **IPC Bridge:** The Electron IPC handler receives the payload. Before passing it to the PDF Renderer or DataManager, it runs ReportSchema.safeParse(payload).  
3. **Error Handling:** If validation fails, the application explicitly alerts the user ("Report Data Corrupted: Missing field 'styles.color'"). This converts "Silent Data Loss" into "Loud, Actionable Errors."

## **3\. Component Mapping: The Interactive-to-Static Bridge**

A critical requirement is ensuring that every interactive control in the HTML editor has a corresponding static primitive in the PDF. The user specifically mentioned "image zooming" or "text editing." In the HTML editor, a user might zoom into an image and pan to crop it. The PDF must render precisely that crop.

### **3.1. The Adapter Pattern for Component Parity**

The mismatch occurs when the HTML component relies on browser-native behaviors (like object-fit: cover or CSS transforms) that @react-pdf does not natively support in the same way. To fix this, we must abstract the *logic* of the component from its *rendering*.

**The "Universal Component" Strategy:**

We define a shared set of props that describe the *state* of the component, not its implementation.

**Example: The Zoomable Image**

* **Shared State:**  
  TypeScript  
  interface ImageState {  
    src: string;  
    zoom: number;       // e.g., 1.5  
    focalPoint: { x: number, y: number }; // Percentage (0.5, 0.5 is center)  
    containerRatio: number; // Aspect ratio of the box  
  }

* **Logic Hook (useImageGeometry.ts):**  
  This hook accepts the ImageState and calculates the exact cropping coordinates. It returns a standardized object: { sourceX, sourceY, sourceWidth, sourceHeight }. This math must be pure JavaScript, avoiding any DOM dependencies.  
* **HTML Adapter (EditorImage.tsx):**  
  Uses the output from useImageGeometry to apply CSS transform: scale(...) translate(...) or background-position. It handles user events (drag/scroll) to update the focalPoint and zoom.  
* **PDF Adapter (PDFImage.tsx):**  
  Uses the *same* output from useImageGeometry to configure the @react-pdf \<Image\> component. Since @react-pdf supports objectPosition and objectFit (mimicking CSS), we map the calculated geometry directly to these props. If @react-pdf lacks a specific transform (like complex skew), the hook provides the fallback pre-calculation (e.g., cropping the image buffer before rendering).

### **3.2. Text Editing and Rich Text**

If the HTML editor uses a library like TipTap or Slate (common for React), it produces a JSON tree of nodes (paragraphs, bold spans). @react-pdf requires a tree of \<Text\> and \<View\> components.

**Mapping Failure Risk:**

HTML allows nested block elements (e.g., a div inside a p). @react-pdf generally does not allow a \<View\> inside a \<Text\>.

**Solution: The Recursive Node Mapper**

Create a RichTextAdapter function.

1. **Input:** The rich text JSON tree.  
2. **Process:** Traverse the tree.  
3. **HTML Output:** Render standard HTML tags (\<strong\>, \<em\>, \<p\>).  
4. **PDF Output:**  
   * Map top-level blocks (paragraphs) to \<View\> or \<Text\> blocks.  
   * Map inline styles (bold, color) to nested \<Text style={...}\> components.  
   * **Crucial:** Flatten any unsupported nesting. If the editor allows an image inside a paragraph, the Adapter must break the paragraph into two \<Text\> blocks with an \<Image\> \<View\> in between for the PDF, as @react-pdf text nodes cannot contain block-level image views easily.

## **4\. Infrastructure Polish and Persistence**

Stabilizing the application requires addressing how data is stored and how the application interacts with the underlying system resources.

### **4.1. Efficiency of usePrintConfig and localStorage**

The current reliance on localStorage for state persistence is a bottleneck for an "enterprise-grade" report builder. localStorage is synchronous and operates on the main thread.

* **Performance Hit:** Reading/Writing large JSON blobs (especially if they contain Base64 encoded image previews) blocks the UI thread. This causes "jank" or freezing during auto-save operations.  
* **Storage Limits:** localStorage is typically capped at 5-10MB. A single weekly report with high-res charts can easily exceed this.

**Optimization Plan:**

1. **Migrate to IndexedDB:** Use a wrapper library like idb-keyval or Dexie.js. IndexedDB is asynchronous, transactional, and supports much larger quotas (hundreds of MBs).  
2. **Debounced Persistence in usePrintConfig:** The hook should not save on every keystroke. Implement a useDebounce pattern that triggers the save operation only after 500ms of inactivity.  
3. **Separation of Concerns:** Store *User Preferences* (theme, last opened file ID) in localStorage (fast, small). Store *Document Content* in the file system or IndexedDB (slow, large).

### **4.2. Atomic Writes in DataManager.ts**

The research highlights a critical vulnerability in Node.js file operations. Standard fs.writeFile is not atomic. If the application crashes, power is lost, or the process is killed during a write operation, the file on disk may be left in a partially written, corrupted state (e.g., a JSON file cutting off in the middle). For a local-first app, this means total data loss for the user.

**The "Write-Replace" Strategy:**

To ensure data integrity, the DataManager.ts must implement an atomic save strategy utilizing the operating system's file move guarantees.

**Recommended Implementation:**

Use the write-file-atomic library or implement the pattern manually:

1. **Serialize:** Convert the report object to a string.  
2. **Write to Temp:** Write this string to a temporary file in the same directory (e.g., report.json.tmp). This ensures the move operation remains on the same partition/filesystem.  
3. **Flush (fsync):** Force the operating system to flush the write buffer to physical disk. This prevents the "saved" file from existing only in RAM cache.  
4. **Rename:** Use fs.rename to replace report.json with report.json.tmp. On POSIX and modern Windows (NTFS), this rename is atomic. Either the old file exists, or the new file exists; there is never a state where the file is half-written.

TypeScript

// Conceptual Implementation  
import fs from 'fs';  
import path from 'path';

export async function saveReportAtomic(filePath: string, data: Report) {  
  const tempPath \= \`${filePath}.tmp.${Date.now()}\`;  
  const serialized \= JSON.stringify(data);  
    
  try {  
    await fs.promises.writeFile(tempPath, serialized);  
    // fsync is critical for true durability  
    const fd \= await fs.promises.open(tempPath, 'r+');  
    await fd.sync();   
    await fd.close();  
      
    // Atomic replacement  
    await fs.promises.rename(tempPath, filePath);  
  } catch (err) {  
    // Cleanup temp file on error  
    try { await fs.promises.unlink(tempPath); } catch (e) {}  
    throw new Error(\`Atomic save failed: ${err.message}\`);  
  }  
}

### **4.3. Multi-Agent Regressions (AGENTS.md)**

In a multi-agent environment (like using Cursor/Windsurf with multiple distinct AI contexts), there is a high risk of regression because one agent might "fix" the CSS to look good in the browser without realizing it broke the PDF parity.

**Review of AGENTS.md:**

The file must be updated to include strict "Context Constraints."

* **Rule 1: The Law of Parity:** "Any change to the visual styling of a component in client/components MUST be accompanied by a corresponding update to the adapter in server/renderers. Do not close a task until both are verified."  
* **Rule 2: No Magic Numbers:** "Do not use arbitrary pixel values (e.g., top: 43px) to align items. All layout constants must be defined in shared/theme.ts and imported by both engines."  
* **Rule 3: The Headless Authority:** "Do not modify calculatePageMap.ts to simply 'make it fit'. If the calculation is wrong, the upstream logic in the Layout Engine must be fixed. The DOM is a projection, not the source of truth."

## **5\. Architecture Update Plan: The Authoritative Layout Engine**

To achieve enterprise-grade stability, the application must invert its control flow. Instead of the View (DOM) dictating the Model (PageMap), a centralized Layout Engine must dictate the View.

### **Phase 1: The Headless Layout Authority**

We will implement a layout calculation service that runs independently of the browser's rendering cycle. This service will use the **exact same layout logic** as the PDF generator.

**The Strategy:**

1. **Yoga in the Main Process:** We will spin up a Node.js worker (or use the Electron main process) that runs yoga-layout-prebuilt.  
2. **Font Measurement Service:** Since we cannot rely on the browser's measureText (which uses HarfBuzz/Skia), we will load the standard .ttf fonts into this worker and use fontkit (the same library @react-pdf uses) to measure text string widths.  
3. **Simulation:** When the user edits the report, the new data is sent to this Layout Authority.  
   * It builds a Yoga tree representing the report.  
   * It populates text nodes and measures them using fontkit.  
   * It calculates the exact (x, y, w, h) of every section.  
   * It determines page breaks based on the PDF page height (e.g., 841.89pt for A4).  
4. **Broadcast:** The Authority returns a PageLayout object.  
   * **PDF Renderer:** Uses these coordinates to place elements absolutely, ensuring perfect adherence to the calculation.  
   * **HTML Preview:** Receives the PageLayout. The React components in the editor are updated to force their dimensions to match the calculation. style={{ height: layout.height \+ 'px' }}.

**Result:** If the fontkit calculation determines a word wraps to a new line, the Layout Authority increases the height of that section. It sends this new height to the browser. The browser forces the DOM element to be taller. The user might see a slight bit of extra whitespace in the HTML editor (because the browser *could* have fitted the text tighter), but **the visual representation now perfectly matches the space reserved in the PDF.** The drift is eliminated by forcing the browser to conform to the PDF engine's constraints.

### **Phase 2: Critical Cleanup List**

The following elements identified in the research must be purged or refactored:

1. **DELETE Paged.js:** This library is designed to polyfill CSS Paged Media for browser-based printing. It is fundamentally incompatible with the @react-pdf Yoga approach. Attempting to mix them causes the "double-pagination" logic bugs seen in calculatePageMap.ts. Remove it entirely.  
2. **REMOVE DOM Measurement Logic:** Any code in calculatePageMap.ts that uses document.getElementById or getBoundingClientRect must be deleted. Measurement must be pure mathematical derivation based on content and font metrics, not DOM probing.  
3. **NORMALIZE Font Formats:** Remove all references to .woff or .woff2 files in the server-side renderer. Ensure the project uses a single set of high-quality .ttf or .otf files that are loaded by both the HTML CSS (@font-face) and the PDF Renderer (Font.register).  
4. **SANITIZE Unit Conversions:** Search for all instances of \* 0.75 or / 96 \* 72\. Replace them with a centralized UnitConverter utility class that handles px to pt conversion, explicitly accounting for window.devicePixelRatio if any screen coordinates are ever touched.

## **6\. Verification Script: The Blueprint**

To guarantee that the new Authoritative Layout Engine works, we need an automated test that proves "What was calculated is what was rendered." We will use pdf-parse or pdf.js in a headless test environment.

**File:** tests/verification/layout-parity.test.ts

**The Concept:**

We will define a "Stress Test Section" containing complex text that is known to cause wrapping issues (widows/orphans). We will ask the Layout Engine to calculate its height. Then we will generate the actual PDF and parse it to see where the text actually landed.

**Script Logic:**

1. **Setup:**  
   Import the LayoutEngine and the PDFGenerator.  
   Define mockData with a text block: "The quick brown fox..." repeated 50 times.  
2. **Prediction:**  
   TypeScript  
   const layout \= LayoutEngine.calculate({ sections: });  
   const expectedHeight \= layout.sections.height; // e.g., 450.5 points

3. **Generation:**  
   TypeScript  
   const pdfStream \= await PDFGenerator.render(mockData);  
   const pdfBuffer \= await streamToBuffer(pdfStream);

4. **Inspection (The "Truth" Check):**  
   We use pdfjs-dist to read the raw PDF commands.  
   TypeScript  
   import \* as pdfjs from 'pdfjs-dist/legacy/build/pdf';

   const doc \= await pdfjs.getDocument(pdfBuffer).promise;  
   const page \= await doc.getPage(1);  
   const textContent \= await page.getTextContent();

   // PDF Coordinates start at Bottom-Left.   
   // We need to find the lowest Y coordinate of any text item on the page.  
   let minBottomY \= Infinity;  
   const pageHeight \= 841.89; // A4 height in points

   textContent.items.forEach(item \=\> {  
     // transform matrix:  
     // translateY (index 5\) is the distance from the bottom of the page  
     const yFromBottom \= item.transform;

     // Calculate distance from TOP of page to match our Layout Engine logic  
     const yFromTop \= pageHeight \- yFromBottom;

     if (yFromTop \> minBottomY) minBottomY \= yFromTop;  
   });

   const actualHeight \= minBottomY;

5. **Assertion:**  
   TypeScript  
   // We allow a tolerance of 1-2 points for floating point rounding differences  
   if (Math.abs(expectedHeight \- actualHeight) \> 2.0) {  
     throw new Error(\`Layout Mismatch\! Engine predicted ${expectedHeight}, PDF rendered ${actualHeight}\`);  
   }  
   console.log("SUCCESS: Layout Engine parity verified.");

## **7\. Conclusion**

The "Weekly Report Builder" stands at a pivotal juncture. The current dual-render approach, while functional for prototyping, is mathematically doomed to drift due to the inherent incompatibility between browser layout engines and the strict Yoga engine used for PDFs. By adopting the **Authoritative Layout Engine** architecture, the application moves from "guessing" the layout to "dictating" it.

This shift, combined with the implementation of Zod for **Type Safety**, the **Universal Component Adapter** pattern for interactive parity, and **Atomic Writes** for data persistence, will elevate the application to enterprise standards. The path forward requires significant refactoring—specifically the deletion of reactive DOM measurement scripts in favor of proactive headless calculation—but the result will be a robust, scalable system where "What You See Is Exactly What You Print." The visual drift will vanish, not because the browser and PDF suddenly agree, but because the browser has been disciplined to follow the PDF's rules.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHUAAAAYCAYAAADEbrI4AAAD/ElEQVR4Xu2ZW6gNURjH/0IRIkRCB7lHuYTcchTiQSTlVl7kkiSURCIPopTbUUouecADeXFIHnTeSMolIpdE5AkvKCS+//nma2bWnrNn5uwz+8w+Z//q394za+01s9Z/Xb61NlDF6CCaIlrgJlSpTFaL6kXPRbuctCoVzkVUTW1z5N3UjqJ+oi5uQhxDRCvdm+2EUkztKaoT7RN1dtJaglOif54WO2mRjBFtFt0V/YVWLgsWiSa4N3NEKaZOFv0QvRcNcNJairmiP0hh6lLRDNFHZGfqSSR8oVaiFFM5OtdD25GRdBZYx0nVhuxh7GlZmNpH9AApX6jMlGJqOcjcVC7WzF8rmgZdxDnil4tGItxbu4qOQteDtdDf0eSsenRauCScE30WvRQdFvUK5SiOBTDjoEsM60tYRg3UhIHQNqv1rln/KAaLNooOiObDL4sETe0G3VMXK6uRNKbyAc+gRn0QNYi2ijZ411ehwQMrslN0x8vLzzPevdRRXE6heewUvxFeU7eLvkHrfVB0ARqEchn6Kprq5SOcvveK3omWiUZD25ft1d3LY6bGlRUijamED2sQPYL2VGO26JfoOPzRyB6VOHITVkE7R1I9FA1v/GXrsQeFgRJPqX6KbsMfdYOgsQsNMVZAO8VC75qj74knG4lmalxZIZprKmW9ifCBfDCns2HevbSmViJcj11TzQhOqYbbztaOPNHq692z+8HZLElZBcRmcGjKVMIyGH7P8q7zZKrt99IqjmKmBuvttrNdN6CwHYMkKauA2AwOcaZy2uH0Q1xTJ4l6e9+jsEAsqfojm01/Gtq0qQyQ7oteQBubuKbWQV+yKWqgkXRSLUHxTlIOmmtqJ9EVhJcrgwGT1StJWQVYhktItt0wU99CjxcNLvo8mdoUuMdpmNPxGmglToiGBtLLzRboKVqwY3BrRsZCAw+K35MSZaoFSoxojSgjGL0yUj4E3SIRBkjn4QehSctqZB40gqIRtn58Fz0VjQ/kczFT30ADIxZcL/oCNTbYMTg1nhZ9El0XbXPSywmfy8ZinS16tneeCH03NuxML83igqZgo99DuO3YpscQblNu87iVY7rdewW/jeeIXkN3E9wi3YJ/rJq2rGbjTr/cr8WtbcyTZmOfBT2ge2rrVJzqOcr43vzkzMN6cEa5Jjrr5SsHfCeOUHYUG7FlxTW1EqGRu+HvBftCp0I2LoO1myiyB2xrsMKjoFMFxe+VeELENZ7TbhQMTDhqOSW3CzjX87gvqDz/rRYFo/Qb0DNrF6ZdFk13E6rkG47ExwhHq4SGHoGazXV1RDi5Sp7h1OsezXGN3Q8doTSb6yv/J61SIexAYZC3Dv4WwRTcF+ae/7ZsGJU7vAblAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAYCAYAAAAxkDmIAAAETUlEQVR4Xu2aXYhVVRTH/6GBopSapoIxk2gRTiSISaU5+PHQgyEi2GtKJTIEFWYEgqP2YJFI9BA9ODgg5UeEqOSD6KWHlIiEUAQxMjF8GgTJoKKP9XOdPfecc2e858y9zv2Y84c/M/vjbM9Z/7XXWns7UoGhMM74knFheqBA6+N943Hjr8Y1qbECbYLJxpIKgdsWrSDwBOOj8nSSC53GV9KdYwy1CjzH+KVxo/GB1FitQNSLxv/kaWR2cnhoPGXcYjxj/Md4IDk85lCrwDyHACX5WvUGTrNHOQVea3zeeEOFwLUKPMm41fhCeqCO2KYcAgcwmYcKgWsTeDRw3wUmyTO/27hEnuyJBOuNT6ice/j5SDQ3kGcxYrqvGcD5t994x3hOvhPzvNuDxpnGZ+W2GS+3DbmzS77+xGgODvRi9EwaPLPI2CtPn88omc/jAj8mj8DDrTWIPALzj4dkf13u8W8aX4/aR4wPy42z0/hbNPcP4zLjq1GbnP+TfL12QKfxhPy7SnJHnmI8HPWRAsmfu+TF7HfG03JbBcyK+k7KhUW8v43vxOYgcJa1EsgjMAih7ILcQwMQ8E/jPpW9Ds/qM14xdhjny5+dF40Ph2nGU3Knycrtd59sHPjmg6ossrhEwal7Yn3rjP8aV0XtYKfL8l0OuuXO8XHUBghcba0KjFRgGP8QQhCi3DTOjfUjLAKzfr88tLcr+MaSknZBlAF5KgsIFXfI90Qy0sMngzPcYaYqeebNslYF6iUwYA3CytJU/2q5N36m+p8RRwIMkpdZMJzA2DdeGKVFCW3m3gtZ1qpAvQUm3y5O9RO+fzHekhci1YATpIu0aiTnNRptLTBJ/rySeQR0GI/JCweKge/l4t0L5KSV8uo8K5sh9I9U4MflxdNReQUegB34363Ql2WtCgSBKRDYOdUQBP5ZXj0GbJCH4c2xPq7vvpUXAqBLvos/V5XSfhTwkNxgH6nycoJ64jXjh8aXlc0uYCiBKbIQD1sEpEVh/Xfl0W9FmCSPfLujcZBlrUFQdTEZUUKe+V1+fHk6Ni+NIPBVeVHFR3FEGJCLzMvE704hO5ebnrdjfX8Z96oxINp8Jd/1ONp+uTHDGMcbbvgWGH9UsmgcCtiLQjJ8G86/XB6t4t/L+fqQyjbnJ21sw3swflse8b6QbwTeB3vmWasmpEM0uY+Q3OgdmQdElEvG6VGbndwnd84e46fR7zOMm+Q7erSAHbFnw2qKtMCtCAQtqfz+oc1OIdr0yi9w3lPZCcYEuKF6Un7JAfk9z5Ves6BbHlJDsfKBfEdzviS8hpshCpyzSl7otDX4YPJCnK34N0yEQS4VKAg5s/8g38HkWgQOxxUc4Jq80CrQYiDHclwj14UcTMhm98YF5oTxRtQu0CLokFfHXMiwm/lLDG7bwA75cQQgMKH7uahdoEVATv1GfkHCOfgtlc+aiP+1/BhJscVxJOs5uCnwPzKXJioZvZY5AAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,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>