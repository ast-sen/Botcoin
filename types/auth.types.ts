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

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginProps {
  onLoginSuccess?: (user: User) => void;
  onNavigateToRegister?: () => void;
  onForgotPassword?: () => void;
}

export interface SignupProps {
  onSignupSuccess?: (user: User) => void;
  onNavigateToLogin?: () => void;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}