import { useState } from 'react';
import { LoginForm, ValidationErrors } from '../types/auth.types';
import { ValidationUtils } from '../utils/validation.utils';

export const useLoginForm = () => {
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = ValidationUtils.validateLoginForm(form);
    setErrors(newErrors);
    return !ValidationUtils.hasErrors(newErrors);
  };

  const resetForm = () => {
    setForm({ email: '', password: '' });
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