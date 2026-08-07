# FE-16: Redux Toolkit State Management Design

## Overview
This document details the Redux Toolkit state management architecture for the Add/Edit Employee Form feature.

## Store Structure

### Root Store Configuration
```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { employeeFormReducer } from './employeeFormSlice';

export const store = configureStore({
  reducer: {
    employeeForm: employeeFormReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['employeeForm/saveDraft'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## Employee Form Slice

### State Interface
```typescript
// employeeFormSlice.ts
interface EmployeeFormState {
  // Form Navigation
  currentStep: number;
  totalSteps: number;
  
  // Form Data
  formData: EmployeeFormData;
  
  // Validation
  validationErrors: Record<string, string>;
  stepValidation: Record<number, boolean>;
  
  // Form State
  isSubmitting: boolean;
  submitSuccess: boolean;
  submitError: string | null;
  
  // Edit Mode
  isEditMode: boolean;
  editingEmployeeId: string | null;
  
  // Draft State
  hasDraft: boolean;
  lastSaved: string | null;
  
  // UI State
  showCancelConfirmation: boolean;
}
```

### Form Data Structure
```typescript
interface EmployeeFormData {
  // Step 1: Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other' | '';
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Step 2: Professional Information
  professionalInfo: {
    employeeId: string;
    department: string;
    position: string;
    employmentType: 'full-time' | 'part-time' | 'contract' | '';
    startDate: string;
    reportingManager: string;
    workLocation: string;
    skills: string[];
    education: EducationEntry[];
  };
  
  // Step 3: Additional Details
  additionalDetails: {
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    taxId: string;
    notes: string;
    documents: DocumentInfo[];
  };
}

interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  year: string;
}

interface DocumentInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}
```

### Initial State
```typescript
const initialState: EmployeeFormState = {
  currentStep: 1,
  totalSteps: 4,
  
  formData: {
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    professionalInfo: {
      employeeId: '',
      department: '',
      position: '',
      employmentType: '',
      startDate: '',
      reportingManager: '',
      workLocation: '',
      skills: [],
      education: [],
    },
    additionalDetails: {
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      taxId: '',
      notes: '',
      documents: [],
    },
  },
  
  validationErrors: {},
  stepValidation: {
    1: false,
    2: false,
    3: false,
    4: false,
  },
  
  isSubmitting: false,
  submitSuccess: false,
  submitError: null,
  
  isEditMode: false,
  editingEmployeeId: null,
  
  hasDraft: false,
  lastSaved: null,
  
  showCancelConfirmation: false,
};
```

## Actions

### Navigation Actions
```typescript
setCurrentStep: (state, action: PayloadAction<number>) => {
  state.currentStep = action.payload;
};

nextStep: (state) => {
  if (state.currentStep < state.totalSteps) {
    state.currentStep += 1;
  }
};

previousStep: (state) => {
  if (state.currentStep > 1) {
    state.currentStep -= 1;
  }
};

goToStep: (state, action: PayloadAction<number>) => {
  if (action.payload >= 1 && action.payload <= state.totalSteps) {
    state.currentStep = action.payload;
  }
};
```

### Form Data Actions
```typescript
updatePersonalInfo: (state, action: PayloadAction<Partial<EmployeeFormData['personalInfo']>>) => {
  state.formData.personalInfo = {
    ...state.formData.personalInfo,
    ...action.payload,
  };
  // Clear validation errors for updated fields
  Object.keys(action.payload).forEach(key => {
    delete state.validationErrors[`personalInfo.${key}`];
  });
};

updateProfessionalInfo: (state, action: PayloadAction<Partial<EmployeeFormData['professionalInfo']>>) => {
  state.formData.professionalInfo = {
    ...state.formData.professionalInfo,
    ...action.payload,
  };
  Object.keys(action.payload).forEach(key => {
    delete state.validationErrors[`professionalInfo.${key}`];
  });
};

updateAdditionalDetails: (state, action: PayloadAction<Partial<EmployeeFormData['additionalDetails']>>) => {
  state.formData.additionalDetails = {
    ...state.formData.additionalDetails,
    ...action.payload,
  };
  Object.keys(action.payload).forEach(key => {
    delete state.validationErrors[`additionalDetails.${key}`];
  });
};
```

### Dynamic Field Actions
```typescript
addSkill: (state, action: PayloadAction<string>) => {
  if (!state.formData.professionalInfo.skills.includes(action.payload)) {
    state.formData.professionalInfo.skills.push(action.payload);
  }
};

removeSkill: (state, action: PayloadAction<string>) => {
  state.formData.professionalInfo.skills = state.formData.professionalInfo.skills.filter(
    skill => skill !== action.payload
  );
};

addEducation: (state) => {
  const newEducation: EducationEntry = {
    id: Date.now().toString(),
    institution: '',
    degree: '',
    field: '',
    year: '',
  };
  state.formData.professionalInfo.education.push(newEducation);
};

updateEducation: (state, action: PayloadAction<{ id: string; field: keyof EducationEntry; value: string }>) => {
  const { id, field, value } = action.payload;
  const education = state.formData.professionalInfo.education.find(edu => edu.id === id);
  if (education) {
    education[field] = value;
  }
};

removeEducation: (state, action: PayloadAction<string>) => {
  state.formData.professionalInfo.education = state.formData.professionalInfo.education.filter(
    edu => edu.id !== action.payload
  );
};

addDocument: (state, action: PayloadAction<DocumentInfo>) => {
  state.formData.additionalDetails.documents.push(action.payload);
};

removeDocument: (state, action: PayloadAction<string>) => {
  state.formData.additionalDetails.documents = state.formData.additionalDetails.documents.filter(
    doc => doc.id !== action.payload
  );
};
```

### Validation Actions
```typescript
setValidationError: (state, action: PayloadAction<{ field: string; error: string }>) => {
  const { field, error } = action.payload;
  state.validationErrors[field] = error;
};

clearValidationError: (state, action: PayloadAction<string>) => {
  delete state.validationErrors[action.payload];
};

clearAllValidationErrors: (state) => {
  state.validationErrors = {};
};

validateStep: (state, action: PayloadAction<number>) => {
  const step = action.payload;
  let isValid = true;
  const errors: Record<string, string> = {};
  
  if (step === 1) {
    const personalErrors = validatePersonalInfo(state.formData.personalInfo);
    Object.assign(errors, personalErrors);
    isValid = Object.keys(personalErrors).length === 0;
  } else if (step === 2) {
    const professionalErrors = validateProfessionalInfo(state.formData.professionalInfo);
    Object.assign(errors, professionalErrors);
    isValid = Object.keys(professionalErrors).length === 0;
  } else if (step === 3) {
    const additionalErrors = validateAdditionalDetails(state.formData.additionalDetails);
    Object.assign(errors, additionalErrors);
    isValid = Object.keys(additionalErrors).length === 0;
  }
  
  state.validationErrors = { ...state.validationErrors, ...errors };
  state.stepValidation[step] = isValid;
};

validateAllSteps: (state) => {
  let allValid = true;
  
  // Validate step 1
  const personalErrors = validatePersonalInfo(state.formData.personalInfo);
  state.stepValidation[1] = Object.keys(personalErrors).length === 0;
  if (!state.stepValidation[1]) allValid = false;
  
  // Validate step 2
  const professionalErrors = validateProfessionalInfo(state.formData.professionalInfo);
  state.stepValidation[2] = Object.keys(professionalErrors).length === 0;
  if (!state.stepValidation[2]) allValid = false;
  
  // Validate step 3
  const additionalErrors = validateAdditionalDetails(state.formData.additionalDetails);
  state.stepValidation[3] = Object.keys(additionalErrors).length === 0;
  if (!state.stepValidation[3]) allValid = false;
  
  state.validationErrors = {
    ...personalErrors,
    ...professionalErrors,
    ...additionalErrors,
  };
};
```

### Form Submission Actions
```typescript
submitFormStart: (state) => {
  state.isSubmitting = true;
  state.submitError = null;
  state.submitSuccess = false;
};

submitFormSuccess: (state) => {
  state.isSubmitting = false;
  state.submitSuccess = true;
  state.submitError = null;
  state.hasDraft = false;
  state.lastSaved = null;
};

submitFormFailure: (state, action: PayloadAction<string>) => {
  state.isSubmitting = false;
  state.submitSuccess = false;
  state.submitError = action.payload;
};
```

### Draft Actions
```typescript
saveDraft: (state) => {
  try {
    localStorage.setItem('employeeForm_draft', JSON.stringify(state.formData));
    localStorage.setItem('employeeForm_currentStep', state.currentStep.toString());
    localStorage.setItem('employeeForm_timestamp', Date.now().toString());
    state.hasDraft = true;
    state.lastSaved = new Date().toISOString();
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
};

loadDraft: (state) => {
  try {
    const draft = localStorage.getItem('employeeForm_draft');
    const step = localStorage.getItem('employeeForm_currentStep');
    
    if (draft) {
      state.formData = JSON.parse(draft);
      state.hasDraft = true;
    }
    
    if (step) {
      state.currentStep = parseInt(step, 10);
    }
    
    const timestamp = localStorage.getItem('employeeForm_timestamp');
    if (timestamp) {
      state.lastSaved = new Date(parseInt(timestamp)).toISOString();
    }
  } catch (error) {
    console.error('Failed to load draft:', error);
  }
};

clearDraft: (state) => {
  localStorage.removeItem('employeeForm_draft');
  localStorage.removeItem('employeeForm_currentStep');
  localStorage.removeItem('employeeForm_timestamp');
  state.hasDraft = false;
  state.lastSaved = null;
};
```

### Edit Mode Actions
```typescript
setEditMode: (state, action: PayloadAction<{ isEditMode: boolean; employeeId?: string }>) => {
  state.isEditMode = action.payload.isEditMode;
  state.editingEmployeeId = action.payload.employeeId || null;
};

loadEmployeeForEdit: (state, action: PayloadAction<EmployeeFormData>) => {
  state.formData = action.payload;
  state.isEditMode = true;
  state.validationErrors = {};
  state.stepValidation = { 1: true, 2: true, 3: true, 4: true };
};

resetForm: (state) => {
  state.formData = initialState.formData;
  state.currentStep = 1;
  state.validationErrors = {};
  state.stepValidation = { 1: false, 2: false, 3: false, 4: false };
  state.isSubmitting = false;
  state.submitSuccess = false;
  state.submitError = null;
  state.isEditMode = false;
  state.editingEmployeeId = null;
  state.hasDraft = false;
  state.lastSaved = null;
};
```

### UI State Actions
```typescript
showCancelConfirmation: (state) => {
  state.showCancelConfirmation = true;
};

hideCancelConfirmation: (state) => {
  state.showCancelConfirmation = false;
};
```

## Complete Slice Implementation
```typescript
// employeeFormSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  validatePersonalInfo, 
  validateProfessionalInfo, 
  validateAdditionalDetails 
} from '../utils/validation';

const employeeFormSlice = createSlice({
  name: 'employeeForm',
  initialState,
  reducers: {
    // Navigation
    setCurrentStep,
    nextStep,
    previousStep,
    goToStep,
    
    // Form Data
    updatePersonalInfo,
    updateProfessionalInfo,
    updateAdditionalDetails,
    
    // Dynamic Fields
    addSkill,
    removeSkill,
    addEducation,
    updateEducation,
    removeEducation,
    addDocument,
    removeDocument,
    
    // Validation
    setValidationError,
    clearValidationError,
    clearAllValidationErrors,
    validateStep,
    validateAllSteps,
    
    // Submission
    submitFormStart,
    submitFormSuccess,
    submitFormFailure,
    
    // Draft
    saveDraft,
    loadDraft,
    clearDraft,
    
    // Edit Mode
    setEditMode,
    loadEmployeeForEdit,
    resetForm,
    
    // UI State
    showCancelConfirmation,
    hideCancelConfirmation,
  },
});

export const {
  setCurrentStep,
  nextStep,
  previousStep,
  goToStep,
  updatePersonalInfo,
  updateProfessionalInfo,
  updateAdditionalDetails,
  addSkill,
  removeSkill,
  addEducation,
  updateEducation,
  removeEducation,
  addDocument,
  removeDocument,
  setValidationError,
  clearValidationError,
  clearAllValidationErrors,
  validateStep,
  validateAllSteps,
  submitFormStart,
  submitFormSuccess,
  submitFormFailure,
  saveDraft,
  loadDraft,
  clearDraft,
  setEditMode,
  loadEmployeeForEdit,
  resetForm,
  showCancelConfirmation,
  hideCancelConfirmation,
} = employeeFormSlice.actions;

export default employeeFormSlice.reducer;
```

## Hooks

### Typed Hooks
```typescript
// hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T => {
  return useSelector(selector);
};
```

### Custom Form Hooks
```typescript
// useEmployeeForm.ts
import { useAppDispatch, useAppSelector } from '../hooks';
import * as actions from './employeeFormSlice';

export const useEmployeeForm = () => {
  const dispatch = useAppDispatch();
  
  const state = useAppSelector(state => state.employeeForm);
  
  return {
    // State
    ...state,
    
    // Actions
    setCurrentStep: (step: number) => dispatch(actions.setCurrentStep(step)),
    nextStep: () => dispatch(actions.nextStep()),
    previousStep: () => dispatch(actions.previousStep()),
    goToStep: (step: number) => dispatch(actions.goToStep(step)),
    
    updatePersonalInfo: (data: Partial<EmployeeFormData['personalInfo']>) => 
      dispatch(actions.updatePersonalInfo(data)),
    updateProfessionalInfo: (data: Partial<EmployeeFormData['professionalInfo']>) => 
      dispatch(actions.updateProfessionalInfo(data)),
    updateAdditionalDetails: (data: Partial<EmployeeFormData['additionalDetails']>) => 
      dispatch(actions.updateAdditionalDetails(data)),
    
    addSkill: (skill: string) => dispatch(actions.addSkill(skill)),
    removeSkill: (skill: string) => dispatch(actions.removeSkill(skill)),
    
    addEducation: () => dispatch(actions.addEducation()),
    updateEducation: (id: string, field: keyof EducationEntry, value: string) => 
      dispatch(actions.updateEducation({ id, field, value })),
    removeEducation: (id: string) => dispatch(actions.removeEducation(id)),
    
    addDocument: (doc: DocumentInfo) => dispatch(actions.addDocument(doc)),
    removeDocument: (id: string) => dispatch(actions.removeDocument(id)),
    
    setValidationError: (field: string, error: string) => 
      dispatch(actions.setValidationError({ field, error })),
    clearValidationError: (field: string) => dispatch(actions.clearValidationError(field)),
    clearAllValidationErrors: () => dispatch(actions.clearAllValidationErrors()),
    validateStep: (step: number) => dispatch(actions.validateStep(step)),
    validateAllSteps: () => dispatch(actions.validateAllSteps()),
    
    submitFormStart: () => dispatch(actions.submitFormStart()),
    submitFormSuccess: () => dispatch(actions.submitFormSuccess()),
    submitFormFailure: (error: string) => dispatch(actions.submitFormFailure(error)),
    
    saveDraft: () => dispatch(actions.saveDraft()),
    loadDraft: () => dispatch(actions.loadDraft()),
    clearDraft: () => dispatch(actions.clearDraft()),
    
    setEditMode: (isEditMode: boolean, employeeId?: string) => 
      dispatch(actions.setEditMode({ isEditMode, employeeId })),
    loadEmployeeForEdit: (data: EmployeeFormData) => dispatch(actions.loadEmployeeForEdit(data)),
    resetForm: () => dispatch(actions.resetForm()),
    
    showCancelConfirmation: () => dispatch(actions.showCancelConfirmation()),
    hideCancelConfirmation: () => dispatch(actions.hideCancelConfirmation()),
  };
};
```

## Usage Example
```typescript
// EmployeeForm.tsx
import { useEmployeeForm } from './hooks/useEmployeeForm';

const EmployeeForm = () => {
  const {
    currentStep,
    formData,
    validationErrors,
    isSubmitting,
    hasDraft,
    lastSaved,
    
    updatePersonalInfo,
    nextStep,
    previousStep,
    validateStep,
    saveDraft,
  } = useEmployeeForm();
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      nextStep();
      saveDraft();
    }
  };
  
  const handlePersonalInfoChange = (field: string, value: string) => {
    updatePersonalInfo({ [field]: value });
    saveDraft();
  };
  
  return (
    <div>
      {/* Form implementation */}
    </div>
  );
};
```

## Benefits of This Design

1. **Type Safety**: Full TypeScript support with typed actions and state
2. **Immutability**: Redux Toolkit handles immutability automatically
3. **Performance**: Efficient updates with Immer
4. **Scalability**: Easy to add new actions and state
5. **Testability**: Pure functions make testing straightforward
6. **DevTools**: Excellent debugging with Redux DevTools
7. **Draft Support**: Built-in local storage integration
8. **Validation**: Centralized validation logic
9. **Edit Mode**: Support for both add and edit workflows
10. **Error Handling**: Comprehensive error state management