// Form interfaces (for UI components)
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

// Service interfaces (for API calls)
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}
// Response interface
export interface AuthResponse {
  user: User | null;
  error: string | null;
}

// Component prop interfaces
export interface LoginProps {
  onLoginSuccess?: (user: User) => void;
  onNavigateToRegister?: () => void;
  onForgotPassword?: () => void;
}

export interface SignupProps {
  onSignupSuccess?: (user: User) => void;
  onNavigateToLogin?: () => void;
}

// Validation interfaces
export interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

// Helper function to convert form data to credentials
export const signupFormToCredentials = (form: SignupForm): SignupCredentials => {
  return {
    name: form.name,
    email: form.email,
    password: form.password
    // confirmPassword and agreeToTerms are handled in validation, not sent to API
  };
};

export const loginFormToCredentials = (form: LoginForm): LoginCredentials => {
  return {
    email: form.email,
    password: form.password
  };
};