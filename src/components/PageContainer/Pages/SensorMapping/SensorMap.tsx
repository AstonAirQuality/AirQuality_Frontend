import React, { useRef, useEffect, useState, ChangeEvent } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import { GeolocateControl, NavigationControl } from 'mapbox-gl';
import SelectDataForm from './SelectDataForm.tsx';
import addSensorLayer from './addSensorLayer.ts';
import addClusterLayer from './addClusterLayer.ts';
import { centerOfMass } from '@turf/turf';
import CustomFadingAlert from '../SharedComponents/CustomFadingAlert.tsx';
import { useDarkModeContext } from '../../../context/DarkModeContext.tsx';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN as string;

type Sensor = {
  sensorid: number;
  sensorType: string;
  geojson: {
    features: any[]; // Replace 'any' with your GeoJSON Feature type if available
  };
};

type FeatureCollectionType = Record<string, any>; // Replace 'any' with your GeoJSON Feature type if available

export default function SensorMap(): React.JSX.Element {
  const [alertMessage, setAlertMessage] = useState<'' | [string, string] | string>('');
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);
  const [lng, setLng] = useState<number>(-1.890800);
  const [lat, setLat] = useState<number>(52.483490);
  const [zoom, setZoom] = useState<number>(10);
  const [darkTheme] = useDarkModeContext();

  const [showSelectForm, setShowSelectForm] = useState<boolean>(false);
  const [sensorData, setSensorData] = useState<Sensor[]>([]);
  const [selectedSensors, setSelectedSensors] = useState<Record<string, boolean>>({});
  const [Hour, setHour] = useState<number>(0);
  const [FeatureCollection, setFeatureCollection] = useState<FeatureCollectionType>({});

  const GeoLocate = new GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
  });

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current as HTMLElement,
      style: darkTheme ? "mapbox://styles/mapbox/dark-v10" : "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.addControl(GeoLocate, 'top-right');
    map.current.addControl(new NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once

  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(darkTheme ? "mapbox://styles/mapbox/dark-v10" : "mapbox://styles/mapbox/streets-v11");
  }, [darkTheme]);

  useEffect(() => {
    if (!map.current) return;
    map.current.on('move', () => {
      setLng(Number(map.current!.getCenter().lng.toFixed(4)));
      setLat(Number(map.current!.getCenter().lat.toFixed(4)));
      setZoom(Number(map.current!.getZoom().toFixed(2)));
    });
  }, []);

  function addCurrentFeatureToFeatureCollection(id_: string, currentFeature: any) {
    if (currentFeature !== undefined && currentFeature !== null) {
      const center = centerOfMass(currentFeature).geometry.coordinates;
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
      setFeatureCollection(FeatureCollection => ({ ...FeatureCollection, [id_]: newFeature }));
    }
  }

  useEffect(() => {
    if (!map.current) return;

    try {
      map.current.getStyle().layers?.forEach(layer => {
        if (layer.id.includes("_data")) {
          map.current!.removeLayer(layer.id);
        }
      });

      const sources = map.current.getStyle().sources;
      Object.keys(sources).forEach(source => {
        if (source.includes("_data")) {
          map.current!.removeSource(source);
        }
      });
    } catch (error) {
      console.log("no data layers to remove");
    }

    if (sensorData.length === 0) return;

    sensorData.forEach(sensor => {
      const currentFeature = sensor.geojson.features[Hour];

      if (currentFeature["geometry"]["coordinates"][0].length === 0) {
        return;
      }

      if (Object.keys(selectedSensors).length !== 0 && !selectedSensors[sensor.sensorid.toString()]) {
        return;
      }

      const id_ = sensor.sensorid.toString();

      if (!selectedSensors[id_]) {
        setSelectedSensors(selectedSensors => ({ ...selectedSensors, [id_]: true }));
      }

      map.current!.addSource(id_ + "_data", {
        'type': 'geojson',
        'data': currentFeature
      });

      addSensorLayer(id_, map.current!);

      addCurrentFeatureToFeatureCollection(id_, currentFeature);
    });

    addClusterLayer(FeatureCollection, map.current!);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensorData, Hour, selectedSensors]);

  function handleSliderChange(event: ChangeEvent<HTMLInputElement>) {
    setHour(Number(event.target.value));
  }

  function handleCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
    const id_ = event.target.id;
    const checked = event.target.checked;

    if (!checked) {
      setSelectedSensors(selectedSensors => ({ ...selectedSensors, [id_]: false }));
      setFeatureCollection(FeatureCollection => {
        const newCollection = { ...FeatureCollection };
        delete newCollection[id_];
        return newCollection;
      });
    } else {
      setSelectedSensors(selectedSensors => ({ ...selectedSensors, [id_]: true }));
      const currentFeature = sensorData.find(sensor => sensor.sensorid === parseInt(id_))?.geojson.features[Hour];
      if (currentFeature) {
        addCurrentFeatureToFeatureCollection(id_, currentFeature);
      }
    }
  }

  return (
    <div className='page'>
      <div ref={mapContainer} className="map-container" />
      <div className="map-overlay">
        <div className="map-overlay-top">
          <div className="map-overlay-inner">
            {alertMessage && <CustomFadingAlert message={alertMessage[0]} setAlertMessage={setAlertMessage} status={alertMessage[1]} />}
            <div className="map-dropdown-container">
              <button onClick={() => setShowSelectForm(!showSelectForm)} className="table-edit-button">{showSelectForm ? "Hide" : "Show"} Data Form</button>
              {showSelectForm && <SelectDataForm setSensorData={setSensorData} setAlertMessage={setAlertMessage} />}
            </div>
            <div className="map-slider-container">
              <label>Hour: {Hour}</label>
              <input type="range" min="0" max="23" value={Hour} className="map-slider" id="myRange" onChange={handleSliderChange} />
            </div>
            <fieldset>
              <label>Selected Sensors</label>
              <div className="map-checkbox-container">
                {sensorData.map((sensor) => {
                  const id_ = sensor.sensorid.toString();
                  return (
                    <div className="map-checkbox-item" key={id_}>
                      <input className="map-checkbox" type="checkbox" id={id_} name={id_} value={id_} checked={!!selectedSensors[id_]} onChange={handleCheckboxChange} />
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
