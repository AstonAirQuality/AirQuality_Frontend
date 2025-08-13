import React, { useState, ChangeEvent } from 'react';

interface SelectDataFormProps {
  setSensorData: (data: any[]) => void;
  setAlertMessage: (msg: [string, string]) => void;
}

interface State {
  start: string;
  end: string;
  averaging_methods: string;
  averaging_frequency: string;
}

const SelectDataForm: React.FC<SelectDataFormProps> = ({ setSensorData, setAlertMessage }) => {
  const [state, setState] = useState<State>({
    start: new Date().toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
    averaging_methods: "mean",
    averaging_frequency: "H",
  });

  async function selectData() {
    setAlertMessage(["Processing your request. This may take a few seconds.", "info"]);

    const startDate = new Date(state.start);
    const startDay = startDate.getDate();
    const startMonth = startDate.getMonth() + 1;
    const startYear = startDate.getFullYear();
    const formattedStartDate = `${startDay}-${startMonth}-${startYear}`;

    const endDate = new Date(state.start);
    endDate.setDate(endDate.getDate() + 1);
    const endDay = endDate.getDate();
    const endMonth = endDate.getMonth() + 1;
    const endYear = endDate.getFullYear();
    const formattedEndDate = `${endDay}-${endMonth}-${endYear}`;

    const requestURL =
      process.env.REACT_APP_AIRQUALITY_API_URL +
      `sensor-summary/as-geojson?start=${formattedStartDate}&end=${formattedEndDate}&averaging_frequency=${state.averaging_frequency}&averaging_methods=${state.averaging_methods}`;

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    await fetch(requestURL, requestOptions).then(async response => {
      if (response.status === 200) {
        let data = await response.json();
        if (data.length === 0) {
          setAlertMessage(["No data found for the selected date range.", "error"]);
          setSensorData([]);
          return;
        } else {
          setAlertMessage(["Data found for the selected date range.", "success"]);
          setSensorData(data);
          return;
        }
      } else {
        return;
      }
    });
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
  }

  return (
    <div>
      <div className="map-form-group">
        <label className="map-form-label">Start Date</label>
        <input
          className="map-form-input"
          id="start"
          type="date"
          name="start"
          value={state.start}
          onChange={handleChange}
        />
      </div>

      <div className="map-form-group">
        <label className="map-form-label">Averaging Method</label>
        <select
          className="map-form-select"
          id="averaging_methods"
          name="averaging_methods"
          value={state.averaging_methods}
          onChange={handleChange}
        >
          <option value="mean">Mean</option>
          <option value="median">Median</option>
          <option value="max">Max</option>
          <option value="min">Min</option>
        </select>
      </div>

      <button onClick={selectData} className="table-create-button mt-4">
        Submit Search Query
      </button>
    </div>
  );
};

export default SelectDataForm;
