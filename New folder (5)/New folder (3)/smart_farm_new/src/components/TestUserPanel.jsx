import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestUserPanel = () => {
  const { createTestUsers, loginAsTestUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateUsers = async () => {
    setLoading(true);
    setMessage('Creating test users...');
    try {
      await createTestUsers();
      setMessage('Test users created successfully!');
    } catch (error) {
      setMessage('Error creating test users');
    }
    setLoading(false);
  };

  const handleLogin = async (email) => {
    setLoading(true);
    setMessage(`Logging in as ${email}...`);
    const result = await loginAsTestUser(email);
    if (result.error) {
      setMessage(`Error: ${result.error}`);
    } else {
      setMessage(`Successfully logged in as ${email}`);
    }
    setLoading(false);
  };

  const farmers = [
    { name: 'sagarika', email: 'sagarika@farmer.com', password: '123456' },
    { name: 'vaishnavi', email: 'vaishnavi@farmer.com', password: '123456' },
    { name: 'rutuja', email: 'rutuja@farmer.com', password: '123456' },
    { name: 'mansi', email: 'mansi@farmer.com', password: '123456' },
    { name: 'rudra', email: 'rudra@farmer.com', password: '123456' },
  ];

  const buyers = [
    { name: 'shreey', email: 'shreey@buyer.com', password: '654321' },
    { name: 'urjjeta', email: 'urjjeta@buyer.com', password: '654321' },
    { name: 'laxmi', email: 'laxmi@buyer.com', password: '654321' },
    { name: 'teju', email: 'teju@buyer.com', password: '654321' },
    { name: 'shruti', email: 'shruti@buyer.com', password: '654321' },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Test User Panel</h2>

      <button
        onClick={handleCreateUsers}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Test Users'}
      </button>

      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Farmers</h3>
          <div className="space-y-2">
            {farmers.map((farmer) => (
              <button
                key={farmer.email}
                onClick={() => handleLogin(farmer.email)}
                disabled={loading}
                className="w-full text-left p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                <div className="font-medium">{farmer.name}</div>
                <div className="text-sm text-gray-500">{farmer.email}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Buyers</h3>
          <div className="space-y-2">
            {buyers.map((buyer) => (
              <button
                key={buyer.email}
                onClick={() => handleLogin(buyer.email)}
                disabled={loading}
                className="w-full text-left p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                <div className="font-medium">{buyer.name}</div>
                <div className="text-sm text-gray-500">{buyer.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestUserPanel;