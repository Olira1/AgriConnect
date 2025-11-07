import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { DollarSign } from 'lucide-react';

interface SuggestedPrice {
  id: string;
  productName: string;
  suggestedPrice: number;
  updatedAt: Date;
}

const SuggestedPrices = () => {
  const [prices, setPrices] = useState<SuggestedPrice[]>([]);
  const [loading, setLoading] = useState(true);

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
      setPrices(pricesData);
    } catch (error) {
      toast.error('Failed to fetch suggested prices');
      console.error(error);
    } finally {
      setLoading(false);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Suggested Prices</h1>
          <p className="text-gray-600">Market prices suggested by admin to help you price competitively</p>
        </div>

        {prices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No suggested prices available yet</p>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SuggestedPrices;
