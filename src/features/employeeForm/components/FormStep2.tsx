// FormStep2 Component - Professional Information (Placeholder)
import React from 'react';
import { FormNavigation } from './FormNavigation';

export const FormStep2: React.FC = () => {
  const handleNext = () => {
    console.log('Step 2 next - to be implemented');
  };
  
  const handleCancel = () => {
    console.log('Step 2 cancel - to be implemented');
  };
  
  return (
    <div className="form-step">
      <h2>Professional Information</h2>
      <p style={{ color: '#6B7280', padding: '20px' }}>
        Professional Information form fields will be implemented in the next phase.
        This includes: Department, Position, Employment Type, Start Date, Skills, and Education.
      </p>
      <FormNavigation
        currentStep={2}
        totalSteps={4}
        isValid={true}
        onNext={handleNext}
        onPrevious={() => console.log('Back')}
        onCancel={handleCancel}
      />
    </div>
  );
};