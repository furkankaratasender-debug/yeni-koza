import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://guyrxlpttwuevppckgvf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1eXJ4bHB0dHd1ZXZwcGNrZ3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjMyMjcsImV4cCI6MjA5NDkzOTIyN30.ZnuSEbu_nViZB5Zp6RlS2dxrAKCr_cFK9BS-hClxcN0"
);
