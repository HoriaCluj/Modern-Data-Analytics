# Modern-Data-Analytics
*MDA Assignment - Group 1*

Understanding our **GitHub Repository**:

#### **1. Dataset Engineering (data_engineering.ipynb)**
This is our data preparation notebook, the starting point of the entire pipeline. On the infrastructure side, we filter municipalities by BE2 NUTS codes, then build the `infrastructure_deficit` score based on the four dimensions: segregation quality, contraflow access, surface quality, and surface materials.
On the accident side, we load the raw accidents Excel file, filter for bike-involved accidents only (using the road user type column), then create the severity covariate based on the French accident classification labels.
Finally, we merge the cleaned bicycle-traffic dataset with our extracted weather data.

#### **2. Accident Score per City (accident_notebook.ipynb)**
We compute the `accident_score` by municipality per year by grouping accidents then multiplying `accident_count x avg_severity`, then extrapolating to 2025-2026 using linear regression per municipality.
We only keep years after (and including) 2020 to correctly align with our yearly bike-weather datasets.

#### **3. Bike-Traffic Predictions (bike_prediction.ipynb)**
To begin with, we concatenate seven yearly hourly bike-weather CSVs (2020 to 2026) into one larger dataset. We then turn to feature engineering where we construct: temporal (season, day, hour, month) variables, public/school holidays, an hour x weekend interaction term, and a lag_24h feature.
Furthermore, we merge the `infrastructure_deficit` score and `population` from our complete_sites.csv dataset, by `counter_id`.
Moreover, we apply a train-test split, keeping 2026 as our test year for bike-count predictions. We then use our training set to train two XGBoost and two LigthGBM models, all using the Poisson objective (since we are dealing with count data).
We save the best model (tuned LightGBM) using joblib, `lgbm_tuned.pkl` is thus a joblib file storing the learned weights of our tuned LightGBM model to avoid constantly re-fitting the model. The model can be loaded using `joblib.load('lgbm_tuned.pkl')`. We replace the actual counts of 2026 with our predicted counts and save the dataset in `model_df_pred.csv`.

#### **4. MCPI Calculator (mcpi_calculator.ipynb)**
This is our final notebook, in which we compute our priority-index (MCPI):
- First, we aggregate hourly bike counts from `model_df_pred.csv` to yearly totals per municipality (using predicted values for 2026).
- Merge with `infrastructure_deficit`, `population`, and `arrondissement` from `complete_sites.csv`
- We also add the `accident_score` from `accidents_scores.csv`. In the few cases the municipality names did not match, we used arrondissement-level scores: `yearly_pred.csv`.
- After manual correction to two municipalities with missing values, we load the final `mcpi_check.csv` and apply the MCPI formula after normalizing each term using sklearn's `MinMaxScaler()` class, and multiplying by the respective weight (set to equal by default).
- Finally, we visualize the final MCPI scores on an interactive Plotly map of Flanders (year can be changed)


**Link to Datasets** - https://kuleuven-my.sharepoint.com/personal/elisabeth_filippini_student_kuleuven_be/_layouts/15/onedrive.aspx?e=5%3A34035655304044e1a350843cc61ddb53&sharingv2=true&fromShare=true&at=9&CT=1778956580409&OR=OWA%2DNT%2DMail&CID=091832a3%2D993a%2Dc1ff%2De21b%2D178edb22eba8&id=%2Fpersonal%2Felisabeth%5Ffilippini%5Fstudent%5Fkuleuven%5Fbe%2FDocuments%2FMDA%20bike%20data&FolderCTID=0x01200066D9480A00A70C4CAB17B185359CD6DB&view=0

