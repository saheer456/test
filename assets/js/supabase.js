import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://yvsetmamsmpxhzpswfme.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2c2V0bWFtc21weGh6cHN3Zm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3Mzk4NDksImV4cCI6MjA3NzMxNTg0OX0._9_mxDWuc-YZjgf94SxAV1QHKlX_Mexmu9PGWwgJBtc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
