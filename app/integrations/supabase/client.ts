import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://phwtkkwwfpbgwcvwgick.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBod3Rra3d3ZnBiZ3djdndnaWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjIzMTQsImV4cCI6MjA3MzkzODMxNH0.PLfuzR4Bfbya0G5W-Hql6jMTDWr_4gt-M_SWa4S-4b8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
