import React, { useState } from "react";
import { VscClose } from "react-icons/vsc";
import { useDarkModeContext } from "../../../context/DarkModeContext.tsx";
import  {calculateCenterPointOfBoundingBox}  from "../SensorManagement/Tables/utils.ts";

interface StaticSensorsProps {
    boundingBox: string | null;
}

interface StaticSensor {
    id: string;
    stationary_box: string;
}

const StaticSensors: React.FC<StaticSensorsProps> = ({ boundingBox })  => {
    const [darkTheme] = useDarkModeContext();
    const [sensors, setSensors] = useState<StaticSensor[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        // Replace with your actual API endpoint
        const url = process.env.REACT_APP_AIRQUALITY_API_URL + "sensor-platform/static-sensors";
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                setSensors(data);
                setLoading(false);
                console.log(data);
            })
            .catch(() => setLoading(false));
        console.log(sensors);
        
    }, []);

    if (loading) {
        return <div className="py-3 px-6">Loading...</div>;
    }

    if (sensors.length > 0) {
        const markerColour = darkTheme ? "f74e4e" : "1754bd";
        const mapStyle = darkTheme ? "dark-v10" : "streets-v11";
        // Calculate center points for all sensors
        const centerPoints = sensors.map(sensor => calculateCenterPointOfBoundingBox(sensor.stationary_box));
        // Build markers string for Mapbox API
        const markers = centerPoints
            .map(
                ([lng, lat]) =>
                    `pin-l-communications-tower+${markerColour}(${lng},${lat})`
            )
            .join(",");
        // Center the map on the first sensor, or average if you prefer
        const [centerLng, centerLat] = centerPoints[0];
        const imageURL = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/${markers}/${centerLng},${centerLat},12/500x300?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`;
        const imageAlt = `Map of stationary sensors`;

        return (
            <div className="py-3 px-6 flex flex-col items-center justify-center">
                <div className="mb-2">
                    {centerPoints.map((point, idx) => (
                        <div key={sensors[idx].id}>
                            Sensor {sensors[idx].id} Center: {point[0]}, {point[1]}
                        </div>
                    ))}
                </div>
                <div className="w-fit h-fit relative">
                    <img src={imageURL} alt={imageAlt} className="static-map" />
                </div>
            </div>
        );
    } else {
        return (
            <div className="py-3 px-6">
                <div className="flex items-center justify-center">
                    No stationary locations found
                </div>
            </div>
        );
    }
};

export default StaticSensors;
