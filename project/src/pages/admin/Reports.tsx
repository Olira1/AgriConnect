import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';
import Footer from '../../components/Footer';
import { FileText, Download, TrendingUp, Users, Package, ShoppingBag } from 'lucide-react';

interface ReportData {
  totalUsers: number;
  totalFarmers: number;
  totalConsumers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
}

const Reports = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'year'>('all');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const farmers = usersSnapshot.docs.filter((doc) => doc.data().role === 'farmer');
      const consumers = usersSnapshot.docs.filter((doc) => doc.data().role === 'consumer');

      // Fetch products
      const productsSnapshot = await getDocs(collection(db, 'products'));

      // Fetch orders
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orders = ordersSnapshot.docs.map((doc) => doc.data());

      // Filter by date range if needed
      let filteredOrders = orders;
      if (dateRange !== 'all') {
        const now = new Date();
        const cutoffDate = new Date();
        if (dateRange === 'week') {
          cutoffDate.setDate(now.getDate() - 7);
        } else if (dateRange === 'month') {
          cutoffDate.setMonth(now.getMonth() - 1);
        } else if (dateRange === 'year') {
          cutoffDate.setFullYear(now.getFullYear() - 1);
        }
        filteredOrders = orders.filter((o) => {
          const orderDate = o.createdAt?.toDate() || new Date(0);
          return orderDate >= cutoffDate;
        });
      }

      const pendingOrders = filteredOrders.filter((o) => o.status === 'pending').length;
      const deliveredOrders = filteredOrders.filter((o) => o.status === 'delivered').length;
      const cancelledOrders = filteredOrders.filter((o) => o.status === 'cancelled').length;

      const deliveredOrdersData = filteredOrders.filter((o) => o.status === 'delivered');
      const totalRevenue = deliveredOrdersData.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      const averageOrderValue =
        deliveredOrdersData.length > 0 ? totalRevenue / deliveredOrdersData.length : 0;

      setReportData({
        totalUsers: usersSnapshot.size,
        totalFarmers: farmers.length,
        totalConsumers: consumers.length,
        totalProducts: productsSnapshot.size,
        totalOrders: filteredOrders.length,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        averageOrderValue,
      });
    } catch (error) {
      toast.error('Failed to fetch report data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const csvContent = `AgriConnect Platform Report
Generated: ${new Date().toLocaleString()}
Date Range: ${dateRange}

Summary Statistics
Total Users,${reportData.totalUsers}
Total Farmers,${reportData.totalFarmers}
Total Consumers,${reportData.totalConsumers}
Total Products,${reportData.totalProducts}
Total Orders,${reportData.totalOrders}
Total Revenue,$${reportData.totalRevenue.toFixed(2)}
Pending Orders,${reportData.pendingOrders}
Delivered Orders,${reportData.deliveredOrders}
Cancelled Orders,${reportData.cancelledOrders}
Average Order Value,$${reportData.averageOrderValue.toFixed(2)}
`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agriconnect-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!reportData) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: reportData.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Products',
      value: reportData.totalProducts,
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Orders',
      value: reportData.totalOrders,
      icon: ShoppingBag,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Total Revenue',
      value: `$${reportData.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Generate and download platform reports</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-md"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <div className="flex gap-2">
            {['all', 'week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range as any)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                  dateRange === range
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} rounded-xl p-6 shadow-md hover:shadow-lg transition`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Breakdown</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Farmers</span>
                <span className="font-semibold text-gray-900">{reportData.totalFarmers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Consumers</span>
                <span className="font-semibold text-gray-900">{reportData.totalConsumers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${
                      reportData.totalUsers > 0
                        ? (reportData.totalConsumers / reportData.totalUsers) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending</span>
                <span className="font-semibold text-yellow-600">{reportData.pendingOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Delivered</span>
                <span className="font-semibold text-green-600">{reportData.deliveredOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cancelled</span>
                <span className="font-semibold text-red-600">{reportData.cancelledOrders}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-600">Average Order Value</span>
                <span className="font-bold text-green-600">
                  ${reportData.averageOrderValue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Report</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Metric</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-gray-600">Total Users</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{reportData.totalUsers}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-600">Total Farmers</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{reportData.totalFarmers}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-600">Total Consumers</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{reportData.totalConsumers}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-600">Total Products</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{reportData.totalProducts}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-600">Total Orders</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{reportData.totalOrders}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-600">Total Revenue</td>
                  <td className="px-6 py-4 font-semibold text-green-600">
                    ${reportData.totalRevenue.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-600">Average Order Value</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    ${reportData.averageOrderValue.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Reports;

