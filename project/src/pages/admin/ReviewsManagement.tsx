import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';
import Footer from '../../components/Footer';
import { Star, Trash2, Search, User } from 'lucide-react';

interface Review {
  id: string;
  farmerId: string;
  farmerName: string;
  consumerId: string;
  consumerName: string;
  productName: string;
  orderId: string;
  stars: number;
  comment: string;
  createdAt: Date;
}

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [searchQuery, reviews]);

  const fetchReviews = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'ratings'));
      const reviewsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Review[];
      setReviews(reviewsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setFilteredReviews(reviewsData);
    } catch (error) {
      toast.error('Failed to fetch reviews');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.consumerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.comment.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReviews(filtered);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await deleteDoc(doc(db, 'ratings', reviewId));
      setReviews(reviews.filter((r) => r.id !== reviewId));
      toast.success('Review deleted successfully');
    } catch (error) {
      toast.error('Failed to delete review');
      console.error(error);
    }
  };

  const getAverageRating = (farmerId: string) => {
    const farmerReviews = reviews.filter((r) => r.farmerId === farmerId);
    if (farmerReviews.length === 0) return 0;
    const sum = farmerReviews.reduce((acc, r) => acc + r.stars, 0);
    return (sum / farmerReviews.length).toFixed(1);
  };

  const getTopFarmers = () => {
    const farmerRatings: { [key: string]: { name: string; avg: number; count: number } } = {};
    reviews.forEach((review) => {
      if (!farmerRatings[review.farmerId]) {
        farmerRatings[review.farmerId] = {
          name: review.farmerName,
          avg: 0,
          count: 0,
        };
      }
      farmerRatings[review.farmerId].avg += review.stars;
      farmerRatings[review.farmerId].count += 1;
    });

    return Object.entries(farmerRatings)
      .map(([id, data]) => ({
        farmerId: id,
        farmerName: data.name,
        averageRating: data.avg / data.count,
        reviewCount: data.count,
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const topFarmers = getTopFarmers();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews & Ratings Management</h1>
          <p className="text-gray-600">View and moderate farmer ratings and consumer reviews</p>
        </div>

        {topFarmers.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Rated Farmers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {topFarmers.map((farmer) => (
                <div key={farmer.farmerId} className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{farmer.farmerName}</p>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-900">{farmer.averageRating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-600">{farmer.reviewCount} reviews</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reviews found</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{review.consumerName}</p>
                        <p className="text-sm text-gray-600">reviewed {review.farmerName}</p>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{review.productName}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= review.stars
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">({review.stars}/5)</span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mt-2">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-3">
                      {review.createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReviewsManagement;

