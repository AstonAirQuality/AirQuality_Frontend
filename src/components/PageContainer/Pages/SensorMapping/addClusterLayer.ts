import { Map, GeoJSONSource, MapLayerMouseEvent } from 'mapbox-gl';

type Feature = GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>;
type FeatureCollectionType = {
  [key: string]: Feature;
};

export default function addClusterLayer(
  FeatureCollection: FeatureCollectionType,
  currentMap: Map
): void {
  if (Object.keys(FeatureCollection).length !== 0) {
    const clusterFeatureCollection: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    };

    Object.keys(FeatureCollection).forEach((key) => {
      clusterFeatureCollection.features.push(FeatureCollection[key]);
    });

    if (currentMap.getSource('cluster_data')) {
      (currentMap.getSource('cluster_data') as GeoJSONSource).setData(clusterFeatureCollection);
    } else {
      currentMap.addSource('cluster_data', {
        type: 'geojson',
        data: clusterFeatureCollection,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });
    }

    if (!currentMap.getLayer('clusters_data')) {
      currentMap.addLayer({
        id: 'clusters_data',
        type: 'circle',
        source: 'cluster_data',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            10,
            '#f1f075',
            30,
            '#f28cb1',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            10,
            30,
            30,
            40,
          ],
        },
      });
    }

    if (!currentMap.getLayer('cluster-count_data')) {
      currentMap.addLayer({
        id: 'cluster-count_data',
        type: 'symbol',
        source: 'cluster_data',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
      });
    }

    currentMap.on('click', 'clusters_data', function (e: MapLayerMouseEvent) {
      if (e.features && e.features[0]) {
        currentMap.flyTo({
          center: (e.features[0].geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: currentMap.getZoom() + 2,
        });
      }
    });

    if (!currentMap.getLayer('unclustered-point_data')) {
      currentMap.addLayer({
        id: 'unclustered-point_data',
        type: 'circle',
        source: 'cluster_data',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#11b4da',
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      });
    }

    currentMap.on('zoom', function () {
      const visibility = currentMap.getZoom() > 14 ? 'none' : 'visible';
      if (currentMap.getLayer('unclustered-point_data')) {
        currentMap.setLayoutProperty('unclustered-point_data', 'visibility', visibility);
      }
    });

    currentMap.on('click', 'unclustered-point_data', function (e: MapLayerMouseEvent) {
      if (e.features && e.features[0]) {
        currentMap.flyTo({
          center: (e.features[0].geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: 16,
        });
      }
    });
  }
}
