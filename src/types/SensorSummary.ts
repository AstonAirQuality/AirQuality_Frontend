
export interface MeasurementData {
    [key: string]: any;
}

export class SensorSummary {
    timestamp: number;
    geom?: string;
    measurement_count: number;
    measurement_data: MeasurementData;
    stationary: boolean;
    sensor_id: number;

    constructor(
        timestamp: number,
        measurement_count: number,
        measurement_data: string | MeasurementData,
        stationary: boolean,
        sensor_id: number,
        geom?: string
    ) {
        this.timestamp = timestamp;
        this.measurement_count = measurement_count;
        // Parse if it's a string, otherwise assign directly
        if (typeof measurement_data === "string") {
            try {
                this.measurement_data = JSON.parse(measurement_data);
            } catch {
                this.measurement_data = {};
            }
        } else {
            this.measurement_data = measurement_data;
        }
        this.stationary = stationary;
        this.sensor_id = sensor_id;
        this.geom = geom;
    }
}
