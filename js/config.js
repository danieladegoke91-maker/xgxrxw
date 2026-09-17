// ============================================
// GLOBAL RISE GRANTS — SUPABASE CONFIGURATION
// ============================================
// Replace the values below with YOUR Supabase credentials.
// Get them from: https://supabase.com/dashboard → Your Project → Settings → API
// ============================================

const SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY-HERE';

// ============================================
// SUPABASE CLIENT INITIALIZATION
// ============================================
// The Supabase JS library is loaded via CDN in index.html.
// This creates a database client we can use in js/app.js
// ============================================

let db = null;

try {
  if (SUPABASE_URL.includes('https://roegdcxxicpbscglfjpq.supabase.co')) {
    console.warn('sb_publishable_N19cqf3kixMu6HQ-wxqVig_-joeEexA');
  } else {
    db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase connected');
  }
} catch (err) {
  console.error('❌ Supabase init failed:', err);
}