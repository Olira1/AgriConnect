import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Star, Send } from 'lucide-react';

interface Order {
  id: string;
  productName: string;
  farmerName: string;
  farmerId: string;
  status: string;
}

const RateFarm = () => {
  const { userData } = useAuth();
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDeliveredOrders();
  }, [userData]);

  const fetchDeliveredOrders = async () => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('consumerId', '==', userData?.uid),
        where('status', '==', 'delivered')
      );
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setDeliveredOrders(ordersData);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!selectedOrder) return;

    setSubmitting(true);

    try {
      await addDoc(collection(db, 'ratings'), {
        farmerId: selectedOrder.farmerId,
        farmerName: selectedOrder.farmerName,
        consumerId: userData?.uid,
        consumerName: userData?.name,
        orderId: selectedOrder.id,
        productName: selectedOrder.productName,
        stars: rating,
        comment,
        createdAt: new Date(),
      });

      toast.success('Rating submitted successfully!');
      setSelectedOrder(null);
      setRating(0);
      setComment('');
      setDeliveredOrders(deliveredOrders.filter((order) => order.id !== selectedOrder.id));
    } catch (error) {
      toast.error('Failed to submit rating');
      console.error(error);
    } finally {
      setSubmitting(false);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rate Farms</h1>
          <p className="text-gray-600">Share your experience with delivered orders</p>
        </div>

        {deliveredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders to rate</h3>
            <p className="text-gray-600">Delivered orders eligible for rating will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliveredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{order.productName}</h3>
                <p className="text-gray-600 mb-4">from {order.farmerName}</p>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  <Star className="w-5 h-5" />
                  Rate this Farm
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Rate Your Experience</h2>
            <p className="text-gray-600 mb-6">
              {selectedOrder.productName} from {selectedOrder.farmerName}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Rating
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                placeholder="Share your experience with this farmer..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSubmitRating}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
              >
                <Send className="w-5 h-5" />
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setRating(0);
                  setComment('');
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RateFarm;
