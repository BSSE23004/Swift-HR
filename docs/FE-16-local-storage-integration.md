# FE-16: Local Storage Integration Plan

## Overview
This document details the local storage integration strategy for the Add/Edit Employee Form, including data persistence, draft management, and error handling.

## Storage Architecture

### Storage Keys
```typescript
const STORAGE_KEYS = {
  DRAFT_DATA: 'employeeForm_draft',
  CURRENT_STEP: 'employeeForm_currentStep',
  TIMESTAMP: 'employeeForm_timestamp',
  IS_EDIT_MODE: 'employeeForm_isEditMode',
  EDITING_EMPLOYEE_ID: 'employeeForm_editingEmployeeId',
} as const;
```

### Data Structure
```typescript
interface StorageData {
  draftData: EmployeeFormData;
  currentStep: number;
  timestamp: string;
  isEditMode: boolean;
  editingEmployeeId: string | null;
}
```

## Storage Utilities

### Core Storage Service
```typescript
// utils/storageService.ts
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
```

### Draft Management Service
```typescript
// utils/draftService.ts
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants/storageKeys';
import type { EmployeeFormData } from '../types/employeeForm.types';

class DraftService {
  saveDraft(
    formData: EmployeeFormData,
    currentStep: number,
    isEditMode: boolean = false,
    editingEmployeeId: string | null = null
  ): boolean {
    try {
      const quota = storageService.getQuota();
      
      // Check if we're approaching quota limit
      if (quota.percentage > 90) {
        console.warn('Storage quota nearly full');
        this.cleanupOldDrafts();
      }
      
      const success = storageService.setItem(STORAGE_KEYS.DRAFT_DATA, formData);
      if (success) {
        storageService.setItem(STORAGE_KEYS.CURRENT_STEP, currentStep);
        storageService.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());
        storageService.setItem(STORAGE_KEYS.IS_EDIT_MODE, isEditMode);
        storageService.setItem(STORAGE_KEYS.EDITING_EMPLOYEE_ID, editingEmployeeId);
      }
      
      return success;
    } catch (error) {
      console.error('Failed to save draft:', error);
      return false;
    }
  }
  
  loadDraft(): {
    data: EmployeeFormData | null;
    currentStep: number;
    timestamp: string | null;
    isEditMode: boolean;
    editingEmployeeId: string | null;
  } {
    const data = storageService.getItem<EmployeeFormData>(STORAGE_KEYS.DRAFT_DATA);
    const currentStep = storageService.getItem<number>(STORAGE_KEYS.CURRENT_STEP) || 1;
    const timestamp = storageService.getItem<string>(STORAGE_KEYS.TIMESTAMP);
    const isEditMode = storageService.getItem<boolean>(STORAGE_KEYS.IS_EDIT_MODE) || false;
    const editingEmployeeId = storageService.getItem<string>(STORAGE_KEYS.EDITING_EMPLOYEE_ID);
    
    return {
      data,
      currentStep,
      timestamp,
      isEditMode,
      editingEmployeeId,
    };
  }
  
  clearDraft(): boolean {
    storageService.removeItem(STORAGE_KEYS.DRAFT_DATA);
    storageService.removeItem(STORAGE_KEYS.CURRENT_STEP);
    storageService.removeItem(STORAGE_KEYS.TIMESTAMP);
    storageService.removeItem(STORAGE_KEYS.IS_EDIT_MODE);
    storageService.removeItem(STORAGE_KEYS.EDITING_EMPLOYEE_ID);
    return true;
  }
  
  hasDraft(): boolean {
    return storageService.getItem(STORAGE_KEYS.DRAFT_DATA) !== null;
  }
  
  getDraftAge(): number | null {
    const timestamp = storageService.getItem<string>(STORAGE_KEYS.TIMESTAMP);
    if (!timestamp) return null;
    
    const now = Date.now();
    const draftTime = parseInt(timestamp, 10);
    return now - draftTime;
  }
  
  isDraftExpired(maxAge: number = 7 * 24 * 60 * 60 * 1000): boolean {
    const age = this.getDraftAge();
    if (age === null) return true;
    return age > maxAge;
  }
  
  cleanupOldDrafts(): void {
    const age = this.getDraftAge();
    if (age && age > 30 * 24 * 60 * 60 * 1000) { // 30 days
      this.clearDraft();
    }
  }
  
  getDraftSummary(): {
    exists: boolean;
    currentStep: number;
    age: number | null;
    isExpired: boolean;
    isEditMode: boolean;
  } {
    const draft = this.loadDraft();
    const age = this.getDraftAge();
    
    return {
      exists: draft.data !== null,
      currentStep: draft.currentStep,
      age,
      isExpired: age ? age > 7 * 24 * 60 * 60 * 1000 : false,
      isEditMode: draft.isEditMode,
    };
  }
}

export const draftService = new DraftService();
```

## Debounced Auto-Save

### Debounce Hook
```typescript
// hooks/useDebounce.ts
import { useEffect, useRef } from 'react';

export function useDebounce<T>(
  value: T,
  delay: number,
  callback: (value: T) => void
): void {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(value);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);
}
```

### Auto-Save Hook
```typescript
// hooks/useAutoSave.ts
import { useEffect } from 'react';
import { useEmployeeForm } from './useEmployeeForm';
import { draftService } from '../utils/draftService';
import { useDebounce } from './useDebounce';

export function useAutoSave(delay: number = 2000) {
  const {
    formData,
    currentStep,
    isEditMode,
    editingEmployeeId,
  } = useEmployeeForm();
  
  const saveDraft = () => {
    draftService.saveDraft(
      formData,
      currentStep,
      isEditMode,
      editingEmployeeId
    );
  };
  
  useDebounce(formData, delay, saveDraft);
  
  // Also save on step change
  useEffect(() => {
    saveDraft();
  }, [currentStep]);
}
```

## React Hook Integration

### Storage Hook
```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';
import { draftService } from '../utils/draftService';
import type { EmployeeFormData } from '../types/employeeForm.types';

interface UseLocalStorageReturn {
  draftData: EmployeeFormData | null;
  currentStep: number;
  hasDraft: boolean;
  draftAge: number | null;
  isDraftExpired: boolean;
  loadDraft: () => void;
  clearDraft: () => void;
  saveDraft: (data: EmployeeFormData, step: number) => boolean;
  draftSummary: DraftSummary;
}

interface DraftSummary {
  exists: boolean;
  currentStep: number;
  age: number | null;
  isExpired: boolean;
  isEditMode: boolean;
}

export function useLocalStorage(): UseLocalStorageReturn {
  const [draftData, setDraftData] = useState<EmployeeFormData | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const [draftAge, setDraftAge] = useState<number | null>(null);
  const [isDraftExpired, setIsDraftExpired] = useState<boolean>(false);
  const [draftSummary, setDraftSummary] = useState<DraftSummary>({
    exists: false,
    currentStep: 1,
    age: null,
    isExpired: false,
    isEditMode: false,
  });
  
  const loadDraft = useCallback(() => {
    const draft = draftService.loadDraft();
    setDraftData(draft.data);
    setCurrentStep(draft.currentStep);
    setHasDraft(draft.data !== null);
    setDraftAge(draft.timestamp ? Date.now() - parseInt(draft.timestamp, 10) : null);
    setIsDraftExpired(draftService.isDraftExpired());
    setDraftSummary(draftService.getDraftSummary());
  }, []);
  
  const clearDraft = useCallback(() => {
    draftService.clearDraft();
    setDraftData(null);
    setCurrentStep(1);
    setHasDraft(false);
    setDraftAge(null);
    setIsDraftExpired(false);
    setDraftSummary({
      exists: false,
      currentStep: 1,
      age: null,
      isExpired: false,
      isEditMode: false,
    });
  }, []);
  
  const saveDraft = useCallback((data: EmployeeFormData, step: number): boolean => {
    const success = draftService.saveDraft(data, step);
    if (success) {
      setDraftData(data);
      setCurrentStep(step);
      setHasDraft(true);
      setDraftAge(Date.now());
      setIsDraftExpired(false);
    }
    return success;
  }, []);
  
  // Initial load
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);
  
  // Periodic check for draft expiration
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasDraft) {
        const expired = draftService.isDraftExpired();
        setIsDraftExpired(expired);
        setDraftSummary(draftService.getDraftSummary());
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [hasDraft]);
  
  return {
    draftData,
    currentStep,
    hasDraft,
    draftAge,
    isDraftExpired,
    loadDraft,
    clearDraft,
    saveDraft,
    draftSummary,
  };
}
```

## Error Handling

### Storage Error Handler
```typescript
// utils/storageErrorHandler.ts
export class StorageError extends Error {
  constructor(
    message: string,
    public code: 'QUOTA_EXCEEDED' | 'ACCESS_DENIED' | 'INVALID_DATA' | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export function handleStorageError(error: unknown): StorageError {
  if (error instanceof DOMException) {
    if (error.name === 'QuotaExceededError') {
      return new StorageError(
        'Storage quota exceeded. Please clear some data.',
        'QUOTA_EXCEEDED'
      );
    }
    if (error.name === 'SecurityError') {
      return new StorageError(
        'Storage access denied. Please check your browser settings.',
        'ACCESS_DENIED'
      );
    }
  }
  
  if (error instanceof SyntaxError) {
    return new StorageError(
      'Invalid data format in storage.',
      'INVALID_DATA'
    );
  }
  
  return new StorageError(
    'An unknown storage error occurred.',
    'UNKNOWN'
  );
}

export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}
```

### Error Boundary Component
```typescript
// components/StorageErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { handleStorageError, isStorageAvailable } from '../utils/storageErrorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: string | null;
  storageAvailable: boolean;
}

export class StorageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      storageAvailable: isStorageAvailable(),
    };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error: error.message,
      storageAvailable: isStorageAvailable(),
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const storageError = handleStorageError(error);
    console.error('Storage error caught:', storageError);
  }
  
  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="storage-error">
          <h2>Storage Error</h2>
          {!this.state.storageAvailable && (
            <p>
              Local storage is not available in your browser. 
              The form will not save drafts automatically.
            </p>
          )}
          {this.state.error && <p>Error: {this.state.error}</p>}
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## Storage Events

### Cross-Tab Synchronization
```typescript
// hooks/useStorageSync.ts
import { useEffect } from 'react';

export function useStorageSync(callback: () => void) {
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.startsWith('swifthr_employeeForm')) {
        callback();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [callback]);
}
```

## Testing Utilities

### Mock Storage Service
```typescript
// utils/mockStorageService.ts
class MockStorageService {
  private storage: Map<string, string> = new Map();
  
  setItem<T>(key: string, value: T): boolean {
    try {
      const serializedValue = JSON.stringify(value);
      this.storage.set(key, serializedValue);
      return true;
    } catch (error) {
      console.error(`Failed to set ${key}:`, error);
      return false;
    }
  }
  
  getItem<T>(key: string): T | null {
    try {
      const item = this.storage.get(key);
      if (item === undefined) return null;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      return null;
    }
  }
  
  removeItem(key: string): boolean {
    try {
      this.storage.delete(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      return false;
    }
  }
  
  clear(): boolean {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }
  
  // Test helpers
  getStorageSize(): number {
    let total = 0;
    this.storage.forEach((value, key) => {
      total += value.length + key.length;
    });
    return total;
  }
  
  simulateQuotaExceeded(): void {
    // Fill storage to simulate quota exceeded
    const largeData = 'x'.repeat(5 * 1024 * 1024); // 5MB
    this.setItem('large_data', largeData);
  }
}

export const mockStorageService = new MockStorageService();
```

## Usage Examples

### Basic Usage
```typescript
// EmployeeForm.tsx
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAutoSave } from '../hooks/useAutoSave';

const EmployeeForm = () => {
  const {
    draftData,
    currentStep,
    hasDraft,
    isDraftExpired,
    loadDraft,
    clearDraft,
  } = useLocalStorage();
  
  const { formData, setCurrentStep } = useEmployeeForm();
  
  // Enable auto-save with 2-second debounce
  useAutoSave(2000);
  
  useEffect(() => {
    if (hasDraft && !isDraftExpired) {
      // Prompt user to restore draft
      const shouldRestore = window.confirm(
        'A saved draft was found. Would you like to restore it?'
      );
      if (shouldRestore) {
        loadDraft();
      } else {
        clearDraft();
      }
    } else if (isDraftExpired) {
      // Inform user about expired draft
      clearDraft();
    }
  }, [hasDraft, isDraftExpired, loadDraft, clearDraft]);
  
  return (
    <div>
      {/* Form implementation */}
    </div>
  );
};
```

### With Error Boundary
```typescript
// App.tsx
import { StorageErrorBoundary } from './components/StorageErrorBoundary';
import { EmployeeForm } from './features/employeeForm/EmployeeForm';

function App() {
  return (
    <StorageErrorBoundary>
      <EmployeeForm />
    </StorageErrorBoundary>
  );
}
```

## Benefits of This Design

1. **Reliability**: Comprehensive error handling for storage operations
2. **Performance**: Debounced auto-save to prevent excessive writes
3. **User Experience**: Draft restoration and expiration handling
4. **Cross-Tab**: Synchronization across browser tabs
5. **Testability**: Mock service for unit testing
6. **Type Safety**: Full TypeScript support
7. **Flexibility**: Easy to extend with additional storage features
8. **Monitoring**: Storage quota tracking and cleanup
9. **Recovery**: Error boundary for graceful degradation
10. **Privacy**: Prefixed keys to avoid conflicts

## Storage Limitations and Mitigations

### Known Limitations
- **Size Limit**: ~5MB per domain
- **Synchronous**: Operations block main thread
- **String Only**: Must serialize/deserialize objects
- **No Expiration**: Manual cleanup required
- **Security**: Accessible via JavaScript

### Mitigations
- **Quota Monitoring**: Track usage and cleanup old data
- **Debouncing**: Reduce write frequency
- **Compression**: Consider compression for large data
- **Error Handling**: Graceful degradation when unavailable
- **Validation**: Data integrity checks on load
- **Fallback**: Offer alternative storage if needed