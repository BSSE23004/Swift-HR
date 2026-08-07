// Custom Hook for Employee Form
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import * as actions from '../store/employeeFormSlice';
import type { EmployeeFormData, EducationEntry, DocumentInfo } from '../types/employeeForm.types';

export const useEmployeeForm = () => {
  const dispatch = useAppDispatch();
  
  const state = useAppSelector(state => state.employeeForm);
  
  return {
    // State
    currentStep: state.currentStep,
    totalSteps: state.totalSteps,
    formData: state.formData,
    validationErrors: state.validationErrors,
    stepValidation: state.stepValidation,
    isSubmitting: state.isSubmitting,
    submitSuccess: state.submitSuccess,
    submitError: state.submitError,
    isEditMode: state.isEditMode,
    editingEmployeeId: state.editingEmployeeId,
    hasDraft: state.hasDraft,
    lastSaved: state.lastSaved,
    showCancelConfirmation: state.showCancelConfirmation,
    
    // Navigation Actions
    setCurrentStep: (step: number) => dispatch(actions.setCurrentStep(step)),
    nextStep: () => dispatch(actions.nextStep()),
    previousStep: () => dispatch(actions.previousStep()),
    goToStep: (step: number) => dispatch(actions.goToStep(step)),
    
    // Form Data Actions
    updatePersonalInfo: (data: Partial<EmployeeFormData['personalInfo']>) => 
      dispatch(actions.updatePersonalInfo(data)),
    updateProfessionalInfo: (data: Partial<EmployeeFormData['professionalInfo']>) => 
      dispatch(actions.updateProfessionalInfo(data)),
    updateAdditionalDetails: (data: Partial<EmployeeFormData['additionalDetails']>) => 
      dispatch(actions.updateAdditionalDetails(data)),
    
    // Dynamic Field Actions
    addSkill: (skill: string) => dispatch(actions.addSkill(skill)),
    removeSkill: (skill: string) => dispatch(actions.removeSkill(skill)),
    
    addEducation: () => dispatch(actions.addEducation()),
    updateEducation: (id: string, field: keyof EducationEntry, value: string) => 
      dispatch(actions.updateEducation({ id, field, value })),
    removeEducation: (id: string) => dispatch(actions.removeEducation(id)),
    
    addDocument: (doc: DocumentInfo) => dispatch(actions.addDocument(doc)),
    removeDocument: (id: string) => dispatch(actions.removeDocument(id)),
    
    // Validation Actions
    setValidationError: (field: string, error: string) => 
      dispatch(actions.setValidationError({ field, error })),
    clearValidationError: (field: string) => dispatch(actions.clearValidationError(field)),
    clearAllValidationErrors: () => dispatch(actions.clearAllValidationErrors()),
    validateStep: (step: number) => dispatch(actions.validateStep(step)),
    validateAllSteps: () => dispatch(actions.validateAllSteps()),
    
    // Submission Actions
    submitFormStart: () => dispatch(actions.submitFormStart()),
    submitFormSuccess: () => dispatch(actions.submitFormSuccess()),
    submitFormFailure: (error: string) => dispatch(actions.submitFormFailure(error)),
    
    // Draft Actions
    saveDraft: () => dispatch(actions.saveDraft()),
    loadDraft: () => dispatch(actions.loadDraft()),
    clearDraft: () => dispatch(actions.clearDraft()),
    
    // Edit Mode Actions
    setEditMode: (isEditMode: boolean, employeeId?: string) => 
      dispatch(actions.setEditMode({ isEditMode, employeeId })),
    loadEmployeeForEdit: (data: EmployeeFormData) => dispatch(actions.loadEmployeeForEdit(data)),
    resetForm: () => dispatch(actions.resetForm()),
    
    // UI State Actions
    showCancelConfirmation: () => dispatch(actions.showCancelConfirmation()),
    hideCancelConfirmation: () => dispatch(actions.hideCancelConfirmation()),
  };
};