blogdown::install_hugo()
library(blogdown)
install_hugo()
hugo_version()

blogdown::new_site(theme = "MarcusVirg/forty",
                     sample = TRUE,
                     theme_example = TRUE,
                     empty_dirs = TRUE,
                     to_yaml = TRUE)




