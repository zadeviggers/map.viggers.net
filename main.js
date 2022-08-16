import "mapbox-gl/dist/mapbox-gl.css";
import "./style.css";

import mapboxgl, { Map, NavigationControl } from "mapbox-gl";

// Setup map
mapboxgl.accessToken =
  "pk.eyJ1IjoiemFkZXZpZ2dlcnMiLCJhIjoiY2w2dzAyc3F2MmRpazNjb2RtZXM2MWNhNyJ9.bD7cv6xgGezqpAIkGHovog";

const map = new Map({
  container: "map",
  projection: "globe",
  style: "mapbox://styles/mapbox/satellite-v9",
  zoom: 2,
});

// Make map instance available in console
window.map = map;

map.addControl(new NavigationControl());

map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    // When active the map will receive updates to the device's location as it changes.
    trackUserLocation: true,
    // Draw an arrow next to the location dot to indicate which direction the device is heading.
    showUserHeading: true,
  })
);

map.on("style.load", () => {
  map.setFog({});
});
map.on("style.load", () => {
  // Fog for space in globe view
  map.setFog({
    color: "rgb(56, 129, 168)", // Lower atmosphere
    "high-color": "rgb(36, 92, 223)", // Upper atmosphere
    "horizon-blend": 0.01, // Atmosphere thickness (default 0.2 at low zooms)
    "space-color": "rgb(11, 11, 25)", // Background color
    "star-intensity": 0.6, // Background star brightness (default 0.35 at low zoooms )
  });

  // 3D terrain
  map.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    tileSize: 512,
    maxzoom: 14,
  });
  map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

  // Spin effect
  const secondsPerRevolution = 180;
  const maxSpinZoom = 4;
  const slowSpinZoom = 2.5;
  let userInteracting = false;

  function spinGlobe() {
    const zoom = map.getZoom();
    if (!userInteracting && zoom < maxSpinZoom) {
      let distancePerSecond = 360 / secondsPerRevolution;
      if (zoom > slowSpinZoom) {
        // Slow spinning at higher zooms
        const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
        distancePerSecond *= zoomDif;
      }
      const center = map.getCenter();
      center.lng -= distancePerSecond;
      // Smoothly animate the map over one second.
      // When this animation is complete, it calls a 'moveend' event.
      map.easeTo({ center, duration: 1000, easing: (n) => n });
    }
  }

  // Pause spinning on interaction
  map.on("mousedown", () => {
    userInteracting = true;
  });

  // Restart spinning the globe when interaction is complete
  map.on("mouseup", () => {
    userInteracting = false;
    spinGlobe();
  });

  // These events account for cases where the mouse has moved
  // off the map, so 'mouseup' will not be fired.
  map.on("dragend", () => {
    userInteracting = false;
    spinGlobe();
  });
  map.on("pitchend", () => {
    userInteracting = false;
    spinGlobe();
  });
  map.on("rotateend", () => {
    userInteracting = false;
    spinGlobe();
  });

  // When animation is complete, start spinning if there is no ongoing interaction
  map.on("moveend", () => {
    spinGlobe();
  });

  // Start spinning automatically
  spinGlobe();
});
