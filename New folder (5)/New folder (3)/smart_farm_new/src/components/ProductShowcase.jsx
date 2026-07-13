import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Tag, Sprout } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatUploadDate, detectProductCategory } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const fallbackProducts = [
  {
    id: 'demo-1',
    crop_name: 'Organic Tomatoes',
    farmer_price: 85,
    quantity: 100,
    unit: 'kg',
    location: 'Maharashtra',
    created_at: new Date().toISOString(),
    category: 'Vegetables',
    ai_suggested_price: 90,
    status: 'available',
  },
  {
    id: 'demo-2',
    crop_name: 'Premium Wheat',
    farmer_price: 42,
    quantity: 500,
    unit: 'kg',
    location: 'Punjab',
    created_at: new Date().toISOString(),
    category: 'Grains',
    ai_suggested_price: 45,
    status: 'available',
  },
  {
    id: 'demo-3',
    crop_name: 'Fresh Corn',
    farmer_price: 60,
    quantity: 200,
    unit: 'kg',
    location: 'Gujarat',
    created_at: new Date().toISOString(),
    category: 'Grains',
    ai_suggested_price: 65,
    status: 'available',
  },
];

const ProductShowcase = () => {
  const [products, setProducts] = useState(fallbackProducts);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(6);

    if (!error && data && data.length > 0) {
      setProducts(data);
    }
  };

  return (
    <section className="py-20 relative overflow-hidden bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured Products from Farmers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fresh produce directly from our verified farmers. Quality guaranteed with blockchain verification.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl overflow-hidden border border-green-100 shadow-lg hover:shadow-xl transition-all"
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.crop_name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-green-200 to-emerald-300 flex items-center justify-center">
                  <Sprout size={64} className="text-green-400" />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.crop_name}</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-green-600" />
                    <span>{product.location || 'Unknown Location'}</span>
                  </div>
<div className="flex items-center gap-2">
                      <Calendar size={16} className="text-green-600" />
                      <span>{formatUploadDate(product.created_at || product.upload_date)}</span>
                    </div>
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-green-600" />
                    <span>{detectProductCategory(product.crop_name) || 'Other'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-green-600">
                    ₹{product.farmer_price}/{product.unit}
                  </span>
                  <span className="text-sm text-gray-500">{product.quantity} {product.unit} available</span>
                </div>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;