import React from 'react';
import Presentation from './components/Presentation';
import IntroSlide from './slides/IntroSlide';
import DataIntroSlide from './slides/DataIntroSlide';
import ExternalDatasetsSlide from './slides/ExternalDatasetsSlide';
import TechStackSlide from './slides/TechStackSlide';
import BikePredictionDashboard from './dashboards/BikePredictionDashboard';
import MCPIDashboard from './dashboards/MCPIDashboard';

import BikePredictionIntroSlide from './slides/BikePredictionIntroSlide';
import MCPIIntroSlide from './slides/MCPIIntroSlide';
import ConclusionSlide from './slides/ConclusionSlide';

function App() {
  const slides = [
    <IntroSlide key="intro" />,
    <DataIntroSlide key="data-intro" />,
    <ExternalDatasetsSlide key="external-data" />,
    <TechStackSlide key="tech-stack" />,
    <BikePredictionIntroSlide key="bike-prediction-intro" />,
    <BikePredictionDashboard key="bike-prediction" />,
    <MCPIIntroSlide key="mcpi-intro" />,
    <MCPIDashboard key="mcpi" />,
    <ConclusionSlide key="conclusion" />
  ];

  return (
    <Presentation slides={slides} />
  );
}

export default App;
