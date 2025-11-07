import { useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">AgriConnect</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-green-600 font-medium hover:text-green-700 transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-sm"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Connecting Farmers and
            <span className="text-green-600"> Consumers Directly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Fresh produce from local farms delivered straight to your door. Support local agriculture
            and enjoy quality products at fair prices.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/marketplace')}
              className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              Explore Marketplace
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-white text-green-600 border-2 border-green-600 rounded-lg font-semibold text-lg hover:bg-green-50 transition w-full sm:w-auto"
            >
              Get Started
            </button>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Sprout className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Fresh & Local</h3>
            <p className="text-gray-600">
              Get fresh produce directly from local farms in your area. No middlemen, just quality.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Sprout className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Fair Prices</h3>
            <p className="text-gray-600">
              Farmers get fair compensation while consumers enjoy competitive prices on quality produce.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Sprout className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Support Community</h3>
            <p className="text-gray-600">
              Strengthen local economy and build relationships between farmers and consumers.
            </p>
          </div>
        </div>
      </div>

      <footer className="bg-gray-50 border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © 2025 AgriConnect. Empowering Farmers and Consumers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
