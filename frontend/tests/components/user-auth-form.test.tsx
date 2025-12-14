declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;
declare const jest: any;

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserAuthForm } from '@/components/auth/user-auth-form';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

// --- Mocks ---
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: jest.fn() }),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('UserAuthForm', () => {
  const mockSignIn = signIn as any;

  beforeEach(() => {
    mockSignIn.mockClear();
  });

  it('renders login form by default', () => {
    render(<UserAuthForm />);
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('validates empty inputs', async () => {
    render(<UserAuthForm />);
    const submitBtn = screen.getByText('Sign In');
    
    await userEvent.click(submitBtn);

    // HTML5 validation or sonner toast checking
    // Since the component uses toast.error for validation:
    expect(toast.error).toHaveBeenCalledWith('Please fill in all fields');
  });

  it('calls signIn with credentials on valid submission', async () => {
    render(<UserAuthForm />);
    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByText('Sign In');

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
        callbackUrl: '/dashboard',
      });
    });
  });

  it('renders registration fields in register mode', () => {
    render(<UserAuthForm mode="register" />);
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });
});