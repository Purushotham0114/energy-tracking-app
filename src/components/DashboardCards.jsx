import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/hover-card";

const StatCard = ({ title, value, subtitle, color, delay }) => (

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -4 }}
    className="energy-card-hover"
  >
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <span className={`text-3xl font-bold ${color}`}>
            {value !== undefined ? value.toFixed(1) : "0.0"}
          </span>
          <span className="text-sm text-muted-foreground">kWh</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{subtitle}</span>
          <span className={`text-sm font-medium ${color}`}>
            ${(value ? value * 0.12 : 0).toFixed(2)} {/* assuming $0.12/kWh */}
          </span>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const DashboardCards = () => {
  console.log("in dashboard");
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0 });

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/usage/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("❌ Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    console.log("in useeffect of dashboard")
    // 🔄 Refresh every 20 minutes
    const interval = setInterval(fetchStats, 20 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: "Today's Usage",
      value: stats.today,
      subtitle: "vs yesterday",
      color: "text-energy-success",
    },
    {
      title: "This Week",
      value: stats.week,
      subtitle: "vs last week",
      color: "text-energy-warning",
    },
    {
      title: "This Month",
      value: stats.month,
      subtitle: "vs last month",
      color: "text-energy-danger",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <StatCard key={card.title} {...card} delay={index * 0.1} />
      ))}
    </div>
  );
};

export default DashboardCards;


// import React from 'react';
// import { motion } from 'framer-motion';
// import { Card, CardContent, CardHeader, CardTitle } from './ui/hover-card'
// import { usageStats } from '../data/mockData';

// const StatCard = ({ title, value, subtitle, cost, color, delay }) => {

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay }}
//       whileHover={{ y: -4 }}
//       className="energy-card-hover"
//     >
//       <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
//         {/* <CardHeader className="pb-2">
//           <CardTitle className="text-sm font-medium text-muted-foreground">
//             {title}
//           </CardTitle>
//         </CardHeader> */}
//         <CardContent>
//           <div className="flex items-baseline space-x-2">
//             <span className={`text-3xl font-bold ${color}`}>
//               {value}
//             </span>
//             <span className="text-sm text-muted-foreground">kWh</span>
//           </div>
//           <div className="mt-2 flex items-center justify-between">
//             <span className="text-xs text-muted-foreground">{subtitle}</span>
//             <span className={`text-sm font-medium ${color}`}>
//               ${cost}
//             </span>
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// };

// const DashboardCards = () => {
//   const cards = [
//     {
//       title: "Today's Usage",
//       value: usageStats.today.toString(),
//       subtitle: 'vs yesterday',
//       cost: usageStats.cost.today.toFixed(2),
//       color: 'text-energy-success'
//     },
//     {
//       title: 'This Week',
//       value: usageStats.week.toString(),
//       subtitle: 'vs last week',
//       cost: usageStats.cost.week.toFixed(2),
//       color: 'text-energy-warning'
//     },
//     {
//       title: 'This Month',
//       value: usageStats.month.toString(),
//       subtitle: 'vs last month',
//       cost: usageStats.cost.month.toFixed(2),
//       color: 'text-energy-danger'
//     }
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//       {cards.map((card, index) => (
//         <StatCard
//           key={card.title}
//           {...card}
//           delay={index * 0.1}
//         />
//       ))}
//     </div>
//   );
// };

// export default DashboardCards;
