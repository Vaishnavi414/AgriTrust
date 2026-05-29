// Cache for API data to avoid too many requests
let apiDataCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// API configuration
const API_KEY = '579b464db66ec23bdd000001f0dde9a8311142426ec92823586ec963';
const API_ENDPOINT = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

function detectProductCategoryLocal(text) {
  const value = (text || '').toLowerCase();
  if (value.includes('tomato') || value.includes('onion') || value.includes('potato')) return 'vegetables';
  if (value.includes('wheat') || value.includes('rice') || value.includes('corn')) return 'grains';
  if (value.includes('milk') || value.includes('paneer') || value.includes('cheese')) return 'dairy';
  if (value.includes(' mango') || value.includes('fruit')) return 'fruits';
  if (value.includes('fertilizer') || value.includes('organic')) return 'fertilizers';
  return 'other';
}

/**
 * Fetch real-time market prices from data.gov.in API
 * @returns {Promise<Array>} Array of price records
 */
async function fetchMarketPrices() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (apiDataCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
    return apiDataCache;
  }
  
  try {
    const response = await fetch(`${API_ENDPOINT}?api-key=${API_KEY}&format=json&limit=1000`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the data
    apiDataCache = data.records || [];
    cacheTimestamp = now;
    
    return apiDataCache;
  } catch (error) {
    console.error('Error fetching market prices:', error);
    
    // Return cached data if available, even if expired
    if (apiDataCache) {
      return apiDataCache;
    }
    
    // Return empty array if no data available
    return [];
  }
}

/**
 * Get average modal price for a specific commodity from market data
 * @param {string} commodityName - Name of the commodity
 * @param {Array} marketData - Array of market price records
 * @returns {number} Average price per quintal (100 kg) in rupees
 */
function getAveragePriceForCommodity(commodityName, marketData) {
  if (!marketData || marketData.length === 0) {
    return null;
  }
  
  // Filter records for the specific commodity (case-insensitive)
  const commodityRecords = marketData.filter(record => 
    record.commodity && 
    record.commodity.toLowerCase().trim() === commodityName.toLowerCase().trim()
  );
  
  if (commodityRecords.length === 0) {
    return null;
  }
  
  // Calculate average modal price
  const validPrices = commodityRecords
    .filter(record => record.modal_price !== null && record.modal_price !== undefined && record.modal_price !== '')
    .map(record => parseFloat(record.modal_price))
    .filter(price => !isNaN(price));
  
  if (validPrices.length === 0) {
    return null;
  }
  
  const sum = validPrices.reduce((acc, price) => acc + price, 0);
  return sum / validPrices.length;
}

/**
 * Convert price from per quintal to per kg
 * @param {number} pricePerQuintal - Price per quintal (100 kg)
 * @returns {number} Price per kg
 */
function convertQuintalToKg(pricePerQuintal) {
  return pricePerQuintal / 100;
}

/**
 * Get base prices for common crops from API data
 * @returns {Promise<Object>} Object mapping crop names to base prices per kg
 */
async function getBasePrices() {
  try {
    const marketData = await fetchMarketPrices();
    const basePrices = {};
    
    // Common crops we want to support
    const commonCrops = [
      'rice', 'wheat', 'corn', 'sugarcane', 'cotton', 'soybean', 
      'potato', 'tomato', 'onion', 'carrot', 'cabbage', 'beans'
    ];
    
    // For each crop, try to get price from API
    for (const crop of commonCrops) {
      const pricePerQuintal = getAveragePriceForCommodity(crop, marketData);
      if (pricePerQuintal !== null) {
        basePrices[crop] = convertQuintalToKg(pricePerQuintal);
      }
    }
    
    return basePrices;
  } catch (error) {
    console.error('Error getting base prices:', error);
    return {};
  }
}

/**
 * Predict price for a crop based on real-time market data
 * @param {string} cropName - Name of the crop
 * @param {number} quantity - Quantity in kg
 * @returns {Promise<number>} Predicted price per kg
 */
export async function predictPrice(cropName, quantity) {
  try {
    // Get base prices from API
    const basePrices = await getBasePrices();
    
    // Normalize crop name for lookup
    const normalizedCrop = cropName.toLowerCase().trim();
    
    // Get base price for the crop (fallback to 30 if not found)
    let basePrice = basePrices[normalizedCrop] || 30;
    
    // Apply quantity-based multiplier
    let quantityMultiplier = 1;
    if (quantity > 1000) {
      quantityMultiplier = 0.95;
    } else if (quantity > 500) {
      quantityMultiplier = 0.97;
    } else if (quantity < 50) {
      quantityMultiplier = 1.05;
    }
    
    // Apply seasonal variation (±5%)
    const seasonalVariation = Math.random() * 0.1 - 0.05;
    
    // Calculate final price
    const finalPricePerUnit = basePrice * quantityMultiplier * (1 + seasonalVariation);
    
    return Math.round(finalPricePerUnit * 100) / 100;
  } catch (error) {
    console.error('Error predicting price:', error);
    
    // Fallback to original hardcoded prices if API fails
const basePrices = {
      rice: 40,
      wheat: 35,
      corn: 30,
      sugarcane: 25,
      cotton: 45,
      soybean: 50,
      potato: 20,
      tomato: 25,
      onion: 15,
      carrot: 22,
      cabbage: 18,
      beans: 35,
      paneer: 120,
      milk: 50,
      mango: 80,
      banana: 30,
      apple: 100,
      herbs: 60,
      fertilizer: 200,
    };

    const categoryPrices = {
      grains: 35,
      vegetables: 25,
      fruits: 60,
      dairy: 120,
      protein: 150,
    };

    const normalizedCrop = cropName.toLowerCase().trim();
    let basePrice = basePrices[normalizedCrop] || 30;

    // Try to match by category if crop not found
    if (!basePrices[normalizedCrop]) {
      const category = detectProductCategoryLocal(cropName);
      basePrice = categoryPrices[category] || 30;
    }

    let quantityMultiplier = 1;
    if (quantity > 1000) {
      quantityMultiplier = 0.95;
    } else if (quantity > 500) {
      quantityMultiplier = 0.97;
    } else if (quantity < 50) {
      quantityMultiplier = 1.05;
    }

    const seasonalVariation = Math.random() * 0.1 - 0.05;
    const finalPricePerUnit = basePrice * quantityMultiplier * (1 + seasonalVariation);
    
    return Math.round(finalPricePerUnit * 100) / 100;
  }
}

/**
 * Calculate total price for a given quantity
 * @param {number} pricePerUnit - Price per unit (kg)
 * @param {number} quantity - Quantity in kg
 * @returns {number} Total price
 */
export function calculateTotalPrice(pricePerUnit, quantity) {
  return Math.round(pricePerUnit * quantity * 100) / 100;
}