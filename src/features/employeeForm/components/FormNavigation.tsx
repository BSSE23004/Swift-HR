// FormNavigation Component
import React from 'react';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  isValid: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  currentStep,
  totalSteps,
  isValid,
  onNext,
  onPrevious,
  onCancel,
  isSubmitting = false,
}) => {
  return (
    <div className="form-navigation">
      <button
        type="button"
        onClick={onCancel}
        className="btn btn-secondary"
        disabled={isSubmitting}
      >
        Cancel
      </button>
      
      <div className="navigation-buttons">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={onPrevious}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Back
          </button>
        )}
        
        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={onNext}
            className="btn btn-primary"
            disabled={!isValid || isSubmitting}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="btn btn-primary"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
};