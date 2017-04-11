import React, { PropTypes } from 'react'
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps";

const defaultZoom = 10,
      defaultCenter = { lat: 45.5231, lng: -122.6765 };


const DefaultMap = withGoogleMap(props => (
  <GoogleMap
    ref={props.onMapLoad}
    defaultZoom={defaultZoom}
    defaultCenter={defaultCenter}
  >
    { Object.keys(props.markers).map(function (key) {
      let marker = props.markers[key];
      if (marker.display) {
        return (
          <Marker
            {...marker}
            onClick={() => props.onMarkerClick(marker)}
          />
        );
      } else {
        return false;
      }
    }, props)}
  </GoogleMap>
));

export default DefaultMap