import Plot from "react-plotly.js";
import { useDarkModeContext } from '../../../../../context/DarkModeContext.tsx';
import { use } from "react";

interface SensorMeasurementColumnGraphProps {
    x_val: any[];
    y_val: any[];
    y_name: string;
}

const SensorMeasurementColumnGraph: React.FC<SensorMeasurementColumnGraphProps> = ({ x_val, y_val, y_name }) => {
    const [darkTheme] = useDarkModeContext();
    console.log(darkTheme);

    const layout = {
        title: {
            text: `${y_name} Levels Over Time`,
            font: { size: 18 },
        },
        paper_bgcolor: darkTheme ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)",
        plot_bgcolor: darkTheme ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)",
        xaxis: {
            title: { text: "Date time UTC" },
            gridcolor: darkTheme ? "#444444" : "#e5e7eb",
        },
        yaxis: {
            title: { text: y_name },
            gridcolor: darkTheme ? "#444444" : "#e5e7eb",
        },
        margin: { l: 50, r: 30, t: 50, b: 50 },
        font: { family: "inherit", color: darkTheme ? "#ffffff" : "#000000" },
    };

    return (
        <Plot
            className="w-full h-full"
            data={[
                {
                    x: x_val,
                    y: y_val,
                    type: "scatter",
                    mode: "lines",
                    marker: { color: "#2563eb", size: 6 },
                    line: { color: "#2563eb", width: 2 },
                },
            ]}
            layout={layout as Partial<Plot.Layout>}
            config={{
                displayModeBar: false, // Enable the mode bar with default buttons
                responsive: true,
                useResizeHandler: true, // Ensure the plot resizes with the container
            }}
        />
    );
};

export default SensorMeasurementColumnGraph;
