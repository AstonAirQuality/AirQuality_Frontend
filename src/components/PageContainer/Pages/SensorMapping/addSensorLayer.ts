import { centerOfMass, Feature, Geometry } from '@turf/turf';
import mapboxgl, { Map, MapLayerMouseEvent } from 'mapbox-gl';

export default function addSensorLayer(id_: string, currentMap: Map) {
  currentMap.addLayer({
    id: `${id_}_data`,
    type: 'fill',
    source: `${id_}_data`,
    paint: {
      'fill-color': '#0080ff',
      'fill-opacity': 0.5,
    },
  });

  currentMap.addLayer({
    id: `${id_}outline_data`,
    type: 'line',
    source: `${id_}_data`,
    layout: {},
    paint: {
      'line-color': '#fff',
      'line-width': 1,
    },
  });

  currentMap.on('click', `${id_}_data`, function (e: MapLayerMouseEvent) {
    const selectedFeature = e.features?.[0] as Feature<Geometry, { [name: string]: any }>;
    if (!selectedFeature) return;

    const CenterPoint = centerOfMass(selectedFeature.geometry);

    let htmlString = `<h3>Sensor ID: ${id_}</h3>`;

    Object.keys(selectedFeature.sensor_metadata || {}).forEach((key) => {
      let value = selectedFeature.sensor_metadata[key];
      if (typeof value === 'number') {
        value = value.toFixed(3);
      }
      htmlString += `<p>${key}: ${value}</p>`;
    });

    const coords = CenterPoint.geometry.coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      currentMap.flyTo({ center: [coords[0], coords[1]] as [number, number] });
    }

    new mapboxgl.Popup()
      .setLngLat([CenterPoint.geometry.coordinates[0], CenterPoint.geometry.coordinates[1]] as [number, number])
      .setHTML(htmlString)
      .addTo(currentMap);
  });
}
