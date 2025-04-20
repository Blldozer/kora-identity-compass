
import { supabase } from "@/integrations/supabase/client";
import { describe, it, expect } from 'vitest';

describe('Authentication System', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`
  };

  it('should allow user registration', async () => {
    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: { 
        data: {
          first_name: testUser.firstName,
          last_name: testUser.lastName,
          phone_number: testUser.phoneNumber
        }
      }
    });

    expect(error).toBeNull();
    expect(data.user).toBeTruthy();
    expect(data.user?.email).toBe(testUser.email);
  });

  it('should prevent duplicate email signup', async () => {
    const { error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password
    });

    expect(error).toBeTruthy();
    expect(error?.message).toContain('already registered');
  });

  it('should create a profile after signup', async () => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testUser.email)
      .single();

    expect(profileError).toBeNull();
    expect(profileData).toBeTruthy();
    expect(profileData.first_name).toBe(testUser.firstName);
    expect(profileData.last_name).toBe(testUser.lastName);
    expect(profileData.phone).toBe(testUser.phoneNumber);
  });

  it('should allow user login', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });

    expect(error).toBeNull();
    expect(data.user).toBeTruthy();
    expect(data.user?.email).toBe(testUser.email);
  });
});
