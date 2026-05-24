import React from 'react';
import Presentation from './components/Presentation';
import IntroSlide from './slides/IntroSlide';
import DataIntroSlide from './slides/DataIntroSlide';
import ExternalDatasetsSlide from './slides/ExternalDatasetsSlide';
import TechStackSlide from './slides/TechStackSlide';
import BikePredictionDashboard from './dashboards/BikePredictionDashboard';
import MCPIDashboard from './dashboards/MCPIDashboard';

function App() {
  const slides = [
    <IntroSlide key="intro" />,
    <DataIntroSlide key="data-intro" />,
    <ExternalDatasetsSlide key="external-data" />,
    <TechStackSlide key="tech-stack" />,
    <BikePredictionDashboard key="bike-prediction" />,
    <MCPIDashboard key="mcpi" />
  ];

  return (
    <Presentation slides={slides} />
  );
}

export default App;
