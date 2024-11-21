import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
  
export class MemoryLocalCacheService {
    public localStorage: MemoryCache = new MemoryCache();
    public sessionStorage: MemoryCache = new MemoryCache();
}

export class MemoryCache {
    private memoryCache: any = {};

    constructor() {
    }

    getItem(key: string): string {
        return this.memoryCache[key] || null;
    }

    setItem(key: string, data: string): void {
        this.memoryCache[key] = data;
    }

    removeItem(key: string): void {
        delete this.memoryCache[key];
    }
}