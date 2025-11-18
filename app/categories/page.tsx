'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconPicker } from '@/components/ui/icon-picker';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  FolderTree,
  Package,
  TrendingUp,
  User,
  Clock,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { isSuperAdmin } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';
import { getIconComponent } from '@/lib/category-icons';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by_id?: string;
  updated_by_id?: string;
  created_by_name?: string;
  updated_by_name?: string;
  product_count?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Package',
    display_order: 0,
  });

  useEffect(() => {
    setIsSuperAdminUser(isSuperAdmin());
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Fetch categories with admin details
      const { data, error } = await supabase
        .from('categories_with_admin_details')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: 'Package',
      display_order: categories.length,
    });
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon || 'Package',
      display_order: category.display_order,
    });
    setShowModal(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      const slug = generateSlug(formData.name);

      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            slug: slug,
            description: formData.description,
            icon: formData.icon,
            display_order: formData.display_order,
            updated_by_id: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('Category updated successfully!');
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            slug: slug,
            description: formData.description,
            icon: formData.icon,
            display_order: formData.display_order,
            is_active: true,
            created_by_id: user.id,
          });

        if (error) throw error;
        toast.success('Category added successfully!');
      }

      await fetchCategories();
      setShowModal(false);
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCategories();
      toast.success('Category deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProducts = categories.reduce((sum, cat) => sum + (cat.product_count || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Categories
          </h1>
          <p className="text-gray-600 mt-2">Organize your products into categories</p>
        </div>
        <Button 
          onClick={handleAddCategory}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Total Categories</p>
              <p className="text-4xl font-bold text-blue-600">{categories.length}</p>
            </div>
            <div className="p-4 bg-blue-500 rounded-2xl shadow-lg">
              <FolderTree className="h-8 w-8 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-900 mb-1">Total Products</p>
              <p className="text-4xl font-bold text-purple-600">{totalProducts}</p>
            </div>
            <div className="p-4 bg-purple-500 rounded-2xl shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-900 mb-1">Active Categories</p>
              <p className="text-4xl font-bold text-green-600">
                {categories.filter(c => c.is_active).length}
              </p>
            </div>
            <div className="p-4 bg-green-500 rounded-2xl shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 mb-8 shadow-lg">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base border-2 focus:border-green-500"
          />
        </div>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => {
          const IconComponent = getIconComponent(category.icon || 'Package');
          
          return (
            <Card 
              key={category.id} 
              className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-white/20 rounded-2xl">
                    <IconComponent className="h-12 w-12" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-80 mb-1">Display Order</div>
                    <div className="font-mono text-sm font-semibold">#{category.display_order}</div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                <p className="text-white/90 text-sm">{category.description}</p>
              </div>

              {/* Stats */}
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-xs text-gray-600 mb-1">Products</div>
                    <div className="text-2xl font-bold text-gray-900">{category.product_count || 0}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-xs text-gray-600 mb-1">Status</div>
                    <div className={`text-sm font-bold ${category.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>

                {/* Super Admin Metadata */}
                {isSuperAdminUser && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <User className="h-3 w-3 text-emerald-700" />
                      <span className="text-emerald-900 font-semibold">Created:</span>
                      <span className="text-emerald-700">{category.created_by_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-emerald-700" />
                      <span className="text-emerald-700">
                        {new Date(category.created_at).toLocaleString()}
                      </span>
                    </div>
                    {category.updated_by_name && (
                      <>
                        <div className="border-t border-emerald-200 pt-2 mt-2"></div>
                        <div className="flex items-center gap-2 text-xs">
                          <User className="h-3 w-3 text-emerald-700" />
                          <span className="text-emerald-900 font-semibold">Updated:</span>
                          <span className="text-emerald-700">{category.updated_by_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="h-3 w-3 text-emerald-700" />
                          <span className="text-emerald-700">
                            {new Date(category.updated_at).toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleEditCategory(category)}
                    className="flex-1 border-2 hover:bg-blue-50 hover:border-blue-500"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 border-2 hover:bg-red-50 hover:border-red-500 text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Category Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Vegetables, Fruits, Dairy"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the category"
                  className="mt-2"
                  rows={3}
                />
              </div>

              <IconPicker
                value={formData.icon}
                onChange={(icon) => setFormData({ ...formData, icon })}
              />

              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveCategory} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingCategory ? 'Update Category' : 'Add Category'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
