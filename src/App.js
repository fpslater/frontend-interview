import React, { Component } from 'react';
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps";

import logo from './logo.png';
import './App.css';

var RTM = require("satori-sdk-js"),
    endpoint = "wss://open-data.api.satori.com",
    appKey = "A7cFAa506c9DB234806fA0bda24A5122",
    channel = "transportation";

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Frontend Coding Exercise</h2>
        </div>
        <div className="App-intro">
          <VehicleTracker />
        </div>
      </div>
    );
  }
}

function RoutesList(props) {
  return (
    <table>
      <thead>
        <tr>
          <th>Route</th>
          <th>Buses on Routes</th>
        </tr>
      </thead>
      <tbody>
      {Object.keys(props.routes).map(function (key) {
        let route = props.routes[key];
        return (
          <tr key={key} onClick={() => props.onListItemClick(key)}>
            <td>{route.routeID}</td>
            <td>{route.vehiclesCount}</td>
          </tr>
        );
      }, props)}
      </tbody>
    </table>
  )  
}

const DefaultMap = withGoogleMap(props => (
  <GoogleMap
    ref={props.onMapLoad}
    defaultZoom={10}
    defaultCenter={{ lat: 45.5231, lng: -122.6765 }}
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

class VehicleTracker extends React.Component {
  constructor(props) {
    super(props);
    this.displayedVehicles = {};
    this.state = {
      markers: {},
      routes: {}
    };
  }

  handleMapLoad = this.handleMapLoad.bind(this);
  handleClick = this.handleClick.bind(this);
  addVehicleToMap = this.addVehicleToMap.bind(this);
  addRoute = this.addRoute.bind(this);

  componentDidMount() {
    this.rtm = new RTM(endpoint, appKey,);
    this.rtm.on("enter-connected", function() {
      console.log("Connected to RTM!");
    });

    let filter = {
      filter: "select * from `transportation` where header.`user-data`='trimet'",
    };

    let subscription = this.rtm.subscribe(channel, RTM.SubscriptionMode.SIMPLE, filter),
        _this = this;
    subscription.on('rtm/subscription/data', function (pdu) {
      pdu.body.messages.forEach(function (msg) {
        _this.addVehicleToMap(msg);
        _this.addRoute(msg);
      });
    });

    this.rtm.start();
    
    setTimeout(function() {
      _this.rtm.stop();
    }, 3000)
  }

  componentWillUnmount() {
    this.rtm.stop();
  }

  isInfoValid(info) {
    return info.entity[0].vehicle.position && info.entity[0].vehicle.trip;
  }

  addVehicleToMap(info) { 
    if (!this.isInfoValid(info)) {
      return;
    }

    let lat = info.entity[0].vehicle.position.latitude,
        lng = info.entity[0].vehicle.position.longitude,
        key = info.entity[0].vehicle.vehicle.id,
        routeID = info.entity[0].vehicle.trip ? info.entity[0].vehicle.trip.route_id : null,
        markers = this.state.markers,
        newVehicle = {
          position: {
              lat: lat,
              lng: lng,
            },
            key: key,
            routeID: routeID, 
            defaultAnimation: 2,
            display: this.displayedVehicles[key] || !Object.keys(this.displayedVehicles).length ? true : false
        };

    markers[key] =  newVehicle;
    this.setState({markers: markers});
  }
  
  addRoute(info) {
    if (!this.isInfoValid(info)) {
      return;
    }

    let routeID = info.entity[0].vehicle.trip.route_id,
        vehicleID = info.entity[0].vehicle.vehicle.id,
        routes = this.state.routes,
        route = routes[routeID] ? routes[routeID] : {
          routeID: routeID,
          vehiclesOnRoute: {},
        };

    route.vehiclesOnRoute[vehicleID] = true;
    route.vehiclesCount = Object.keys(route.vehiclesOnRoute).length;    
    routes[routeID] = route;
    this.setState({routes: routes});
  }

  handleMapLoad(map) {
    this._mapComponent = map;
    if (map) {
      console.log(map.getZoom());
    }
  }

  handleClick(param) {
    let key = typeof param === 'object' ? param.routeID : param;

    this.displayedVehicles = this.state.routes[key].vehiclesOnRoute;

    Object.keys(this.state.markers).map(function (key) {
      let markers = this.state.markers;
      this.displayedVehicles[key] ? markers[key].display = true : markers[key].display = false;
      //this.setState({markers: markers});
    }, this);
  }

  render() {
    return (
      <div style={{height: '700px'}}>
        <RoutesList 
          routes={this.state.routes}
          onListItemClick={this.handleClick}
        />
        <div className='map' style={{height: `100%`}}>
          <DefaultMap
            containerElement={
              <div style={{ height: `100%` }} />
            }
            mapElement={
              <div style={{ height: `100%` }} />
            }
            onMapLoad={this.handleMapLoad}
            markers={this.state.markers}
            onMarkerClick={this.handleClick}
          />
        </div>
      </div>
    );
  }
}

export default App;
