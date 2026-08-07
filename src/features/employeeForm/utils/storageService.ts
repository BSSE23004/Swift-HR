// Storage Service
import { STORAGE_KEYS } from '../constants/storageKeys';

class StorageService {
  private readonly PREFIX = 'swifthr_';
  
  private getKey(key: string): string {
    return `${this.PREFIX}${key}`;
  }
  
  setItem<T>(key: string, value: T): boolean {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.getKey(key), serializedValue);
      return true;
    } catch (error) {
      console.error(`Failed to set ${key}:`, error);
      return false;
    }
  }
  
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (item === null) return null;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      return null;
    }
  }
  
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      return false;
    }
  }
  
  clear(): boolean {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }
  
  getStorageSize(): number {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }
  
  getQuota(): { used: number; available: number; percentage: number } {
    const used = this.getStorageSize();
    const available = 5 * 1024 * 1024; // 5MB typical limit
    return {
      used,
      available,
      percentage: (used / available) * 100,
    };
  }
}

export const storageService = new StorageService();