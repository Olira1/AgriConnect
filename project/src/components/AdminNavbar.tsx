import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sprout, LogOut, User, LayoutDashboard, Users, Package, ShoppingBag, DollarSign, Star, Megaphone, FileText, Settings } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const AdminNavbar = () => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
      console.error(error);
    }
  };

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/admin/prices', label: 'Prices', icon: DollarSign },
    { to: '/admin/reviews', label: 'Reviews', icon: Star },
    { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/admin/reports', label: 'Reports', icon: FileText },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <Sprout className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">AgriConnect Admin</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg font-medium transition"
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg hover:bg-green-200 transition"
              >
                <User className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-800">{userData?.name}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-800">{userData?.email}</p>
                    <p className="text-xs text-green-600 capitalize mt-1">{userData?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <User className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {showDropdown && (
          <div className="md:hidden pb-4 space-y-2">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-green-50 rounded-lg transition"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;

