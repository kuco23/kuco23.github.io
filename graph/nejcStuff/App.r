library('dplyr')
library('shiny')
library('readr')

setwd('C:/Users/kuco/sex porn fuckmaterial/super dirty shit/RProject/don/nejcStuff')
data <- read_csv('data.csv') %>% View
unips <- c("MAT3", "MAT_DR", "STAT3", "PED2", "ISRM2", "FIN2", "MAT2",  
           "PED_MAG", "MAT_MAG", "PED_SPEC", "FIN1",  "MAT1", "MAT_UNI",
           "MAT_VIS_UM", "PRA1", "PRA")
names(unips) <- unips

ui <- fluidPage(
  titlePanel('Studentsko ponavljanje'),
  sidebarLayout(
    sidebarPanel(
      checkboxGroupInput('UNIP', 'Program', choices=unips)
    ),
    mainPanel(
      tableOutput('tbl')
    )
  )
)
server <- function(input, output) {
  observeEvent(input$UNIP, {
    print(input$UNIP)
    output$tbl <- renderTable(data %>% filter(program %in% input$UNIP))
  })
}

shinyApp(ui=ui, server=server)