// FormStep3 Component - Additional Details (Placeholder)
import React from 'react';
import { FormNavigation } from './FormNavigation';

export const FormStep3: React.FC = () => {
  const handleNext = () => {
    console.log('Step 3 next - to be implemented');
  };
  
  const handleCancel = () => {
    console.log('Step 3 cancel - to be implemented');
  };
  
  return (
    <div className="form-step">
      <h2>Additional Details</h2>
      <p style={{ color: '#6B7280', padding: '20px' }}>
        Additional Details form fields will be implemented in the next phase.
        This includes: Emergency Contact, Bank Information, and Document Upload.
      </p>
      <FormNavigation
        currentStep={3}
        totalSteps={4}
        isValid={true}
        onNext={handleNext}
        onPrevious={() => console.log('Back')}
        onCancel={handleCancel}
      />
    </div>
  );
};