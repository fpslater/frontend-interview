import React, { Component } from 'react';
import VehicleTracker from './containers/VehicleTracker'
import logo from './logo.png';
import './App.css';

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

export default App;
