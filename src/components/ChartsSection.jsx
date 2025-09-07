import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const ChartsSection = () => {
    const [timeframe, setTimeframe] = useState("hourly");

    const [hourlyData, setHourlyData] = useState([]);
    const [visibleHourly, setVisibleHourly] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [appliances, setAppliances] = useState([]);
    const [topAppliances, setTopAppliances] = useState([]);
    const [slotIndex, setSlotIndex] = useState(0);

    const hourlyIntervalRef = useRef(null);
    const slotIntervalRef = useRef(null);

    // --- Simulated current time for development ---
    const simulatedNow = new Date("2024-03-15T14:35:00"); // any date in March
    const currentHour = simulatedNow.getHours();
    const currentMinute = simulatedNow.getMinutes();
    const currentSlot = Math.floor(currentMinute / 20); // 20-min slots

    // ---------- Helpers ----------
    function normalizeDevices(rawDevices = []) {
        return rawDevices.map(d => {
            const name = d.name ?? d._id ?? d.device ?? d.device_id ?? "Unknown";
            let slots = null;
            if (Array.isArray(d.slots) && d.slots.length) {
                slots = d.slots.map(s => {
                    if (typeof s === "number") return s;
                    return Number(s.cumulative ?? s.usage ?? s.value ?? 0);
                });
            }
            const dailyUsage = (d.dailyUsage !== undefined) ? Number(d.dailyUsage) : (slots ? Number(slots[slots.length - 1] ?? 0) : (d.currentUsage ?? 0));
            const currentUsage = (d.currentUsage !== undefined) ? Number(d.currentUsage) : (slots ? Number(slots[slots.length - 1] ?? 0) : dailyUsage);
            return { name, slots, dailyUsage, currentUsage };
        });
    }

    function buildTopAppliancesFromSlot(normalizedDevices, idx) {
        return normalizedDevices.map(d => {
            let usage = 0;
            if (Array.isArray(d.slots) && d.slots.length) {
                usage = d.slots[Math.min(idx, d.slots.length - 1)] ?? 0;
            } else {
                usage = d.dailyUsage ?? d.currentUsage ?? 0;
            }
            return { name: d.name, usage: Number(usage) };
        }).sort((a, b) => b.usage - a.usage);
    }

    // ---------- Fetch data once ----------
    useEffect(() => {
        let mounted = true;
        async function fetchData() {
            try {
                const [hourlyRes, dailyRes, devicesRes] = await Promise.all([
                    fetch("/api/usage/hourly?date=2024-03-03"),
                    fetch("/api/usage/daily"),
                    fetch("/api/usage/devices?date=2024-03-03")
                ]);
                const hourly = await hourlyRes.json();
                const daily = await dailyRes.json();
                const devicesRaw = await devicesRes.json();
                if (!mounted) return;

                setHourlyData(Array.isArray(hourly) ? hourly : []);
                setDailyData(Array.isArray(daily) ? daily : []);

                const normalized = normalizeDevices(Array.isArray(devicesRaw) ? devicesRaw : []);
                setAppliances(normalized);

                setSlotIndex(0);
                setTopAppliances(buildTopAppliancesFromSlot(normalized, 0));
            } catch (err) {
                console.error("Error fetching charts data:", err);
            }
        }
        fetchData();
        return () => { mounted = false; };
    }, []);

    // ---------- Animate hourly line build-up ----------
    useEffect(() => {
        if (hourlyIntervalRef.current) {
            clearInterval(hourlyIntervalRef.current);
            hourlyIntervalRef.current = null;
        }
        if (!hourlyData || hourlyData.length === 0) {
            setVisibleHourly([]);
            return;
        }
        setVisibleHourly([hourlyData[0]]);

        let idx = 1;
        hourlyIntervalRef.current = setInterval(() => {
            if (idx <= currentHour && idx < hourlyData.length) {
                setVisibleHourly(prev => [...prev, hourlyData[idx]]);
                idx++;
            } else {
                clearInterval(hourlyIntervalRef.current);
                hourlyIntervalRef.current = null;
            }
        }, 300); // quick replay for dev
        return () => { if (hourlyIntervalRef.current) clearInterval(hourlyIntervalRef.current); };
    }, [hourlyData]);

    // ---------- Update bar + pie per slot ----------
    useEffect(() => {
        if (slotIntervalRef.current) {
            clearInterval(slotIntervalRef.current);
            slotIntervalRef.current = null;
        }
        if (!appliances || appliances.length === 0) return;

        const slotsCount = (appliances[0].slots && appliances[0].slots.length) ? appliances[0].slots.length : 72;
        let idx = 0;

        setTopAppliances(buildTopAppliancesFromSlot(appliances, 0));
        setSlotIndex(0);

        const maxSlotIndex = currentHour * 3 + currentSlot;

        slotIntervalRef.current = setInterval(() => {
            if (idx <= maxSlotIndex && idx < slotsCount) {
                setSlotIndex(idx);
                setTopAppliances(buildTopAppliancesFromSlot(appliances, idx));
                idx++;
            } else {
                clearInterval(slotIntervalRef.current);
                slotIntervalRef.current = null;
            }
        }, 400); // quick for dev

        return () => { if (slotIntervalRef.current) clearInterval(slotIntervalRef.current); };
    }, [appliances]);

    const chartData = timeframe === "hourly" ? visibleHourly : dailyData;
    const pieData = topAppliances.map(d => ({ name: d.name, value: d.usage }));
    const hourlyTicks = (hourlyData && hourlyData.length === 24) ? Array.from({ length: 12 }, (_, i) => i * 2) : undefined;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Line Chart */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <Card className="h-96">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold">Energy Usage Trends</CardTitle>
                            <div className="flex space-x-2">
                                <Button variant={timeframe === "hourly" ? "default" : "outline"} size="sm" onClick={() => setTimeframe("hourly")} className="text-xs">Hourly</Button>
                                <Button variant={timeframe === "daily" ? "default" : "outline"} size="sm" onClick={() => setTimeframe("daily")} className="text-xs">Daily</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis
                                    dataKey={timeframe === "hourly" ? "hour" : "day"}
                                    tick={{ fontSize: 10 }}
                                    ticks={timeframe === "hourly" ? hourlyTicks : undefined}
                                    tickFormatter={(val) => timeframe === "hourly" ? String(val) : (val ? String(val).slice(0, 3) : "")}
                                >
                                    <Label value={timeframe === "hourly" ? "Hour of Day" : "Day of Week"} offset={-5} position="insideBottom" style={{ fontSize: "12px", fill: "#666" }} />
                                </XAxis>
                                <YAxis tick={{ fontSize: 10 }} >
                                    <Label value="Energy (kWh)" angle={-90} position="insideLeft" style={{ fontSize: "12px", fill: "#666" }} />
                                </YAxis>
                                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                                <Line type="monotone" dataKey="usage" stroke="hsl(var(--energy-primary))" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Pie Chart */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                <Card className="h-96">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Device Usage Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} kWh`, "Cumulative"]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Bar Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Top Consuming Devices (Real-time)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={topAppliances} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip formatter={value => [`${Number(value).toFixed(2)} kWh`, "Cumulative"]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                                <Bar dataKey="usage" fill="hsl(var(--energy-secondary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default ChartsSection;
