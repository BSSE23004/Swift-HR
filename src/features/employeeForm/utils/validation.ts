// Validation Utilities
import type { PersonalInfo, ProfessionalInfo, AdditionalDetails, ValidationErrors } from '../types/employeeForm.types';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone validation regex (basic)
const PHONE_REGEX = /^[\d\s\-\+\(\)]+$/;
// Date validation (YYYY-MM-DD format)
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return phone === '' || PHONE_REGEX.test(phone);
};

export const isValidDate = (date: string): boolean => {
  if (!DATE_REGEX.test(date)) return false;
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

export const validatePersonalInfo = (data: PersonalInfo): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!data.firstName.trim()) {
    errors['personalInfo.firstName'] = 'First name is required';
  } else if (data.firstName.trim().length < 2) {
    errors['personalInfo.firstName'] = 'First name must be at least 2 characters';
  }
  
  if (!data.lastName.trim()) {
    errors['personalInfo.lastName'] = 'Last name is required';
  } else if (data.lastName.trim().length < 2) {
    errors['personalInfo.lastName'] = 'Last name must be at least 2 characters';
  }
  
  if (!data.email.trim()) {
    errors['personalInfo.email'] = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors['personalInfo.email'] = 'Invalid email format';
  }
  
  if (data.phone && !isValidPhone(data.phone)) {
    errors['personalInfo.phone'] = 'Invalid phone number format';
  }
  
  if (!data.dateOfBirth) {
    errors['personalInfo.dateOfBirth'] = 'Date of birth is required';
  } else if (!isValidDate(data.dateOfBirth)) {
    errors['personalInfo.dateOfBirth'] = 'Invalid date format';
  } else {
    const dob = new Date(data.dateOfBirth);
    const now = new Date();
    const age = now.getFullYear() - dob.getFullYear();
    if (age < 18 || age > 100) {
      errors['personalInfo.dateOfBirth'] = 'Must be between 18 and 100 years old';
    }
  }
  
  if (!data.gender) {
    errors['personalInfo.gender'] = 'Gender is required';
  }
  
  return errors;
};

export const validateProfessionalInfo = (data: ProfessionalInfo): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!data.department) {
    errors['professionalInfo.department'] = 'Department is required';
  }
  
  if (!data.position) {
    errors['professionalInfo.position'] = 'Position is required';
  }
  
  if (!data.employmentType) {
    errors['professionalInfo.employmentType'] = 'Employment type is required';
  }
  
  if (!data.startDate) {
    errors['professionalInfo.startDate'] = 'Start date is required';
  } else if (!isValidDate(data.startDate)) {
    errors['professionalInfo.startDate'] = 'Invalid date format';
  } else {
    const startDate = new Date(data.startDate);
    const now = new Date();
    if (startDate > now) {
      errors['professionalInfo.startDate'] = 'Start date cannot be in the future';
    }
  }
  
  if (!data.workLocation) {
    errors['professionalInfo.workLocation'] = 'Work location is required';
  }
  
  if (data.education.length === 0) {
    errors['professionalInfo.education'] = 'At least one education entry is required';
  } else {
    data.education.forEach((edu, index) => {
      if (!edu.institution.trim()) {
        errors[`professionalInfo.education.${index}.institution`] = 'Institution is required';
      }
      if (!edu.degree.trim()) {
        errors[`professionalInfo.education.${index}.degree`] = 'Degree is required';
      }
      if (!edu.field.trim()) {
        errors[`professionalInfo.education.${index}.field`] = 'Field of study is required';
      }
      if (!edu.year) {
        errors[`professionalInfo.education.${index}.year`] = 'Graduation year is required';
      } else if (isNaN(parseInt(edu.year)) || parseInt(edu.year) < 1950 || parseInt(edu.year) > new Date().getFullYear() + 5) {
        errors[`professionalInfo.education.${index}.year`] = 'Invalid graduation year';
      }
    });
  }
  
  return errors;
};

export const validateAdditionalDetails = (data: AdditionalDetails): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!data.emergencyContactName.trim()) {
    errors['additionalDetails.emergencyContactName'] = 'Emergency contact name is required';
  }
  
  if (!data.emergencyContactPhone.trim()) {
    errors['additionalDetails.emergencyContactPhone'] = 'Emergency contact phone is required';
  } else if (!isValidPhone(data.emergencyContactPhone)) {
    errors['additionalDetails.emergencyContactPhone'] = 'Invalid phone number format';
  }
  
  if (!data.emergencyContactRelationship) {
    errors['additionalDetails.emergencyContactRelationship'] = 'Relationship is required';
  }
  
  if (data.accountNumber && data.accountNumber.length < 8) {
    errors['additionalDetails.accountNumber'] = 'Account number must be at least 8 digits';
  }
  
  if (data.routingNumber && data.routingNumber.length !== 9) {
    errors['additionalDetails.routingNumber'] = 'Routing number must be 9 digits';
  }
  
  return errors;
};

export const validateField = (fieldName: string, value: string): string | null => {
  if (!value.trim()) {
    return `${fieldName} is required`;
  }
  
  if (fieldName.toLowerCase().includes('email') && !isValidEmail(value)) {
    return 'Invalid email format';
  }
  
  if (fieldName.toLowerCase().includes('phone') && !isValidPhone(value)) {
    return 'Invalid phone number format';
  }
  
  return null;
};