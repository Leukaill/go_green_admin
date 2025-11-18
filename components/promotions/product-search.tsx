'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';

interface Product {
  id: string;
  name: string;
  image_url?: string;
  price: number;
  category?: string;
}

interface ProductSearchProps {
  selectedProducts: string[];
  onProductsChange: (productIds: string[]) => void;
  maxProducts?: number;
}

export function ProductSearch({ selectedProducts, onProductsChange, maxProducts = 5 }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProductsData, setSelectedProductsData] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load selected products data
  useEffect(() => {
    if (selectedProducts.length > 0) {
      loadSelectedProducts();
    } else {
      setSelectedProductsData([]);
    }
  }, [selectedProducts]);

  // Search products as user types
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const delayDebounce = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSelectedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image_url, price, category')
        .in('id', selectedProducts);

      if (!error && data) {
        setSelectedProductsData(data);
      }
    } catch (error) {
      console.error('Error loading selected products:', error);
    }
  };

  const searchProducts = async (query: string) => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image_url, price, category')
        .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(10);

      if (!error && data) {
        // Filter out already selected products
        const filtered = data.filter(p => !selectedProducts.includes(p.id));
        setSearchResults(filtered);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleSelectProduct = (product: Product) => {
    if (selectedProducts.length >= maxProducts) {
      return;
    }

    const newSelected = [...selectedProducts, product.id];
    onProductsChange(newSelected);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleRemoveProduct = (productId: string) => {
    const newSelected = selectedProducts.filter(id => id !== productId);
    onProductsChange(newSelected);
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            className="pl-10"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto shadow-lg">
            <div className="p-2">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors text-left"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      RWF {product.price.toLocaleString()}
                      {product.category && ` • ${product.category}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* No Results */}
        {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
          <Card className="absolute z-50 w-full mt-1 p-4 text-center text-sm text-muted-foreground shadow-lg">
            No products found
          </Card>
        )}
      </div>

      {/* Selected Products */}
      {selectedProductsData.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Selected Products ({selectedProductsData.length}/{maxProducts})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedProductsData.map((product) => (
              <Badge
                key={product.id}
                variant="secondary"
                className="pl-2 pr-1 py-1 flex items-center gap-2"
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-5 h-5 object-cover rounded"
                  />
                )}
                <span className="text-sm">{product.name}</span>
                <button
                  onClick={() => handleRemoveProduct(product.id)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Max Products Warning */}
      {selectedProducts.length >= maxProducts && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxProducts} products can be selected
        </p>
      )}
    </div>
  );
}
