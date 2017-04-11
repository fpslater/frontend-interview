import React, { PropTypes } from 'react'

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

export default RoutesList