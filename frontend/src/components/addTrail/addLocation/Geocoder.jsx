import React from 'react';
import MapBoxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { useValue } from '../../../context/ContextProvider';
import { useControl } from 'react-map-gl';

function Geocoder({ updateLocationType }) {
  const { dispatch } = useValue();
  const ctrl = new MapBoxGeocoder({
    accessToken: 'MAPBOX_TOKEN',
    marker: false,
    collapsed: true,
  });

  useControl(() => ctrl);

  ctrl.on('result', (e) => {
    const coords = e.result.geometry.coordinates;
    dispatch({
      type: updateLocationType,
      payload: { lat: coords[1], lng: coords[0] },
    });
  });

  return null;
}

export default Geocoder;