import React from 'react';
import { motion } from 'framer-motion';
import DashboardCards from '../components/DashboardCards';
import ChartsSection from '../components/ChartsSection'
import RecommendationsList from '../components/RecommendationsList';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-energy-primary to-energy-secondary bg-clip-text text-transparent mb-4">
            Smart Energy Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Monitor and optimize your home's energy consumption in real-time.
            Get insights, save money, and reduce your carbon footprint.
          </p>
        </motion.div>

        {/* Dashboard Cards */}
        <DashboardCards />

        {/* Charts Section */}
        <ChartsSection />

        {/* Recommendations */}
        <RecommendationsList />

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <div className="text-center p-6 rounded-lg bg-card/50 border border-border/50">
            <div className="text-2xl font-bold text-energy-success mb-2">8</div>
            <div className="text-sm text-muted-foreground">Active Devices</div>
          </div>
          <div className="text-center p-6 rounded-lg bg-card/50 border border-border/50">
            <div className="text-2xl font-bold text-energy-warning mb-2">24%</div>
            <div className="text-sm text-muted-foreground">Peak Hour Usage</div>
          </div>
          <div className="text-center p-6 rounded-lg bg-card/50 border border-border/50">
            <div className="text-2xl font-bold text-energy-primary mb-2">$65</div>
            <div className="text-sm text-muted-foreground">Monthly Savings Potential</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;











// import React from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { BarChart3, Shield, Zap, Users, TrendingDown, Bell } from 'lucide-react';

// const Home = () => {
//   const { user } = useAuth();

//   const features = [
//     {
//       icon: BarChart3,
//       title: 'Real-time Analytics',
//       description: 'Monitor your energy consumption in real-time with detailed charts and insights.'
//     },
//     {
//       icon: Shield,
//       title: 'Secure & Private',
//       description: 'Your data is encrypted and secure with email verification and session management.'
//     },
//     {
//       icon: TrendingDown,
//       title: 'Cost Optimization',
//       description: 'Get smart recommendations to reduce your energy costs and carbon footprint.'
//     },
//     {
//       icon: Bell,
//       title: 'Smart Alerts',
//       description: 'Receive notifications when your energy usage exceeds normal patterns.'
//     }
//   ];

//   return (
//     <div className="min-h-screen">
//       {/* Hero Section */}
//       <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
//           <div className="text-center">
//             <div className="flex justify-center mb-8">
//               <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
//                 <Zap className="h-16 w-16 text-yellow-300" />
//               </div>
//             </div>
//             <h1 className="text-5xl md:text-6xl font-bold mb-6">
//               Monitor Your Energy,
//               <br />
//               <span className="text-yellow-300">Save the Planet</span>
//             </h1>
//             <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
//               Track your energy consumption, reduce costs, and make smarter decisions with our intelligent energy monitoring platform.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               {user ? (
//                 <Link
//                   to="/dashboard"
//                   className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
//                 >
//                   Go to Dashboard
//                 </Link>
//               ) : (
//                 <>
//                   <Link
//                     to="/signup"
//                     className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
//                   >
//                     Get Started Free
//                   </Link>
//                   <Link
//                     to="/login"
//                     className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
//                   >
//                     Sign In
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-20 bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
//               Why Choose EnergyMonitor?
//             </h2>
//             <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
//               Our platform provides comprehensive energy monitoring solutions to help you make informed decisions.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {features.map((feature, index) => {
//               const Icon = feature.icon;
//               return (
//                 <div
//                   key={index}
//                   className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
//                 >
//                   <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 w-fit mb-4">
//                     <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
//                   </div>
//                   <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//                     {feature.title}
//                   </h3>
//                   <p className="text-gray-600 dark:text-gray-300">
//                     {feature.description}
//                   </p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="py-20 bg-white dark:bg-gray-800">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid md:grid-cols-3 gap-8 text-center">
//             <div>
//               <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">25%</div>
//               <p className="text-gray-600 dark:text-gray-300">Average Energy Savings</p>
//             </div>
//             <div>
//               <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">10K+</div>
//               <p className="text-gray-600 dark:text-gray-300">Devices Monitored</p>
//             </div>
//             <div>
//               <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">1M+</div>
//               <p className="text-gray-600 dark:text-gray-300">kWh Tracked</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <h2 className="text-3xl md:text-4xl font-bold mb-6">
//             Ready to Start Saving Energy?
//           </h2>
//           <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
//             Join thousands of users who are already saving money and helping the environment.
//           </p>
//           {!user && (
//             <Link
//               to="/signup"
//               className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
//             >
//               Start Your Free Trial
//             </Link>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Home;


