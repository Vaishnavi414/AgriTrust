import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function detectProductCategory(text) {
  const value = (text || '').toLowerCase();

  const categories = [
    { keywords: ['tomato', 'tomatoes', 'onion', 'potato', 'carrot', 'cabbage', 'spinach', 'lettuce', 'pepper', 'chili'], category: 'Vegetables' },
    { keywords: ['wheat', 'rice', 'barley', 'oats', 'corn', 'maize', 'grain', 'millet'], category: 'Grains' },
    { keywords: ['apple', 'banana', 'mango', 'orange', 'grape', 'berry', 'fruit', 'lemon'], category: 'Fruits' },
    { keywords: ['milk', 'cheese', 'butter', 'yogurt'], category: 'Dairy' },
    { keywords: ['poultry', 'chicken', 'egg', 'meat'], category: 'Protein' },
    { keywords: ['fertilizer', 'compost', 'manure'], category: 'Fertilizers' },
    { keywords: ['herb', 'herbs', 'spice', 'spices'], category: 'Herbs & Spices' },
  ];

  for (const entry of categories) {
    if (entry.keywords.some((keyword) => value.includes(keyword))) {
      return entry.category;
    }
  }

  return 'Other';
}

export function formatUploadDate(dateString) {
  if (!dateString) return 'Unknown Date';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Unknown Date';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}