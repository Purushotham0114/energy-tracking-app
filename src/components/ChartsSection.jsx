import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const ChartsSection = () => {
    const [timeframe, setTimeframe] = useState("hourly");

    // state for raw + simulated live data
    const [hourlyData, setHourlyData] = useState([]);
    const [visibleHourly, setVisibleHourly] = useState([]);

    const [dailyData, setDailyData] = useState([]);
    const [appliances, setAppliances] = useState([]);
    const [topAppliances, setTopAppliances] = useState([]);

    // fetch all chart data once
    const fetchData = async () => {
        try {
            const [hourlyRes, dailyRes, devicesRes] = await Promise.all([
                fetch("/api/usage/hourly"),
                fetch("/api/usage/daily"),
                fetch("/api/usage/devices")
            ]);

            const hourly = await hourlyRes.json();
            const daily = await dailyRes.json();
            const devices = await devicesRes.json();

            setHourlyData(hourly);
            setDailyData(daily);
            setAppliances(devices);

            // initialize top appliances
            setTopAppliances(
                devices
                    .sort((a, b) => b.currentUsage - a.currentUsage)
                    .slice(0, 5)
                    .map(app => ({
                        name: app.name,
                        usage: app.currentUsage / 1000, // W → kW
                    }))
            );

            // 🔥 simulate live updates for hourly data
            if (hourly.length > 0) {
                setVisibleHourly([hourly[0]]); // start with first point
                let index = 1;

                const interval = setInterval(() => {
                    if (index < hourly.length) {
                        setVisibleHourly(prev => [...prev, hourly[index]]);
                        index++;
                    } else {
                        clearInterval(interval); // stop when all points are shown
                    }
                }, 1000); // ⏱ 1s for testing (20*60*1000 in real)
            }
        } catch (err) {
            console.error("❌ Error fetching charts data:", err);
        }
    };

    useEffect(() => {
        fetchData();

        // 🔄 simulate continuous updates for bar chart
        const barInterval = setInterval(() => {
            setTopAppliances(prev =>
                prev.map(app => ({
                    ...app,
                    usage: Math.max(0, app.usage + (Math.random() * 0.2 - 0.1)) // random +/- fluctuation
                }))
            );
        }, 2000); // update every 2s

        return () => clearInterval(barInterval);
    }, []);

    // decide which dataset to show
    const chartData = timeframe === "hourly" ? visibleHourly : dailyData;

    const pieData = appliances
        .filter(app => app.dailyUsage > 0)
        .map(app => ({
            name: app.name,
            value: app.dailyUsage,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Usage Trends */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <Card className="h-96">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold">Energy Usage Trends</CardTitle>
                            <div className="flex space-x-2">
                                <Button
                                    variant={timeframe === "hourly" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTimeframe("hourly")}
                                    className="text-xs"
                                >
                                    Hourly
                                </Button>
                                <Button
                                    variant={timeframe === "daily" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTimeframe("daily")}
                                    className="text-xs"
                                >
                                    Daily
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis
                                    dataKey={timeframe === "hourly" ? "hour" : "day"}
                                    className="text-xs"
                                    tick={{ fontSize: 10 }}
                                    ticks={timeframe === "hourly" ? [0, 4, 8, 12, 16, 20, 24] : undefined}
                                    tickFormatter={(val) =>
                                        timeframe === "hourly" ? val : (val ? val.slice(0, 3) : "")
                                    }
                                />
                                <YAxis className="text-xs" tick={{ fontSize: 10 }} ticks={[0.0, 0.4, 0.8, 1.2]} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="usage"
                                    stroke="hsl(var(--energy-primary))"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Device Usage Breakdown */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <Card className="h-96">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Device Usage Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={appliances}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="dailyUsage"  // 👈 use the correct field from backend
                                    nameKey="name"
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                    labelLine={false}
                                >
                                    {appliances.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`${value.toFixed(1)} kWh`, "Daily Usage"]}
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "8px",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>
            {/* Top Consuming Devices */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Top Consuming Devices (Real-time)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={topAppliances} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis type="number" className="text-xs" tick={{ fontSize: 10 }} />
                                <YAxis type="category" dataKey="name" className="text-xs" tick={{ fontSize: 10 }} width={100} />
                                <Tooltip
                                    formatter={value => [`${value.toFixed(2)} kW`, "Current Usage"]}
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "8px"
                                    }}
                                />
                                <Bar dataKey="usage" fill="hsl(var(--energy-secondary))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default ChartsSection;


// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import {
//     LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
//     XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
// } from "recharts";
// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import { Button } from "./ui/button";

// const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

// const ChartsSection = () => {
//     const [timeframe, setTimeframe] = useState("hourly");

//     // line chart states
//     const [hourlyData, setHourlyData] = useState([]);
//     const [visibleHourly, setVisibleHourly] = useState([]);

//     // daily chart state
//     const [dailyData, setDailyData] = useState([]);

//     // pie chart states
//     const [appliances, setAppliances] = useState([]);
//     const [visiblePieData, setVisiblePieData] = useState([]);

//     // top appliances bar chart
//     const [topAppliances, setTopAppliances] = useState([]);

//     const fetchData = async () => {
//         try {
//             const [hourlyRes, dailyRes, devicesRes] = await Promise.all([
//                 fetch("/api/usage/hourly"),
//                 fetch("/api/usage/daily"),
//                 fetch("/api/usage/devices")
//             ]);

//             const hourly = await hourlyRes.json();
//             const daily = await dailyRes.json();
//             const devices = await devicesRes.json();

//             setHourlyData(hourly);
//             setDailyData(daily);
//             setAppliances(devices);

//             // prepare top appliances once
//             const tops = devices
//                 .sort((a, b) => b.currentUsage - a.currentUsage)
//                 .slice(0, 5)
//                 .map(app => ({
//                     name: app.name,
//                     usage: app.currentUsage / 1000, // W → kW
//                 }));
//             setTopAppliances(tops);

//             // 🔥 simulate live updates for line + pie
//             if (hourly.length > 0) {
//                 setVisibleHourly([hourly[0]]);
//                 setVisiblePieData([]);
//                 let index = 1;

//                 const interval = setInterval(() => {
//                     if (index < hourly.length) {
//                         // update line chart
//                         setVisibleHourly(prev => [...prev, hourly[index]]);

//                         // update pie chart cumulatively
//                         const cumulativePie = devices.map(app => ({
//                             name: app.name,
//                             value: (app.dailyUsage / hourly.length) * (index + 1) // distribute daily usage
//                         }));
//                         setVisiblePieData(cumulativePie);

//                         index++;
//                     } else {
//                         clearInterval(interval);
//                     }
//                 }, 5000); // 5s test interval (replace with 20*60*1000 in real)

//                 return () => clearInterval(interval);
//             }
//         } catch (err) {
//             console.error("❌ Error fetching charts data:", err);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//     }, []);

//     // dataset for line chart
//     const chartData = timeframe === "hourly" ? visibleHourly : dailyData;

//     return (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//             {/* Usage Trends */}
//             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
//                 <Card className="h-96">
//                     <CardHeader>
//                         <div className="flex items-center justify-between">
//                             <CardTitle className="text-lg font-semibold">Energy Usage Trends</CardTitle>
//                             <div className="flex space-x-2">
//                                 <Button
//                                     variant={timeframe === "hourly" ? "default" : "outline"}
//                                     size="sm"
//                                     onClick={() => setTimeframe("hourly")}
//                                     className="text-xs"
//                                 >
//                                     Hourly
//                                 </Button>
//                                 <Button
//                                     variant={timeframe === "daily" ? "default" : "outline"}
//                                     size="sm"
//                                     onClick={() => setTimeframe("daily")}
//                                     className="text-xs"
//                                 >
//                                     Daily
//                                 </Button>
//                             </div>
//                         </div>
//                     </CardHeader>
//                     <CardContent>
//                         <ResponsiveContainer width="100%" height={240}>
//                             <LineChart data={chartData}>
//                                 <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
//                                 <XAxis
//                                     dataKey={timeframe === "hourly" ? "hour" : "day"}
//                                     className="text-xs"
//                                     tick={{ fontSize: 10 }}
//                                     ticks={timeframe === "hourly" ? [0, 4, 8, 12, 16, 20, 24] : undefined}
//                                     tickFormatter={(val) =>
//                                         timeframe === "hourly" ? val : (val ? val.slice(0, 3) : "")
//                                     }
//                                 />
//                                 <YAxis className="text-xs" tick={{ fontSize: 10 }} />
//                                 <Tooltip
//                                     contentStyle={{
//                                         backgroundColor: "hsl(var(--card))",
//                                         border: "1px solid hsl(var(--border))",
//                                         borderRadius: "8px",
//                                     }}
//                                 />
//                                 <Line
//                                     type="monotone"
//                                     dataKey="usage"
//                                     stroke="hsl(var(--energy-primary))"
//                                     strokeWidth={3}
//                                     dot={false}
//                                     activeDot={{ r: 5 }}
//                                 />
//                             </LineChart>
//                         </ResponsiveContainer>
//                     </CardContent>
//                 </Card>
//             </motion.div>

//             {/* Device Usage Breakdown */}
//             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
//                 <Card className="h-96">
//                     <CardHeader>
//                         <CardTitle className="text-lg font-semibold">Device Usage Breakdown</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <ResponsiveContainer width="100%" height={240}>
//                             <PieChart>
//                                 <Pie
//                                     data={visiblePieData}
//                                     cx="50%"
//                                     cy="50%"
//                                     outerRadius={80}
//                                     dataKey="value"
//                                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                                     labelLine={false}
//                                 >
//                                     {visiblePieData.map((entry, index) => (
//                                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                                     ))}
//                                 </Pie>
//                                 <Tooltip
//                                     formatter={value => [`${value.toFixed(1)} kWh`, "Cumulative Usage"]}
//                                     contentStyle={{
//                                         backgroundColor: "hsl(var(--card))",
//                                         border: "1px solid hsl(var(--border))",
//                                         borderRadius: "8px"
//                                     }}
//                                 />
//                             </PieChart>
//                         </ResponsiveContainer>
//                     </CardContent>
//                 </Card>
//             </motion.div>

//             {/* Top Consuming Devices */}
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-2">
//                 <Card>
//                     <CardHeader>
//                         <CardTitle className="text-lg font-semibold">Top Consuming Devices (Real-time)</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <ResponsiveContainer width="100%" height={200}>
//                             <BarChart data={topAppliances} layout="horizontal">
//                                 <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
//                                 <XAxis type="number" className="text-xs" tick={{ fontSize: 10 }} />
//                                 <YAxis type="category" dataKey="name" className="text-xs" tick={{ fontSize: 10 }} width={100} />
//                                 <Tooltip
//                                     formatter={value => [`${value.toFixed(2)} kW`, "Current Usage"]}
//                                     contentStyle={{
//                                         backgroundColor: "hsl(var(--card))",
//                                         border: "1px solid hsl(var(--border))",
//                                         borderRadius: "8px"
//                                     }}
//                                 />
//                                 <Bar dataKey="usage" fill="hsl(var(--energy-secondary))" radius={[0, 4, 4, 0]} />
//                             </BarChart>
//                         </ResponsiveContainer>
//                     </CardContent>
//                 </Card>
//             </motion.div>
//         </div>
//     );
// };

// export default ChartsSection;


