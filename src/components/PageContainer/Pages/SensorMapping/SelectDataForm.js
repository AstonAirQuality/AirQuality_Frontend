import React, {useState} from 'react';

// open side window with form to select data to be mapped to a sensor
export default function SelectDataForm({setSensorData, setAlertMessage}) {

    // state
    const [state, setState] = useState({
        // default values for start and end date are the current date
        start: new Date().toISOString().slice(0, 10),
        end: new Date().toISOString().slice(0, 10),
        averaging_methods: "mean",
        averaging_frequency: "H",
    });

            

    // call geojson export data endpoint
    async function selectData() {
    
    setAlertMessage(["Processing your request. This may take a few seconds.", "info"])

    // get start and end date from state and format them to dd-mm-yyyy
    const startDate = new Date(state.start);
    const startDay = startDate.getDate();
    const startMonth = startDate.getMonth() + 1;
    const startYear = startDate.getFullYear();
    const formattedStartDate = `${startDay}-${startMonth}-${startYear}`;

    // end date is the next day from start date
    const endDate = new Date(state.start);
    endDate.setDate(endDate.getDate() + 1);
    const endDay = endDate.getDate();
    const endMonth = endDate.getMonth() + 1;
    const endYear = endDate.getFullYear();
    const formattedEndDate = `${endDay}-${endMonth}-${endYear}`;

    const requestURL = process.env.REACT_APP_AIRQUALITY_API_URL + `sensor-summary/as-geojson?start=${formattedStartDate}&end=${formattedEndDate}&averaging_frequency=${state.averaging_frequency}&averaging_methods=${state.averaging_methods}`;
    
    // const url = process.env.REACT_APP_AIRQUALITY_API_URL + "sensor-summary/as-geojson" + "?start=" + formattedStartDate + "&end=" + formattedEndDate + "&averaging_frequency=" + state.averaging_frequency + "&averaging_methods=" + state.averaging_methods;

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    await fetch(requestURL, requestOptions).then(
      async response => {
        if (response.status === 200) {
          let data = await response.json();
          if(data.length === 0) {
            setAlertMessage(["No data found for the selected date range.", "error"]);
            setSensorData([])
            return;
          }
          else{
            setAlertMessage(["Data found for the selected date range.", "success"]);
            setSensorData(data);
            return;
          }
        }
        else {
          return;
        }
      })

  }

    // handle change in input form
    function handleChange(e,setState,state) {
        const {name, value} = e.target;
        setState({...state, [name]: value});
    }


    // create input form for start and end date
    return(
        
        <div>
            <div className="map-form-group">
                <label className="map-form-label">
                    Start Date
                </label>
                <input className="map-form-input"
                id="start" type="date"
                name="start"
                value={state.start}
                onChange={(e) => handleChange(e,setState,state)}/>
            </div>

            <div className="map-form-group">
                <label className="map-form-label">
                    Averaging Method
                </label>
                <select className="map-form-select"
                id="averaging_methods"
                name="averaging_methods"
                value={state.averaging_methods}
                onChange={(e) => handleChange(e,setState,state)}>
                    <option value="mean">Mean</option>
                    <option value="median">Median</option>
                    <option value="max">Max</option>
                    <option value="min">Min</option>
                </select>
            </div>

            {/* // submit button */}
            <button onClick={() => selectData()} className="table-create-button mt-4">Submit Search Query</button>

        </div>

    )


}


    