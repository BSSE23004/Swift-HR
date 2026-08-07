// Auto-Save Hook
import { useEffect } from 'react';
import { useEmployeeForm } from './useEmployeeForm';
import { draftService } from '../utils/draftService';

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
  
  // Save on form data changes (debounced in component)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft();
    }, delay);
    
    return () => clearTimeout(timer);
  }, [formData, delay]);
  
  // Save on step change immediately
  useEffect(() => {
    saveDraft();
  }, [currentStep]);
}