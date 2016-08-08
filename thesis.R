setwd("C:/Users/Victor/Dropbox/thesis/Statistics/thesisScripts")
#Global variables and data
files=list.files(path="C:/Users/Victor/Desktop/thesisdata/Victor/Viktor",pattern="*.csv",full.names=TRUE,recursive=TRUE)

#Begining of Shiny server function
require('shiny')
require('chemometrics')
require('jsonlite')
require('dplyr')
require('lubridate')

hours <- function(dateTime){
	date <- parse_date_time(dateTime, "%Y-%m-%d %H%M%S")
	h <- hour(date)+as.numeric(minute(date))/60 + as.numeric(second(date))/3600
	return (h)
}

#calculate proportio of outlying points
pout <- function(rddata){
	nout <- 0
	for(i in 1:nrow(rddata)){
		if(rddata$rd[i]>rddata$cd[i]){
			nout <- nout+1
		}
	}
	return (nout/nrow(rddata))
}

#

#prop of days that are bad
pdays <- function(rddata){
	nerrdays <- 0
	for(i in unique(rddata$dy)){
		gdata <- group_by(rddata,dy)
		nd <- pout(filter(gdata,dy==i))
		if(nd>0.3){
			nerrdays=nerrdays+1
		}
	}
	return (nerrdays/length(unique(rddata$dy)))
}

iter <- 1
propdays <- c()
propmeas <- c()
filename <- c()

for(file in files){
	cdata <- read.csv(file,header=T)
	#remove uninteresting variables
	data=subset(cdata,select=-c(X,R,State,EventName))
	#remove rows with missing data
    data <- data[complete.cases(subset(data,select=-EventLevel)),]
	#calculate robust distances
	
    rd_data <-  Moutlier(subset(data,select=-c(Date,EventLevel)),quantile=0.95,plot=F)
					    
	dy <- yday(as.Date(data$Date,format='%Y-%m-%d'))
	t <- data$Date%>%hours
	dayofYear <- data$Date
	rddata <- data.frame(data,dy=dy,time=t,rd=rd_data$rd,cd=rd_data$cutoff)
	
    #convert data to json format
	comdat <- toJSON(rddata,pretty=TRUE)

	#write to json
    write(comdat,paste("C:/Users/Victor/Dropbox/thesisViz/data/",paste(strsplit(basename(file), "\\.")[[1]][1],'.json',sep=""),sep="/"))
	#write events file
	eventdat <- data.frame(time=cdata$Date%>%hours,dy=yday(as.Date(cdata$Date,format="%Y-%m-%d")),eventN=cdata$EventName,eventL=cdata$EventLevel)
	write(comdat,paste("C:/Users/Victor/Dropbox/thesisViz/data/",paste(strsplit(basename(file), "\\.")[[1]][1],'_E.json',sep=""),sep="/"))
	
	propdays[iter] <- pdays(rddata)
	propmeas[iter] <- pout(rddata)
	filename[iter] <- paste(strsplit(basename(file), "\\.")[[1]][1],'.json',sep="")
	iter <- iter+1
	print(iter)
}

#overview data
overview <- data.frome(x=propmeas,y=propdays,file=filename)
write(overview,"C:/Users/Victor/Dropbox/thesisViz/data/overview.json")
