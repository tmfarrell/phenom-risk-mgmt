// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://onyninrwfmomluobsvpt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueW5pbnJ3Zm1vbWx1b2JzdnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1MTU3MTgsImV4cCI6MjA0OTA5MTcxOH0.4S6y_hacaK000pfd4101pKvctYXHCdLd-iy-OGrO4dQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);