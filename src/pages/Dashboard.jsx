// import React from 'react';
// import { motion } from 'framer-motion';
// import DashboardCards from '@/components/DashboardCards';
// import ChartsSection from '@/components/ChartsSection';
// import RecommendationsList from '@/components/RecommendationsList';

// const Home = () => {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Hero Section */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-8"
//         >
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-energy-primary to-energy-secondary bg-clip-text text-transparent mb-4">
//             Smart Energy Dashboard
//           </h1>
//           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//             Monitor and optimize your home's energy consumption in real-time. 
//             Get insights, save money, and reduce your carbon footprint.
//           </p>
//         </motion.div>

//         {/* Dashboard Cards */}
//         <DashboardCards />

//         {/* Charts Section */}
//         <ChartsSection />

//         {/* Recommendations */}
//         <RecommendationsList />

//         {/* Quick Stats */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.4 }}
//           className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
//         >
//           <div className="text-center p-6 rounded-lg bg-card/50 border border-border/50">
//             <div className="text-2xl font-bold text-energy-success mb-2">8</div>
//             <div className="text-sm text-muted-foreground">Active Devices</div>
//           </div>
//           <div className="text-center p-6 rounded-lg bg-card/50 border border-border/50">
//             <div className="text-2xl font-bold text-energy-warning mb-2">24%</div>
//             <div className="text-sm text-muted-foreground">Peak Hour Usage</div>
//           </div>
//           <div className="text-center p-6 rounded-lg bg-card/50 border border-border/50">
//             <div className="text-2xl font-bold text-energy-primary mb-2">$65</div>
//             <div className="text-sm text-muted-foreground">Monthly Savings Potential</div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Home;




import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  Zap, TrendingUp, TrendingDown,
  Lightbulb
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    fetchEnergyStats();
  }, [period]);

  const fetchEnergyStats = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/energy/stats?period=${period}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch energy stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Here's your energy consumption overview
          </p>
        </div>

        {/* Period Selector */}
        <div className="mb-8">
          <div className="flex space-x-2">
            {['week', 'month'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Energy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalConsumption.total.toFixed(2)} kWh
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats?.totalConsumption.totalCost.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Daily</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {((stats?.totalConsumption.total || 0) / 7).toFixed(2)} kWh
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3">
                <TrendingDown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Device Consumption
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.deviceConsumption}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalEnergy" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Energy Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.deviceConsumption}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalEnergy"
                >
                  {stats?.deviceConsumption.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daily Consumption Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.dailyConsumption}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalEnergy" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recommendations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Smart Recommendations
            </h3>
          </div>
          <div className="space-y-3">
            {stats?.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
              >
                <p className="text-yellow-800 dark:text-yellow-300">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


