import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Heart, User } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  pricePerUnit: number;
  imageUrl: string;
  farmerName: string;
  farmerId: string;
  likes: number;
}

const Community = () => {
  const { userData } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCommunityProducts();
  }, [userData]);

  const fetchCommunityProducts = async () => {
    try {
      const q = query(collection(db, 'products'), where('farmerId', '!=', userData?.uid));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      toast.error('Failed to fetch community products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (productId: string) => {
    if (likedProducts.has(productId)) {
      toast.error('You already liked this product');
      return;
    }

    try {
      await updateDoc(doc(db, 'products', productId), {
        likes: increment(1),
      });

      setProducts(
        products.map((p) => (p.id === productId ? { ...p, likes: p.likes + 1 } : p))
      );
      setLikedProducts(new Set([...likedProducts, productId]));
      toast.success('Product liked!');
    } catch (error) {
      toast.error('Failed to like product');
      console.error(error);
    }
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
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Community Products</h1>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <p className="text-gray-600">No products from other farmers yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{product.farmerName}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Category:</span>{' '}
                      <span className="capitalize">{product.category}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Quantity:</span> {product.quantity} kg
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      ${product.pricePerUnit}/unit
                    </p>
                  </div>
                  <button
                    onClick={() => handleLike(product.id)}
                    disabled={likedProducts.has(product.id)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
                      likedProducts.has(product.id)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${likedProducts.has(product.id) ? 'fill-red-600' : ''}`}
                    />
                    {product.likes} {product.likes === 1 ? 'Like' : 'Likes'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Community;
