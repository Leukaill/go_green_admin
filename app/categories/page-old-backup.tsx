'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Leaf,
  Apple,
  Sprout,
  Wheat,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { isSuperAdmin } from '@/lib/auth';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  productCount: number;
  totalRevenue: number;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

const mockCategories: Category[] = [
  {
    id: 'CAT-001',
    name: 'Vegetables',
    description: 'Fresh organic vegetables from local farms',
    icon: 'Leaf',
    productCount: 45,
    totalRevenue: 12500000,
    createdBy: 'Super Admin',
    createdAt: '2025-10-15 09:00',
  },
  {
    id: 'CAT-002',
    name: 'Fruits',
    description: 'Seasonal fresh fruits',
    icon: 'Apple',
    productCount: 32,
    totalRevenue: 8750000,
    createdBy: 'Admin User',
    createdAt: '2025-10-16 14:30',
    updatedBy: 'Super Admin',
    updatedAt: '2025-11-01 10:20',
  },
  {
    id: 'CAT-003',
    name: 'Herbs',
    description: 'Aromatic herbs and spices',
    icon: 'Sprout',
    productCount: 18,
    totalRevenue: 3200000,
    createdBy: 'Admin User',
    createdAt: '2025-10-20 11:15',
  },
  {
    id: 'CAT-004',
    name: 'Grains',
    description: 'Whole grains and cereals',
    icon: 'Wheat',
    productCount: 25,
    totalRevenue: 6800000,
    createdBy: 'John Doe',
    createdAt: '2025-10-25 16:45',
  },
];

const iconMap: { [key: string]: any } = {
  Leaf,
  Apple,
  Sprout,
  Wheat,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Leaf',
  });

  useEffect(() => {
    setIsSuperAdminUser(isSuperAdmin());
  }, []);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', icon: 'Leaf' });
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
    });
    setShowModal(true);
  };

  const handleSaveCategory = () => {
    if (!formData.name || !formData.description) {
      toast.error('Please fill in all fields');
      return;
    }

    if (editingCategory) {
      setCategories(categories.map(cat =>
        cat.id === editingCategory.id
          ? { ...cat, ...formData, updatedBy: 'Current User', updatedAt: new Date().toLocaleString() }
          : cat
      ));
      toast.success('Category updated successfully');
    } else {
      const newCategory: Category = {
        id: `CAT-${String(categories.length + 1).padStart(3, '0')}`,
        ...formData,
        productCount: 0,
        totalRevenue: 0,
        createdBy: 'Current User',
        createdAt: new Date().toLocaleString(),
      };
      setCategories([...categories, newCategory]);
      toast.success('Category added successfully');
    }
    setShowModal(false);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Category deleted successfully');
    }
  };

  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);
  const totalRevenue = categories.reduce((sum, cat) => sum + cat.totalRevenue, 0);

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
              <p className="text-sm font-semibold text-green-900 mb-1">Total Revenue</p>
              <p className="text-4xl font-bold text-green-600">
                {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(totalRevenue)}
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
        {filteredCategories.map((category) => (
          <Card 
            key={category.id} 
            className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 rounded-2xl">
                  {(() => {
                    const IconComponent = iconMap[category.icon];
                    return IconComponent ? <IconComponent className="h-12 w-12" /> : <FolderTree className="h-12 w-12" />;
                  })()}
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-80 mb-1">Category ID</div>
                  <div className="font-mono text-sm font-semibold">{category.id}</div>
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
                  <div className="text-2xl font-bold text-gray-900">{category.productCount}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-xs text-gray-600 mb-1">Revenue</div>
                  <div className="text-lg font-bold text-green-600">
                    {new Intl.NumberFormat('en-RW', { notation: 'compact', compactDisplay: 'short' }).format(category.totalRevenue)}
                  </div>
                </div>
              </div>

              {/* Super Admin Metadata */}
              {isSuperAdminUser && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <User className="h-3 w-3 text-emerald-700" />
                    <span className="text-emerald-900 font-semibold">Created:</span>
                    <span className="text-emerald-700">{category.createdBy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-3 w-3 text-emerald-700" />
                    <span className="text-emerald-700">{category.createdAt}</span>
                  </div>
                  {category.updatedBy && (
                    <>
                      <div className="border-t border-emerald-200 pt-2 mt-2"></div>
                      <div className="flex items-center gap-2 text-xs">
                        <User className="h-3 w-3 text-emerald-700" />
                        <span className="text-emerald-900 font-semibold">Updated:</span>
                        <span className="text-emerald-700">{category.updatedBy}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3 text-emerald-700" />
                        <span className="text-emerald-700">{category.updatedAt}</span>
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
        ))}
      </div>

      {/* Add/Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-8">
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
                <Label>Category Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Vegetables"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the category"
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label>Icon</Label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full mt-2 h-10 px-3 border border-gray-200 rounded-md"
                >
                  <option value="Leaf">🥬 Leaf (Vegetables)</option>
                  <option value="Apple">🍎 Apple (Fruits)</option>
                  <option value="Sprout">🌿 Sprout (Herbs)</option>
                  <option value="Wheat">🌾 Wheat (Grains)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveCategory} className="flex-1 bg-green-600 hover:bg-green-700">
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
