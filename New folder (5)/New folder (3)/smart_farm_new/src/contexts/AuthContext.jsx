import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { createTestUsers, loginAsTestUser } from '../lib/createTestUsers';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       (_event, session) => {
         setSession(session);
         setUser(session?.user ?? null);
         if (session?.user) {
           loadProfile(session.user.id).finally(() => setLoading(false));
         } else {
           setProfile(null);
           setLoading(false);
         }
       }
     );

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        console.log('Profile loaded:', data);
        setProfile(data);
        return;
      }

      console.log('Profile not found on first attempt, retrying...', error);
      await new Promise(r => setTimeout(r, 1000));
      const { data: retryData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (retryData) {
        console.log('Profile loaded on retry:', retryData);
        setProfile(retryData);
      } else {
        console.log('Profile still not found after retry');
      }
    } catch (err) {
      console.error('loadProfile failed:', err);
    }
  };

  const signUp = async (
    email,
    password,
    userData
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: userData.full_name.trim(),
            user_type: userData.user_type,
            phone: userData.phone?.trim() ?? '',
            address: userData.address?.trim() ?? '',
            farmer_wallet_address: userData.farmer_wallet_address ?? null,
          },
        },
      });

      if (error) return { error: error.message };

      if (data.user && !data.session) {
        return { error: 'Account created! Please confirm your email before signing in.' };
      }

      if (data.user && data.session) {
        const profilePayload = {
          id: data.user.id,
          email: data.user.email ?? email.toLowerCase().trim(),
          full_name: userData.full_name.trim(),
          user_type: userData.user_type,
          phone: userData.phone?.trim() ?? '',
          address: userData.address?.trim() ?? '',
          wallet_balance: userData.user_type === 'buyer' ? 10000 : 0,
        };

        if (userData.farmer_wallet_address) {
          profilePayload.farmer_wallet_address = userData.farmer_wallet_address;
        }

        const { error: profileError } = await supabase.from('profiles').upsert(profilePayload);
        if (profileError) {
          console.error('Profile upsert failed:', profileError);
          return {
            error: `Account created but profile setup failed: ${profileError.message || 'Unknown error'}`,
          };
        }
        
        setProfile(profilePayload);
      }

      return { error: null };
    } catch (err) {
      console.error('Sign-up exception:', err);
      return { error: err.message ?? 'Unexpected error during sign up' };
    }
   };

   const signIn = async (email, password) => {
    console.log('🔐 signIn called:', email);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password.trim()
      });

      if (error) {
        console.log('❌ Supabase sign-in error:', error.message);
        if (error.message.includes('Invalid login credentials') || error.message.includes('wrong')) {
          return { error: 'Incorrect email or password.' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: 'Please confirm your email before signing in.' };
        }
        return { error: error.message };
      }

      console.log('✅ Supabase sign-in successful');
      return { error: null };
    } catch (err) {
      console.error('Sign-in exception:', err);
      return { error: err.message ?? 'Unexpected error during sign in' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  const handleCreateTestUsers = async () => {
    await createTestUsers();
  };

  const handleLoginAsTestUser = async (email) => {
    const result = await loginAsTestUser(email);
    if (!result.error && result.user) {
      await loadProfile(result.user.id);
    }
    return result;
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, session, loading, signUp, signIn, signOut, refreshProfile, createTestUsers: handleCreateTestUsers, loginAsTestUser: handleLoginAsTestUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
