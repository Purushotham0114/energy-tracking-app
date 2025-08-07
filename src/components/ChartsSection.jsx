import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { hourlyData, dailyData, appliances } from '../data/mockData';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const ChartsSection = () => {
    const [timeframe, setTimeframe] = useState('hourly');

    const chartData = timeframe === 'hourly' ? hourlyData : dailyData;

    const pieData = appliances
        .filter(app => app.dailyUsage > 0)
        .map(app => ({
            name: app.name,
            value: app.dailyUsage,
            category: app.category
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    const topAppliances = appliances
        .sort((a, b) => b.currentUsage - a.currentUsage)
        .slice(0, 5)
        .map(app => ({
            name: app.name,
            usage: app.currentUsage / 1000,
            category: app.category
        }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Usage Trends Chart */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Card className="h-96">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold">Energy Usage Trends</CardTitle>
                            <div className="flex space-x-2">
                                <Button
                                    variant={timeframe === 'hourly' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setTimeframe('hourly')}
                                    className="text-xs"
                                >
                                    Hourly
                                </Button>
                                <Button
                                    variant={timeframe === 'daily' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setTimeframe('daily')}
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
                                    dataKey="hour"
                                    className="text-xs"
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis
                                    className="text-xs"
                                    tick={{ fontSize: 10 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="usage"
                                    stroke="hsl(var(--energy-primary))"
                                    strokeWidth={3}
                                    dot={{ fill: 'hsl(var(--energy-primary))', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: 'hsl(var(--energy-primary))', strokeWidth: 2 }}
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
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={value => [`${value.toFixed(1)} kWh`, 'Daily Usage']}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Top Consuming Devices */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2"
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Top Consuming Devices (Real-time)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={topAppliances} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis
                                    type="number"
                                    className="text-xs"
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    className="text-xs"
                                    tick={{ fontSize: 10 }}
                                    width={100}
                                />
                                <Tooltip
                                    formatter={value => [`${value.toFixed(2)} kW`, 'Current Usage']}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar
                                    dataKey="usage"
                                    fill="hsl(var(--energy-secondary))"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default ChartsSection;
