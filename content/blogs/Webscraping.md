---
categories:  
- ""    #the front matter should be like the one found in, e.g., blog2.md. It cannot be like the normal Rmd we used
- ""
date: "2024-02-4"
description: Web scrapper for crypto sentiment analysis 
draft: false

keywords: ""
slug: webscrapper # slug is the shorthand URL address... no spaces plz
title: Web scrapper for crypto sentiment analysis 
---

# Web scrapper for crypto sentiment analysis 

```python
import requests
from bs4 import BeautifulSoup
import pandas as pd
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import spacy
from website_data import website_data
#nltk.download('vader_lexicon')
#nltk.download('stopwords')
#nltk.download('punkt')

cryptocurrencies = pd.read_excel('Criptocurrency_list.xlsx')
crypto_dict={name.lower().strip(): ticker for name, ticker in zip(cryptocurrencies['Name'], cryptocurrencies['Ticker'])}
nlp = spacy.load('en_core_web_sm')


def clean_text(text)->str:
    # Tokenize the text
    words = word_tokenize(text)
    # Remove stop words
    stop_words = set(stopwords.words('english'))
    filtered_words = [word.lower() for word in words if word.isalnum() and word.lower() not in stop_words]
    return ' '.join(filtered_words)
        
def analyze_sentiment(text)->str:
    sia = SentimentIntensityAnalyzer()
    sentiment_score = sia.polarity_scores(text)['compound']
    # Assume a simple threshold for sentiment
    if sentiment_score >= 0.1:
        return 'Buy'
    elif sentiment_score <= -0.1:
        return 'Sell'
    else:
        return 'Hold'
    
def get_main_currency(text)->str:
    doc = nlp(text)
    # Extract entities recognized as cryptocurrencies
    recognized_currencies = [ent.text.lower() for ent in doc.ents if ent.text.lower() in crypto_dict]
    # If there are recognized cryptocurrencies, return the first one, otherwise return None
    return recognized_currencies[0] if recognized_currencies else None

def run_process(website:str)->None:
    s=website_data()
    if website=="cryptonews_relevantpost":
        posts=s.cryptonews_relevantpost()
        type="cryptonews_relevantpost"
    elif website=="coindesk_relevantpost":
        posts=s.coindesk_relevantpost()
        type="coindesk_relevantpost"
    elif website=="yahoo_relevantpost":
        posts=s.yahoo_relevantpost()
        type="yahoo_relevantpost"
    elif website=="independent_relevantpost":
        posts=s.independent_relevantpost()
        type="independent_relevantpost"
    for post in posts:
        text=s.text_from_relevant(post, type)
        clean=clean_text(text)
        sentiment=analyze_sentiment(clean)
        currency=get_main_currency(text)
        if currency:
            print(f'I should {sentiment} {crypto_dict[currency].upper()}')
        else:
            print('No relevant currency found')       
    

if __name__ == '__main__':
    run_process("cryptonews_relevantpost")
    run_process("coindesk_relevantpost")
    run_process("yahoo_relevantpost")
    run_process("independent_relevantpost")
    
```

```         
Rows: 125
Columns: 14
$ case                 <chr> "Oxford High School shooting", "San Jose VTA shooting", "FedEx warehouse shooting…
$ year                 <dbl> 2021, 2021, 2021, 2021, 2021, 2021, 2020, 2020, 2019, 2019, 2019, 2019, 2019, 201…
$ month                <chr> "Nov", "May", "Apr", "Mar", "Mar", "Mar", "Mar", "Feb", "Dec", "Dec", "Aug", "Aug…
$ day                  <dbl> 30, 26, 15, 31, 22, 16, 16, 26, 10, 6, 31, 4, 3, 28, 31, 15, 24, 23, 19, 7, 27, 2…
$ location             <chr> "Oxford, Michigan", "San Jose, California", "Indianapolis, Indiana", "Orange, Cal…
$ summary              <chr> "Ethan Crumbley, a 15-year-old student at Oxford High School, opened fire with a …
$ fatalities           <dbl> 4, 9, 8, 4, 10, 8, 4, 5, 4, 3, 7, 9, 22, 3, 12, 5, 3, 5, 3, 12, 11, 3, 5, 3, 5, 1…
$ injured              <dbl> 7, 0, 7, 1, 0, 1, 0, 0, 3, 8, 25, 27, 26, 12, 4, 6, 1, 0, 0, 22, 6, 3, 0, 2, 2, 1…
$ total_victims        <dbl> 11, 9, 15, 5, 10, 9, 4, 5, 7, 11, 32, 36, 48, 15, 16, 11, 4, 5, 3, 34, 17, 6, 5, …
$ location_type        <chr> "School", "Workplace", "Workplace", "Workplace", "Workplace", "Workplace", "Workp…
$ male                 <lgl> TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRU…
$ age_of_shooter       <dbl> 15, 57, 19, NA, 21, 21, 31, 51, NA, NA, 36, 24, 21, 19, 40, 45, 21, 21, 32, 28, 4…
$ race                 <chr> NA, NA, "White", NA, NA, "White", NA, "Black", "Black", NA, "White", "White", "Wh…
$ prior_mental_illness <chr> NA, "Yes", "Yes", NA, "Yes", NA, NA, NA, NA, NA, "Yes", NA, NA, NA, NA, "Yes", NA…```
``` 
## Explore the data

### Specific questions

-   Generate a data frame that summarizes the number of mass shootings per year.

```r
#Summarize number of mass shooting per year
mass_shootings %>% 
  #Group by year
  group_by(year) %>%
  #Count mass shootings by year
  summarise(count=n())
```

-   Generate a bar chart that identifies the number of mass shooters associated with each race category. The bars should be sorted from highest to lowest and each bar should show its number.

```r
#Mass shootings by race
mass_shootings %>% 
  #Take only observations where race is not NA
  filter(complete.cases(race)) %>% 
  #Group it by race
  group_by(race) %>%
  #Count the mass shooting by race
  summarise(count=n()) %>% 
  #Sort it descendingly 
  arrange(desc(count)) %>%
  #Set the aesthetic
  ggplot(aes(x=fct_reorder(race,count, .desc=TRUE), y=count)) +
  #Make a column graph filled by LBS colour
  geom_col(fill='#001e62') +
  #Add a text with the value of each bar
  geom_text(aes(label = count), vjust = -0.5, color = "black") +
  #Black and white theme
  theme_bw() + 
  #Add labels to axis and title
  labs(x='Race', title='Mass shooters by race', y='Frequency') +
  #Put the title at the middle
   theme(plot.title = element_text(hjust=0.5, vjust=0.5) )
```
![Alt Text](/img/blogs/my_plot.png)

-
