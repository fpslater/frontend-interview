import React from 'react';
import DefaultMap from '../components/DefaultMap'
import RoutesList from '../components/RoutesList'

const RTM = require("satori-sdk-js"),
      endpoint = "wss://open-data.api.satori.com",
      appKey = "A7cFAa506c9DB234806fA0bda24A5122",
      channel = "transportation",
      filter = { filter: "select * from `transportation` where header.`user-data`='trimet'"};

class VehicleTracker extends React.Component {
  constructor(props) {
    super(props);
    this.displayedVehicles = {};
    this.selectedRouteID = '';
    this.state = {
      vehicles: {},
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

    let subscription = this.rtm.subscribe(channel, RTM.SubscriptionMode.SIMPLE, filter),
        _this = this;
    subscription.on('rtm/subscription/data', function (pdu) {
      pdu.body.messages.forEach(function (msg) {
        _this.addVehicleToMap(msg);
        _this.addRoute(msg);
      });
    });

    this.rtm.start();
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
        vehicles = this.state.vehicles,
        display = (routeID === this.selectedRouteID || !Object.keys(this.displayedVehicles).length) ? true : false,
        newVehicle = {
          position: {
              lat: lat,
              lng: lng,
            },
            key: key,
            routeID: routeID, 
            defaultAnimation: 2,
            display: display
        };
    vehicles[key] =  newVehicle;
    this.setState({vehicles: vehicles});
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

    this.selectedRouteID = key;
    this.displayedVehicles = this.state.routes[key].vehiclesOnRoute;

    Object.keys(this.state.vehicles).map(function (key) {
      let vehicles = this.state.vehicles;
      this.displayedVehicles[key] ? vehicles[key].display = true : vehicles[key].display = false;
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
            markers={this.state.vehicles}
            onMarkerClick={this.handleClick}
          />
        </div>
      </div>
    );
  }
}

export default VehicleTracker