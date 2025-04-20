
import { User, Session } from '@supabase/supabase-js';

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResult<T = any> {
  data: T | null;
  error: AuthError | null;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLocked: boolean;
}

export interface SignUpMetadata {
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}
