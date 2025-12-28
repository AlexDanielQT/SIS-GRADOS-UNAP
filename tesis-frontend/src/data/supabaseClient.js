import { createClient } from '@supabase/supabase-js';

// ⚠️ REEMPLAZA ESTO CON TUS DATOS DE SUPABASE (Settings > API)
// Al ponerlas aquí, tus compañeros no necesitan configurar nada extra.
const supabaseUrl = 'https://dsmnxkerixthwhsprzob.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbW54a2VyaXh0aHdoc3Byem9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzQ4MjAsImV4cCI6MjA4MjUxMDgyMH0.kXPNoudg9IQ2JezPJG4DGZjhsF7LaZDwgYxYXmeQ_DE';

export const supabase = createClient(supabaseUrl, supabaseKey);