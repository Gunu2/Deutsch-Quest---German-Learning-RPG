// Copy config.example.js to config.js and add your Supabase project URL + anon/public key.
// The anon key is intended for browser use when Row Level Security (RLS) is configured.
// NEVER put a Supabase service_role key in frontend code.
export default {
  SUPABASE_URL: "YOUR_PROJECT_URL",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY"
};