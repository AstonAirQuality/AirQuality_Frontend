import { VscClose } from "react-icons/vsc";
import { useState, useEffect } from "react";
import SensorMeasurementColumnGraph from "./SensorMeasurementColumnGraph.tsx";

interface MeasurementData {
    [timestamp: string]: {
        [key: string]: number | string | null | undefined;
    };
}

interface SensorSummaryProps {
    sensor_id: string;
    measurement_count: number;
    measurement_data: string | MeasurementData;
    stationary: boolean;
    geom: string | null;
    type_name: string;
    timestamp_UTC: string;
}

class SensorSummary {
    sensor_id: string;
    measurement_count: number;
    measurement_data: MeasurementData;
    columns: string[];
    stationary: boolean;
    geom: string | null;
    type_name: string;
    timestamp_UTC: string;

    constructor(
        sensor_id: string,
        measurement_count: number,
        measurement_data: string | MeasurementData,
        stationary: boolean,
        geom: string | null,
        type_name: string,
        timestamp_UTC: string
    ) {
        this.sensor_id = sensor_id;
        this.measurement_count = measurement_count;
        this.measurement_data = this.formatMeasurementData(measurement_data);
        this.columns = this.setColumnsfromMeasurementData();
        this.stationary = stationary;
        this.geom = geom;
        this.type_name = type_name;
        this.timestamp_UTC = timestamp_UTC;
    }

    setColumnsfromMeasurementData(): string[] {
        let columns: string[] = [];
        if (this.measurement_data) {
            const firstKey = Object.keys(this.measurement_data)[0];
            if (firstKey && this.measurement_data[firstKey]) {
                columns = Object.keys(this.measurement_data[firstKey]);
                columns = columns.filter(
                    (col) => col !== "latitude" && col !== "longitude"
                );
            }
        }
        return columns;
    }

    formatMeasurementData(
        measurement_data: string | MeasurementData
    ): MeasurementData {
        if (typeof measurement_data === "string") {
            try {
                return JSON.parse(measurement_data);
            } catch (error) {
                console.error("Error parsing measurement_data:", error);
                return {};
            }
        }
        return measurement_data;
    }

    getPlotData(column: string): { timestamps: Date[]; columnValues: (number | string | null | undefined)[] } {
        const timestamps: Date[] = [];
        const columnValues: (number | string | null | undefined)[] = [];
        for (const [timestamp, data] of Object.entries(this.measurement_data)) {
            timestamps.push(new Date(parseInt(timestamp) * 1000));
            columnValues.push(data[column] !== undefined ? data[column] : null);
        }
        return { timestamps, columnValues };
    }
}

interface ViewContainerProps {
    menuOpen: string;
    setMenuOpen: (open: string) => void;
    rowData: {
        time_updated: string;
        [key: string]: any;
    };
}

const ViewContainer: React.FC<ViewContainerProps> = ({
    menuOpen,
    setMenuOpen,
    rowData,
}) => {
    const [sensorSummary, setSensorSummary] = useState<SensorSummary | null>(null);
    const [column, setColumn] = useState<string>("PM10");
    const [plotData, setPlotData] = useState<{
        timestamps: Date[];
        columnValues: (number | string | null | undefined)[];
    }>({ timestamps: [], columnValues: [] });

    function handleClose(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if ((e.target as HTMLElement).id === "modal") {
            setMenuOpen("false");
        }
    }

    useEffect(() => {
        if (sensorSummary && column) {
            const data = sensorSummary.getPlotData(column);
            setPlotData(data);
        }
    }, [sensorSummary, column]);

    useEffect(() => {
        const base_url =
            process.env.REACT_APP_AIRQUALITY_API_URL +
            "sensor-summary/as-json?";
        if (rowData) {
            const start_date = new Date(rowData.time_updated)
                .toISOString()
                .split("T")[0]
                .split("-")
                .reverse()
                .join("-");
            const end_date = new Date(rowData.time_updated)
                .toISOString()
                .split("T")[0]
                .split("-")
                .reverse()
                .join("-");
            const columns = [
                "sensor_id",
                "measurement_count",
                "measurement_data",
                "stationary",
                "geom",
                "timestamp",
            ];
            const url = `${base_url}start=${start_date}&end=${end_date}&columns=${columns.join(
                "&columns="
            )}&join_sensor_type=true`;
            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    setSensorSummary(
                        new SensorSummary(
                            data[0].sensor_id,
                            data[0].measurement_count,
                            data[0].measurement_data,
                            data[0].stationary,
                            data[0].geom,
                            data[0].type_name,
                            data[0].timestamp
                        )
                    );
                })
                .catch((error) => {
                    console.error("Error fetching sensor data:", error);
                });
        }
    }, [menuOpen, rowData]);

    return (
        <>
            <div id="modal" onClick={handleClose} className="modal-container">
                <div className="crud-container">
                    <h5 className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
                        {menuOpen}
                    </h5>
                    <button
                        onClick={() => setMenuOpen("false")}
                        className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                        <VscClose size={32} />
                    </button>
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-4 shadow-inner h-full">
                        {sensorSummary ? (
                            <>
                                <h1 className="text-lg font-semibold  mb-2">
                                    Sensor ID: {sensorSummary.sensor_id}
                                </h1>
                                <h2 className="text-md font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    Type: {sensorSummary.type_name}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    Measurement Count: {sensorSummary.measurement_count}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    Stationary: {sensorSummary.stationary ? "Yes" : "No"}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    Geom:{" "}
                                    {sensorSummary.geom
                                        ? sensorSummary.geom
                                        : "No geom data available"}
                                </p>
                                <select
                                    id="column-select"
                                    value={column}
                                    onChange={(e) => {
                                        setColumn(e.target.value);
                                        const data = sensorSummary.getPlotData(e.target.value);
                                        setPlotData(data);
                                    }}
                                    className="block w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                >
                                    {sensorSummary.columns.map((col) => (
                                        <option key={col} value={col}>
                                            {col}
                                        </option>
                                    ))}
                                </select>
                                <div className="mt-4 w-full h-[65%]">
                                    <SensorMeasurementColumnGraph
                                        x_val={plotData.timestamps}
                                        y_val={plotData.columnValues}
                                        y_name={column}
                                    />
                                </div>
                            </>
                        ) : (
                            <p className="font-semibold text-gray-500 dark:text-gray-400">
                                Loading data...
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewContainer;
