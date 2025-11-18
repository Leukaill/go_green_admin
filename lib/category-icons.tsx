import {
  Leaf, Apple, Carrot, Cherry, Grape, 
  Banana, Salad, Sprout, Wheat, Milk, Egg, Fish, Beef,
  Pizza, Coffee, Cookie, IceCream, Cake, Candy, Wine, Beer,
  Soup, Sandwich, Drumstick, Ham, Croissant, Popcorn,
  Flame, Snowflake, Package, ShoppingBag, Store,
  Droplet, TreePine, Flower2, Palmtree, Trees, Flower,
  Sparkles, Crown, Award, Tag, Percent, Gift,
  Sun, Heart, Star, Gem, Shield
} from 'lucide-react';

export interface CategoryIcon {
  name: string;
  component: any;
  label: string;
  category: 'produce' | 'food' | 'drinks' | 'special';
}

// Curated list of icons relevant to grocery/produce website
export const categoryIcons: CategoryIcon[] = [
  // Fresh Produce
  { name: 'Leaf', component: Leaf, label: 'Leaf (Vegetables)', category: 'produce' },
  { name: 'Apple', component: Apple, label: 'Apple (Fruits)', category: 'produce' },
  { name: 'Carrot', component: Carrot, label: 'Carrot (Root Vegetables)', category: 'produce' },
  { name: 'Cherry', component: Cherry, label: 'Cherry (Berries)', category: 'produce' },
  { name: 'Grape', component: Grape, label: 'Grape (Fruits)', category: 'produce' },
  { name: 'Banana', component: Banana, label: 'Banana (Tropical Fruits)', category: 'produce' },
  { name: 'Salad', component: Salad, label: 'Salad (Leafy Greens)', category: 'produce' },
  { name: 'Sprout', component: Sprout, label: 'Sprout (Herbs & Sprouts)', category: 'produce' },
  { name: 'Wheat', component: Wheat, label: 'Wheat (Grains & Cereals)', category: 'produce' },
  { name: 'TreePine', component: TreePine, label: 'Tree (Organic/Natural)', category: 'produce' },
  { name: 'Flower2', component: Flower2, label: 'Flower (Fresh Flowers)', category: 'produce' },
  { name: 'Palmtree', component: Palmtree, label: 'Palm Tree (Tropical)', category: 'produce' },
  { name: 'Trees', component: Trees, label: 'Trees (Farm Fresh)', category: 'produce' },
  { name: 'Flower', component: Flower, label: 'Flower (Garden)', category: 'produce' },
  
  // Protein & Dairy
  { name: 'Milk', component: Milk, label: 'Milk (Dairy Products)', category: 'food' },
  { name: 'Egg', component: Egg, label: 'Egg (Eggs & Protein)', category: 'food' },
  { name: 'Fish', component: Fish, label: 'Fish (Seafood)', category: 'food' },
  { name: 'Beef', component: Beef, label: 'Beef (Meat)', category: 'food' },
  { name: 'Drumstick', component: Drumstick, label: 'Drumstick (Poultry)', category: 'food' },
  { name: 'Ham', component: Ham, label: 'Ham (Deli & Cold Cuts)', category: 'food' },
  
  // Prepared Foods & Bakery
  { name: 'Pizza', component: Pizza, label: 'Pizza (Ready Meals)', category: 'food' },
  { name: 'Sandwich', component: Sandwich, label: 'Sandwich (Sandwiches)', category: 'food' },
  { name: 'Soup', component: Soup, label: 'Soup (Soups & Stews)', category: 'food' },
  { name: 'Croissant', component: Croissant, label: 'Croissant (Bakery)', category: 'food' },
  { name: 'Popcorn', component: Popcorn, label: 'Popcorn (Snacks)', category: 'food' },
  { name: 'Cookie', component: Cookie, label: 'Cookie (Baked Goods)', category: 'food' },
  { name: 'Cake', component: Cake, label: 'Cake (Desserts)', category: 'food' },
  { name: 'IceCream', component: IceCream, label: 'Ice Cream (Frozen)', category: 'food' },
  { name: 'Candy', component: Candy, label: 'Candy (Sweets)', category: 'food' },
  
  // Beverages
  { name: 'Coffee', component: Coffee, label: 'Coffee (Hot Beverages)', category: 'drinks' },
  { name: 'Wine', component: Wine, label: 'Wine (Wine)', category: 'drinks' },
  { name: 'Beer', component: Beer, label: 'Beer (Beer)', category: 'drinks' },
  { name: 'Droplet', component: Droplet, label: 'Droplet (Water & Juices)', category: 'drinks' },
  
  // Special Categories
  { name: 'Package', component: Package, label: 'Package (General Products)', category: 'special' },
  { name: 'ShoppingBag', component: ShoppingBag, label: 'Shopping Bag (Groceries)', category: 'special' },
  { name: 'Store', component: Store, label: 'Store (Shop)', category: 'special' },
  { name: 'Tag', component: Tag, label: 'Tag (Sale Items)', category: 'special' },
  { name: 'Percent', component: Percent, label: 'Percent (Discounts)', category: 'special' },
  { name: 'Award', component: Award, label: 'Award (Premium Quality)', category: 'special' },
  { name: 'Crown', component: Crown, label: 'Crown (Premium)', category: 'special' },
  { name: 'Gem', component: Gem, label: 'Gem (Specialty Items)', category: 'special' },
  { name: 'Gift', component: Gift, label: 'Gift (Gift Baskets)', category: 'special' },
  { name: 'Star', component: Star, label: 'Star (Featured)', category: 'special' },
  { name: 'Sparkles', component: Sparkles, label: 'Sparkles (New Arrivals)', category: 'special' },
  { name: 'Heart', component: Heart, label: 'Heart (Healthy Options)', category: 'special' },
  { name: 'Shield', component: Shield, label: 'Shield (Organic/Certified)', category: 'special' },
  { name: 'Flame', component: Flame, label: 'Flame (Hot & Spicy)', category: 'special' },
  { name: 'Snowflake', component: Snowflake, label: 'Snowflake (Frozen Foods)', category: 'special' },
  { name: 'Sun', component: Sun, label: 'Sun (Fresh & Seasonal)', category: 'special' },
];

// Helper function to get icon component by name
export function getIconComponent(iconName: string) {
  const icon = categoryIcons.find(i => i.name === iconName);
  return icon?.component || Package;
}

// Helper function to get icon label by name
export function getIconLabel(iconName: string) {
  const icon = categoryIcons.find(i => i.name === iconName);
  return icon?.label || iconName;
}

// Group icons by category
export function getIconsByCategory() {
  const grouped: Record<string, CategoryIcon[]> = {
    produce: [],
    food: [],
    drinks: [],
    special: [],
  };
  
  categoryIcons.forEach(icon => {
    grouped[icon.category].push(icon);
  });
  
  return grouped;
}
