import { LoginForm, SignupForm, ValidationErrors } from '../types/auth.types';

export class ValidationUtils {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  static validateName(name: string): boolean {
    return name.trim().length >= 2;
  }

  static validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true };
  }

  static validateLoginForm(form: LoginForm): ValidationErrors {
    const errors: ValidationErrors = {};

    // Email validation
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!this.validateEmail(form.email)) {
      errors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!form.password) {
      errors.password = 'Password is required';
    } else if (!this.validatePassword(form.password)) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  }

  static validateSignupForm(form: SignupForm): ValidationErrors {
    const errors: ValidationErrors = {};

    // Name validation
    if (!form.name.trim()) {
      errors.name = 'Name is required';
    } else if (!this.validateName(form.name)) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!this.validateEmail(form.email)) {
      errors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!form.password) {
      errors.password = 'Password is required';
    } else {
      const passwordCheck = this.validatePasswordStrength(form.password);
      if (!passwordCheck.isValid) {
        errors.password = passwordCheck.message;
      }
    }

    // Confirm password validation
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement validation
    if (!form.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    return errors;
  }

  static hasErrors(errors: ValidationErrors): boolean {
    return Object.keys(errors).length > 0;
  }
}