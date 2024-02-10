---
categories:  
- ""    #the front matter should be like the one found in, e.g., blog2.md. It cannot be like the normal Rmd we used
- ""
date: "2024-02-4"
description: des
draft: false

keywords: ""
slug: webscrapper # slug is the shorthand URL address... no spaces plz
title: Web scrapper for crypto sentiment analysis 
---

## Importing data

The first step is to get the data from different crypto news websites. The class , WebsiteData, is designed to perform web scraping on news websites related to cryptocurrency. The class provides methods to retrieve relevant posts' URLs from various sources such as Crypto News, Coindesk, Yahoo Finance, and The Independent. Additionally, there's a method to extract the textual content from a given URL based on the specified type.

The scraping process involves making HTTP requests to the respective URLs, parsing the HTML content using BeautifulSoup, and extracting relevant information. The class is modular, with each method focusing on a specific website, enhancing code organization and readability. The text_from_relevant method further allows customization based on the source type, handling specific cases like removing unwanted content or truncating text.

It's essential to monitor and adapt the class as websites may change their structure over time, impacting the web scraping process. 

You can play with this repositorty and add your own features in the next github link:
https://github.com/andergod/Webscrap_crypto.git

```python
import requests
from bs4 import BeautifulSoup
import config

def cryptonews_relevantpost()->tuple:
    # Make a request to the Cryptonews URL
    r=requests.get(config.cryptonews_url, headers=config.headers)
    soup = BeautifulSoup(r.text, 'lxml')
    
    # Extract relevant post headlines
    headlines=soup.find_all('a', class_="post-loop__link")
    return [headline.get('href') for headline in headlines],"cryptonews_relevantpost"

def coindesk_relevantpost()->tuple:
    # Make a request to the Coindesk URL
    r=requests.get(config.coindesk_url, headers=config.headers)
    soup = BeautifulSoup(r.text, 'lxml')
    
    # Extract relevant post headlines
    headlines=soup.find_all('a', class_="card-titlestyles__CardTitleWrapper-sc-1ptmy9y-0 junCw card-title-link")
    return ["https://www.coindesk.com/" + str(headline.get('href')) for headline in headlines], "coindesk_relevantpost"

def yahoo_relevantpost()->tuple:
    # Make a request to the Yahoo Finance URL
    r=requests.get(config.yahoo_url, headers=config.headers)
    soup = BeautifulSoup(r.text, 'lxml')
    
    # Extract relevant post headlines
    headlines=soup.find_all('a', class_='js-content-viewer wafer-caas Fw(b) Fz(18px) Lh(23px) LineClamp(2,46px) ' 
                            'Fz(17px)--sm1024 Lh(19px)--sm1024 LineClamp(2,38px)--sm1024 mega-item-header-link '
                            'Td(n) C(#0078ff):h C(#000) LineClamp(2,46px) LineClamp(2,38px)--sm1024 not-isInStreamVideoEnabled')
    
    return ["https://finance.yahoo.com/"+ str(headline.get('href')) for headline in headlines], "yahoo_relevantpost"

def independent_relevantpost()->tuple:
    # Make a request to the Independent URL
    r=requests.get(config.independent_url, headers=config.headers)
    soup=BeautifulSoup(r.text, 'lxml')
    
    # Extract relevant post headlines
    headlines_object=soup.find_all('h2', class_='sc-9tb5ao-0 bXiXts')
    headlines=[headline.find('a',class_="title") for headline in headlines_object]
    
    # Return URLs of top 10 independent headlines
    return ["https://www.independent.co.uk"+ str(headline.get('href')) for headline in headlines[:10]], "independent_relevantpost"

def text_from_relevant(link:str, type:str)->tuple:
    # Make a request to the specified link
    r=requests.get(link, headers=config.headers)
    soup = BeautifulSoup(r.text, 'lxml')
    
    # Extract text based on the specified type
    if type=='cryptonews_relevantpost':
        text=soup.find_all('p')
    elif type=='coindesk_relevantpost':
        text=soup.find_all('div', class_="typography__StyledTypography-sc-owin6q-0 dbtmOA at-text")
    elif type=='yahoo_relevantpost':
        text=soup.find_all('div', class_='caas-body')
    elif type=='independent_relevantpost':
        text=soup.find_all('p')    
        
    # Process and join paragraphs into a single string
    paragraph=[p.text for p in text]
    b_paragraph=' '.join(paragraph)
    
    # Specific processing based on the type
    if type=='independent_relevantpost':
        # Remove content specified in 'Remove_independent.txt'
        with open(config.remove_independent_file, 'r') as file:
            remove_independent=file.read()
        b_paragraph=b_paragraph.replace(remove_independent, '')
    elif type=='cryptonews_relevantpost':
        # Remove content after the specified substring
        substring_to_end = "Read more about"
        position = b_paragraph.find(substring_to_end)
        if position != -1:
            # Extract the portion of the string before the substring
            b_paragraph = b_paragraph[:position]                  
    return b_paragraph
    
```

## Sensitive analysis

This script aims to analyze sentiment and provide trading recommendations for cryptocurrencies based on relevant posts from different news websites. It uses the WebsiteData class to perform web scraping, and the sentiment analysis is done using the NLTK and spaCy libraries.

The sentiment analysis in this script is performed using the VADER (Valence Aware Dictionary and sEntiment Reasoner) sentiment analysis tool from the nltk library. Here's a breakdown of how the sentiment analysis works:

### 1)VADER SentimentIntensityAnalyzer:
The SentimentIntensityAnalyzer from the nltk.sentiment module is used to perform sentiment analysis. It assigns a sentiment polarity score to a given text, indicating the positivity, negativity, and neutrality of the text.The VADER sentiment analysis tool determines the sentiment polarity of a given text by employing a lexicon-based approach. It utilizes a pre-established lexicon with sentiment scores assigned to individual words, ranging from -4 to +4. Words are analyzed for their valence, where positive, negative, and neutral sentiments are represented by corresponding scores. Intensifiers and negations are taken into account to adjust the sentiment of words, considering modifiers such as "very" or "not." The algorithm calculates a compound score by summing the valence scores, incorporating modifiers, and normalizing the result to a scale between -1 and +1. A positive compound score indicates positive sentiment, a negative score indicates negative sentiment, and a score close to 0 suggests neutrality. VADER also considers factors like emoticons, slang, punctuation, and sentence structure, making it effective for analyzing sentiment in short and informal texts commonly found in social media and headlines.

### 2)Sentiment Polarity Scores:
The polarity_scores() method of the SentimentIntensityAnalyzer is used to obtain a dictionary of sentiment scores, including the compound score. The compound score is a single value that represents the overall sentiment of the text. It ranges from -1 (most negative) to 1 (most positive), with 0 indicating a neutral sentiment.

### 3)Trading Recommendations based on Compound Score:
After obtaining the compound sentiment score, the script uses a simple threshold-based approach to provide trading recommendations:

If the compound score is greater than or equal to 0.1, it suggests a "Buy."
If the compound score is less than or equal to -0.1, it suggests a "Sell."
Otherwise, it suggests a "Hold."
This approach assumes that a positive sentiment suggests a favorable condition for the cryptocurrency, while a negative sentiment suggests an unfavorable condition. The choice of the threshold values (0.1 and -0.1) is somewhat arbitrary and can be adjusted based on the desired sensitivity of the sentiment analysis.

It's important to note that sentiment analysis has its limitations and should be interpreted with caution. VADER is particularly useful for analyzing sentiment in short texts, like social media posts and headlines. However, it may not capture the nuances of longer, more complex texts.

Feel free to adjust the threshold values or explore more sophisticated sentiment analysis models if the script's recommendations do not align with your desired level of sensitivity or accuracy.


The run_process function orchestrates the entire process for different news websites, extracting relevant posts, cleaning the text, analyzing sentiment, and identifying the main cryptocurrency mentioned. The script then provides trading recommendations based on the sentiment and the main cryptocurrency identified.

Keep in mind that sentiment analysis and extracting the main cryptocurrency are based on assumptions and thresholds, and they might need adjustment based on the specific requirements and characteristics of the data being analyzed.

```python
# Description: This file contains the functions to analyze the sentiment of news articles and provide trading recommendations.
import pandas as pd
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import spacy

nltk.download('vader_lexicon')
nltk.download('vader_lexicon')
nltk.download('stopwords')
nltk.download('punkt')

# Load cryptocurrency data from an Excel file
cryptocurrencies = pd.read_excel('Criptocurrency_list.xlsx')
# Create a dictionary mapping cryptocurrency names to tickers
crypto_dict={name.lower().strip(): ticker for name, ticker in zip(cryptocurrencies['Name'], cryptocurrencies['Ticker'])}
# Load the spaCy English model
nlp = spacy.load('en_core_web_sm')


def clean_text(text)->str:
    # Tokenize the text
    words = word_tokenize(text)
    # Remove stop words
    stop_words = set(stopwords.words('english'))
    filtered_words = [word.lower() for word in words if word.isalnum() and word.lower() not in stop_words]
    return ' '.join(filtered_words)
        
def analyze_sentiment(text)->str:
    #Analyze sentiment of the text and return a trading recommendation.
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
    if recognized_currencies:
        return crypto_dict[recognized_currencies[0]].upper()
    else:   
        return None  
    

```

Finally, we can mix both elements on the main file. 

```python

from website_data import cryptonews_relevantpost, coindesk_relevantpost, yahoo_relevantpost, independent_relevantpost, text_from_relevant 
from sentiment_analysis import clean_text, analyze_sentiment, get_main_currency 

def run_process(website:callable)->None:
    #Run the process for a specific website, extract relevant posts, and analyze sentiment.
    posts, type = website()
    for post in posts:
        text=text_from_relevant(post, type)
        clean=clean_text(text)
        sentiment=analyze_sentiment(clean)
        currency=get_main_currency(text)
        if currency:
            print(f'I should {sentiment} {currency}')
        else:
            print('No relevant currency found')       

if __name__ == '__main__':
    run_process(cryptonews_relevantpost)
    run_process(coindesk_relevantpost)
    run_process(yahoo_relevantpost)
    run_process(independent_relevantpost)

```
We can see the results on the next command prompt screen, where we receive the signals and the currencies that each news is recommending us.
We took website info and create structure results on signals that can be stores or later used for strategies.  

![Alt Text](/img/blogs/Result_crypto.png)

