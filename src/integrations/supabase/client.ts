// Updated to use environment variables instead of hardcoded values
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables from the main supabase client
// This prevents multiple client instances and ensures consistency
export { supabase } from '../../lib/supabase';