import React, { useRef, useEffect, useState } from 'react';
import mapboxgl, { Map, MapboxOptions, GeolocateControl, FullscreenControl, NavigationControl, ScaleControl } from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import CustomFadingAlert from '../../../SharedComponents/CustomFadingAlert.tsx';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN as string;

interface DrawOnMapProps {
  darkTheme: boolean;
  state: any;
  setState: (state: any) => void;
}

const DrawOnMap: React.FC<DrawOnMapProps> = (props) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);
  const [lng, setLng] = useState<number>(-1.890800);
  const [lat, setLat] = useState<number>(52.483490);
  const [zoom, setZoom] = useState<number>(10);
  const [alertMessage, setAlertMessage] = useState<string | [string, string] | ''>('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  // Draw and GeoLocate must be created only once
  const drawRef = useRef<MapboxDraw | null>(null);
  const geoLocateRef = useRef<GeolocateControl| null>(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    drawRef.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
    });

    geoLocateRef.current = new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });

    map.current = new mapboxgl.Map({
      container: mapContainer.current as HTMLElement,
      style: props.darkTheme ? "mapbox://styles/mapbox/dark-v10" : "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom
    });

    map.current.addControl(drawRef.current, 'top-left');
    map.current.addControl(geoLocateRef.current, 'top-right');
    map.current.addControl(new FullscreenControl(), 'top-right');
    map.current.addControl(new NavigationControl(), 'top-right');
    map.current.addControl(new ScaleControl(), 'bottom-right');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //change map style on theme change
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(props.darkTheme ? "mapbox://styles/mapbox/dark-v10" : "mapbox://styles/mapbox/streets-v11");
  }, [props.darkTheme]);

  useEffect(() => {
    if (!map.current) return;
    const handleMove = () => {
      setLng(Number(map.current!.getCenter().lng.toFixed(4)));
      setLat(Number(map.current!.getCenter().lat.toFixed(4)));
      setZoom(Number(map.current!.getZoom().toFixed(2)));
    };
    map.current.on('move', handleMove);
    return () => {
      map.current?.off('move', handleMove);
    };
  }, []);

  function SavePolygon(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!map.current || !drawRef.current) return;
    // Get all drawn features
    const features = drawRef.current.getAll().features;
    const feature = features[0];
    if (feature && feature.geometry.type === "Polygon") {
      const coordinates = (feature.geometry.coordinates[0] as [number, number][]);
      const longitudes: number[] = [];
      const latitudes: number[] = [];

      coordinates.forEach((coordinate) => {
        longitudes.push(coordinate[0]);
        latitudes.push(coordinate[1]);
      });
      const maxLongitude = Math.max(...longitudes);
      const minLongitude = Math.min(...longitudes);
      const maxLatitude = Math.max(...latitudes);
      const minLatitude = Math.min(...latitudes);

      // POLYGON ((minX minY,maxX minY,maxX maxY,minX maxY,minX minY))
      const geometryString = `POLYGON ((${minLongitude} ${minLatitude},${maxLongitude} ${minLatitude},${maxLongitude} ${maxLatitude},${minLongitude} ${maxLatitude},${minLongitude} ${minLatitude}))`;
      props.setState({ ...props.state, stationary_box: geometryString });
      setAlertMessage('Polygon saved');
      setAlertType('success');
    } else {
      setAlertMessage('No polygon found');
      setAlertType('error');
    }
  }

  return (
    <div className='page h-screen overflow-hidden'>
      {alertMessage && <CustomFadingAlert message={alertMessage} setAlertMessage={setAlertMessage} status={alertType} />}
      <button
        className="bg-green-600 hover:bg-green-700 border-green-800 text-white font-bold py-2 px-4 w-full border rounded text-sm"
        onClick={SavePolygon}
      >
        Save Polygon
      </button>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default DrawOnMap;
