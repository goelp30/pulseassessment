import { Injectable } from '@angular/core';
import { MemoryLocalCacheService, MemoryCache } from './MemoryLocalCacheService';
import { LocalStorageTypes } from '../app/enums/LocalStorageTypes';

@Injectable({
    providedIn: 'root'
})
  
export class LocalDataCacheService {
    localStorageCache: Storage | MemoryCache;
    sessionStorageCache: Storage | MemoryCache;

    constructor(memoryCache: MemoryLocalCacheService) {
        this.localStorageCache = localStorage || memoryCache.localStorage;
        this.sessionStorageCache = sessionStorage || memoryCache.sessionStorage;
    }

    public setToken(data: any, storageType: LocalStorageTypes = LocalStorageTypes.SessionStorage) {
        this.getStorage(storageType).setItem("PA", JSON.stringify(data));
    }

    public getToken(storageType: LocalStorageTypes = LocalStorageTypes.SessionStorage) {
        return JSON.parse(this.getStorage(storageType).getItem("PA") || '{}');
    }

    private getStorage(storageType: LocalStorageTypes): Storage | MemoryCache {
        if (storageType == LocalStorageTypes.LocalStorage)
            return this.localStorageCache;
        else
            return this.sessionStorageCache;
    }
}
