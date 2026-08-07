// EmployeeForm Main Container Component
import React, { useEffect } from 'react';
import { useEmployeeForm } from '../hooks/useEmployeeForm';
import { draftService } from '../utils/draftService';
import { useAutoSave } from '../hooks/useAutoSave';
import { FormProgress } from './FormProgress';
import { FormStep1 } from './FormStep1';
import { FormStep2 } from './FormStep2';
import { FormStep3 } from './FormStep3';
import { FormStep4 } from './FormStep4';

export const EmployeeForm: React.FC = () => {
  const {
    currentStep,
    formData,
    validationErrors,
    isSubmitting,
    submitSuccess,
    showCancelConfirmation,
    
    loadDraft,
    clearDraft,
    resetForm,
    showCancelConfirmation: showCancelDialog,
    hideCancelConfirmation,
    submitFormStart,
    submitFormSuccess,
    submitFormFailure,
  } = useEmployeeForm();
  
  // Enable auto-save with 2-second debounce
  useAutoSave(2000);
  
  // Handle draft restoration on mount
  useEffect(() => {
    const draftSummary = draftService.getDraftSummary();
    
    if (draftSummary.exists && !draftSummary.isExpired) {
      const shouldRestore = window.confirm(
        'A saved draft was found. Would you like to restore it?'
      );
      if (shouldRestore) {
        loadDraft();
      } else {
        draftService.clearDraft();
        clearDraft();
      }
    } else if (draftSummary.isExpired) {
      draftService.clearDraft();
      clearDraft();
    }
  }, []);
  
  const handleSubmit = async () => {
    submitFormStart();
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      submitFormSuccess();
      clearDraft();
    } catch (error) {
      submitFormFailure('Failed to submit form');
    }
  };
  
  const handleCancel = () => {
    const hasDraft = draftService.hasDraft();
    if (hasDraft) {
      showCancelDialog();
    } else {
      clearDraft();
      resetForm();
    }
  };
  
  const confirmCancel = () => {
    clearDraft();
    resetForm();
    hideCancelConfirmation();
  };
  
  if (submitSuccess) {
    return (
      <div className="employee-form">
        <div className="success-message">
          <h2>Employee {formData.isEditMode ? 'Updated' : 'Added'} Successfully!</h2>
          <p style={{ color: '#6B7280', marginBottom: '20px' }}>
            The employee information has been saved successfully.
          </p>
          <button onClick={resetForm} className="btn btn-primary">
            Add Another Employee
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="employee-form">
      <h1>{formData.isEditMode ? 'Edit Employee' : 'Add New Employee'}</h1>
      <FormProgress currentStep={currentStep} totalSteps={4} />
      
      {currentStep === 1 && <FormStep1 />}
      {currentStep === 2 && <FormStep2 />}
      {currentStep === 3 && <FormStep3 />}
      {currentStep === 4 && <FormStep4 onSubmit={handleSubmit} />}
      
      {showCancelConfirmation && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>Cancel Form?</h2>
            <p>
              You have unsaved changes. Are you sure you want to cancel?
            </p>
            <div className="dialog-actions">
              <button
                onClick={hideCancelConfirmation}
                className="btn btn-secondary"
              >
                No, Keep Editing
              </button>
              <button
                onClick={confirmCancel}
                className="btn btn-danger"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};