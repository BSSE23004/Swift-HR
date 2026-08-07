// Dropdown Options Constants

export const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const;

export const DEPARTMENT_OPTIONS = [
  { value: '', label: 'Select Department' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
] as const;

export const POSITION_OPTIONS = [
  { value: '', label: 'Select Position' },
  { value: 'manager', label: 'Manager' },
  { value: 'senior', label: 'Senior Developer' },
  { value: 'mid', label: 'Mid-Level Developer' },
  { value: 'junior', label: 'Junior Developer' },
  { value: 'intern', label: 'Intern' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'coordinator', label: 'Coordinator' },
] as const;

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: '', label: 'Select Employment Type' },
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
] as const;

export const WORK_LOCATION_OPTIONS = [
  { value: '', label: 'Select Work Location' },
  { value: 'remote', label: 'Remote' },
  { value: 'office', label: 'Office' },
  { value: 'hybrid', label: 'Hybrid' },
] as const;

export const EMERGENCY_RELATIONSHIP_OPTIONS = [
  { value: '', label: 'Select Relationship' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
] as const;