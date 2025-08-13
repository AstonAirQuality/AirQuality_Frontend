import React, { useState } from "react";
import { VscClose } from "react-icons/vsc";
import { useDarkModeContext } from "../../../../context/DarkModeContext.tsx";
import  {calculateCenterPointOfBoundingBox}  from "./utils.ts";

interface StaticSensorMapMarkerProps {
    boundingBox: string | null;
}

const StaticSensorMapMarker: React.FC<StaticSensorMapMarkerProps> = ({ boundingBox }) => {
    const [map, setMap] = useState(false);
    const [darkTheme] = useDarkModeContext();

    if (map === true && boundingBox !== null) {
        const CenterPointOfPolygon = calculateCenterPointOfBoundingBox(boundingBox);
        const markerColour = darkTheme ? "f74e4e" : "1754bd";
        const mapStyle = darkTheme ? "dark-v10" : "streets-v11";
        const imageURL = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/pin-l-communications-tower+${markerColour}(${CenterPointOfPolygon[0]},${CenterPointOfPolygon[1]})/${CenterPointOfPolygon[0]},${CenterPointOfPolygon[1]},16/500x300?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`;
        const imageAlt = `Map of a stationary sensor at point: ${CenterPointOfPolygon[0]},${CenterPointOfPolygon[1]}`;

        return (
            <div className="py-3 px-6 flex flex-col items-center justify-center">
                {"Center Point: " + CenterPointOfPolygon}
                <div className="w-fit h-fit relative">
                    <img src={imageURL} alt={imageAlt} className="static-map" />
                    <button
                        onClick={() => setMap(!map)}
                        className="text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400  dark:hover:bg-gray-600 dark:hover:text-white rounded-lg p-2.5 absolute top-0 right-0"
                    >
                        <VscClose size={32} />
                    </button>
                </div>
            </div>
        );
    } else {
        return (
            <div className="py-3 px-6">
                <div className="flex items-center justify-center">
                    {boundingBox ? (
                        <button className="table-view-map-button" onClick={() => setMap(!map)}>
                            View on Map
                        </button>
                    ) : (
                        "No stationary location found"
                    )}
                </div>
            </div>
        );
    }
};

export default StaticSensorMapMarker;