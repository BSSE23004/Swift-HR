// Employee Form Types

export interface PersonalInfo {
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
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface ProfessionalInfo {
  employeeId: string;
  department: string;
  position: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | '';
  startDate: string;
  reportingManager: string;
  workLocation: string;
  skills: string[];
  education: EducationEntry[];
}

export interface DocumentInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface AdditionalDetails {
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  taxId: string;
  notes: string;
  documents: DocumentInfo[];
}

export interface EmployeeFormData {
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  additionalDetails: AdditionalDetails;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface EmployeeFormState {
  // Form Navigation
  currentStep: number;
  totalSteps: number;
  
  // Form Data
  formData: EmployeeFormData;
  
  // Validation
  validationErrors: ValidationErrors;
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