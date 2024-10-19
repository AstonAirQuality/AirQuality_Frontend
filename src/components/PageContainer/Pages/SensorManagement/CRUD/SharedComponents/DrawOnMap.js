import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { GeolocateControl , FullscreenControl , NavigationControl} from 'mapbox-gl';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import CustomFadingAlert from '../../../SharedComponents/CustomFadingAlert';
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

//https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-draw/
export default function DrawOnMap(props) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-1.890800);
  const [lat, setLat] = useState(52.483490);
  const [zoom, setZoom] = useState(10);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  
  const Draw = new MapboxDraw({
    displayControlsDefault: false,
    // Select which mapbox-gl-draw control buttons to add to the map.
    controls: {
    polygon: true,
    trash: true,
  },});

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
      zoom: zoom
    });
    map.current.addControl(Draw, 'top-left');
    map.current.addControl(GeoLocate, 'top-right');
    map.current.addControl(new FullscreenControl(), 'top-right');
    map.current.addControl(new NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right');
  });

  //change map style on theme change
  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.setStyle(props.darkTheme ? "mapbox://styles/mapbox/dark-v10" : "mapbox://styles/mapbox/streets-v11");
  }, [props.darkTheme]);
  
  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });


  function SavePolygon(e) {
    e.preventDefault();
    if (!map.current) return; // wait for map to initialize
    //get the polygon coordinates
    const feature = map.current.getStyle().sources["mapbox-gl-draw-cold"].data.features[0]
    if (feature && feature.geometry.type === "Polygon") {
      const coordinates = feature.geometry.coordinates[0]
      const longitudes = []
      const latitudes = []

      coordinates.forEach((coordinate) => {
        longitudes.push(coordinate[0])
        latitudes.push(coordinate[1])
      })
      const maxLongitude = Math.max(...longitudes)
      const minLongitude = Math.min(...longitudes)
      const maxLatitude = Math.max(...latitudes)
      const minLatitude = Math.min(...latitudes)

      // POLYGON ((minX minY,maxX minY,maxX maxY,minX maxY,minX minY))
      const geometryString = `POLYGON ((${minLongitude} ${minLatitude},${maxLongitude} ${minLatitude},${maxLongitude} ${maxLatitude},${minLongitude} ${maxLatitude},${minLongitude} ${minLatitude}))`
      props.setState({...props.state,stationary_box: geometryString})
      setAlertMessage('Polygon saved')
      setAlertType('success')
    }
    else {
      setAlertMessage('No polygon found')
      setAlertType('error')
    }

  }

  return (
    <div className='page h-screen overflow-hidden'>
      {alertMessage && <CustomFadingAlert message={alertMessage} setAlertMessage={setAlertMessage} status={alertType} />}
      <button className="bg-green-600 hover:bg-green-700 border-green-800 text-white font-bold py-2 px-4 w-full border rounded text-sm"
        onClick={(e) => SavePolygon(e)}>
        Save Polygon
      </button>   
      <div ref={mapContainer} className="map-container"/>
    </div>
  );
}
