
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://apfuzwpathjdkkeixnse.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwZnV6d3BhdGhqZGtrZWl4bnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjk0MTIsImV4cCI6MjA3NTcwNTQxMn0.KCnY2TYbXPVaco21-1adK0Gp2N6DGq64BTPf2ZsZM-8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
