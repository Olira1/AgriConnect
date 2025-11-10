import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';
import Footer from '../../components/Footer';
import { DollarSign, Plus, Edit, Trash2 } from 'lucide-react';

interface SuggestedPrice {
  id: string;
  productName: string;
  suggestedPrice: number;
  updatedAt: Date;
}

const SuggestedPricesAdmin = () => {
  const [prices, setPrices] = useState<SuggestedPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState<SuggestedPrice | null>(null);
  const [formData, setFormData] = useState({
    productName: '',
    suggestedPrice: '',
  });

  useEffect(() => {
    fetchSuggestedPrices();
  }, []);

  const fetchSuggestedPrices = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'suggestedPrices'));
      const pricesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as SuggestedPrice[];
      setPrices(pricesData.sort((a, b) => a.productName.localeCompare(b.productName)));
    } catch (error) {
      toast.error('Failed to fetch suggested prices');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.suggestedPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (editingPrice) {
        // Update existing price
        await setDoc(doc(db, 'suggestedPrices', editingPrice.id), {
          productName: formData.productName,
          suggestedPrice: Number(formData.suggestedPrice),
          updatedAt: new Date(),
        });
        toast.success('Price updated successfully');
      } else {
        // Check if product name already exists
        const q = query(collection(db, 'suggestedPrices'), where('productName', '==', formData.productName));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          toast.error('A price suggestion for this product already exists');
          return;
        }

        // Add new price
        await setDoc(doc(collection(db, 'suggestedPrices')), {
          productName: formData.productName,
          suggestedPrice: Number(formData.suggestedPrice),
          updatedAt: new Date(),
        });
        toast.success('Price suggestion added successfully');
      }

      setFormData({ productName: '', suggestedPrice: '' });
      setShowForm(false);
      setEditingPrice(null);
      fetchSuggestedPrices();
    } catch (error) {
      toast.error('Failed to save price suggestion');
      console.error(error);
    }
  };

  const handleEdit = (price: SuggestedPrice) => {
    setEditingPrice(price);
    setFormData({
      productName: price.productName,
      suggestedPrice: price.suggestedPrice.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price suggestion?')) return;

    try {
      await deleteDoc(doc(db, 'suggestedPrices', id));
      toast.success('Price suggestion deleted successfully');
      fetchSuggestedPrices();
    } catch (error) {
      toast.error('Failed to delete price suggestion');
      console.error(error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPrice(null);
    setFormData({ productName: '', suggestedPrice: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Suggested Prices</h1>
            <p className="text-gray-600">Manage market price suggestions for farmers</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Price
          </button>
        </div>

        {prices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">No suggested prices available yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Add First Price Suggestion
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Product Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Suggested Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Last Updated
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {prices.map((price) => (
                    <tr key={price.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{price.productName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-600 font-bold text-lg">
                          ${price.suggestedPrice.toFixed(2)}/unit
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {price.updatedAt.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(price)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(price.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingPrice ? 'Edit Price Suggestion' : 'Add Price Suggestion'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  required
                  disabled={!!editingPrice}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  placeholder="e.g., Fresh Tomatoes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suggested Price ($)
                </label>
                <input
                  type="number"
                  value={formData.suggestedPrice}
                  onChange={(e) => setFormData({ ...formData, suggestedPrice: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  {editingPrice ? 'Update' : 'Add'} Price
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SuggestedPricesAdmin;

