# Modern-Data-Analytics

*MDA Assignment - Group 1*

**Link to Dataset** - https://kuleuven-my.sharepoint.com/personal/elisabeth_filippini_student_kuleuven_be/_layouts/15/onedrive.aspx?e=5%3A34035655304044e1a350843cc61ddb53&sharingv2=true&fromShare=true&at=9&CT=1778956580409&OR=OWA%2DNT%2DMail&CID=091832a3%2D993a%2Dc1ff%2De21b%2D178edb22eba8&id=%2Fpersonal%2Felisabeth%5Ffilippini%5Fstudent%5Fkuleuven%5Fbe%2FDocuments%2FMDA%20bike%20data&FolderCTID=0x01200066D9480A00A70C4CAB17B185359CD6DB&view=0

# MCPI Calculator


Calculated for each municipality m

The first term in the formula represents a relative safety risk, second is an infrastructure gap

and the third represents the cycling demand density.

α, β, γ are tunable weights depending on preference on what factor should be prioritized. To

start, we can set these to be equal.

mcpi_calculator.ipynb has all relevant code for that



# Bike Traffic 


For modelling bike count, we will utilize the combination of the variables from the original

EcoCounter datasets, the demographic data from Statbel, as well as the weather API data. For

building the actual model itself, we believe the strongest option from the Sci-Kit Learn

Python Package is Gradient Boosting (XGBoost or LightGBM) as it properly handles

nonlinear relationships, captures interactions, and is expected to work well for tabular data.


this is done in bike prediction ipynb
