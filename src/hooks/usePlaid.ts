
// Re-export the refactored Plaid hook from its new location
import { usePlaid } from './plaid/usePlaid';
import { PlaidAccount, PlaidTransaction, PlaidItem } from './plaid/types';

export { usePlaid };
export type { PlaidAccount, PlaidTransaction, PlaidItem };
