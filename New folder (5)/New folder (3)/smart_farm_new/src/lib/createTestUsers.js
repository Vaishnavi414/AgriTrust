// Test users removed for security - DO NOT USE IN PRODUCTION
export async function createTestUsers() {
  console.warn('Test user creation disabled for security');
}

export async function loginAsTestUser(email) {
  console.warn('Test user login disabled for security');
  return { error: 'Disabled' };
}