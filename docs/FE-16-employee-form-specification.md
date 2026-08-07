# FE-16: Add/Edit Employee Form - Feature Specification

## Overview
This document provides the technical specification for implementing the Add/Edit Employee Form frontend component (FE-16) for SwiftHR.

## Scope
- **Feature**: Add/Edit Employee Form
- **Screens**: Desktop 8-11 (4 screens from design)
- **Technology**: React + TypeScript, Redux Toolkit, Local Storage
- **Focus**: Frontend implementation only

## Design Analysis

### Screen Breakdown (Desktop 8-11)

Based on the design images analysis, the 4 screens represent:

**Desktop 8**: Employee Form - Personal Information
- First step of employee form
- Personal details fields
- Form validation indicators
- Navigation buttons (Next/Cancel)

**Desktop 9**: Employee Form - Professional Information  
- Second step of employee form
- Work experience and education
- Skills and qualifications
- Navigation buttons (Back/Next/Cancel)

**Desktop 10**: Employee Form - Additional Details
- Third step of employee form
- Additional employee information
- Document upload sections
- Navigation buttons (Back/Next/Cancel)

**Desktop 11**: Employee Form - Review & Submit
- Final step showing summary
- Review all entered information
- Submit/Cancel buttons
- Confirmation state

### Design System Specifications

**Color Palette** (from image analysis):
- Primary Teal: `#09B2A0` (RGB: 9, 178, 160)
- Secondary Teal: `#41BFAA` (RGB: 65, 191, 170)
- Background White: `#FFFFFF`
- Light Gray: `#F8FAFC` (RGB: 248, 250, 252)
- Medium Gray: `#F6F6F7` (RGB: 246, 246, 247)
- Dark Text: `#042334` (RGB: 4, 35, 52)
- Charcoal: `#21272A` (RGB: 33, 39, 42)

**Typography**:
- Font: Inter or system-ui
- Base size: 14px for body text
- Headings: 18-24px for form section titles
- Labels: 14px medium weight
- Helper text: 12px

**Spacing**:
- 8-point grid system
- Form field spacing: 16px vertical
- Section spacing: 24px vertical
- Button padding: 12px 24px

**Components**:
- Border radius: 6px for inputs, 8px for cards
- Input borders: 1px solid light gray (`#E5E5E5`)
- Focus state: Primary teal border
- Error state: Red border and text

## Form Structure

### Step 1: Personal Information (Desktop 8)
**Fields**:
- First Name (required)
- Last Name (required)
- Email (required, email validation)
- Phone Number (optional, phone validation)
- Date of Birth (required)
- Gender (required, dropdown)
- Address (optional)
- City (optional)
- State (optional)
- Zip Code (optional)

### Step 2: Professional Information (Desktop 9)
**Fields**:
- Employee ID (auto-generated for edit, manual for add)
- Department (required, dropdown)
- Position (required, dropdown)
- Employment Type (required, dropdown: Full-time, Part-time, Contract)
- Start Date (required)
- Reporting Manager (optional, dropdown)
- Work Location (required)
- Skills (multi-select or tags)
- Education (dynamic array: Institution, Degree, Field, Year)

### Step 3: Additional Details (Desktop 10)
**Fields**:
- Emergency Contact Name (required)
- Emergency Contact Phone (required)
- Emergency Contact Relationship (required)
- Bank Name (optional)
- Account Number (optional)
- Routing Number (optional)
- Tax ID (optional)
- Notes (optional, textarea)
- Document Upload (resume, ID, certifications)

### Step 4: Review & Submit (Desktop 11)
**Display**:
- Summary of all entered information
- Read-only view of all fields
- Edit buttons for each section
- Final submit confirmation
- Success state after submission

## Technical Requirements

### State Management (Redux Toolkit)

**Slice Structure**:
```typescript
// employeeFormSlice.ts
interface EmployeeFormState {
  currentStep: number;
  formData: EmployeeFormData;
  validationErrors: ValidationErrors;
  isSubmitting: boolean;
  submitSuccess: boolean;
  submitError: string | null;
}

interface EmployeeFormData {
  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Professional Information
  professionalInfo: {
    employeeId: string;
    department: string;
    position: string;
    employmentType: string;
    startDate: string;
    reportingManager: string;
    workLocation: string;
    skills: string[];
    education: Education[];
  };
  
  // Additional Details
  additionalDetails: {
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    taxId: string;
    notes: string;
    documents: Document[];
  };
}
```

**Actions**:
- `setCurrentStep`: Navigate between form steps
- `updatePersonalInfo`: Update personal information
- `updateProfessionalInfo`: Update professional information
- `updateAdditionalDetails`: Update additional details
- `validateStep`: Validate current step
- `submitForm`: Submit employee form
- `resetForm`: Reset form to initial state
- `loadEmployeeForEdit`: Load existing employee data

### Local Storage Integration

**Storage Keys**:
- `employeeForm_draft`: Save form draft data
- `employeeForm_currentStep`: Save current step
- `employeeForm_timestamp`: Last save timestamp

**Storage Strategy**:
- Auto-save form data on field change (debounced)
- Save current step navigation
- Load draft on form initialization
- Clear draft after successful submission
- Handle storage quota exceeded errors

**Implementation**:
```typescript
// localStorageUtils.ts
export const saveDraft = (data: EmployeeFormData, step: number) => {
  try {
    localStorage.setItem('employeeForm_draft', JSON.stringify(data));
    localStorage.setItem('employeeForm_currentStep', step.toString());
    localStorage.setItem('employeeForm_timestamp', Date.now().toString());
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
};

export const loadDraft = (): { data: EmployeeFormData; step: number } | null => {
  try {
    const draft = localStorage.getItem('employeeForm_draft');
    const step = localStorage.getItem('employeeForm_currentStep');
    if (draft && step) {
      return {
        data: JSON.parse(draft),
        step: parseInt(step, 10)
      };
    }
  } catch (error) {
    console.error('Failed to load draft:', error);
  }
  return null;
};

export const clearDraft = () => {
  localStorage.removeItem('employeeForm_draft');
  localStorage.removeItem('employeeForm_currentStep');
  localStorage.removeItem('employeeForm_timestamp');
};
```

### Component Structure

```
src/features/employeeForm/
├── components/
│   ├── EmployeeForm.tsx           # Main form container
│   ├── FormStep1.tsx              # Personal Information
│   ├── FormStep2.tsx              # Professional Information
│   ├── FormStep3.tsx              # Additional Details
│   ├── FormStep4.tsx              # Review & Submit
│   ├── FormProgress.tsx           # Progress indicator
│   ├── FormNavigation.tsx        # Navigation buttons
│   ├── PersonalInfoFields.tsx     # Personal info inputs
│   ├── ProfessionalInfoFields.tsx # Professional info inputs
│   ├── AdditionalDetailsFields.tsx # Additional details inputs
│   ├── DocumentUpload.tsx         # File upload component
│   ├── EducationFields.tsx         # Education array fields
│   └── SkillsInput.tsx            # Skills tag input
├── hooks/
│   ├── useEmployeeForm.ts         # Form logic hook
│   ├── useFormValidation.ts       # Validation hook
│   └── useDraftSave.ts            # Draft saving hook
├── utils/
│   ├── validation.ts              # Validation functions
│   ├── localStorage.ts            # Local storage utilities
│   └── formatters.ts              # Data formatters
├── types/
│   └── employeeForm.types.ts      # TypeScript types
└── index.ts                       # Feature exports
```

### Form Validation

**Validation Rules**:
```typescript
// validation.ts
export const validatePersonalInfo = (data: PersonalInfo): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!data.firstName.trim()) errors.firstName = 'First name is required';
  if (!data.lastName.trim()) errors.lastName = 'Last name is required';
  if (!data.email.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(data.email)) errors.email = 'Invalid email format';
  if (!data.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
  if (!data.gender) errors.gender = 'Gender is required';
  
  return errors;
};

export const validateProfessionalInfo = (data: ProfessionalInfo): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!data.department) errors.department = 'Department is required';
  if (!data.position) errors.position = 'Position is required';
  if (!data.employmentType) errors.employmentType = 'Employment type is required';
  if (!data.startDate) errors.startDate = 'Start date is required';
  if (!data.workLocation) errors.workLocation = 'Work location is required';
  
  return errors;
};

export const validateAdditionalDetails = (data: AdditionalDetails): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!data.emergencyContactName.trim()) errors.emergencyContactName = 'Emergency contact name is required';
  if (!data.emergencyContactPhone.trim()) errors.emergencyContactPhone = 'Emergency contact phone is required';
  if (!data.emergencyContactRelationship) errors.emergencyContactRelationship = 'Relationship is required';
  
  return errors;
};
```

## Implementation Plan

### Phase 1: Setup & Structure (Day 1)
1. Create component folder structure
2. Set up Redux Toolkit slice for employee form
3. Define TypeScript types and interfaces
4. Set up local storage utilities
5. Create main form container component

### Phase 2: Step 1 - Personal Information (Day 2)
1. Implement FormStep1 component
2. Create PersonalInfoFields component
3. Add form validation for personal info
4. Implement draft saving for step 1
5. Add navigation to step 2

### Phase 3: Step 2 - Professional Information (Day 3)
1. Implement FormStep2 component
2. Create ProfessionalInfoFields component
3. Implement EducationFields dynamic array
4. Create SkillsInput component
5. Add form validation for professional info
6. Implement draft saving for step 2

### Phase 4: Step 3 - Additional Details (Day 4)
1. Implement FormStep3 component
2. Create AdditionalDetailsFields component
3. Implement DocumentUpload component
4. Add form validation for additional details
5. Implement draft saving for step 3

### Phase 5: Step 4 - Review & Submit (Day 5)
1. Implement FormStep4 component
2. Create review/summary display
3. Implement form submission logic
4. Add success/error states
5. Clear draft after submission
6. Add edit functionality from review

### Phase 6: Integration & Polish (Day 6)
1. Implement FormProgress component
2. Create FormNavigation component
3. Add edit mode (load existing employee)
4. Implement responsive design
5. Add loading states
6. Error handling and edge cases
7. Final testing and refinement

## Key Features

### Multi-Step Form
- 4-step form with progress indicator
- Step validation before navigation
- Back/Next navigation
- Cancel functionality with confirmation

### Draft Saving
- Auto-save to local storage
- Draft restoration on page reload
- Clear draft after submission
- Handle storage errors gracefully

### Edit Mode
- Load existing employee data
- Pre-fill form fields
- Update instead of create
- Maintain edit mode state

### Validation
- Real-time field validation
- Step-level validation
- Clear error messages
- Visual error indicators

### Responsive Design
- Mobile-friendly layout
- Touch-friendly inputs
- Responsive grid
- Adaptive component sizing

## Success Criteria

- [ ] All 4 form steps implemented according to design
- [ ] Redux Toolkit state management working correctly
- [ ] Local storage draft saving functional
- [ ] Form validation working for all steps
- [ ] Edit mode loads and updates existing employees
- [ ] Responsive design matches specifications
- [ ] Error handling implemented throughout
- [ ] TypeScript types properly defined
- [ ] Code follows React best practices
- [ ] Component structure is maintainable

## Technical Constraints

- **Frontend Only**: No backend integration required
- **Local Storage**: Use browser localStorage for data persistence
- **No API Calls**: Mock data for dropdowns and testing
- **Single Feature**: Focus only on employee form, no other features
- **Design Adherence**: Follow Desktop 8-11 design specifications exactly

## Next Steps

1. Review this specification
2. Approve the technical approach
3. Begin implementation following the phased plan
4. Test each phase before proceeding
5. Final integration and testing