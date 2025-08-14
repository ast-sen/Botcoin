import { useState } from 'react';
import { SignupForm, ValidationErrors } from '../types/auth.types';
import { ValidationUtils } from '../utils/validation.utils';

export const useSignupForm = () => {
  const [form, setForm] = useState<SignupForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof SignupForm, value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = ValidationUtils.validateSignupForm(form);
    setErrors(newErrors);
    return !ValidationUtils.hasErrors(newErrors);
  };

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    });
    setErrors({});
    setIsLoading(false);
  };

  return {
    form,
    errors,
    isLoading,
    setIsLoading,
    updateField,
    validateForm,
    resetForm,
  };
};