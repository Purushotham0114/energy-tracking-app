import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext'
import { Button } from '../components/ui/button';
import { Home, Settings, Bell, BellOff } from 'lucide-react';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/appliances', label: 'Appliances' },
    { path: '/recommendations', label: 'Recommendations' },
    { path: '/about', label: 'About' },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <nav className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8 energy-gradient rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-energy-primary to-energy-secondary bg-clip-text text-transparent">
              EnergyMon
            </span>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `relative px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${isActive
                      ? 'text-energy-primary'
                      : 'text-muted-foreground hover:text-foreground'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.icon && <item.icon className="w-4 h-4" />}
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          className="absolute -bottom-2 left-0 right-0 h-0.5 bg-energy-primary rounded-full"
                          layoutId="activeTab"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </div>

          {/* Theme Toggle */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-accent"
            >
              {theme === 'dark' ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive
                  ? 'bg-accent text-energy-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`
              }
            >
              <div className="flex items-center space-x-2">
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext';
// import { Zap, Sun, Moon, LogOut, User } from 'lucide-react';

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const { darkMode, toggleDarkMode } = useTheme();
//   const location = useLocation();

//   const handleLogout = async () => {
//     try {
//       await logout();
//     } catch (error) {
//       console.error('Logout failed:', error);
//     }
//   };

//   const navItems = [
//     { path: '/', label: 'Home' },
//     { path: '/about', label: 'About' },
//     ...(user ? [{ path: '/dashboard', label: 'Dashboard' }] : [])
//   ];

//   return (
//     <nav className="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-300">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           <Link to="/" className="flex items-center space-x-2">
//             <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
//             <span className="text-xl font-bold text-gray-900 dark:text-white">EnergyMonitor</span>
//           </Link>

//           <div className="flex items-center space-x-4">
//             {navItems.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${location.pathname === item.path
//                   ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
//                   : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                   }`}
//               >
//                 {item.label}
//               </Link>
//             ))}

//             <button
//               onClick={toggleDarkMode}
//               className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
//             >
//               {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
//             </button>

//             {user ? (
//               <div className="flex items-center space-x-2">
//                 <div className="flex items-center space-x-1 text-gray-700 dark:text-gray-300">
//                   <User className="h-4 w-4" />
//                   <span className="text-sm">{user.name}</span>
//                 </div>
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors duration-200"
//                 >
//                   <LogOut className="h-4 w-4" />
//                   <span>Logout</span>
//                 </button>
//               </div>
//             ) : (
//               <div className="flex items-center space-x-2">
//                 <Link
//                   to="/login"
//                   className="px-4 py-2 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors duration-200"
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   to="/signup"
//                   className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
//                 >
//                   Sign Up
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

