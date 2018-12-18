library('dplyr')
library('readr')

setwd('C:/Users/kuco/sex porn fuckmaterial/super dirty shit/RProject/don/podatki')
save_to <- 'C:/Users/kuco/sex porn fuckmaterial/super dirty shit/RProject/don/nejcStuff'
stat_letniki <- c('1', '2', '3', '4', '5')
stat_unips <- c("MAT3", "MAT_DR", "STAT3", "PED2", "ISRM2", "FIN2", "MAT2",  
                "PED_MAG", "MAT_MAG", "PED_SPEC", "FIN1",  "MAT1", "MAT_UNI",
                "MAT_VIS_UM", "PRA1", "PRA")

get_year <- function(x) {substr(x, 1, 4)  %>% as.numeric}
process_person <- function(st_id, leta, letniki, tip) {
  n <- length(stat_letniki)
  ret_data <- rep(NA, n+1)
  names(ret_data) <- c(paste0('leto', stat_letniki), 'DIPLOMA')
  for (i in 1:n) {
    ret_data[[i]] <- length(unique(leta[letniki == stat_letniki[[i]]]))
    # if a person wasnt in previos year he cant be in the next
    if (ret_data[[i]] == 0) {
      ret_data[[i]] = NA
      return(ret_data)
    }
  }
  if (any(tip == 'DIPLOMA')) ret_data[[n+1]] = TRUE
  ret_data
}

naredili_redno <- function(yr1, yr2) {
  letniki <- c(paste0('leto', stat_letniki), 'DIPLOMA')
  data <- original[, (yr1 + 2):(yr2 + 2)]
  fltr <- apply(data, 1, function(x) {
    n <- length(x)
    all(x[1:(n-1)] == 1) & !is.na(x[[n]])
  })
  return(c(length(data[[1]]), length(data[fltr,][[1]])))
}

original <- read_csv('dogodki.csv', n_max=1000) %>%
  group_by(STUDENT_ID) %>%
  do(
    cbind(
      data.frame(program = .$PROGRAM_ID[[1]]),
      as.data.frame(t(process_person(.$STUDENT_ID, sapply(.$DATUM, get_year), .$LETNIK, .$TIP)))
    )
  )
  #write_csv(paste0(save_to, '/data.csv'))
print(naredili_redno(1, 2))

####################################################################
quick_access <- function(file) {read_csv(file, n_max=1000) %>% View}
get_student_info <- function(sid) {
  read_csv('dogodki.csv') %>%
  filter(STUDENT_ID==sid) %>% View
}
