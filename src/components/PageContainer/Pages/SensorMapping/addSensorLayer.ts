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

    Object.keys(selectedFeature.properties || {}).forEach((key) => {
      let value = selectedFeature.properties[key];
      if (typeof value === 'number') {
        value = value.toFixed(3);
      }
      htmlString += `<p>${key}: ${value}</p>`;
    });

    currentMap.flyTo({ center: (CenterPoint.geometry.coordinates as [number, number]).slice() });

    new mapboxgl.Popup()
      .setLngLat((CenterPoint.geometry.coordinates as [number, number]).slice())
      .setHTML(htmlString)
      .addTo(currentMap);
  });
}
