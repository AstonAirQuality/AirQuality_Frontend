import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { GeolocateControl, NavigationControl } from 'mapbox-gl';
import SelectDataForm from './SelectDataForm';
import addSensorLayer from './addSensorLayer';
import addClusterLayer from './addClusterLayer';
import { centerOfMass } from '@turf/turf';
import CustomFadingAlert from '../SharedComponents/CustomFadingAlert';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function SensorMap(props) {
  const [alertMessage, setAlertMessage] = useState('');
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-1.890800);
  const [lat, setLat] = useState(52.483490);
  const [zoom, setZoom] = useState(10);

  // state for geojson data
  const [showSelectForm, setShowSelectForm] = useState(false);
  const [sensorData, setSensorData] = useState([]);

  // states for handling selected sensors
  const [selectedSensors, setSelectedSensors] = useState("");
  const [Hour, setHour] = useState(0);

  // state for handling clustering
  // create a feature collection to hold all the current features to be used for clustering
  const [FeatureCollection, setFeatureCollection] = useState({});

  const GeoLocate = new GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    // When active the map will receive updates to the device's location as it changes.
    trackUserLocation: true,
    // Draw an arrow next to the location dot to indicate which direction the device is heading.
    showUserHeading: true
  });

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: props.darkTheme ? "mapbox://styles/mapbox/dark-v10" : "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.addControl(GeoLocate, 'top-right');
    // map.current.addControl(new FullscreenControl(), 'top-right');
    map.current.addControl(new NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right');
  });

  //change map style on theme change
  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.setStyle(props.darkTheme ? "mapbox://styles/mapbox/dark-v10" : "mapbox://styles/mapbox/streets-v11");
  }, [props.darkTheme]);

  //handle map movement
  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });



  function addCurrentFeatureToFeatureCollection(id_, currentFeature) {
    // aggregate all the current features into a single feature collection
    if (currentFeature !== undefined && currentFeature !== null) {
      // get the center of the current feature
      const center = centerOfMass(currentFeature).geometry.coordinates;
      // create a new feature with the center of the current feature
      const newFeature = {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": center
        },
        "properties": {
          "sensorid": id_,
        }
      };
      // add the new feature to the feature collection dictionary
      setFeatureCollection(FeatureCollection => ({ ...FeatureCollection, [id_]: newFeature }));
    }
  }


  // add geojson data to map
  useEffect(() => {
    if (!map.current) return; // wait for map to initialize

    // try to delete all layers and sources that include _data
    try {
      //for every re-render remove map layers that include _data
      map.current.getStyle().layers.forEach(layer => {
        if (layer.id.includes("_data")) {
          map.current.removeLayer(layer.id);
        }
      });

      // remove map sources that include _data
      const sources = map.current.getStyle().sources;
      Object.keys(sources).forEach(source => {
        // if source id includes _data then remove it
        if (source.includes("_data")) {
          map.current.removeSource(source);
        }
      });
    }
    //catch pass
    catch (error) {
      console.log("no data layers to remove");
    }

    // wait for data to be fetched
    if (sensorData.length === 0) return;

    // for each sensor in the geojson data export add a layer to the map
    sensorData.forEach(sensor => {

      const currentFeature = sensor.geojson.features[Hour];
      
      // if there are no coordinates for the current feature then do not add it to the map
      if(currentFeature["geometry"]["coordinates"][0].length === 0) {
        return;      
      }

      // if the selected sensors is not empty and if the current feature is not in the selected sensors then skip it
      if (selectedSensors.length !== 0 && !selectedSensors[sensor.sensorid.toString()]) {
        return;
      }

      // convert sensor id to string
      const id_ = sensor.sensorid.toString();

      // add sensor id to selected sensors if it is not already there and set to true
      if (!selectedSensors[id_]) {
        setSelectedSensors(selectedSensors => ({ ...selectedSensors, [id_]: true }));
      }

      // add geojson data to map
      map.current.addSource(id_ + "_data", {
        'type': 'geojson',
        'data': currentFeature
      });

      addSensorLayer(id_, map.current);

      addCurrentFeatureToFeatureCollection(id_, currentFeature);
    });

    addClusterLayer(FeatureCollection, map.current);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensorData, Hour, selectedSensors]);




  // change the data displayed in the popup when the slider is changed
  function handleSliderChange(event) {
    setHour(event.target.value);
  }

  // add or remove sensor layers from the map when the checkbox is clicked
  function handleCheckboxChange(event) {
    const id_ = event.target.id;
    const checked = event.target.checked;


    // if the checkbox is unchecked, remove the layer from the map
    if (!checked) {
      // set the sensor id to false in the selected sensors object
      setSelectedSensors(selectedSensors => ({ ...selectedSensors, [id_]: false }));
      // remove id from feature collection
      setFeatureCollection(FeatureCollection => { delete FeatureCollection[id_]; return FeatureCollection; });



    }
    // if the checkbox is checked, add the layer to the map
    else {
      // set the sensor id to true in the selected sensors object
      setSelectedSensors(selectedSensors => ({ ...selectedSensors, [id_]: true }));
      // add id to feature collection
      const currentFeature = sensorData.find(sensor => sensor.sensorid === parseInt(id_)).geojson.features[Hour];
      addCurrentFeatureToFeatureCollection(id_, currentFeature);
    }
  }


  return (
    <div className='page'>
      <div ref={mapContainer} className="map-container" />
      {/* map overlay */}
      <div className="map-overlay">
        <div className="map-overlay-top">
          <div className="map-overlay-inner">
            {alertMessage && <CustomFadingAlert message={alertMessage[0]} setAlertMessage={setAlertMessage} status={alertMessage[1]} />}
            {/* side window overlay for selecting data*/}
            <div className="map-dropdown-container">
              <button onClick={() => setShowSelectForm(!showSelectForm)} className="table-edit-button">{showSelectForm ? "Hide" : "Show"} Data Form</button>
              {showSelectForm && <SelectDataForm setSensorData={setSensorData} setAlertMessage={setAlertMessage} />}
            </div>


            {/* input slider for each hour of the day */}
            <div className="map-slider-container">
              <label>Hour: {Hour}</label>
              <input type="range" min="0" max="23" value={Hour} className="map-slider" id="myRange" onChange={handleSliderChange} />
            </div>

            {/* checkbox menu for selecting sensor layers  */}
            <fieldset>
              <label>Selected Sensors</label>
              <div className="map-checkbox-container">
                {sensorData.map((sensor) => {
                  const id_ = sensor.sensorid.toString();
                  return (
                    <div className="map-checkbox-item" key={id_}>
                      <input className="map-checkbox" type="checkbox" id={id_} name={id_} value={id_} checked={selectedSensors[id_]} onChange={handleCheckboxChange} />
                      <label htmlFor={id_}>{id_ + " (" + sensor.sensorType + ")"}</label>
                    </div>
                  )
                })}
              </div>
            </fieldset>

          </div>
        </div>
      </div>

    </div>
  );
}


