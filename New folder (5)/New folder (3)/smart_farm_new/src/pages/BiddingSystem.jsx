import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Clock, CheckCircle, XCircle, Send, Gavel } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Project = {
  id: '',
  name: '',
  description: '',
  buyer: '',
  price: 0,
  status: 'open',
  createdAt: '',
  targetDelivery: '',
};

const Bid = {
  id: '',
  projectId: '',
  supplier: '',
  amount: 0,
  status: 'pending',
  createdAt: '',
  product: null,
};

export function BiddingSystem() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  const handleBidAction = async (bidId, action) => {
    const { error } = await supabase
      .from('bids')
      .update({ status: action })
      .eq('id', bidId);

    if (!error) {
      if (profile?.id) {
        const { data } = await supabase
          .from('bids')
          .select('*')
          .eq('buyer_id', profile.id)
          .order('created_at', { ascending: false });

        if (data) {
          const formattedBids = data.map(bid => ({
            id: bid.id,
            projectId: bid.product_id,
            supplier: profile.full_name || 'Unknown',
            amount: bid.bid_amount * 100,
            status: bid.status || 'pending',
            createdAt: bid.created_at,
          }));
          setMyBids(formattedBids);
        }
      }
    } else {
      console.error('Error updating bid status:', error);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      const loadBids = async () => {
        if (profile.user_type === 'buyer') {
          const { data, error } = await supabase
            .from('bids')
            .select('*')
            .eq('buyer_id', profile.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            const formattedBids = data.map(bid => ({
              id: bid.id,
              projectId: bid.product_id,
              supplier: profile.full_name || 'Unknown',
              amount: bid.bid_amount * 100,
              status: bid.status || 'pending',
              createdAt: bid.created_at,
            }));
            setMyBids(formattedBids);
          }
        } else if (profile.user_type === 'farmer') {
          const { data: products } = await supabase.from('products').select('id').eq('farmer_id', profile.id);
          if (products) {
            const productIds = products.map(p => p.id);
            const { data, error } = await supabase
              .from('bids')
              .select('*, profiles!bids_buyer_id_fkey(full_name)')
              .in('product_id', productIds)
              .neq('buyer_id', profile.id);

            if (!error && data) {
              const formattedBids = data.map(bid => ({
                id: bid.id,
                projectId: bid.product_id,
                supplier: bid.profiles?.full_name || 'Unknown',
                amount: bid.bid_amount * 100,
                status: bid.status || 'pending',
                createdAt: bid.created_at,
              }));
              setMyBids(formattedBids);
            }
          }
        }
        setLoading(false);
      };
      loadBids();
    }
  }, [profile]);

  const handleSubmitBid = async () => {
    if (!selectedProject || !bidAmount || !profile?.id) return;
    
    const { error } = await supabase.from('bids').insert({
      product_id: selectedProject.id,
      buyer_id: profile.id,
      bid_amount: parseFloat(bidAmount),
      status: 'pending',
    });

    if (!error) {
      setSuccessMessage('Bid submitted successfully!');
      setBidAmount('');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bidding System</h1>
          <p className="text-gray-600">Place and manage bids on agricultural products</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Gavel className="text-green-600" />
              My Bids
            </h2>
            
            {myBids.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bids yet</p>
            ) : (
              <div className="space-y-4">
                {myBids.map((bid) => (
                  <div key={bid.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">Product #{bid.projectId?.substring(0, 8)}</h3>
                        <p className="text-sm text-gray-500">Bid Amount: ₹{bid.amount}</p>
                        <p className="text-xs text-gray-400">{new Date(bid.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}>
                        {bid.status}
                      </span>
                    </div>
                    {bid.status === 'pending' && profile?.user_type === 'farmer' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleBidAction(bid.id, 'accepted')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleBidAction(bid.id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Send className="text-blue-600" />
              Place New Bid
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  onChange={(e) => {
                    const project = projects.find(p => p.id === e.target.value);
                    setSelectedProject(project);
                  }}
                >
                  <option value="">Select a product...</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bid Amount (₹)</label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter your bid amount"
                />
              </div>
              
              <button
                onClick={handleSubmitBid}
                disabled={!selectedProject || !bidAmount}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Submit Bid
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}