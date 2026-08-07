// Draft Service
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