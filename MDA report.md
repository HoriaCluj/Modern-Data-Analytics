**[1 - Introduction]{.underline}**

*1.1 Biking In Flanders*

In Belgium, the Agentschap Wegen & Verkeer (AWV) is the official government agency responsible for managing, operating, and maintaining the primary road network across the Flanders region. Additionally, it specifically is responsible for the construction and maintenance of a large bicycle lane network, which stretches 7700 km long. As a roads and traffic agency, it has several important objectives.

A primary objective of the agency is reducing maintenance backlog. According to the AWV, approximately 40% of Flemish cycle paths are in poor condition, creating safety bottlenecks and a significant maintenance backlog [(citation]{.mark}). A further objective is to reduce biking accidents, and in particular Vision Zero: reducing fatal accidents involving cyclists and pedestrians to zero. The third objective is to increase the overall biking rate and have 30% of all journeys be by bicycle by 2030.

To support their goals, within this project we aim to develop a comprehensive two-tier decision-support tool for cycling infrastructure planning. The final dashboard will achieve two goals:

1.  **Forecasting bike traffic:** At the operational level, the tool will deliver accurate hourly bike traffic forecasts per sensor to guide short-to-medium-term decisions, such as maintenance scheduling and event congestion management, helping reduce the current maintenance backlog.

2.  **A priority index:** At the strategic level, it computes a Municipality Cycling Priority Index (MCPI) for long-term investment planning. By integrating annual traffic exposure, severity-weighted accident data, and infrastructure quality metrics, the MCPI outputs a transparent composite priority score per municipality. This score will help policy makers to decide where to allocate investment and resources for biking infrastructure projects, such that they yield the greatest safety and mobility impact.

The data used in this project are automatic bycicle count data, i.e. counts of how many bikes drive past EcoSensors installed throughout Flanders. They are provided by the AWV and are separated into three datasets, joined by unique EcoCounter IDs:

1.  **Counts**: Counts are provided for each EcoSensor from late 2019 to 2026, including but not limited to bycicles (pedestrians or cars, for instance, might also be included). Directions are included as well, given as in, out, or both. These data are split across multiple tables.

2.  **Direction**: The directions (in / out / both) of the EcoCounters is provided too.

3.  **Sites**: Information about the EcoCounters themselves is given. In particular, the geographical coordinates and minucipality are included in this dataset.

In this project, we will retain the counts and the sites data.

*1.2 -- Supplementary datasets*

Throughout this project, we used the following four datasets in addition to the bike sensor data:

1)  **Weather dataset** -- Our source for gathering weather data was Open-Meteo (<https://open-meteo.com>), which provides detailed and spatially dense historical weather data reaching back to 1940. Using the website's API, we scraped weather data at hourly intervals at the geographical coordinates of the individual bike sensors and across the same (differing) timeframes as the given sensors. In particular, the variables gathered were temperature (in degrees Celcius), apparent temperature, wind speed (in kph), precipitation (in mm), and snowfall (in mm).

2)  **Accident dataset** -- Statistics Belgium (StatBel) provides a comprehensive tabular description of road accidents in Belgium, both in French and Dutch, including the location, date, weather conditions, and injury levels. It also specifies the involved modes of transportation: for example, whether it was an accident involving only cars, or cars and bikes, or only bikes. The full dataset is available at this link: <https://data.gov.be/en/datasets/nodeid6391>

3)  **Demographic data** -- Population sizes across municipalities and the years 2020-2026 were obtained from StatBel as well.

4)  **Infrastructure dataset** -- Belgian cycling infrastructure data for 2024 is available at this link: <https://www.ecf.com/en/resources/ecfs-cycling-infrastructure-tracker/> , provided by the European Cyclist Federation (ECF). At the municipality level, different variables regarding cycling traffic and the quality of cycling paths are given.

[A snapshot of each dataset can be found in the appendix.]{.mark}

*1.3 -- Visualising our process*

The final dashboard constructed throughout this process will be in two parts, focused at (1) the EcoCounter level and (2) the minucipality level.

The first map will display all counters. Users can hence select a counter of their choice, as well as input a time and weather conditions, and receive a **prediction of bike traffic** at this counter and for those given parameters. A preliminary map of the counters across Flanders can be seen below.

[MAP HERE]{.mark}

The second map will display the **MCPI** by municipality, indicated by color. The user may then select a given municipality and obtain a breakdown of the variables involved in computing the index. Additionally, the user can tune the weights to give more or less priority to these parameters according to organizers' needs.

**[2 - Data Processing]{.underline}**

Our first aim, predicting bike traffic, required preparing the bike sensor counts and sensor location datasets, as well as the scraped weather data and the infrastructure data.

The bike sensor counts and location data were first joined by sensor ID and aggregated from the original 15-minute interval format to hourly intervals, before being stored as seven datasets for each year from 2020 to 2026. This data was then joined with the scraped weather data by location coordinates and saved as a single dataset. An additional variable was added to indicate whether a bike count took place during school holidays, and another for the 24-hour lag bike count. Categorical variables (season, weekday, etc) were encoded numerically. Finally, an interaction term between the hour and presence of a weekend was added, under the assumption that rush hours might be decreased or different during weekends.

For the infrastructure data, an **Infrastructure Deficit Metric (IDM)** was constructed for each given arrondissement using new previously engineered variables (some were defined according to ECB guidelines and will be underlined in the below descriptions), and condensed in the following formula:

IDM = w1 \* segregated + w2 \* contraflow + w3 \* quality + w4 \* surface

Higher values indicate a poorer infrastructure. The variables involved refer to the following concepts, respectively:

- ***segregated*:** The new variable *seg_score* is the variable *ratio-cycle_tracks-main_roads* after scaling. The variable represents [segregation quality]{.underline}, which refers to how much of cycling infrastructure is properly separated from motor traffic.

- ***contraflow*:** The new variable *contra_score* is the variable *ratio_contraflow* after scaling. The [contraflow access]{.underline} is a measure of whether cyclists can travel both directions on one-way streets.

- ***extended:*** The variable *quality_score* is constructed by averaging the proportions of lanes, tracks, and paths shared with pedestrians that are either badly or not rideable. It reflects the share of cycling infrastructure of poor or unknown quality.

- ***surface***: The variable surface_score is constructed by averaging the proportions of tracks and paths shared with pedestrians that use either gravel or dirt. This conveys the share of cycling infrastructure using poor materials.

As a final step, the sensor-weather data and the infrastructure deficit data were joined by location: the arrondissements given in the infrastructure datasets were matched to their respective municipalities in the sensor location data, to allow each Eco-counter to be attributed an IDM.

Our second aim, constructing the MCPI for each municipality, primarily required preparing the accidents data, with the objective of engineering a single variable to describe the accident rate in each municipality by year.

To do this, the dataset was first filtered to retain only accidents involving a bike as either party, scanning for the terms "bicyclette", "vélo\", \"velo\", and \"cycliste\". A new variable was then formed to numericize accident severity based on the TX_ROAD_USR_TYPE1_FR column, assigning the following scores to the different casualty descriptions:

| Score | French terminology | Description |
|----|----|----|
| 4 | Includes "mortellement" | The accident incurred deadly wounds |
| 3 | Includes "tués\" | The accident incurred death in general |
| 2 | Includes "grave" | The accident (or wounds, possibly) was severe |
| 1 | -- | All other accidents of lower severity |

*Fig. 1 Explanation of the weights for each accident*

The decision to rank accidents with deadly wounds above accidents incurring death in general rested on considering [(what was our justification again?)]{.mark}. The below dashboard gives a visualization of accident distribution across Belgium, across all years included in the dataset (2017-2024).

![](media/image.png){width="5.198595800524934in" height="2.484430227471566in"}

*Fig 2. Visualisation of all bicycle-related accidents in Belgium from 2017-2024*

The accidents data were then restricted to only Flemish municipalities, by only keeping observations with a NIS/ISN code below 50,000 and excluding values between 21,000 and 21,999 (which correspond to the Brussels-Capital Region municipalities). The data were aggregated by municipality (given by the TX_MUNTY_COLLISION_NL column) and by year; a combined accident score was then formed by multiplying the number of accidents, in a given year and municipality, by the average accident severity.

Finally, we extrapolated the accident scores to the years 2025 and 2026, assuming that the trends present in our dataset would be maintained. This was done through simple linear regression of the score against the year. While we used all years available to maximize our prediction accuracy, we then restricted our final dataset to 2020 onwards to match our bike count data.

With the accident data fully prepared, we also prepared the following variables for each year and municipality: the predicted bike traffic, obtained from predicting bike counts as detailed in Section 3, the IDMs constructed above, and population.

**[3 - Predicting Bike Traffic]{.underline}**

To predict biking traffic, we first split our data into a training and a testing set by using the years 2020-2025 for the former and setting all data for 2026 as the latter. Predictions were made across 15-minute intervals.

Our first prediction attempt was made with an XGBoost model, specifying the bike count as Poisson-distributed data. Five hundred estimators were used, with a learning rate of 5%, and a maximum depth of 6. This initial attempt had a poor performance, with an R^2^ of 67%.

Fine-tuning in an iterative manner was not possible given the size of the data and the incurring computational cost. Parameters were hence adjusted in a more naïve search approach: the number of trees was increased and the learning rate lowered, the maximum depth was increased, a minimum child weight parameter was increased from the default to prevent overfitting, and both Lasso and Ridge regularization parameters were incorporated. This did increase performance, though not to a satisfying level, with a new R^2^ of 71%, and an RMSE decreasing from around15 to 14.

Following this, a LightGBM model was used instead, with again 500 trees, a learning rate of 5%, a maximum of 63 leaves per tree, and a minimum child samples value of 20. This model yielded an R^2^ of 72% with an RMSE of just below 14.

This encouraged us to continue with a LightBGM model, adjusting parameters as follows. The number of trees was increased to 1000 and maximum number of leaves doubled to 127, while the value of minimum child samples was decreased to 10 and the minimum split gain increased from the default 0 to 0.01. Both L1 and L2 regularization was also implemented again. With this model, an R^2^ of 75% was reached, and the RMSE decreased to just above 13.

The better performing LightGBM model was hence retained, and predictions were computed for the year 2026. All modelling approaches above and their performance are summarized in the table below.

| ***Model*** | ***1*** | ***2*** |  | ***3*** | ***4*** |
|----|----|----|----|----|----|
| **XGBoost parameters** |  |  | **LightGBM parameters** |  |  |
| **Model Type** | *XGBoost* | *XBGoost* | **Model Type** | *LightGBM* | *LightGBM* |
| **Number of trees** | 500 | 800 | **Number of trees** | 500 | 1000 |
| **Learning rate** | 0.05 | 0.03 | **Learning rate** | 0.05 | 0.03 |
| **Maximum depth** | 6 | 8 | **Number of leaves** | 63 | 127 |
| **Minimum child weight** | Default: 1 | 5 | **Minimum child samples** | 20 | 10 |
|  |  |  | **Minimum split gain** | Default: 0 | 0.01 |
| **Regularization parameters** |  | LASSO, RIDGE | **Regularization parameters** |  | LASSO, RIDGE |
| **Mean Absolute Error (MAE)** | 6.00 | 5.62 |  | 5.59 | 5.28 |
| **Root Mean Square Error (RMSE)** | 14.93 | 14.07 |  | 13.88 | 13.17 |
| **R^2^** | 0.67 | 0.71 |  | 0.72 | 0.75 |

Below is a snapshot of the final bike count dashboard map with an implementation example. As introduced before, by selecting a specific time and hour at a certain EcoCounter , an accurate bike prediction for that time period appears. It does so by oulling the same weather prediction variables that were incorporated into the model, utilizing open-meteo\'s weather prediction API.

We have selected the EcoCounter [ID]{.mark} and [TIME]{.mark}, and the dashboard informs us that an estimated [NUMBER]{.mark} bikes will pass by the counter in that time interval.

[DASHBOARD]{.mark}

**[4 - A Priority Index]{.underline}**

The final MCPI indices were engineered with the below formula:

[(someone whose desktop word doesnt crash at the mere mention of an equation pls transcribe the screenshot)]{.mark}

![](media/image2.png){width="6.260416666666667in" height="1.0729166666666667in"}

Where:

1)  *m* denotes the municipality;

2)  *Weighted Accidents* refers to the annual accidents for the municipality, weighted by severity;

3)  *Predicted Traffic* refers to the past or predicted EcoCounter bike counts across the whole municipality, for the given year;

4)  *Infrastructure Deficit* refers to the municipality IDM calculated in Section 2;

5)  *Population* is the municipality population;

To avoid either of the three terms (A) accident rate per cyclist, (B) infrastructure gap, or (C) cycling adoption rate having a disproportionate weight in the MCPI, all three were rescaled to fall between 0 and 1. The parameters alpha, beta, and gamma are tuning parameters, providing the option to weigh one of the three aspects as more or less important.

The final MCPI map shows the indices across Flemish municipalities, indicated as dots with size and color varying by severity. Larger dots correspond to higher indices, and color varies from green to red accordingly. By selecting a specific year (in the range from 2020 to 2026), policymakers can assess how priority regions have evolved over time and determine whether previously identified high-priority regions have improved. In addition, selecting 2026 enables them to identify which regions should be prioritized next for infrastructure improvements and future development projects.

Below is the map for 2026.

[DASHBOARD 2 HERE]{.mark}

Talk about results, which municipalities need prioritization according to our map?

How does this change when we switch the parameter sliders around?

**[5 - Discussion]{.underline}**

Multiple assumptions and adjustments were made throughout this project that may affect the results.

Firstly, accident severity might be interpreted differently, with accidents resulting in deaths ranked higher than accidents resulting in deadly injuries. This would mildly affect the accident rate and hence the final MCPI. To assess the potential impact of our interpretation, the number of accidents was aggregated for each year and by level, with the results in the table below indicating that [\...]{.mark}

[TABLE HERE]{.mark}

We also assume that accident severity increases in a linear way, which might not be accurate especially given the disturbances in mobility during the Covid-19 pandemic and lockdown from 2020 to 2022. Looking again at the table above, we see that [\...]{.mark}

Other forecasting methods could have been implemented, such as an ARIMA or SARIMA model, but the computational demand of tuning and fitting these models on this dataset encouraged the use of linear regression instead. Lastly, we assumed accident rates are independent across municipalities. Should this assumption be wrong, there would be ways of introducing municipality effects as well as spatial dependency. For instance, random effects for municipalities could be introduced within the linear model, in addition to lagged terms for prior accident rates of neighbouring municipalities. Outside of linear regression, vector autogression (VAR) models could be used to simultaneously predict the accident time series and take into account their potential co-dependency.

Some values, i.e. the infrastructure deficit and municipality population, were assumed to be constant with respect to a baseline, due to dataset restrictions. This baseline was 2024 for both the IDM and municipality population. While the infrastructure deficits might not have drastically changed, the assumption of constant population almost certainly do not hold; however, as two out of three terms include population, the MCPI would become at most slightly biased towards the infrastructure deficit. As an approximate alternative to augmenting the data and refitting the model, this can be adressed through the tuning weights.

Finally, the size of the datasets and complexity of modelling approaches used limited the extent of feasible fine-tuning and prevented the fitting of a globally optimal bike prediction model. For instance, the final bike prediction model, stood at nearly 1GB. For the same reason, we did not extent predictions (and hence the MCPI) beyond the year 2026.

[Brainstorm potential fix\...]{.mark}

Our overall approach proves to be feasible and of an acceptable accuracy. While the models could certainly be improved by incorporating more data, the bias introduced by our assumptions is not of a critical severity and can be mitigated with manageable changes. Given higher computational power or a different data storage and processing approach, biking prediction could be improved further and extended, as well as, subsequently, the MCPI.

**[6 -- Conclusion]{.underline}**

**[Appendix:]{.underline}**

[Screenshot of datasets]{.mark}
