import SensorMap from '../SensorMapping/SensorMap';
import { useState, useEffect } from 'react';
const Home = ({ darkTheme }) => {

    const [showMap, setShow] = useState(window.innerWidth >= 768 && window.innerHeight >= 750);

    const updateMedia = () => {
        setShow(window.innerWidth >= 768 && window.innerHeight >= 750);
    };

    useEffect(() => {
        window.addEventListener("resize", updateMedia);
        return () => window.removeEventListener("resize", updateMedia);
    });


    return (
        <div className="page">
 
            <div className="p-8">
                <h1 className='page-section-title'>
                    Welcome 👋
                </h1>
                <h1 className="page-title">Aston Air Quality </h1>

                <div className="">
                    <p className="page-text">
                        Welcome to our air quality management dashboard! We provide historical data on air quality to help you make informed decisions about your health and well-being.
                        Our dashboard displays air quality information from various monitoring stations across different locations, including indoor and outdoor environments. You can easily access and export historical air quality data, including the concentration of pollutants such as particulate matter (PM), ozone (O3), nitrogen dioxide (NO2), and sulfur dioxide (SO2).
                    </p>
                    <br />
                    <p className="page-text">
                        Our dashboard is designed for everyone, from individuals concerned about their personal health to businesses looking to monitor and improve the air quality in their facilities. With our data, you can make informed decisions about when to go outside, which routes to take, and when to take precautions such as wearing a mask.
                        We believe that access to real-time air quality information is crucial for everyone's health and well-being, and we are committed to providing accurate and up-to-date data. Explore our dashboard today and take control of your environment!
                    </p>
                </div>

            </div>
            {showMap ? <div className="home-map-container">
                <SensorMap darkTheme={darkTheme} />
            </div> : <></>}


        </div>
    )
}

export default Home