
// Types related to Plaid integration

export type PlaidItem = {
  id: string;
  user_id: string;
  plaid_item_id: string;
  plaid_institution_id: string | null;
  institution_name: string | null;
  status: string;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type PlaidAccount = {
  id: string;
  item_id: string;
  user_id: string;
  plaid_account_id: string;
  name: string;
  mask: string | null;
  official_name: string | null;
  type: string;
  subtype: string | null;
  balance_available: number | null;
  balance_current: number | null;
  balance_limit: number | null;
  balance_iso_currency_code: string | null;
  created_at: string;
  updated_at: string;
  plaid_items?: {
    institution_name: string | null;
    status: string;
    error_message: string | null;
  };
};

export type PlaidTransaction = {
  id: string;
  account_id: string;
  user_id: string;
  plaid_transaction_id: string;
  name: string;
  amount: number;
  date: string;
  pending: boolean;
  category: string[] | null;
  merchant_name: string | null;
  payment_channel: string | null;
  location: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  plaid_accounts?: {
    name: string;
    mask: string | null;
    type: string;
    subtype: string | null;
  };
};
