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

The first step is to get the data from different website crypto news. The class , WebsiteData, is designed to perform web scraping on news websites related to cryptocurrency. The class provides methods to retrieve relevant posts' URLs from various sources such as Crypto News, Coindesk, Yahoo Finance, and The Independent. Additionally, there's a method to extract the textual content from a given URL based on the specified type.

The scraping process involves making HTTP requests to the respective URLs, parsing the HTML content using BeautifulSoup, and extracting relevant information. The class is modular, with each method focusing on a specific website, enhancing code organization and readability. The text_from_relevant method further allows customization based on the source type, handling specific cases like removing unwanted content or truncating text.

It's essential to monitor and adapt the class as websites may change their structure over time, impacting the web scraping process. 

```python
import requests
from bs4 import BeautifulSoup

class website_data:
    def __init__(self):
        # Set user agent and other headers for making requests        
        self.headers=({'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36','Accept-Language': 'en-UK, en;q=0.5'})
        
        # Define URLs for different news sources
        self.cryptonews_url='https://crypto.news/markets/'
        self.coindesk_url='https://www.coindesk.com/markets/'
        self.yahoo_url='https://finance.yahoo.com/topic/crypto'
        self.independent_url='https://www.independent.co.uk/topic/bitcoin'
        
        # File name to store content to remove for 'independent_relevantpost'
        self.remove_independent_file="Remove_independent.txt"
    def cryptonews_relevantpost(self)->list:
        # Make a request to the Cryptonews URL
        r=requests.get(self.cryptonews_url, headers=self.headers)
        soup = BeautifulSoup(r.text, 'lxml')
        
        # Extract relevant post headlines
        headlines=soup.find_all('a', class_="post-loop__link")
        return [headline.get('href') for headline in headlines]

    def coindesk_relevantpost(self)->list:
        # Make a request to the Coindesk URL
        r=requests.get(self.coindesk_url, headers=self.headers)
        soup = BeautifulSoup(r.text, 'lxml')
        
        # Extract relevant post headlines
        headlines=soup.find_all('a', class_="card-titlestyles__CardTitleWrapper-sc-1ptmy9y-0 junCw card-title-link")
        return ["https://www.coindesk.com/" + str(headline.get('href')) for headline in headlines]
    
    def yahoo_relevantpost(self)->list:
        # Make a request to the Yahoo Finance URL
        r=requests.get(self.yahoo_url, headers=self.headers)
        soup = BeautifulSoup(r.text, 'lxml')
        
        # Extract relevant post headlines
        headlines=soup.find_all('a', class_='js-content-viewer wafer-caas Fw(b) Fz(18px) Lh(23px) LineClamp(2,46px) ' 
                                'Fz(17px)--sm1024 Lh(19px)--sm1024 LineClamp(2,38px)--sm1024 mega-item-header-link '
                                'Td(n) C(#0078ff):h C(#000) LineClamp(2,46px) LineClamp(2,38px)--sm1024 not-isInStreamVideoEnabled')
        
        return ["https://finance.yahoo.com/"+ str(headline.get('href')) for headline in headlines]
    
    def independent_relevantpost(self)->list:
        # Make a request to the Independent URL
        r=requests.get(self.independent_url, headers=self.headers)
        soup=BeautifulSoup(r.text, 'lxml')
        
        # Extract relevant post headlines
        headlines_object=soup.find_all('h2', class_='sc-9tb5ao-0 bXiXts')
        headlines=[headline.find('a',class_="title") for headline in headlines_object]
        
        # Return URLs of top 10 independent headlines
        return ["https://www.independent.co.uk"+ str(headline.get('href')) for headline in headlines[:10]]

    def text_from_relevant(self, link:str, type:str)->str:
        # Make a request to the specified link
        r=requests.get(link, headers=self.headers)
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
            with open(self.remove_independent_file, 'r') as file:
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

The run_process function orchestrates the entire process for different news websites, extracting relevant posts, cleaning the text, analyzing sentiment, and identifying the main cryptocurrency mentioned. The script then provides trading recommendations based on the sentiment and the main cryptocurrency identified.

Keep in mind that sentiment analysis and extracting the main cryptocurrency are based on assumptions and thresholds, and they might need adjustment based on the specific requirements and characteristics of the data being analyzed.

```python
import requests
from bs4 import BeautifulSoup
import pandas as pd
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import spacy
from website_data import website_data # Updated import statement for the WebsiteData class
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
    return recognized_currencies[0] if recognized_currencies else None

def run_process(website:str)->None:
    #Run the process for a specific website, extract relevant posts, and analyze sentiment.
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


