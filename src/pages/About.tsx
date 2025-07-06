import React from 'react';
import { Target, Award, Users, Leaf } from 'lucide-react';

const About: React.FC = () => {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To empower individuals and businesses to make informed energy decisions through comprehensive monitoring and analytics.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, providing accurate data and reliable insights you can trust.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a community of environmentally conscious users working together for a sustainable future.'
    },
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'Promoting sustainable energy practices and helping reduce carbon footprints worldwide.'
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About EnergyMonitor
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're on a mission to make energy monitoring accessible, intelligent, and actionable for everyone.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Founded in 2024, EnergyMonitor emerged from a simple observation: most people don't know how much energy they're actually using or how to reduce it effectively.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our team of engineers, data scientists, and sustainability experts came together to create a platform that not only tracks energy consumption but also provides actionable insights to help users save money and reduce their environmental impact.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Today, we're proud to serve thousands of users worldwide, helping them make smarter energy decisions every day.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-8 text-white">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">10K+</div>
                  <p className="text-sm opacity-90">Users Served</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">1M+</div>
                  <p className="text-sm opacity-90">kWh Tracked</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">25%</div>
                  <p className="text-sm opacity-90">Avg. Savings</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">50+</div>
                  <p className="text-sm opacity-90">Countries</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3 w-fit mb-4">
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Accuracy
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our advanced algorithms provide precise energy consumption tracking and forecasting.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Reliability
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                99.9% uptime ensures your energy monitoring never stops working when you need it.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Support
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                24/7 customer support to help you get the most out of our platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;