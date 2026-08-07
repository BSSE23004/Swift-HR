// PersonalInfoFields Component
import React from 'react';
import type { PersonalInfo } from '../types/employeeForm.types';
import { GENDER_OPTIONS } from '../constants/dropdownOptions';

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
          <label htmlFor="firstName" className="required">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={data.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={errors['personalInfo.firstName'] ? 'error' : ''}
            placeholder="Enter first name"
          />
          {errors['personalInfo.firstName'] && (
            <span className="error-message">{errors['personalInfo.firstName']}</span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName" className="required">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            value={data.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={errors['personalInfo.lastName'] ? 'error' : ''}
            placeholder="Enter last name"
          />
          {errors['personalInfo.lastName'] && (
            <span className="error-message">{errors['personalInfo.lastName']}</span>
          )}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="email" className="required">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={data.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={errors['personalInfo.email'] ? 'error' : ''}
          placeholder="Enter email address"
        />
        {errors['personalInfo.email'] && (
          <span className="error-message">{errors['personalInfo.email']}</span>
        )}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={errors['personalInfo.phone'] ? 'error' : ''}
            placeholder="Enter phone number"
          />
          {errors['personalInfo.phone'] && (
            <span className="error-message">{errors['personalInfo.phone']}</span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="dateOfBirth" className="required">
            Date of Birth
          </label>
          <input
            type="date"
            id="dateOfBirth"
            value={data.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            className={errors['personalInfo.dateOfBirth'] ? 'error' : ''}
          />
          {errors['personalInfo.dateOfBirth'] && (
            <span className="error-message">{errors['personalInfo.dateOfBirth']}</span>
          )}
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="gender" className="required">
            Gender
          </label>
          <select
            id="gender"
            value={data.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            className={errors['personalInfo.gender'] ? 'error' : ''}
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors['personalInfo.gender'] && (
            <span className="error-message">{errors['personalInfo.gender']}</span>
          )}
        </div>
        
        <div className="form-group">
          {/* Empty for layout balance */}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="address">Address</label>
        <input
          type="text"
          id="address"
          value={data.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Enter street address"
        />
      </div>
      
      <div className="form-row three-columns">
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            value={data.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Enter city"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="state">State</label>
          <input
            type="text"
            id="state"
            value={data.state}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="Enter state"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="zipCode">Zip Code</label>
          <input
            type="text"
            id="zipCode"
            value={data.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            placeholder="Enter zip code"
          />
        </div>
      </div>
    </div>
  );
};