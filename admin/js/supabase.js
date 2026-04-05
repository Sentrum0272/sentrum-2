const SUPABASE_URL = "https://ovjgdrqmervbbcbrposl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92amdkcnFtZXJ2YmJjYnJwb3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODU3NzQsImV4cCI6MjA5MDk2MTc3NH0.nv9X7zyrPxNC2llGQtCiH0KtoDcBIxWSHO3ukzb9OSU";


window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)