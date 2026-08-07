// FormProgress Component
import React from 'react';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const FormProgress: React.FC<FormProgressProps> = ({ currentStep, totalSteps }) => {
  const steps = [
    { number: 1, title: 'Personal Information' },
    { number: 2, title: 'Professional Information' },
    { number: 3, title: 'Additional Details' },
    { number: 4, title: 'Review & Submit' },
  ];
  
  return (
    <div className="form-progress">
      <div className="progress-bar">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className={`progress-step ${
              step.number < currentStep ? 'active' : ''
            } ${
              step.number === currentStep ? 'current' : ''
            }`}
          >
            <div className="step-number">{step.number}</div>
            <div className="step-title">{step.title}</div>
            {index < steps.length - 1 && <div className="step-connector" />}
          </div>
        ))}
      </div>
    </div>
  );
};