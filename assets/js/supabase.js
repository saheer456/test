import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://fzhvotasyrbxyfmkqkfa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6aHZvdGFzeXJieHlmbWtxa2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NzkyNzIsImV4cCI6MjA3NzU1NTI3Mn0.zdd0dgvuE5eQziKKUrxSa7imfiyasGNsfv6ExqjHW9Y"
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
