'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Star,
  Package,
  User,
  Clock,
  Filter,
  Grid3x3,
  List,
  Image as ImageIcon
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { isSuperAdmin } from '@/lib/auth';
import { getIconComponent } from '@/lib/category-icons';
import { supabase } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: 'fruits' | 'vegetables';
  origin: 'local' | 'imported';
  image_url: string;
  stock: number;
  is_featured: boolean;
  is_available: boolean;
  category_id?: string;
  health_benefits?: string[];
  nutrition_facts?: { label: string; value: string }[];
  created_at: string;
  updated_at: string;
}


interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    unit: 'per kg',
    origin: 'local' as 'local' | 'imported',
    image_url: '',
    is_featured: false,
    health_benefits: '',
    nutrition_facts: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    setIsSuperAdminUser(isSuperAdmin());
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, icon')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
        return;
      }

      setProducts((data as Product[]) || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while loading products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const optimizeAndUploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for optimization
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;

          // Calculate dimensions (max 1200px width, maintain aspect ratio)
          let width = img.width;
          let height = img.height;
          const maxWidth = 1200;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                reject(new Error('Failed to optimize image'));
                return;
              }

              // Upload to Supabase Storage
              const fileName = `products/${Date.now()}-${file.name}`;
              const { data, error } = await supabase.storage
                .from('product-images')
                .upload(fileName, blob, {
                  contentType: 'image/jpeg',
                  cacheControl: '3600',
                });

              if (error) {
                reject(error);
                return;
              }

              // Get public URL
              const { data: urlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName);

              resolve(urlData.publicUrl);
            },
            'image/jpeg',
            0.85 // 85% quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddProduct = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      unit: 'per kg',
      origin: 'local',
      image_url: '',
      is_featured: false,
      health_benefits: '',
      nutrition_facts: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setIsAddDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category_id: product.category_id || (categories.length > 0 ? categories[0].id : ''),
      unit: product.unit,
      origin: product.origin,
      image_url: product.image_url,
      is_featured: product.is_featured,
      health_benefits: product.health_benefits?.join('\n') || '',
      nutrition_facts: product.nutrition_facts?.map(nf => `${nf.label}: ${nf.value}`).join('\n') || '',
    });
    setImageFile(null);
    setImagePreview(null);
    setIsEditDialogOpen(true);
  };

  const handleSubmitAdd = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = formData.image_url;

      // Upload and optimize image if selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await optimizeAndUploadImage(imageFile);
          toast.success('Image uploaded and optimized!');
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError);
          toast.error('Failed to upload image, but continuing...');
        } finally {
          setUploadingImage(false);
        }
      }

      // Parse health benefits (one per line)
      const healthBenefits = formData.health_benefits
        .split('\n')
        .map(b => b.trim())
        .filter(b => b.length > 0);

      // Parse nutrition facts (format: "Label: Value" per line)
      const nutritionFacts = formData.nutrition_facts
        .split('\n')
        .map(line => {
          const [label, value] = line.split(':').map(s => s.trim());
          return label && value ? { label, value } : null;
        })
        .filter(nf => nf !== null);

      const { error } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: 0,
          category_id: formData.category_id,
          unit: formData.unit,
          origin: formData.origin,
          image_url: imageUrl || '',
          is_featured: formData.is_featured,
          is_available: true,
          health_benefits: healthBenefits.length > 0 ? healthBenefits : null,
          nutrition_facts: nutritionFacts.length > 0 ? nutritionFacts : null,
        });

      if (error) throw error;

      await fetchProducts();
      setIsAddDialogOpen(false);
      setImageFile(null);
      setImagePreview(null);
      toast.success('Product added successfully!');
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(error.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!formData.name || !formData.price || !editingProduct) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = editingProduct.image_url;

      // Upload and optimize new image if selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await optimizeAndUploadImage(imageFile);
          toast.success('Image uploaded and optimized!');
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError);
          toast.error('Failed to upload image, keeping current image...');
        } finally {
          setUploadingImage(false);
        }
      }

      // Parse health benefits (one per line)
      const healthBenefits = formData.health_benefits
        .split('\n')
        .map(b => b.trim())
        .filter(b => b.length > 0);

      // Parse nutrition facts (format: "Label: Value" per line)
      const nutritionFacts = formData.nutrition_facts
        .split('\n')
        .map(line => {
          const [label, value] = line.split(':').map(s => s.trim());
          return label && value ? { label, value } : null;
        })
        .filter(nf => nf !== null);

      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category_id: formData.category_id,
          unit: formData.unit,
          origin: formData.origin,
          image_url: imageUrl || '',
          is_featured: formData.is_featured,
          is_available: true,
          health_benefits: healthBenefits.length > 0 ? healthBenefits : null,
          nutrition_facts: nutritionFacts.length > 0 ? nutritionFacts : null,
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      await fetchProducts();
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      setImageFile(null);
      setImagePreview(null);
      toast.success('Product updated successfully!');
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const getAvailabilityColor = (isAvailable: boolean) => {
    return isAvailable
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">
                {products.filter(p => p.is_available).length}
              </p>
            </div>
            <Star className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Featured Products</p>
              <p className="text-2xl font-bold text-yellow-600">
                {products.filter(p => p.is_featured).length}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(products.map(p => p.category).filter(Boolean)).size}
              </p>
            </div>
            <Filter className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Search & View Toggle */}
      <Card className="p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products by name, category, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Products Display - List or Grid */}
      {viewMode === 'list' ? (
        /* Products Table */
        <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-900">Name</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900">Category</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900">Price</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900">Stock</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900">Origin</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900">Available</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-500 mt-2">Loading products...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-gray-900">{product.name}</div>
                        {product.description && (
                          <div className="text-xs text-gray-600 mt-1">{product.description.substring(0, 50)}...</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-700 capitalize">{product.category}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-gray-900">{formatPrice(product.price)}</div>
                        <div className="text-xs text-gray-600">{product.unit}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-gray-900">{product.stock}</span>
                    </td>
                    <td className="p-4">
                      <Badge className={product.origin === 'local' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                        {product.origin}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={getAvailabilityColor(product.is_available)}>
                        {product.is_available ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-500">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold">No products found</p>
              <p className="text-sm mt-2">Try adjusting your search</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Product Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                  {/* Featured Badge */}
                  {product.is_featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Star className="h-3 w-3 fill-current" />
                      Featured
                    </div>
                  )}
                  {/* Availability Badge */}
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold shadow-lg ${
                    product.is_available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {product.is_available ? 'Available' : 'Unavailable'}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  {/* Name & Category */}
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 capitalize mt-1">{product.category}</p>
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Price & Stock */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPrice(product.price)}
                      </p>
                      <p className="text-xs text-gray-500">{product.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{product.stock} units</p>
                      <Badge className={product.origin === 'local' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                        {product.origin}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Fresh Tomatoes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (RWF) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="2500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => {
                      const IconComponent = getIconComponent(cat.icon);
                      return (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {cat.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="per kg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Select
                value={formData.origin}
                onValueChange={(value: 'local' | 'imported') => setFormData({ ...formData, origin: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select origin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="imported">Imported</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">Max 5MB. Image will be optimized for web and mobile.</p>
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded border" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="health_benefits">Health Benefits (one per line)</Label>
              <Textarea
                id="health_benefits"
                value={formData.health_benefits}
                onChange={(e) => setFormData({ ...formData, health_benefits: e.target.value })}
                placeholder="Rich in vitamins and minerals&#10;Supports immune system&#10;High in antioxidants&#10;Promotes healthy digestion"
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">Enter each benefit on a new line</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nutrition_facts">Nutrition Facts (format: Label: Value)</Label>
              <Textarea
                id="nutrition_facts"
                value={formData.nutrition_facts}
                onChange={(e) => setFormData({ ...formData, nutrition_facts: e.target.value })}
                placeholder="Calories: 52 per 100g&#10;Protein: 2.6g&#10;Carbs: 11g&#10;Fiber: 2.4g&#10;Vitamin C: 45mg"
                rows={5}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">Format: Label: Value (one per line)</p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_featured" className="cursor-pointer">Feature this product on homepage</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdd} disabled={submitting} className="bg-green-600 hover:bg-green-700">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Fresh Tomatoes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (RWF) *</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="2500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => {
                      const IconComponent = getIconComponent(cat.icon);
                      return (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {cat.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit *</Label>
                <Input
                  id="edit-unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="per kg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-origin">Origin</Label>
              <Select
                value={formData.origin}
                onValueChange={(value: 'local' | 'imported') => setFormData({ ...formData, origin: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select origin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="imported">Imported</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Product Image</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">Max 5MB. Leave empty to keep current image.</p>
              {imagePreview ? (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded border" />
                </div>
              ) : editingProduct?.image_url ? (
                <div className="mt-2">
                  <img src={editingProduct.image_url} alt="Current" className="h-32 w-32 object-cover rounded border" />
                  <p className="text-xs text-gray-500 mt-1">Current image</p>
                </div>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-health_benefits">Health Benefits (one per line)</Label>
              <Textarea
                id="edit-health_benefits"
                value={formData.health_benefits}
                onChange={(e) => setFormData({ ...formData, health_benefits: e.target.value })}
                placeholder="Rich in vitamins and minerals&#10;Supports immune system&#10;High in antioxidants&#10;Promotes healthy digestion"
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">Enter each benefit on a new line</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nutrition_facts">Nutrition Facts (format: Label: Value)</Label>
              <Textarea
                id="edit-nutrition_facts"
                value={formData.nutrition_facts}
                onChange={(e) => setFormData({ ...formData, nutrition_facts: e.target.value })}
                placeholder="Calories: 52 per 100g&#10;Protein: 2.6g&#10;Carbs: 11g&#10;Fiber: 2.4g&#10;Vitamin C: 45mg"
                rows={5}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">Format: Label: Value (one per line)</p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="edit-is_featured" className="cursor-pointer">Feature this product on homepage</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
