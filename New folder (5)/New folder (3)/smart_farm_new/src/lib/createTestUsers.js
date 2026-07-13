import { supabase } from './supabase';

export async function createTestUsers() {
  const farmers = [
    { name: 'sagarika', email: 'sagarika@farmer.com', password: '123456', wallet: '0x346eA8F7E1fF8f76d1a7D3C2E7D9b5f4C2a1B3E5' },
    { name: 'vaishnavi', email: 'vaishnavi@farmer.com', password: '123456', wallet: '0x7f2D9C8E3B4A6F5D1C8E2A7B4C9D6E3F1A8B5C2D' },
    { name: 'rutuja', email: 'rutuja@farmer.com', password: '123456', wallet: '0x8E3F1D7A9C5B6E2D4F8A1C7B3E9D5F6A2C4B8E1' },
    { name: 'mansi', email: 'mansi@farmer.com', password: '123456', wallet: '0x9F4E2C8B1D7A6E3F5C9A2B4D8E1F6A3C5B7D9E' },
    { name: 'rudra', email: 'rudra@farmer.com', password: '123456', wallet: '0x1A5F3D9C2E7B8F4A6D1C3E9F5B2D7A8C4E6F1D' },
  ];

  const buyers = [
    { name: 'shreey', email: 'shreey@buyer.com', password: '654321' },
    { name: 'urjjeta', email: 'urjjeta@buyer.com', password: '654321' },
    { name: 'laxmi', email: 'laxmi@buyer.com', password: '654321' },
    { name: 'teju', email: 'teju@buyer.com', password: '654321' },
    { name: 'shruti', email: 'shruti@buyer.com', password: '654321' },
  ];

  console.log('Creating test farmers with DIFFERENT wallet addresses...');
  for (const farmer of farmers) {
    const userId = `farmer_${farmer.name}_${Date.now()}`;
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: farmer.email,
        full_name: farmer.name,
        user_type: 'farmer',
        phone: '+1234567890',
        address: `${farmer.name} Farm Address`,
        wallet_balance: 0.00,
        farmer_wallet_address: farmer.wallet.toLowerCase(),
      });

    if (error) {
      console.error(`Error creating farmer ${farmer.name}:`, error);
    } else {
      console.log(`Created farmer: ${farmer.name} - Email: ${farmer.email} - Wallet: ${farmer.wallet}`);
    }
  }

  console.log('Creating test buyers...');
  for (const buyer of buyers) {
    const userId = `buyer_${buyer.name}_${Date.now()}`;
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: buyer.email,
        full_name: buyer.name,
        user_type: 'buyer',
        phone: '+1234567890',
        address: `${buyer.name} Buyer Address`,
        wallet_balance: 10000.00,
      });

    if (error) {
      console.error(`Error creating buyer ${buyer.name}:`, error);
    } else {
      console.log(`Created buyer: ${buyer.name} - Email: ${buyer.email} - Password: ${buyer.password}`);
    }
  }

  console.log('Test users created successfully!');
  console.log('\n=== FARMERS (Each has DIFFERENT wallet) ===');
  farmers.forEach(farmer => {
    console.log(`${farmer.name}: ${farmer.email} / ${farmer.password} | Wallet: ${farmer.wallet}`);
  });

  console.log('\n=== BUYERS ===');
  buyers.forEach(buyer => {
    console.log(`${buyer.name}: ${buyer.email} / ${buyer.password}`);
  });
}

export async function loginAsTestUser(email) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !profile) {
      console.error('User not found:', email);
      return { error: 'User not found' };
    }

    console.log('Logging in as:', profile.full_name, '(', profile.user_type, ')');

    return {
      user: {
        id: profile.id,
        email: profile.email,
      },
      profile: profile,
      error: null
    };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Login failed' };
  }
}