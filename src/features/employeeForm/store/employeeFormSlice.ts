// Employee Form Redux Slice
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  validatePersonalInfo, 
  validateProfessionalInfo, 
  validateAdditionalDetails 
} from '../../utils/validation';
import type { 
  EmployeeFormState, 
  EmployeeFormData, 
  PersonalInfo, 
  ProfessionalInfo, 
  AdditionalDetails, 
  EducationEntry, 
  DocumentInfo,
  ValidationErrors 
} from '../../types/employeeForm.types';

// Initial state for form data
const initialFormData: EmployeeFormData = {
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
};

const initialState: EmployeeFormState = {
  currentStep: 1,
  totalSteps: 4,
  formData: initialFormData,
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

const employeeFormSlice = createSlice({
  name: 'employeeForm',
  initialState,
  reducers: {
    // Navigation Actions
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1;
      }
    },
    
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    
    goToStep: (state, action: PayloadAction<number>) => {
      if (action.payload >= 1 && action.payload <= state.totalSteps) {
        state.currentStep = action.payload;
      }
    },
    
    // Form Data Actions
    updatePersonalInfo: (state, action: PayloadAction<Partial<PersonalInfo>>) => {
      state.formData.personalInfo = {
        ...state.formData.personalInfo,
        ...action.payload,
      };
      // Clear validation errors for updated fields
      Object.keys(action.payload).forEach(key => {
        delete state.validationErrors[`personalInfo.${key}`];
      });
    },
    
    updateProfessionalInfo: (state, action: PayloadAction<Partial<ProfessionalInfo>>) => {
      state.formData.professionalInfo = {
        ...state.formData.professionalInfo,
        ...action.payload,
      };
      Object.keys(action.payload).forEach(key => {
        delete state.validationErrors[`professionalInfo.${key}`];
      });
    },
    
    updateAdditionalDetails: (state, action: PayloadAction<Partial<AdditionalDetails>>) => {
      state.formData.additionalDetails = {
        ...state.formData.additionalDetails,
        ...action.payload,
      };
      Object.keys(action.payload).forEach(key => {
        delete state.validationErrors[`additionalDetails.${key}`];
      });
    },
    
    // Dynamic Field Actions
    addSkill: (state, action: PayloadAction<string>) => {
      if (!state.formData.professionalInfo.skills.includes(action.payload)) {
        state.formData.professionalInfo.skills.push(action.payload);
      }
    },
    
    removeSkill: (state, action: PayloadAction<string>) => {
      state.formData.professionalInfo.skills = state.formData.professionalInfo.skills.filter(
        skill => skill !== action.payload
      );
    },
    
    addEducation: (state) => {
      const newEducation: EducationEntry = {
        id: Date.now().toString(),
        institution: '',
        degree: '',
        field: '',
        year: '',
      };
      state.formData.professionalInfo.education.push(newEducation);
    },
    
    updateEducation: (state, action: PayloadAction<{ id: string; field: keyof EducationEntry; value: string }>) => {
      const { id, field, value } = action.payload;
      const education = state.formData.professionalInfo.education.find(edu => edu.id === id);
      if (education) {
        education[field] = value;
      }
    },
    
    removeEducation: (state, action: PayloadAction<string>) => {
      state.formData.professionalInfo.education = state.formData.professionalInfo.education.filter(
        edu => edu.id !== action.payload
      );
    },
    
    addDocument: (state, action: PayloadAction<DocumentInfo>) => {
      state.formData.additionalDetails.documents.push(action.payload);
    },
    
    removeDocument: (state, action: PayloadAction<string>) => {
      state.formData.additionalDetails.documents = state.formData.additionalDetails.documents.filter(
        doc => doc.id !== action.payload
      );
    },
    
    // Validation Actions
    setValidationError: (state, action: PayloadAction<{ field: string; error: string }>) => {
      const { field, error } = action.payload;
      state.validationErrors[field] = error;
    },
    
    clearValidationError: (state, action: PayloadAction<string>) => {
      delete state.validationErrors[action.payload];
    },
    
    clearAllValidationErrors: (state) => {
      state.validationErrors = {};
    },
    
    validateStep: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      let isValid = true;
      const errors: ValidationErrors = {};
      
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
    },
    
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
    },
    
    // Form Submission Actions
    submitFormStart: (state) => {
      state.isSubmitting = true;
      state.submitError = null;
      state.submitSuccess = false;
    },
    
    submitFormSuccess: (state) => {
      state.isSubmitting = false;
      state.submitSuccess = true;
      state.submitError = null;
      state.hasDraft = false;
      state.lastSaved = null;
    },
    
    submitFormFailure: (state, action: PayloadAction<string>) => {
      state.isSubmitting = false;
      state.submitSuccess = false;
      state.submitError = action.payload;
    },
    
    // Draft Actions
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
    },
    
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
    },
    
    clearDraft: (state) => {
      localStorage.removeItem('employeeForm_draft');
      localStorage.removeItem('employeeForm_currentStep');
      localStorage.removeItem('employeeForm_timestamp');
      state.hasDraft = false;
      state.lastSaved = null;
    },
    
    // Edit Mode Actions
    setEditMode: (state, action: PayloadAction<{ isEditMode: boolean; employeeId?: string }>) => {
      state.isEditMode = action.payload.isEditMode;
      state.editingEmployeeId = action.payload.employeeId || null;
    },
    
    loadEmployeeForEdit: (state, action: PayloadAction<EmployeeFormData>) => {
      state.formData = action.payload;
      state.isEditMode = true;
      state.validationErrors = {};
      state.stepValidation = { 1: true, 2: true, 3: true, 4: true };
    },
    
    resetForm: (state) => {
      state.formData = initialFormData;
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
    },
    
    // UI State Actions
    showCancelConfirmation: (state) => {
      state.showCancelConfirmation = true;
    },
    
    hideCancelConfirmation: (state) => {
      state.showCancelConfirmation = false;
    },
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