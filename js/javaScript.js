//Begin overview plot of all compressors

//function to read all files in the data directory

				var windowWidth=$(window).width(),
					windowHeight=$(window).height();

				var   margin={top:50,right:60,bottom:50,left:60},
					  owidth = windowWidth-margin.left-margin.right,
					  oheight= windowHeight -margin.top-margin.bottom;

				var cwidth = owidth - margin.left - margin.right,
				    cheight= oheight- margin.top - margin.bottom;

				var pwidth=cwidth-margin.left-margin.right,
				    pheight=cheight-margin.top-margin.bottom;

				//define overview div/////////////////////////////////////////////////////////////////////////////////////
				var osvg=d3.select('#overview').style('width',owidth+margin.left+margin.right)
				                               .style('height',oheight+margin.top+margin.bottom)
																			 .append('svg')
																			 .attr('width',owidth+margin.left+margin.right)
																			 .attr('height',oheight+margin.top+margin.bottom)
																			 .append('g')
																			 .attr('transform',"translate("+margin.left+","+margin.top+")");

				var goviz=osvg.append('g').attr("transform","translate("+margin.left+","+margin.top+")");
				///////////////////////////////////////////////////////////////////////////////////////////////////////////


				//Define with and height of compressor detail view(parallel coord)
				d3.select('#parallel').style('width',pwidth).style('height',pheight);


				//Define overview axis/////////////////////////////////////////////////
				//x-axis
				var oxValue=function(d){return d.x;},
					oxScale=d3.scale.linear().range([0,owidth]),
					oxMap=function(d){return oxScale(oxValue(d))},
					oxAxis=d3.svg.axis().scale(oxScale).orient('bottom');
       //y-axis
				var oyValue=function(d){return d.y;},
					oyScale=d3.scale.linear().range([oheight,0]),
					oyMap=function(d){return oyScale(oyValue(d))},
					oyAxis=d3.svg.axis().scale(oyScale).orient('left');
			/////////////////////////////////////////////////////////////////////////


//Import overview data
d3.json("data/overview.json",function(odata){
	     odata=odata.filter(function(d){return d.x>=0;});
			  var oxdomain=d3.extent(odata,function(d){return d.x;});
				oxScale.domain([oxdomain[0]-0.01,oxdomain[1]+0.01]);
				var oydomain=d3.extent(odata,function(d){return d.y;});
		    oyScale.domain([oydomain[0]-0.02,oydomain[1]+0.01]);

				//add axis
				osvg.append('g').attr("class",'y axis')
						.attr('transform',"translate(0,"+oheight+")")
						.call(oxAxis);
				osvg.append('g').attr('class','y axis')
						.call(oyAxis);

			  osvg.selectAll('canvas').data(odata).enter().append('circle')
				                                            .attr('cx',function(d){return oxMap(d);})
																										.attr('cy',function(d){return oyMap(d);})
																										.attr('r',6)
																										.attr('opacity',0.7)
																										.on('click',function(d){updateCviz(d.file)});
});




function updateCviz(filename){

	      $("#overviewCompressor").empty();

				//create compressor svg element to draw visulization///////////////////////////////////////////////////////
				var csvg=d3.select('#overviewCompressor').style('width',cwidth+margin.left+margin.right)
																								 .style('height',cheight+margin.top+margin.bottom)
																								 .append('svg')
																								 .attr('width',cwidth+margin.left+margin.right)
																								 .attr('height',cheight+margin.top+margin.bottom)
																								 .append('g')
																								 .attr('transform',"translate("+margin.left+","+margin.top+")");


				var gcviz=csvg.append('g').attr("transform","translate("+margin.left+","+margin.top+")");
				////////////////////////////////////////////////////////////////////////////////////////////////////////////

				// Define compressor view axis/////////////////////////////////////////
				//define axis
				var cxValue=function(d){return d.dy;},
					cxScale=d3.scale.linear().range([0,cwidth]),
					cxMap=function(d){return cxScale(cxValue(d))},
					cxAxis=d3.svg.axis().scale(cxScale).orient('bottom');
			 //define yaxis
				var cyValue=function(d){return d.time;},
					cyScale=d3.scale.linear().domain([-0.9,25]).range([cheight,0]),
					cyMap=function(d){return cyScale(cyValue(d))},
					cyAxis=d3.svg.axis().scale(cyScale).orient('left');
			//////////////////////////////////////////////////////////////////////////



			 // Functions//////////////////////////////////////////////////////////////

					 function color(d){
					 if(d.rd < d.cd){
						 return '#00ff00';
					 }
					 else {
						 return '#ff0000';
					 }
						}

						 function chunkArray(ar,chunksize) {
							 var R = [];
							 if (chunksize <= 0) return ar;
							 for (var i = 0; i < ar.length; i+=chunksize) {
									 R.push(ar.slice(i,i+chunksize));
							 }
							 return R;
					 }
					 function radius(d){
            if(d==0){
              return 0;
            }
            else if (d==1) {
              return 5;
            }
            else if (d==2) {
              return 10;
            }
            else if(d==3){
              return 0;
            }
          }

	////////////////////////////////////////////////////////////////////////////////////////////////////////




					filePath="data"+"/"+filename;
					// load csv file and create the chart
					d3.json(filePath, function(data) {
				           d3.json("data"+"/"+filename.slice(0,-5)+"_E.json",function(dataE){

						             var domain = d3.extent(data,function(d){return d.dy;})
						             cxScale.domain([domain[0]-2,domain[1]+2]);
						             var numrec=d3.max(d3.extent(data,function(d){return d.dy;}))-d3.min(d3.extent(data,function(d){return d.dy;}));
						                 numrec= 1.2*numrec;

						              //add axis
						              csvg.append('g').attr("class",'y axis')
						                  .attr('transform',"translate(0,"+cheight+")")
						                  .call(cxAxis);
						              csvg.append('g').attr('class','y axis')
						                  .call(cyAxis);

						              //Progressive rendering of data
						              var dataPool1 = chunkArray(data,100);
						              var dataPool2 = chunkArray(dataE,100);
						              var poolPosition1=0;
						              var poolPosition2=0;
						              var iterator1;
						              var iterator1;
						              var groups1=[];
						              var groups2=[];

						              function updateVisualization1() {
						                //bind data to svg element
						                groups1 = csvg.selectAll('canvas').data(dataPool1[poolPosition1]).enter()
						                       .append('rect')
						                       .attr('x',function(d){return cxMap(d);})
						                       .attr('y',function(d){return cyMap(d);})
						                       .attr('width',cwidth/numrec)
						                       .attr('height',0.3)
						                             .style('fill',function(d){return color(d);})
						                             .style('opacity',0.9);
						                         csvg.call(brush);

						                         poolPosition1 += 1;
						                        if (poolPosition1 >= dataPool1.length) {
						                            clearInterval(iterator1);
						                        }
						                 }

						             function updateVisualization2(){
						               groups2 = csvg.selectAll('canvas').data(dataPool2[poolPosition2]).enter()
						                       .append('circle')
						                       .attr('cx',function(d){
						                         if(d.eventL !== undefined){
						                             return cxMap(d);
						                           }
						                             })
						                       .attr('cy',function(d){
						                          if(d.eventL !== undefined){
						                              return cyMap(d);
						                            }
						                          })
						                       .attr('opacity',0.5)
						                       .attr('stroke','#ffff00')
						                       .attr('r',function(d){return radius(d.eventL);});

						                       poolPosition2 += 1;
						                      if (poolPosition2 >= dataPool2.length) {
						                          clearInterval(iterator2);
						                      }
						             }

						              iterator1 = setInterval(updateVisualization1,0.5);
						              iterator2 = setInterval(updateVisualization2,0.5);

						              //Define brush
						               var brush=d3.svg.brush().x(cxScale)
						                           .y(cyScale)
						                           .on('brushend',brushEnd);

						              function brushEnd(){
						                updateParallCoord(brush.extent());
						              }


						             function updateParallCoord(k){
						                   $('#parallel').empty();

						                   var fildata = data.filter(function(d){
						                     return d.dy>k[0][0] & d.dy < k[1][0];

						                   });

						                   fildata = fildata.filter(function(d){
						                     return d.time>k[0][1] & d.time < k[1][1];
						                   });

						                   var colorPar = function(d) {  if(d.rd<d.cd){return '#00ff00';}
						                   else {return '#ff0000';} };

						                   var parcoords = d3.parcoords()("#parallel")
						                   .data(fildata)
						                   .hideAxis(["Date",'cd','rd'])
						                   .color(colorPar)
						                   .alpha(0.25)
						                   .composite("darken")
						                   .margin({ top: 24, left: 150, bottom: 12, right: 0 })
						                   .mode("queue")
						                   .render()
						                    .reorderable()
						                   .brushMode("1D-axes");  // enable brushing

						                   parcoords.svg.selectAll("text")
						                   .style("font", "10px sans-serif");

						               }

						            });
						 			});

		}
