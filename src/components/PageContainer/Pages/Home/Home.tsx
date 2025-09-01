import React from 'react';
import {IoLayersOutline ,IoStatsChartOutline, IoMapOutline, IoAnalytics, IoNotifications, IoTimeOutline, IoHardwareChipOutline } from 'react-icons/io5';
import StaticSensors from './StaticSensors.tsx';

const Home: React.FC = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      
      {/* Hero Section */}
      <header className="py-24 text-gray-900 dark:text-gray-100 text-center shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            Aston University IoT Sensor Fleet Manager
          </h1>
          <p className="text-lg sm:text-xl font-light opacity-90">
            Your unified dashboard for seamless IoT device management and data analysis.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Introduction Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12 mb-16 transition-transform duration-300 hover:scale-[1.01]">
          <div className="flex flex-col md:flex-row items-center md:space-x-8">
            <div className="w-full">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            Welcome to a Smarter Fleet Management Tool
              </h2>
              <p className="text-base sm:text-lg mb-4 leading-relaxed">
            Our platform empowers you to monitor, analyze, and manage a diverse range of IoT sensors across multiple environments. Visualize historical sensor data, manage device status, and gain actionable insights to optimize your operations.
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
            Whether you're tracking air quality, temperature, humidity, noise, or other properties, we bring all your data into a single, intuitive interface.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
            <span className="home-badge bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
              🌍 Multi-Environment Support
            </span>
            <span className="home-badge bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200">
              📊 Big Data Analytics
            </span>
            <span className="home-badge bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200">
              🔔 Smart Notifications
            </span>
            <span className="home-badge bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200">
              🛠️ Easy Device Management
            </span>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">
            Key Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="home-card">
              <IoHardwareChipOutline className="text-4xl text-blue-500 mb-4" />
              <h3 className="home-card-title">Add IoT Sensor Platforms</h3>
              <p className="home-card-content">Easily set up and onboard new generic sensor platforms to expand your fleet.</p>
            </div>
            <div className="home-card">
                <IoLayersOutline className="text-4xl text-orange-500 mb-4" />
                <h3 className="home-card-title">Semantic Enrichment</h3>
                <p className="home-card-content">Annotate your sensor data with CSVW for richer, machine-readable metadata and interoperability.</p>
            </div>
            <div className="home-card">
              <IoMapOutline className="text-4xl text-green-500 mb-4" />
              <h3 className="home-card-title">Interactive Mapping</h3>
              <p className="home-card-content">Visualize sensor locations on an interactive map using GeoJSON for easy fleet overview.</p>
            </div>
            <div className="home-card">
              <IoAnalytics className="text-4xl text-purple-500 mb-4" />
              <h3 className="home-card-title">Historical Data & Analytics</h3>
              <p className="home-card-content">Export and analyze historical data to identify trends and assess variability</p>
            </div>
            <div className="home-card">
              <IoTimeOutline className="text-4xl text-yellow-500 mb-4" />
              <h3 className="home-card-title">Data Ingestion Logs</h3>
              <p className="home-card-content">View daily data ingestion logs for every sensor platform in your fleet</p>
            </div>
            <div className="home-card">
              <IoStatsChartOutline className="text-4xl text-red-500 mb-4" />
              <h3 className="home-card-title">Data Visualization</h3>
              <p className="home-card-content">View live and historical sensor data through interactive charts and graphs to identify key trends and insights.</p>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        {/* <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-6 home-card-content">
            Explore your sensor fleet on the interactive map or dive into detailed analytics for each platform.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
            Start Exploring
          </button>
        </section> */}
      </main>
    </div>
  );
};

export default Home;