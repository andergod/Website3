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

```r
#Download data
mass_shootings <- read_csv(here::here("data", "mass_shootings.csv"))
#See the data
glimpse(mass_shootings)
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

-   Generate a boxplot visualizing the number of total victims, by type of location.

```r
#Boxplot of total victims by location type
mass_shootings  %>% 
  #Set the aesthetic
  ggplot(aes(x=location_type, y=total_victims)) +
  #Make a boxplot graph with a black and white theme
  geom_boxplot() + theme_bw() +
  #Add labels and title
  labs(y='N People', title='Total victims by location type', x='') +
   theme(plot.title = element_text(hjust=0.5, vjust=0.5) )

```
![Alt Text](/img/blogs/my_plot2.png)


### More open-ended questions

Address the following questions. Generate appropriate figures/tables to support your conclusions.

```r
#Males shooters with prior mental illness
mass_shootings %>% 
  #Filter it for males shooter, happening after 2000 with previous mental illness and white race
  filter(male==TRUE & year>2000 & prior_mental_illness=='Yes' & race=='White') %>% 
  #Count total cases
  summarise(total=n())
  

```

-   Which month of the year has the most mass shootings? Generate a bar chart sorted in chronological (natural) order (Jan-Feb-Mar- etc) to provide evidence of your answer.

```r
#Set a vector with the appropiater order
months_order <- c("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")

#Add the factor to the months date in the data set
mass_shootings$month<- factor(mass_shootings$month, levels = months_order)

#Make the graph
mass_shootings %>%
  #Calculate the total shooting by month
  group_by(month) %>% 
  summarise(count=n()) %>% 
  #Make a column graph
  ggplot(aes(x=month, y=count)) +
  geom_col(fill='#001e62') +
  #Set the appearance parameters
  theme_bw() + 
  labs(x='', title='Mass shootings by Month', y='Frequency') +
   theme(plot.title = element_text(hjust=0.5, vjust=0.5) )

```

![Alt Text](/img/blogs/my_plot3.png)


The biggest amounts of mass shootings happened in February, March,October and November. 


-   How does the distribution of mass shooting fatalities differ between White and Black shooters? What about White and Latino shooters?

```r
#Mass shooting by race
mass_shootings %>% 
  #Only takes the shootings done by white and black shooters 
  filter(race=='White' | race=='Black') %>% 
  #Make a fatality histogram by race 
  ggplot(aes(x=fatalities)) +
  geom_histogram(binwidth = 3, fill = "#ADD8E6")  + #Make a histogram
  facet_wrap(~race, scales='free') +
  #Set the appearance parameters
  labs(x = "Fatalities", y = "Frequency", title = "White and Black shooters fatalities distribution") +
  theme_bw() + #Add the labels
   theme(plot.title = element_text(hjust=0.5, vjust=0.5) ) #Put the title in the middle
```

![Alt Text](/img/blogs/my_plot4.png)

There is by far less fatalities in Black shooters than White ones. The former usually have less than 10 fatalities, while for white shooters the fatalities are higher. 

```r
#Mass shooting by race
mass_shootings %>% 
  #Filter by race white and latino
  filter(race=='White' | race=='Latino') %>% 
  #Make the graph
  ggplot(aes(x=fatalities)) +
  geom_histogram(binwidth = 3, fill = "#ADD8E6")  + #Make a histogram
  facet_wrap(~race, scales='free') +
  #Add labes
  labs(x = "Fatalities", y = "Frequency", title = "White and Latino shooters fatalities distribution") +
  #Add aesthetics
  theme_bw() + 
   theme(plot.title = element_text(hjust=0.5, vjust=0.5) ) #Put the title in the middle


```
![Alt Text](/img/blogs/my_plot5.png)

