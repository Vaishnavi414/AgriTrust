import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase KEY (first 20 chars):', supabaseAnonKey?.slice(0, 20) + '...');
console.log('Supabase KEY (full length):', supabaseAnonKey?.length);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    supabaseUrl: supabaseUrl ? '***' : 'MISSING',
    supabaseAnonKey: supabaseAnonKey ? '***' : 'MISSING',
  });
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'smart-farm-auth-v2',
  }
});
console.log('✅ Supabase client initialized');

console.log('Testing connection...');
supabase.auth.getSession()
  .then(({ data, error }) => {
    console.log('Auth test - session:', data.session ? '✅ has session' : '❌ no session');
    if (error) console.error('Auth test error:', error.message, error.status);
  })
  .catch(err => console.error('Auth test exception:', err));

fetch(`${supabaseUrl}/rest/v1/profiles?select=count`, {
  headers: {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
  }
})
.then(r => {
  console.log('REST test - status:', r.status, r.statusText);
  return r.json();
})
.then(data => console.log('REST test - data:', data))
.catch(err => console.error('REST test exception:', err));

export const Profile = null;
export const Product = null;
export const Transaction = null;
export const Bid = null;
export const Purchase = null;
