// FormStep1 Component - Personal Information
import React from 'react';
import { useEmployeeForm } from '../hooks/useEmployeeForm';
import { PersonalInfoFields } from './PersonalInfoFields';
import { FormNavigation } from './FormNavigation';

export const FormStep1: React.FC = () => {
  const {
    formData,
    validationErrors,
    updatePersonalInfo,
    nextStep,
    previousStep,
    validateStep,
    resetForm,
    showCancelConfirmation,
    hideCancelConfirmation,
  } = useEmployeeForm();
  
  const isValid = Object.keys(validationErrors).filter(
    key => key.startsWith('personalInfo')
  ).length === 0;
  
  const handleNext = () => {
    if (validateStep(1)) {
      nextStep();
    }
  };
  
  const handleCancel = () => {
    showCancelConfirmation();
  };
  
  const confirmCancel = () => {
    resetForm();
    hideCancelConfirmation();
  };
  
  return (
    <div className="form-step">
      <h2>Personal Information</h2>
      <PersonalInfoFields
        data={formData.personalInfo}
        errors={validationErrors}
        onChange={updatePersonalInfo}
      />
      <FormNavigation
        currentStep={1}
        totalSteps={4}
        isValid={isValid}
        onNext={handleNext}
        onPrevious={previousStep}
        onCancel={handleCancel}
      />
      
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