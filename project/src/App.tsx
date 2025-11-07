import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

import AddProduct from './pages/farmer/AddProduct';
import MyProducts from './pages/farmer/MyProducts';
import Community from './pages/farmer/Community';
import SuggestedPrices from './pages/farmer/SuggestedPrices';
import OrdersReceived from './pages/farmer/OrdersReceived';

import Marketplace from './pages/consumer/Marketplace';
import ProductDetails from './pages/consumer/ProductDetails';
import Cart from './pages/consumer/Cart';
import MyOrders from './pages/consumer/MyOrders';
import RateFarm from './pages/consumer/RateFarm';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetails />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/products"
            element={
              <ProtectedRoute role="farmer">
                <MyProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/add-product"
            element={
              <ProtectedRoute role="farmer">
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/community"
            element={
              <ProtectedRoute role="farmer">
                <Community />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/suggested-prices"
            element={
              <ProtectedRoute role="farmer">
                <SuggestedPrices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/orders"
            element={
              <ProtectedRoute role="farmer">
                <OrdersReceived />
              </ProtectedRoute>
            }
          />

          <Route
            path="/consumer/cart"
            element={
              <ProtectedRoute role="consumer">
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/orders"
            element={
              <ProtectedRoute role="consumer">
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/rate"
            element={
              <ProtectedRoute role="consumer">
                <RateFarm />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
