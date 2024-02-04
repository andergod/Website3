---
categories:  
- ""    #the front matter should be like the one found in, e.g., blog2.md. It cannot be like the normal Rmd we used
- ""
date: "2024-02-4"
description: macro graphs
draft: false

keywords: ""
slug: macro_graphs
title: Macroeconomic Graphs 
---

### FX

The presented Python script offers a comprehensive analysis of various macroeconomic indicators through the use of financial and economic data. The initial section focuses on fetching foreign exchange data for EUR/USD, GBP/USD, and CAD/USD using the yfinance API. The script constructs a dataframe, displaying the latest five rows, and generates a line graph illustrating the evolution of exchange rates over the past five years. 

```python
# For data manipulation
import numpy as np
import pandas as pd
import datetime as dt
import pandas_datareader.data as web
import os


# To fetch financial data
import yfinance as yf

#To do graphs
import matplotlib as plt
from matplotlib import cycler, rcParams
import seaborn as sns
import matplotlib.dates as mdates

# Set the ticker to download
currencies=['EURUSD=X','GBPUSD=X' , 'CAD=X']
forex_data = yf.download(currencies, start='2015-01-02', end='2022-12-31')

# Set the index to a datetime object
forex_data.index = pd.to_datetime(forex_data.index)
df=forex_data['Adj Close']
df=df.rename(columns={'CAD=X':'CAD','EURUSD=X':'EUR','GBPUSD=X':'GBP'})
# Display the last five rows
df.tail()

    
```

![Alt Text](/img/blogs/Macro_table1.png)

Lets make a graph to show the evolution of the exchange rate across the last 5 years.

```python
#Reworking the dataframe
df_melted = pd.melt(df.reset_index(),id_vars='Date', var_name='Currency', value_name='Exchange_rate')
df_melted.set_index('Date', inplace=True)

#Graph line
plt.figure(figsize=(6.4, 4.8))
sns.lineplot(data=df_melted, y="Exchange_rate", x=df_melted.index, hue='Currency')
date_format = mdates.DateFormatter('%b-%y')  # %b: abbreviated month, %y: abbreviated year
plt.gca().xaxis.set_major_formatter(date_format)

# Add labels and title
plt.xlabel('')
plt.ylabel('Exchange rate', fontsize=12)
plt.title('Main exchange rate evolution',fontsize=15, fontweight='bold')
plt.legend(fancybox=True, loc='upper left', frameon=True)

# Display the plot
plt.tight_layout()  # Adjust layout to prevent clipping of labels
plt.show()

```
![Alt Text](/img/blogs/Macro_graph_fx.png)


### GDP

Moving on to the analysis of real quarterly GDP growth rates, the script retrieves data from the OECD website for selected countries, including the United States, United Kingdom, Canada, and the Euro area. This data is processed, and a line graph is produced, providing insights into the differences and trends in economic growth among the selected countries.

```python
#Lets import the data of Real GDP
## GDP growth from https://stats.oecd.org/index.aspx?queryid=350#
gw_df=pd.read_csv('Data/GDP_growth.csv')
countries=['United States', 'United Kingdom','Canada','Euro area (20 countries)' ]
gw_df.loc[gw_df['Country'].isin(countries),['Country','Period','Value']]

#Format the date
gw_df['Date']= (pd.to_datetime(
        gw_df['Period'].str.split('-').apply(lambda x: ''.join(x[::-1]))
))

#Select the countries and rename the column
gw_df=gw_df.loc[gw_df['Country'].isin(countries),['Country','Date','Value']] 
gw_df.loc[gw_df ['Country'] =='Euro area (20 countries)','Country']='Europe'
gw_df=gw_df.pivot_table(index=['Date'], columns='Country', values='Value')
gw_df=gw_df.rename(columns={'United States':'US_GDP','United Kingdom':'UK_GDP','Europe':'EU_GDP','Canada':'CA_GDP'})
gw_df2=gw_df.resample('D').ffill()

#Merge both datasets currency and GDP
df1=pd.merge(df, gw_df2, how='left', left_index=True, right_index=True)
df1.head(5)

```

![Alt Text](/img/blogs/Macro_table_GDP.png)

Lets make a graph of this growth rates.

```python
#Add graph of growh rates and show differences between countries.
#Reworking the dataframe
df_melted2=df1.iloc[:,3:]
df_melted2 = pd.melt(df_melted2.reset_index(),id_vars='Date', var_name='Country', value_name='Growth_rate')
df_melted2.set_index('Date', inplace=True)

#Graph line 
plt.figure(figsize=(6.4, 4.8))
sns.lineplot(data=df_melted2, y="Growth_rate", x=df_melted2.index, hue='Country')
date_format = mdates.DateFormatter('%b-%y')  # %b: abbreviated month, %y: abbreviated year
plt.gca().xaxis.set_major_formatter(date_format)

# Add labels and title
plt.xlabel('')
plt.ylabel('Yield', fontsize=12)
plt.title('Real growth rate evolution',fontsize=15, fontweight='bold')
plt.legend(fancybox=True, loc='upper left', frameon=True)

# Display the plot
plt.tight_layout()  # Adjust layout to prevent clipping of labels
plt.show()


```

![Alt Text](/img/blogs/Macro_graph_gdp.png)

We can make a graph of the distribution to show some fundamental differences between countries

```python
#Make a subplot graph
fig, ax = plt.subplots(2,2)
n=0
for i in range(2):
    for j in range(2):
        ax[i,j].set_title(gw_df.columns[n][:2], fontsize=10)
        ax[i,j].hist(gw_df.iloc[:,n], bins=20, color='#87CEEB')
        data = gw_df.iloc[:, n]
        median_value = data.median()
        median_value_formatted = "{:.4f}".format(median_value)
        # Plot a small square indicating the median
        ax[i, j].scatter([median_value], [0], marker='s', color='red', s=30, label=f'Median: {median_value_formatted}')
        ax[i, j].legend(loc='upper right')
        n=n+1
fig.suptitle('Growth rate distribution', fontsize=15, fontweight='bold')

```

The graph shows similar distributions of quarterly growth during the last 5 years, showing clearly the outlier during covid period. The medians are all in line and the distribution seemed quite similar.

### Yield rates

The script further explores interest rate yields by importing data for 2-year and 10-year bonds for various countries. After merging and processing these datasets, a line graph is generated to visualize the evolution of interest rate yields, shedding light on how different countries responded to economic challenges, especially during the pandemic.

```python
#Loading all the datasets related  to interest rate yields
#List of countries codes
country_code=df.columns.to_list()
country_code.append('US')
bond_name=[[str(code)+'_2',str(code)+'_10'] for code in country_code]
bond_name=[item for sublist in bond_name for item in sublist]

#List of files
directory_path='Data'
file_names = [f for f in os.listdir(directory_path) if not f.startswith('GDP')]

#Make a dictionary to match elements with their code
bond_dict = dict(zip(bond_name, file_names))

#Import the data and format titles
bond_set={}
for key, value in bond_dict.items():
    bond_set[key]=pd.read_csv('Data/'+bond_dict[key])[['Date','Price']]
    bond_set[key]=bond_set[key].rename(columns={'Price':key})

df2=bond_set['CAD_2']
for key,data_set in bond_set.items():
    if data_set is not df2:
        df2=pd.merge(df2, data_set, how='left', left_on='Date', right_on='Date')

#Change the day format to datetime and add the index
df2['Date']=pd.to_datetime(df2['Date'])
df2=df2.set_index('Date')

#Merge everything into the final dataset
df3=pd.merge(df1, df2, how='left', left_index=True, right_index=True)
df3=df3.ffill()
df3.head(5)

```

After that, we can graph it to see their evolution since the pandemic and how interest rate grew to tackle inflation in their different countries. 


```python
#Reworking the dataframe
df_melted3=df3[bond_name]
df_melted3=df_melted3.reset_index()
df_melted3 = pd.melt(df_melted3,id_vars='Date', var_name='Bond_type', value_name='Yield')
df_melted3.set_index('Date', inplace=True)

#Graph line 
plt.figure(figsize=(6.4, 4.8))
sns.lineplot(data=df_melted3, y="Yield", x=df_melted3.index, hue='Bond_type')
date_format = mdates.DateFormatter('%b-%y')  # %b: abbreviated month, %y: abbreviated year
plt.gca().xaxis.set_major_formatter(date_format)

# Add labels and title
plt.xlabel('')
plt.ylabel('Yield', fontsize=12)
plt.title('Yield rate evolution',fontsize=15, fontweight='bold')
plt.legend(fancybox=True, loc='upper left', frameon=True)

# Display the plot
plt.tight_layout()  # Adjust layout to prevent clipping of labels
plt.show()

```

![Alt Text](/img/blogs/macro_graph_yields.png)

We can observe than most of the time Germany yields were under zero. This may be surprising but the constant effort in the Eurozone to carry out stimulus pre-Covid was quite clear. Thus, the negative interest rate, beside that, most of the yields follow a similar patter with different paths before the pandemic, but after that they are quite correlated.

### Sentiment Indicator

Introducing the VIX (Volatility Index) as a sentiment indicator, we compare it with the S&P 500 index, offering a perspective on how market sentiment correlates with broader market movements. 

```python
# Set the ticker as 'EURUSD=X'
sentiment_vix=['^VIX']
sentiment_data = yf.download(sentiment_vix, start='2015-01-02', end='2022-12-31').reset_index()[['Date','Close']]
sentiment_data.set_index('Date', inplace=True)

#We can show how this is the fear market indicator by how this correlated with the SP500
SP500=['^GSPC']
market = yf.download(SP500, start='2015-01-02', end='2022-12-31').reset_index()[['Date','Close']]
market.set_index('Date', inplace=True)

#Graph line of sentiment and SP500
fig, ax = plt.figure(figsize=(6.4, 4.8)), plt.axes()
ax.plot(market.index, 100*market['Close']/market.iloc[0,0], color='blue', label='SP500')
ax.plot(sentiment_data.index, 100*sentiment_data['Close']/sentiment_data.iloc[0,0], color='red', label='VIX')
ax.legend(loc='upper left', frameon=True)
ax.set_title('SP500 vs VIX', fontsize=15, fontweight='bold')

```
![Alt Text2](/img/blogs/macro_graph_VIX.png)

To bring everything together, we merge all the obtained datasets, including foreign exchange rates, GDP growth rates, interest rate yields, and the sentiment indicator, into a comprehensive dataframe (df4). This final dataset allows for a holistic exploration of potential relationships between various macroeconomic factors.

```python
#Lets merge everything into the final data set
sentiment_data=sentiment_data.rename(columns={'Close':'Sentiment'})
sentiment_data=sentiment_data/sentiment_data.iloc[0,0]
df4=pd.merge(df3, sentiment_data, how='left', left_index=True, right_index=True)
df4=df4.ffill()

```
In conclusion, this script demonstrates a well-organized approach, utilizing essential libraries like pandas, matplotlib, seaborn, and yfinance. Thoughtful comments have been interspersed throughout the code, contributing to clarity and facilitating reader comprehension of each step's purpose and functionality. The script adeptly showcases the seamless integration of diverse datasets and effective visualization techniques. However, enriching the script with additional detailed insights and interpretations would not only enhance its educational value but also foster a more profound understanding of the intricate macroeconomic landscape.