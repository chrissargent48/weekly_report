declare module 'pagedjs' {
  export interface PreviewerOptions {
    stylesheets?: string[];
  }

  export interface PagedResult {
    total: number;
    pages: HTMLElement[];
  }

  export class Previewer {
    constructor(options?: PreviewerOptions);
    preview(
      content: string | HTMLElement,
      stylesheets?: string[],
      renderTo?: HTMLElement
    ): Promise<PagedResult>;
  }

  export class Chunker {
    constructor(content: HTMLElement, renderTo: HTMLElement);
  }

  export class Polisher {
    constructor();
    add(...stylesheets: CSSStyleSheet[]): void;
  }

  export function registerHandlers(...handlers: any[]): void;

  export interface Handler {
    afterParsed?(parsed: Document): void;
    beforeRendered?(content: HTMLElement, page: HTMLElement): void;
    afterRendered?(page: HTMLElement): void;
    afterPageLayout?(pageElement: HTMLElement, page: any): void;
    beforePageLayout?(page: any): void;
    onBreakToken?(breakToken: any): void;
    onAtPage?(node: any): void;
  }
}
