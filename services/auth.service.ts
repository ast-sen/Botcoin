import { LoginForm, SignupForm, User } from '../types/auth.types';

export class AuthService {
  private static readonly API_BASE_URL = 'https://your-api.com';
  private static readonly DEMO_CREDENTIALS = {
    email: 'demo@example.com',
    password: 'password'
  };

  static async login(credentials: LoginForm): Promise<User> {
    // For demo purposes - replace with real API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (
          credentials.email === this.DEMO_CREDENTIALS.email &&
          credentials.password === this.DEMO_CREDENTIALS.password
        ) {
          resolve({
            id: '123',
            email: credentials.email,
            name: 'Demo User'
          });
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 2000);
    });
  }

  static async signup(credentials: SignupForm): Promise<User> {
    // For demo purposes - replace with real API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate email already exists check
        if (credentials.email === this.DEMO_CREDENTIALS.email) {
          reject(new Error('Email already exists'));
          return;
        }

        // Simulate successful signup
        resolve({
          id: Math.random().toString(36).substr(2, 9),
          email: credentials.email,
          name: credentials.name
        });
      }, 2000);
    });
  }

  // Real API implementations
  static async loginWithAPI(credentials: LoginForm): Promise<User> {
    const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
  }

  static async signupWithAPI(credentials: SignupForm): Promise<User> {
    const { confirmPassword, agreeToTerms, ...signupData } = credentials;
    
    const response = await fetch(`${this.API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }

    return response.json();
  }

  static async socialLogin(provider: string): Promise<User> {
    // Implement social login logic with Expo AuthSession
    throw new Error(`${provider} login not implemented yet`);
  }
}