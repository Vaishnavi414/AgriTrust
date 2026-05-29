import { useState, useEffect, useMemo } from 'react';
import { MapPin, Calendar, Tag, Sprout } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatUploadDate, detectProductCategory } from '../lib/utils';
import { motion } from 'framer-motion';
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
    description: 'Fresh organic tomatoes grown without pesticides',
    image_url: null,
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
    description: 'High quality wheat seeds',
    image_url: null,
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
    description: 'Sweet corn freshly harvested',
    image_url: null,
    status: 'available',
  },
  {
    id: 'demo-4',
    crop_name: 'Ripe Mangoes',
    farmer_price: 120,
    quantity: 75,
    unit: 'kg',
    location: 'Karnataka',
    created_at: new Date().toISOString(),
    category: 'Fruits',
    ai_suggested_price: 130,
    description: 'Sweet and juicy Alphonso mangoes',
    image_url: null,
    status: 'available',
  },
  {
    id: 'demo-5',
    crop_name: 'Red Onions',
    farmer_price: 35,
    quantity: 200,
    unit: 'kg',
    location: 'Nashik, Maharashtra',
    created_at: new Date().toISOString(),
    category: 'Vegetables',
    ai_suggested_price: 40,
    description: 'Fresh red onions, perfect for cooking',
    image_url: null,
    status: 'available',
  },
  {
    id: 'demo-6',
    crop_name: 'Basmati Rice',
    farmer_price: 95,
    quantity: 300,
    unit: 'kg',
    location: 'Punjab',
    created_at: new Date().toISOString(),
    category: 'Grains',
    ai_suggested_price: 100,
    description: 'Aromatic basmati rice, aged 1 year',
    image_url: null,
    status: 'available',
  },
];

const Products = () => {
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const availableProducts = data.filter(p => p.status === 'available');
      setProducts(availableProducts);
    }
    // Fallback products already set as initial state
  };

  const priceMin = parseFloat(filterMinPrice);
  const priceMax = parseFloat(filterMaxPrice);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const cropName = product.crop_name?.toString().toLowerCase() || '';
      const location = (product.location || '').toString().toLowerCase();
      const category = (product.category || '').toString().toLowerCase();
      const search = searchQuery.trim().toLowerCase();

      if (search && !cropName.includes(search)) {
        return false;
      }
      if (filterLocation.trim() && !location.includes(filterLocation.trim().toLowerCase())) {
        return false;
      }
      if (filterCategory.trim() && !category.includes(filterCategory.trim().toLowerCase())) {
        return false;
      }
      const productPrice = Number(product.farmer_price);
      if (!Number.isNaN(priceMin) && productPrice < priceMin) {
        return false;
      }
      if (!Number.isNaN(priceMax) && productPrice > priceMax) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, filterLocation, filterCategory, priceMin, priceMax]);

  const locationOptions = useMemo(
    () => Array.from(new Set(products.map((product) => product.location || '').filter(Boolean))),
    [products]
  );

  const categoryOptions = useMemo(
    () => Array.from(new Set(products.map((product) => product.category || '').filter(Boolean))),
    [products]
  );

  const resetFilters = () => {
    setSearchQuery('');
    setFilterLocation('');
    setFilterCategory('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
          <p className="text-gray-600">Browse fresh produce directly from our verified farmers</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100 bg-white">
            <div className="grid gap-4 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search crop</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rice, Wheat, Corn..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  list="location-options"
                  type="text"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  placeholder="City, Village, State"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <datalist id="location-options">
                  {locationOptions.map((location) => (
                    <option key={location} value={location} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={filterMinPrice}
                    onChange={(e) => setFilterMinPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="₹10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={filterMaxPrice}
                    onChange={(e) => setFilterMaxPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="₹1000"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all bg-white"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.crop_name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                      <Sprout size={64} className="text-green-400" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {product.crop_name}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{product.location || 'Unknown Location'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{formatUploadDate(product.created_at || product.upload_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-gray-400" />
                        <span>{product.category || detectProductCategory(product.crop_name) || 'Other'}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Available: {product.quantity} {product.unit}</p>
                    <p className="text-lg font-bold text-green-600">
                      ₹{product.farmer_price}/{product.unit}
                    </p>
                    {product.ai_suggested_price && (
                      <p className="text-xs text-blue-600">
                        AI Fair Price: ₹{product.ai_suggested_price}/{product.unit}
                      </p>
                    )}
                    {product.description && (
                      <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                    )}
                    <button 
                      onClick={() => navigate('/login')}
                      className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;