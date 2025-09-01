// import SensorMap from '../SensorMapping/SensorMap.tsx';
import { useDarkModeContext } from '../../../context/DarkModeContext.tsx';
import React, { useState, useEffect } from 'react';

const Home: React.FC = () => {
    const [darkTheme] = useDarkModeContext();

    // const [showMap, setShow] = useState<boolean>(window.innerWidth >= 768 && window.innerHeight >= 750);

    // const updateMedia = () => {
    //     setShow(window.innerWidth >= 768 && window.innerHeight >= 750);
    // };

    // useEffect(() => {
    //     window.addEventListener("resize", updateMedia);
    //     return () => window.removeEventListener("resize", updateMedia);
    // }, []);

    return (
        <div className="page">
            <div className="p-8">
                <h1 className="page-section-title">
                    Sensor Fleet Management Dashboard
                </h1>
                <h2 className="page-title">Aston University IoT Sensor Fleet Manager</h2>

                <div>
                    <p className="page-text">
                        Welcome to your unified sensor fleet management tool. This dashboard empowers you to monitor, analyze, and manage a diverse range of IoT sensors deployed across multiple environments.
                    </p>
                    <br />
                    <p className="page-text">
                        Whether you are tracking air quality, temperature, humidity, noise, or other observable properties, our platform brings together data from various sensor platforms into a single, intuitive interface. Visualize real-time and historical sensor data, manage device status, and gain actionable insights to optimize your operations.
                    </p>
                    <br />
                    <p className="page-text">
                        Key features include:
                        <ul className="list-disc ml-6 mt-2">
                            <li>Live sensor status and health monitoring</li>
                            <li>Interactive mapping of sensor locations</li>
                            <li>Customizable alerts and notifications</li>
                            <li>Historical data export and analytics</li>
                            <li>Support for multiple sensor types and observable properties</li>
                        </ul>
                    </p>
                    <br />
                    <p className="page-text">
                        Get started by exploring your sensor fleet below. Use the map to locate devices, or dive into detailed analytics for each sensor platform.
                    </p>
                </div>
            </div>
            {/* {showMap ? (
                <div className="home-map-container">
                    <SensorMap />
                </div>
            ) : null} */}
        </div>
    );
};
export default Home;
