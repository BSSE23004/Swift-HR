# FE-16: Component Structure Documentation

## Overview
This document provides the complete component structure and implementation details for the Add/Edit Employee Form feature.

## Component Hierarchy

```
EmployeeForm (Main Container)
├── FormProgress
├── FormStep1 (Personal Information)
│   ├── PersonalInfoFields
│   └── FormNavigation
├── FormStep2 (Professional Information)
│   ├── ProfessionalInfoFields
│   ├── EducationFields (Dynamic Array)
│   ├── SkillsInput
│   └── FormNavigation
├── FormStep3 (Additional Details)
│   ├── AdditionalDetailsFields
│   ├── DocumentUpload
│   └── FormNavigation
├── FormStep4 (Review & Submit)
│   ├── ReviewSection (Personal)
│   ├── ReviewSection (Professional)
│   ├── ReviewSection (Additional)
│   └── FormNavigation
└── CancelConfirmationDialog
```

## Folder Structure

```
src/features/employeeForm/
├── components/
│   ├── EmployeeForm.tsx
│   ├── FormProgress.tsx
│   ├── FormNavigation.tsx
│   ├── CancelConfirmationDialog.tsx
│   ├── FormStep1.tsx
│   ├── FormStep2.tsx
│   ├── FormStep3.tsx
│   ├── FormStep4.tsx
│   ├── PersonalInfoFields.tsx
│   ├── ProfessionalInfoFields.tsx
│   ├── AdditionalDetailsFields.tsx
│   ├── EducationFields.tsx
│   ├── SkillsInput.tsx
│   ├── DocumentUpload.tsx
│   └── ReviewSection.tsx
├── hooks/
│   ├── useEmployeeForm.ts
│   ├── useFormValidation.ts
│   ├── useAutoSave.ts
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
├── utils/
│   ├── validation.ts
│   ├── storageService.ts
│   ├── draftService.ts
│   ├── storageErrorHandler.ts
│   └── formatters.ts
├── types/
│   └── employeeForm.types.ts
├── constants/
│   ├── storageKeys.ts
│   ├── validationRules.ts
│   └── dropdownOptions.ts
└── index.ts
```

## Component Specifications

### EmployeeForm.tsx (Main Container)
```typescript
// components/EmployeeForm.tsx
import React, { useEffect } from 'react';
import { useEmployeeForm } from '../hooks/useEmployeeForm';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAutoSave } from '../hooks/useAutoSave';
import { FormProgress } from './FormProgress';
import { FormStep1 } from './FormStep1';
import { FormStep2 } from './FormStep2';
import { FormStep3 } from './FormStep3';
import { FormStep4 } from './FormStep4';
import { CancelConfirmationDialog } from './CancelConfirmationDialog';

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
  
  const {
    hasDraft,
    isDraftExpired,
    loadDraft: loadFromStorage,
    clearDraft: clearFromStorage,
  } = useLocalStorage();
  
  // Enable auto-save
  useAutoSave(2000);
  
  // Handle draft restoration on mount
  useEffect(() => {
    if (hasDraft && !isDraftExpired) {
      const shouldRestore = window.confirm(
        'A saved draft was found. Would you like to restore it?'
      );
      if (shouldRestore) {
        loadFromStorage();
        loadDraft();
      } else {
        clearFromStorage();
        clearDraft();
      }
    } else if (isDraftExpired) {
      clearFromStorage();
      clearDraft();
    }
  }, [hasDraft, isDraftExpired]);
  
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
    if (hasDraft) {
      showCancelDialog();
    } else {
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
      <div className="success-message">
        <h2>Employee {formData.isEditMode ? 'Updated' : 'Added'} Successfully!</h2>
        <button onClick={resetForm}>Add Another Employee</button>
      </div>
    );
  }
  
  return (
    <div className="employee-form">
      <FormProgress currentStep={currentStep} totalSteps={4} />
      
      {currentStep === 1 && <FormStep1 />}
      {currentStep === 2 && <FormStep2 />}
      {currentStep === 3 && <FormStep3 />}
      {currentStep === 4 && <FormStep4 onSubmit={handleSubmit} />}
      
      <CancelConfirmationDialog
        isOpen={showCancelConfirmation}
        onConfirm={confirmCancel}
        onCancel={hideCancelConfirmation}
      />
    </div>
  );
};
```

### FormProgress.tsx
```typescript
// components/FormProgress.tsx
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
        {steps.map((step) => (
          <div
            key={step.number}
            className={`progress-step ${step.number <= currentStep ? 'active' : ''} ${step.number === currentStep ? 'current' : ''}`}
          >
            <div className="step-number">{step.number}</div>
            <div className="step-title">{step.title}</div>
            {step.number < totalSteps && <div className="step-connector" />}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### FormNavigation.tsx
```typescript
// components/FormNavigation.tsx
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
```

### FormStep1.tsx (Personal Information)
```typescript
// components/FormStep1.tsx
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
    handleCancel,
  } = useEmployeeForm();
  
  const isValid = Object.keys(validationErrors).filter(
    key => key.startsWith('personalInfo')
  ).length === 0;
  
  const handleNext = () => {
    if (validateStep(1)) {
      nextStep();
    }
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
    </div>
  );
};
```

### PersonalInfoFields.tsx
```typescript
// components/PersonalInfoFields.tsx
import React from 'react';
import type { PersonalInfo } from '../types/employeeForm.types';

interface PersonalInfoFieldsProps {
  data: PersonalInfo;
  errors: Record<string, string>;
  onChange: (data: Partial<PersonalInfo>) => void;
}

export const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({
  data,
  errors,
  onChange,
}) => {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ [field]: value });
  };
  
  return (
    <div className="personal-info-fields">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            value={data.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={errors['personalInfo.firstName'] ? 'error' : ''}
          />
          {errors['personalInfo.firstName'] && (
            <span className="error-message">{errors['personalInfo.firstName']}</span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            value={data.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={errors['personalInfo.lastName'] ? 'error' : ''}
          />
          {errors['personalInfo.lastName'] && (
            <span className="error-message">{errors['personalInfo.lastName']}</span>
          )}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          value={data.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={errors['personalInfo.email'] ? 'error' : ''}
        />
        {errors['personalInfo.email'] && (
          <span className="error-message">{errors['personalInfo.email']}</span>
        )}
      </div>
      
      {/* Additional fields following similar pattern */}
    </div>
  );
};
```

### FormStep2.tsx (Professional Information)
```typescript
// components/FormStep2.tsx
import React from 'react';
import { useEmployeeForm } from '../hooks/useEmployeeForm';
import { ProfessionalInfoFields } from './ProfessionalInfoFields';
import { EducationFields } from './EducationFields';
import { SkillsInput } from './SkillsInput';
import { FormNavigation } from './FormNavigation';

export const FormStep2: React.FC = () => {
  const {
    formData,
    validationErrors,
    updateProfessionalInfo,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    removeSkill,
    nextStep,
    previousStep,
    validateStep,
    handleCancel,
  } = useEmployeeForm();
  
  const isValid = Object.keys(validationErrors).filter(
    key => key.startsWith('professionalInfo')
  ).length === 0;
  
  const handleNext = () => {
    if (validateStep(2)) {
      nextStep();
    }
  };
  
  return (
    <div className="form-step">
      <h2>Professional Information</h2>
      <ProfessionalInfoFields
        data={formData.professionalInfo}
        errors={validationErrors}
        onChange={updateProfessionalInfo}
      />
      
      <EducationFields
        education={formData.professionalInfo.education}
        onAdd={addEducation}
        onUpdate={updateEducation}
        onRemove={removeEducation}
      />
      
      <SkillsInput
        skills={formData.professionalInfo.skills}
        onAdd={addSkill}
        onRemove={removeSkill}
      />
      
      <FormNavigation
        currentStep={2}
        totalSteps={4}
        isValid={isValid}
        onNext={handleNext}
        onPrevious={previousStep}
        onCancel={handleCancel}
      />
    </div>
  );
};
```

### EducationFields.tsx (Dynamic Array)
```typescript
// components/EducationFields.tsx
import React from 'react';
import type { EducationEntry } from '../types/employeeForm.types';

interface EducationFieldsProps {
  education: EducationEntry[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof EducationEntry, value: string) => void;
  onRemove: (id: string) => void;
}

export const EducationFields: React.FC<EducationFieldsProps> = ({
  education,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  return (
    <div className="education-fields">
      <h3>Education</h3>
      {education.map((edu) => (
        <div key={edu.id} className="education-entry">
          <div className="form-row">
            <div className="form-group">
              <label>Institution</label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => onUpdate(edu.id, 'institution', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Degree</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => onUpdate(edu.id, 'degree', e.target.value)}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(edu.id)}
            className="btn btn-danger"
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={onAdd} className="btn btn-secondary">
        Add Education
      </button>
    </div>
  );
};
```

### SkillsInput.tsx
```typescript
// components/SkillsInput.tsx
import React, { useState } from 'react';

interface SkillsInputProps {
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (skill: string) => void;
}

export const SkillsInput: React.FC<SkillsInputProps> = ({ skills, onAdd, onRemove }) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleAdd = () => {
    if (inputValue.trim() && !skills.includes(inputValue.trim())) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };
  
  return (
    <div className="skills-input">
      <h3>Skills</h3>
      <div className="skills-container">
        {skills.map((skill) => (
          <div key={skill} className="skill-tag">
            {skill}
            <button
              type="button"
              onClick={() => onRemove(skill)}
              className="skill-remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="skill-input-row">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a skill"
        />
        <button type="button" onClick={handleAdd} className="btn btn-secondary">
          Add
        </button>
      </div>
    </div>
  );
};
```

### FormStep3.tsx (Additional Details)
```typescript
// components/FormStep3.tsx
import React from 'react';
import { useEmployeeForm } from '../hooks/useEmployeeForm';
import { AdditionalDetailsFields } from './AdditionalDetailsFields';
import { DocumentUpload } from './DocumentUpload';
import { FormNavigation } from './FormNavigation';

export const FormStep3: React.FC = () => {
  const {
    formData,
    validationErrors,
    updateAdditionalDetails,
    addDocument,
    removeDocument,
    nextStep,
    previousStep,
    validateStep,
    handleCancel,
  } = useEmployeeForm();
  
  const isValid = Object.keys(validationErrors).filter(
    key => key.startsWith('additionalDetails')
  ).length === 0;
  
  const handleNext = () => {
    if (validateStep(3)) {
      nextStep();
    }
  };
  
  return (
    <div className="form-step">
      <h2>Additional Details</h2>
      <AdditionalDetailsFields
        data={formData.additionalDetails}
        errors={validationErrors}
        onChange={updateAdditionalDetails}
      />
      
      <DocumentUpload
        documents={formData.additionalDetails.documents}
        onAdd={addDocument}
        onRemove={removeDocument}
      />
      
      <FormNavigation
        currentStep={3}
        totalSteps={4}
        isValid={isValid}
        onNext={handleNext}
        onPrevious={previousStep}
        onCancel={handleCancel}
      />
    </div>
  );
};
```

### DocumentUpload.tsx
```typescript
// components/DocumentUpload.tsx
import React, { useRef } from 'react';
import type { DocumentInfo } from '../types/employeeForm.types';

interface DocumentUploadProps {
  documents: DocumentInfo[];
  onAdd: (document: DocumentInfo) => void;
  onRemove: (id: string) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documents,
  onAdd,
  onRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const document: DocumentInfo = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
      onAdd(document);
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <div className="document-upload">
      <h3>Documents</h3>
      <div className="upload-area">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-secondary"
        >
          Upload Document
        </button>
      </div>
      
      <div className="documents-list">
        {documents.map((doc) => (
          <div key={doc.id} className="document-item">
            <span>{doc.name}</span>
            <span>{formatFileSize(doc.size)}</span>
            <button
              type="button"
              onClick={() => onRemove(doc.id)}
              className="btn btn-danger"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### FormStep4.tsx (Review & Submit)
```typescript
// components/FormStep4.tsx
import React from 'react';
import { useEmployeeForm } from '../hooks/useEmployeeForm';
import { ReviewSection } from './ReviewSection';
import { FormNavigation } from './FormNavigation';

interface FormStep4Props {
  onSubmit: () => void;
}

export const FormStep4: React.FC<FormStep4Props> = ({ onSubmit }) => {
  const {
    formData,
    previousStep,
    validateAllSteps,
    handleCancel,
    isSubmitting,
  } = useEmployeeForm();
  
  const handleSubmit = () => {
    if (validateAllSteps()) {
      onSubmit();
    }
  };
  
  return (
    <div className="form-step">
      <h2>Review & Submit</h2>
      
      <ReviewSection
        title="Personal Information"
        data={formData.personalInfo}
        onEdit={() => {}} // Would navigate to step 1
      />
      
      <ReviewSection
        title="Professional Information"
        data={formData.professionalInfo}
        onEdit={() => {}} // Would navigate to step 2
      />
      
      <ReviewSection
        title="Additional Details"
        data={formData.additionalDetails}
        onEdit={() => {}} // Would navigate to step 3
      />
      
      <FormNavigation
        currentStep={4}
        totalSteps={4}
        isValid={true}
        onNext={handleSubmit}
        onPrevious={previousStep}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
```

### ReviewSection.tsx
```typescript
// components/ReviewSection.tsx
import React from 'react';

interface ReviewSectionProps {
  title: string;
  data: any;
  onEdit: () => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ title, data, onEdit }) => {
  return (
    <div className="review-section">
      <div className="review-header">
        <h3>{title}</h3>
        <button type="button" onClick={onEdit} className="btn btn-link">
          Edit
        </button>
      </div>
      <div className="review-content">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="review-item">
            <span className="review-label">{formatLabel(key)}:</span>
            <span className="review-value">{formatValue(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatLabel = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const formatValue = (value: any): string => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return String(value || '-');
};
```

### CancelConfirmationDialog.tsx
```typescript
// components/CancelConfirmationDialog.tsx
import React from 'react';

interface CancelConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CancelConfirmationDialog: React.FC<CancelConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>Cancel Form?</h2>
        <p>
          You have unsaved changes. Are you sure you want to cancel?
        </p>
        <div className="dialog-actions">
          <button onClick={onCancel} className="btn btn-secondary">
            No, Keep Editing
          </button>
          <button onClick={onConfirm} className="btn btn-danger">
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
```

## Styling Approach

### CSS Variables (Design Tokens)
```css
:root {
  /* Colors */
  --color-primary: #09B2A0;
  --color-primary-light: #41BFAA;
  --color-white: #FFFFFF;
  --color-bg-light: #F8FAFC;
  --color-bg-medium: #F6F6F7;
  --color-text-dark: #042334;
  --color-text-medium: #21272A;
  --color-error: #DC2626;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  
  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  
  /* Typography */
  --font-family: 'Inter', system-ui, sans-serif;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
}
```

### Component CSS Structure
```css
/* Employee Form Container */
.employee-form {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-8);
  background: var(--color-white);
  border-radius: var(--radius-md);
}

/* Progress Bar */
.form-progress {
  margin-bottom: var(--space-8);
}

.progress-bar {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-bg-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.progress-step.active .step-number {
  background: var(--color-primary);
  color: var(--color-white);
}

.progress-step.current .step-number {
  border: 2px solid var(--color-primary);
}

/* Form Fields */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  font-size: var(--font-size-base);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid #E5E5E5;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: var(--color-error);
}

.error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
}

/* Buttons */
.btn {
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover {
  background: var(--color-primary-light);
}

.btn-secondary {
  background: var(--color-white);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-secondary:hover {
  background: var(--color-bg-light);
}

.btn-danger {
  background: var(--color-error);
  color: var(--color-white);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Navigation */
.form-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-bg-medium);
}

.navigation-buttons {
  display: flex;
  gap: var(--space-4);
}

/* Skills Tags */
.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.skill-tag {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-light);
  border-radius: var(--radius-sm);
}

.skill-remove {
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

/* Dialog */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: var(--color-white);
  padding: var(--space-8);
  border-radius: var(--radius-md);
  max-width: 400px;
  width: 100%;
}

.dialog-actions {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-6);
  justify-content: flex-end;
}
```

## Implementation Priority

### Phase 1: Core Structure (Day 1)
1. EmployeeForm container
2. FormProgress component
3. FormNavigation component
4. Basic form structure

### Phase 2: Step 1 (Day 2)
1. FormStep1 component
2. PersonalInfoFields component
3. Personal info validation
4. Integration with Redux

### Phase 3: Step 2 (Day 3)
1. FormStep2 component
2. ProfessionalInfoFields component
3. EducationFields dynamic array
4. SkillsInput component

### Phase 4: Step 3 (Day 4)
1. FormStep3 component
2. AdditionalDetailsFields component
3. DocumentUpload component

### Phase 5: Step 4 (Day 5)
1. FormStep4 component
2. ReviewSection component
3. Final submission logic
4. Success state

### Phase 6: Integration (Day 6)
1. Local storage integration
2. Auto-save functionality
3. Cancel confirmation
4. Error handling
5. Styling and polish

## Testing Strategy

### Unit Tests
- Component rendering
- User interactions
- Form validation
- Redux actions

### Integration Tests
- Multi-step navigation
- Draft saving/loading
- Form submission
- Error scenarios

### E2E Tests
- Complete form flow
- Draft restoration
- Edit mode
- Responsive design

This component structure provides a solid foundation for implementing the Add/Edit Employee Form with clear separation of concerns, type safety, and maintainability.