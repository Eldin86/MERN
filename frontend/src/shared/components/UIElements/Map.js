import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
 
const styles = {
  width: "100%",
  height: "100%",
};
 
const Map = (props) => {
  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);
  const { center, zoom } = props;

  console.log('props.center -> Map', props.center)
 
  useEffect(() => {
    mapboxgl.accessToken = "pk.eyJ1IjoiZWR5ODYiLCJhIjoiY2sycWs4YmV2MGVxNjNocWxzc2l5ZmdjYSJ9.kOHR2MXj13qkF0AC7Vmy-w";
    
    const initializeMap = ({ setMap, mapContainer }) => {
      //konfiguracijski objekat, instanca
      const map = new mapboxgl.Map({
        //container u koji se treba renderati mapa
        container: mapContainer.current,
        //styles
        style: "mapbox://styles/mapbox/streets-v11",
        //koordinate
        center: center,
        //zoom velicina, ukoliko zoom ne proslijedimo dobijemo error tipa, failed to invert matrix at To._calcMatrices
        zoom: zoom || 16
      });

      //instance funkcija na load event se aktivira
      map.on("load", () => {
        console.log('map', map)
        setMap(map);
        map.resize();
      });
    };
    console.log(center)
    if (!map) initializeMap({ setMap, mapContainer });
  }, [map, center, zoom]);
 
  return <div ref={el => (mapContainer.current = el)} style={styles} />;
  //return <div ref={mapContainer} style={styles} />;
};
 
export default Map;