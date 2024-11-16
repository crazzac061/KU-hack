import React, { useEffect, useState } from 'react';
import { useValue } from '../../context/ContextProvider';
import { getTrails } from '../../actions/trail';
import ReactMapGL, { Marker, Popup, NavigationControl, GeolocateControl, Source, Layer } from 'react-map-gl';
import SuperCluster from 'supercluster';
import './cluster.css'
import { Avatar, Paper, Tooltip } from '@mui/material';
import { Typography, Box, Button } from '@mui/material';
import ParkIcon from '@mui/icons-material/Park';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GeocoderInput from '../sidebar/GeocoderInput';
import PopupTrail from './PopupTrail';
import HotelIcon from '@mui/icons-material/Hotel';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import EvStationIcon from '@mui/icons-material/EvStation';

const supercluster = new SuperCluster({
  radius: 75,
  maxZoom: 20
});

function ClusterMap() {
  const { state: { filteredTrails }, dispatch, mapRef } = useValue();
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [checkpointData, setCheckpointData] = useState(null);
  const [points, setPoints] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [bounds, setBounds] = useState([-180, -85, 180, 85]);
  const [zoom, setZoom] = useState(0);
  const [popupInfo, setPopupInfo] = useState(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [isClick, setIsClick] = useState(false);
  const [poiData, setPoiData] = useState(null);
  const [searchParams, setSearchParams] = useState({
    category: null,
    routeCoordinates: null
  });

  useEffect(() => {
    getTrails(dispatch);
  }, []);

  useEffect(() => {
    const points = filteredTrails.map((trail) => ({
      type: 'Feature',
      properties: {
        cluster: false,
        trailId: trail._id,
        title: trail.title,
        description: trail.description,
        images: trail.images,
        floc: trail.floc,
        sloc: trail.sloc,
        checkpoints: trail.checkp,
        uPhoto: trail.uPhoto,
        uName: trail.uName,
        uid: trail.uid,
        price: trail.price,
      },
      geometry: {
        type: 'Point',
        coordinates: [trail.sloc[0], trail.sloc[1]],
      },
    }));
    setPoints(points);
  }, [filteredTrails]);

  const pointToLineDistance = (point, lineStart, lineEnd) => {
    const [x, y] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;
    
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = x - xx;
    const dy = y - yy;
    
    const R = 6371; // Earth's radius in km
    return Math.sqrt(dx * dx + dy * dy) * Math.PI / 180 * R;
  };

  const isPointNearRoute = (point, routeCoordinates, threshold = 10) => {
    if (!routeCoordinates || routeCoordinates.length < 2) return false;
    
    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      const distance = pointToLineDistance(
        point,
        routeCoordinates[i],
        routeCoordinates[i + 1]
      );
      if (distance <= threshold) return true;
    }
    return false;
  };
  const ICON_MAPPING = {
    hospital: 'hospital-15',
    natural: 'park-15',
    cultural: 'monument-15',
    hotel: 'lodging-15',
    gas: 'fuel-15',
    grocery: 'grocery-15'
  };

  useEffect(() => {
    const fetchPOIData = async () => {
      try {
        if (!searchParams.category || !searchParams.routeCoordinates) return;
        
        const coords = searchParams.routeCoordinates;
        const minLng = Math.min(...coords.map(c => c[0])) - 0.1;
        const maxLng = Math.max(...coords.map(c => c[0])) + 0.1;
        const minLat = Math.min(...coords.map(c => c[1])) - 0.1;
        const maxLat = Math.max(...coords.map(c => c[1])) + 0.1;
        
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchParams.category}.json?bbox=${[minLng, minLat, maxLng, maxLat].join(',')}&access_token=pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g&limit=100`
        );
        const data = await response.json();
        
        const features = data.features
          .filter(feature => 
            isPointNearRoute(
              feature.geometry.coordinates,
              searchParams.routeCoordinates
            )
          )
          .map(feature => ({
            type: 'Feature',
            properties: {
              description: feature.text,
              category: searchParams.category,
              icon: ICON_MAPPING[searchParams.category] || 'park-15'
            },
            geometry: feature.geometry
          }));

        setPoiData({
          type: 'FeatureCollection',
          features
        });
      } catch (error) {
        console.error('Error fetching POI data:', error);
      }
    };

    fetchPOIData();
  }, [searchParams]);
  
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      map.on('load', () => {
        // Ensure the icons are loaded
        Object.values(ICON_MAPPING).forEach(iconName => {
          if (!map.hasImage(iconName)) {
            map.loadImage(
              `https://api.mapbox.com/v4/marker/${iconName}.png?access_token=${map.getCanvas().style.imageManager._requestManager._transformRequest.options.accessToken}`,
              (error, image) => {
                if (error) throw error;
                if (!map.hasImage(iconName)) map.addImage(iconName, image);
              }
            );
          }
        });
      });
    }
  }, [mapRef.current]);

  const handleCategoryClick = (newCategory) => {
    setSearchParams(prev => ({
      ...prev,
      category: newCategory
    }));
  };

  useEffect(() => {
    supercluster.load(points);
    setClusters(supercluster.getClusters(bounds, zoom));
  }, [points, zoom, bounds]);

  useEffect(() => {
    if (mapRef.current) {
      setBounds(mapRef.current.getMap().getBounds().toArray().flat());
    }
  }, [mapRef?.current]);

  const handlePopupOpen = async (properties) => {
    setPopupInfo(properties);
    setIsClick(true);
    
    const waypoints = [
      [properties.sloc[0], properties.sloc[1]],
      ...properties.checkpoints.map(checkpoint => [checkpoint[0], checkpoint[1]]),
      [properties.floc[0], properties.floc[1]]
    ];
    
    try {
      const coordinates = waypoints.map((coord) => coord.join(',')).join(';');
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&access_token=pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g`
      );
      const data = await response.json();
      
      if (data.routes && data.routes[0]) {
        const routeCoordinates = data.routes[0].geometry.coordinates;
        setRouteGeometry({
          type: 'Feature',
          properties: {},
          geometry: data.routes[0].geometry,
        });
        
        setSearchParams(prev => ({
          ...prev,
          routeCoordinates
        }));
        
        const weatherPromises = waypoints.map(([lon, lat]) =>
          fetchWeatherData(lat, lon)
        );
        const weatherData = await Promise.all(weatherPromises);
        
        const checkpointsData = {
          type: 'FeatureCollection',
          features: properties.checkpoints.map(([lon, lat, description], index) => ({
            type: 'Feature',
            properties: {
              description: description || `Checkpoint ${index + 1}`,
              weather: weatherData[index],
            },
            geometry: { type: 'Point', coordinates: [lon, lat] },
          })),
        };
        setCheckpointData(checkpointsData);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const handleCheckpointClick = (event) => {
    const features = mapRef.current.getMap().queryRenderedFeatures(event.point, {
      layers: ['checkpoint-layer']
    });

    if (features.length > 0) {
      const clickedCheckpoint = features[0];
      setSelectedCheckpoint({
        description: clickedCheckpoint.properties.description,
        coordinates: clickedCheckpoint.geometry.coordinates
      });
    } else {
      setSelectedCheckpoint(null);
    }
  };

  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=fb32af4b6bf1f56e786a5d08de51454d`
      );
      const data = await response.json();
      return {
        temperature: data.main.temp,
        description: data.weather[0].description,
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  };

  const poiLayer = {
    id: 'poi-layer',
    type: 'symbol',
    source: 'poi-data',
    layout: {
      'icon-image': [
        'match',
        ['get', 'category'],
        'hospital', 'hospital-15',
        'natural', 'park-15',
        'cultural', 'monument-15',
        'hotel', 'lodging-15',
        'gas', 'fuel-15',
        'grocery', 'grocery-15',
        'park-15' // default icon
      ],
      'icon-size': 1.5,
      'icon-allow-overlap': true,
      'icon-anchor': 'bottom',
    },
    paint: {
      'icon-opacity': 0.9
    }
  };


  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {isClick && (
        <Box
          sx={{
            opacity: 1,
            transform: "scale(1)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            margin: 2,
            
          }}
        >
          <Button
            variant="contained"
            startIcon={<ParkIcon />}
            sx={{
              backgroundColor: "#fff",
              color: "#06402b",
              textTransform: "none",
              borderRadius: "12px",
              padding: "10px 20px",
            }}
            onClick={() => handleCategoryClick("natural")}
          >
            Natural landmark
          </Button>
          <Button
            variant="contained"
            startIcon={<AccountBalanceIcon />}
            sx={{
              backgroundColor: "#fff",
              color: "#06402b",
              textTransform: "none",
              borderRadius: "12px",
              padding: "10px 20px",
            }}
            onClick={() => handleCategoryClick("cultural")}
          >
            Heritages
          </Button>
          <Button
            variant="contained"
            startIcon={<HotelIcon />}
            sx={{
              backgroundColor: "#fff",
              color: "#06402b",
              textTransform: "none",
              borderRadius: "12px",
              padding: "10px 20px",
            }}
            onClick={() => handleCategoryClick("hotel")}
          >
            Accommodation
          </Button>
          <Button
            variant="contained"
            startIcon={<LocalHospitalIcon />}
            sx={{
              backgroundColor: "#fff",
              color: "#06402b",
              textTransform: "none",
              borderRadius: "12px",
              padding: "10px 20px",
            }}
            onClick={() => handleCategoryClick("hospital")}
          >
            Hospital
          </Button>
          <Button
            variant="contained"
            startIcon={<LocalGasStationIcon />}
            sx={{
              backgroundColor: "#fff",
              color: "#06402b",
              textTransform: "none",
              borderRadius: "12px",
              padding: "10px 20px",
            }}
            onClick={() => handleCategoryClick("gas")}
          >
            Gas Station
          </Button>
          <Button
            variant="contained"
            startIcon={<EvStationIcon />}
            sx={{
              backgroundColor: "#fff",
              color: "#06402b",
              textTransform: "none",
              borderRadius: "12px",
              padding: "10px 20px",
            }}
            onClick={() => handleCategoryClick("grocery")}
          >
            Grocery stores
          </Button>
        </Box>
      )}

      <ReactMapGL
        initialViewState={{ latitude: 27, longitude: 88, zoom: 6 }}
        mapboxAccessToken={'pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g'}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        ref={mapRef}
        onZoomEnd={(e) => setZoom(Math.round(e.viewState.zoom))}
        onClick={handleCheckpointClick}
      >
        {clusters.map((cluster) => {
          const { cluster: isCluster, point_count } = cluster.properties;
          const [longitude, latitude] = cluster.geometry.coordinates;
          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                longitude={longitude}
                latitude={latitude}
              >
                <div
                  id="cluster"
                  style={{
                    width: `${10 + (point_count / points.length) * 20}px`,
                    height: `${10 + (point_count / points.length) * 20}px`,
                  }}
                  onClick={() => {
                    const zoom = Math.min(supercluster.getClusterExpansionZoom(cluster.id), 20);
                    mapRef.current.flyTo({
                      center: [longitude, latitude],
                      zoom,
                      speed: 1,
                    });
                  }}
                >
                  {point_count}
                </div>
              </Marker>
            );
          }
          return (
            <Marker
              key={`trial-${cluster.properties.trailId}`}
              longitude={longitude}
              latitude={latitude}
            >
              <Tooltip title={cluster.properties.uName}>
                <Avatar
                  src={cluster.properties.uPhoto}
                  component={Paper}
                  elevation={2}
                  onClick={() => handlePopupOpen(cluster.properties)}
                />
              </Tooltip>
            </Marker>
          );
        })}
        <GeocoderInput />
        {popupInfo && (
          <Popup
            longitude={popupInfo.sloc[0]}
            latitude={popupInfo.sloc[1]}
            maxWidth="auto"
            closeOnClick={false}
            focusAfterOpen={false}
            onClose={() => {setPopupInfo(null),setIsClick(false)}}
          >
            <PopupTrail {...{ popupInfo }} />
            {popupInfo.sloc && popupInfo.floc && (
              <Source
                id="route"
                type="geojson"
                data={routeGeometry}
              >
                <Layer
                  id="route-layer"
                  type="line"
                  paint={{
                    'line-color': '#3887be',
                    'line-width': 4,
                  }}
                />
              </Source>
            )}
            {checkpointData && (
              <>
                <Source id="checkpoints" type="geojson" data={checkpointData}>
                  <Layer
                    id="checkpoint-layer"
                    type="circle"
                    paint={{
                      'circle-radius': 6,
                      'circle-color': '#FFFF00',
                      'circle-stroke-width': 1,
                      'circle-stroke-color': '#fff',
                    }}
                  />
                </Source>
                {checkpointData.features.map((feature, index) => (
                  <Popup
                    key={`weather-popup-${index}`}
                    longitude={feature.geometry.coordinates[0]}
                    latitude={feature.geometry.coordinates[1]}
                    closeButton={false}
                    anchor="bottom"
                  >
                    <div style={{ textAlign: 'center' }}>
                      <Typography variant="body2">
                        {feature.properties.description}
                      </Typography>
                      {feature.properties.weather && (
                        <>
                          <Typography variant="body2">
                            Temp: {feature.properties.weather.temperature}°C
                          </Typography>
                          <Typography variant="body2">
                            {feature.properties.weather.description}
                          </Typography>
                        </>
                      )}
                    </div>
                  </Popup>
                ))}
              </>
            )}

          </Popup>
        )}
        {poiData && (
          <Source id="poi-data" type="geojson" data={poiData}>
            <Layer {...poiLayer} />
          </Source>
        )}



        {selectedCheckpoint && (
         
          <Popup
            longitude={selectedCheckpoint.coordinates[0]}
            latitude={selectedCheckpoint.coordinates[1]}
            onClose={() => setSelectedCheckpoint(null)}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
          >
            <div
              style={{
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                minWidth: '150px',
                maxWidth: '300px'
              }}
            >
              <Typography
                variant="body1"
                style={{
                  color: '#1a1a1a',
                  fontSize: '14px',
                  fontWeight: '500',
                  margin: 0,
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  lineHeight: 1.5
                }}
              >
                {selectedCheckpoint.description}
              </Typography>
            </div>
          </Popup>
        )}

        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
      </ReactMapGL>
    </div>
  );
}

export default ClusterMap;