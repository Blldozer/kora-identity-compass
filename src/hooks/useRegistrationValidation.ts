
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import debounce from 'lodash/debounce';

interface ValidationState {
  isChecking: boolean;
  emailExists: boolean;
  phoneExists: boolean;
}

export function useRegistrationValidation() {
  const [validationState, setValidationState] = useState<ValidationState>({
    isChecking: false,
    emailExists: false,
    phoneExists: false
  });

  const checkEmailExists = async (email: string) => {
    const { data, error } = await supabase.auth.admin.listUsers({
      filters: {
        email: email
      }
    });
    return data && data.length > 0;
  };

  const checkPhoneExists = async (phone: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('phone')
      .eq('phone', phone)
      .maybeSingle();
    
    return !!data;
  };

  const validateField = useCallback(
    debounce(async (field: 'email' | 'phone', value: string) => {
      if (!value) return;

      setValidationState(prev => ({ ...prev, isChecking: true }));

      try {
        if (field === 'email') {
          const exists = await checkEmailExists(value);
          setValidationState(prev => ({ ...prev, emailExists: exists }));
        } else {
          const exists = await checkPhoneExists(value);
          setValidationState(prev => ({ ...prev, phoneExists: exists }));
        }
      } catch (error) {
        console.error(`Error checking ${field}:`, error);
      } finally {
        setValidationState(prev => ({ ...prev, isChecking: false }));
      }
    }, 500),
    []
  );

  return {
    ...validationState,
    validateField
  };
}
