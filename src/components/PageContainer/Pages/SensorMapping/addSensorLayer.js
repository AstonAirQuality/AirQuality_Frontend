import { centerOfMass } from '@turf/turf';
import mapboxgl from 'mapbox-gl';

export default function addSensorLayer(id_, currentMap){

    currentMap.addLayer({
      'id': id_ + "_data",
      'type': 'fill',
      'source': id_ + "_data",
      'paint': {
        'fill-color': '#0080ff', // blue color fill
        'fill-opacity': 0.5
      }
    });
  
    currentMap.addLayer({
      'id': id_ + "outline_data",
      'type': 'line',
      'source': id_ + "_data",
      'layout': {},
      'paint': {
        'line-color': '#fff', // white outline
        'line-width': 1
      }
    });
  
    currentMap.on('click', id_ + "_data", function (e) {
  
      const selectedFeature = e.features[0];
      const CenterPoint = centerOfMass(selectedFeature.geometry);
  
      // iterate through the properties of the first feature in the feature collection
      // and display each property in the popup
      let htmlString = `<h3>Sensor ID: ${id_}</h3>`;
  
      // append each property to the html string
      Object.keys(selectedFeature.properties).forEach((key) => {
        // if the property is a number, round it to 3 decimal places
        if (typeof selectedFeature.properties[key] === 'number') {
          selectedFeature.properties[key] = selectedFeature.properties[key].toFixed(3);
        }
        // append the property to the html string
        htmlString += `<p>${key}: ${selectedFeature.properties[key]}</p>`;
      });
  
      currentMap.flyTo({ center: CenterPoint.geometry.coordinates.slice() });
  
      new mapboxgl.Popup()
        .setLngLat(CenterPoint.geometry.coordinates.slice())
        .setHTML(htmlString)
        .addTo(currentMap);
    });
  }