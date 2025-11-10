import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userData?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (userData?.role === 'farmer') {
      navigate('/farmer/products');
    } else if (userData?.role === 'consumer') {
      navigate('/marketplace');
    }
  }, [userData, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );
};

export default Dashboard;
