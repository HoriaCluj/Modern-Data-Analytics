## Modern Data Analytics Project Proposal – Group 1

Decision-Support Tool for Cycling Infrastructure Planning in Flanders
Emerentia Arjani Nurman (r0869771), Elisabeth Filippini (r1082934), Horia Cătălin (r0926569), Waseem Irshad (r0918036)

## 1. Proposal Introduction

According to the AMV (Agentschap Wegen & Verkeer), approximately 40% of Flemish cycle
paths are in poor condition, creating safety bottlenecks and a significant maintenance
backlog. To address this, we are developing a two-tier decision-support tool for cycling
infrastructure planning. At the operational level, the tool delivers accurate, weather- and
demographic-adjusted bike traffic forecasts per sensor to guide short-to-medium-term
decisions, such as maintenance scheduling and event congestion management. At the
strategic level, it computes a Municipality Cycling Priority Index (MCPI) for long-term
investment planning. By integrating predicted traffic exposure, severity-weighted accident
data, and infrastructure quality metrics, the MCPI outputs a transparent composite priority
score per municipality, ensuring resources are allocated where they yield the greatest safety
and mobility impact.

## 2. Data

Original Bike Traffic Data: The original bike traffic data provides us with our response
variable for the supervised learning task of predicting bike traffic, which will then be
combined with accident volume, resulting in sound policy decisions for Flemish authorities.

Demographic Data: We include population and demographic data (including age, gender)
per municipality from Statbel’s datasets over the years 2019-2024. For the years 2025 and
2026 where there is no published data yet, we will either use 2024 as a proxy year or make
estimates from past years.

Weather Data: Using the API from open-meteo.com, we are able to scrape hourly weather
data from 2019 to 2026 for each bicycle count tracker using its longitude and latitude. This
API provides a broad range of variables to choose from, including the temperature, rainfall,
windspeed and snowfall.

Road Accidents Data: The entries in the road accident dataset give us the precise date and
conditions under which a road accident occurred in a specific area of Flanders. As such, we
will be able to classify the level of risk in the surroundings of an EcoCounter and
municipality.

Infrastructure Data: The European Cyclist Federation provides us with a dataset with
cycling infrastructure metrics per municipality. These metrics include the ratio of segregated
cycling infrastructure to main roads, ratio of contraflow cycling, and more. Thus allowing us
to assess infrastructure quality. The data is only present for the year 2024, so we will use it as
a static baseline measure for the MCPI.

## 3. Modelling

a. Feature Engineering
We will extract temporal features (season, day type, time of day) from the raw
15-minute EcoCounter data, potentially aggregating to daily or monthly intervals to
align with external datasets. Weather variables (temperature, rainfall, windspeed,
snowfall) will be matched to each sensor’s coordinates and timestamp, while
demographic metrics (population, age, gender) will be aggregated per municipality.
Combined, these spatiotemporal, environmental, and demographic features will drive
accurate bike traffic predictions per EcoCounter.
For the MCPI, we will take recent accident data that will be filtered for
cyclist-involved incidents, weighted by severity (fatal=5, serious=3, minor=1), and
aggregated per municipality. Infrastructure quality is captured via an Infrastructure
Deficit Score, using infrastructure ratios from the dataset:
Deficit = 1 − (w₁·segregated + w₂·contraflow + w₃·extended + w₄·cycle_track_ratio),
where higher values indicate poorer infrastructure.
The weights will be set equally initially, but can be fine tuned later.

b. Tools and Python Packages
Tools: Jupyter (exploration), Scikit-learn/LightGBM (prediction), Pandas/Polars (processing),
GeoPandas/Folium (mapping/ interactive dashboard).

c. Methodology & Model

## Bike Traffic Prediction Model

For modelling bike count, we will utilize the combination of the variables from the original
EcoCounter datasets, the demographic data from Statbel, as well as the weather API data. For
building the actual model itself, we believe the strongest option from the Sci-Kit Learn
Python Package is Gradient Boosting (XGBoost or LightGBM) as it properly handles
nonlinear relationships, captures interactions, and is expected to work well for tabular data.

Municipality Cycling Priority Index (MCPI)= (refer to python notebook)

Calculated for each municipality m

The first term in the formula represents a relative safety risk, second is an infrastructure gap
and the third represents the cycling demand density.

α, β, γ are tunable weights depending on preference on what factor should be prioritized. To
start, we can set these to be equal.

## Presentation

The dashboard delivers two core tools for the government: (1) per-sensor traffic forecasts,
where users select an EcoCounter, input time/weather conditions, and receive instant bike
count predictions to guide operational decisions; and (2) a municipality-level MCPI map of
Belgium, where color intensity indicates priority. Clicking a municipality reveals a
breakdown of its accident risk, predicted cycling demand, and infrastructure gaps. We can
also add an optional weight-adjustment panel (α, β, γ sliders) to let policymakers explore
trade-offs between safety, infrastructure, and demand priorities.
The dashboard will thus look like a combination of the below two images:
