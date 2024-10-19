

export default function addClusterLayer(FeatureCollection, currentMap) {

  // add clustering source and layer to map
  if (FeatureCollection.length !== 0) {

    let clusterFeatureCollection = {
      "type": "FeatureCollection",
      "features": []
    };

    // add all the features in the feature collection dictionary to the feature collection
    Object.keys(FeatureCollection).forEach(key => {
      clusterFeatureCollection.features.push(FeatureCollection[key]);
    });

    // console.log(clusterFeatureCollection);

    // add clustering source and layer to map
    currentMap.addSource('cluster_data', {
      'type': 'geojson',
      'data': clusterFeatureCollection,
      'cluster': true,
      'clusterMaxZoom': 14, // Max zoom to cluster points on
      'clusterRadius': 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    currentMap.addLayer({
      'id': 'clusters_data',
      'type': 'circle',
      'source': 'cluster_data',
      'filter': ['has', 'point_count'],
      'paint': {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          10,
          '#f1f075',
          30,
          '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10,
          30,
          30,
          40
        ]
      }
    });

    currentMap.addLayer({
      'id': 'cluster-count_data',
      'type': 'symbol',
      'source': 'cluster_data',
      'filter': ['has', 'point_count'],
      'layout': {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    });

    // zoom to the cluster when the user clicks on it
    currentMap.on('click', 'clusters_data', function (e) {
      currentMap.flyTo({
        center: e.features[0].geometry.coordinates,
        zoom: currentMap.getZoom() + 2
      });
    });



    /// unclustered points

    // when there is only one point in the cluster, show the cluster as a point
    currentMap.addLayer({
      'id': 'unclustered-point_data',
      'type': 'circle',
      'source': 'cluster_data',
      'filter': ['!', ['has', 'point_count']],
      'paint': {
        'circle-color': '#11b4da',
        'circle-radius': 4,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    });

    // hide the unclustered points when the user zooms in
    currentMap.on('zoom', function () {
      if (currentMap.getZoom() > 14) {
        currentMap.setLayoutProperty('unclustered-point_data', 'visibility', 'none');
      } else {
        currentMap.setLayoutProperty('unclustered-point_data', 'visibility', 'visible');
      }
    });

    // zoom to the point when the user clicks on it
    currentMap.on('click', 'unclustered-point_data', function (e) {
      currentMap.flyTo({
        center: e.features[0].geometry.coordinates,
        zoom: 16
      });
    });
  }
}
