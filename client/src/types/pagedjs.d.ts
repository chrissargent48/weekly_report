declare module 'pagedjs' {
    export class Previewer {
        constructor(options?: any);
        preview(content: string | HTMLElement, stylesheets: string[], renderTo: HTMLElement): Promise<any>;
    }
    
    export class Poller {
        constructor(previewer: Previewer, container: HTMLElement, delay: number);
    }
}
