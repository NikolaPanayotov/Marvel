var margin = {top:400, right: 20, bottom: 30, left: 40},
    width = 970 - margin.left - margin.right,
    height = 30;
  

var panExtent = {x: [1900,2020]};

var nameArray = [];

var x = d3.scale.linear()
    .domain([1980, 2000])
    .range([0, width]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(5)
    .tickSize(-80)
    .tickFormat(d3.format("d"));

//Define Tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    

var zoom = d3.behavior.zoom()
    .x(x)
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(zoom);

svg.append("rect")
    .attr("width", width)
    .attr("height", height);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    
function panLimit() {
		ty = 0;
    
    var divisor = { w: width / ((x.domain()[1]-x.domain()[0])*zoom.scale())},
		minX = -(((x.domain()[0]-x.domain()[1])*zoom.scale())+(panExtent.x[1]-(panExtent.x[1]-(width/divisor.w)))),
        maxX = -(((x.domain()[0]-x.domain()[1]))+(panExtent.x[1]-panExtent.x[0]))*divisor.w*zoom.scale(),
        
        tx = x.domain()[0] < panExtent.x[0] ? 
				minX : 
				x.domain()[1] > panExtent.x[1] ? 
					maxX : 
					zoom.translate()[0];
	
	return [tx,ty];
}

 
//GET THE DATA
 d3.csv("marvel_heroes.csv",function(error, data){
    //console.log(data);
    data.forEach(function(d){
            d.name = d.name;
            d.year = +d.year; 
    });
     
    
     nameArray = data;
     
     for(var i=0; i<data.length; i++){
         getCharacterInfo(data[i]["name"], data[i]["year"], data[i]["alterego"]);
     }
     
     console.log(data);
     

function getCharacterInfo(name, year, alterego){
    //is it possible to return just the data.data.results[0]?
	return new Promise(function(resolve, reject){
        //figure out how to do md5 hash dynamically with no hard coding in JS
		d3.json('http://gateway.marvel.com:80/v1/public/characters?name=' + name + '&ts=1480481937207' + '&apikey=' + '772a59c75a72e2e7b7d6ce62b0a8be7a' + '&hash=6c31cce8b0841376453f6b096157537e', function(err, json){
			if (err !== null){
				//setError("Error from the Marvel API. " + err.statusText);
                console.log(err)
				reject(null);
			}
			else if (json.data === null || json.data.count === 0){
				console.log("Error: " + name + " is not finding anyone in the API. This app isn't very smart, so please play around with spaces and dashes on compound words (ie, Spider-man) to find a character.");
//                console.log(err)
				reject(null);
			}
			else if (json.data.count > 1){
				//setError("Error : " + name + " has matched more than one character, please use a name that only returns one character.");
				
                reject(null);
			}
			else {
                
				resolve(json.data.results[0]);
                
                console.log(json.data.results[0]);
                console.log(json.data.results[0].description);
                //get the character icon here

                var img = svg.append("svg:image")
                             .data(data)
                             .attr("xlink:href", json.data.results[0].thumbnail.path + '.' + json.data.results[0].thumbnail.extension)
                             .attr("width", 50)
                             .attr("height", 50)
                             .attr("x", function(d) {return x(year);})
                             .attr("y",-75)
                             .call(zoom)
                             .on("mouseover", function(d){
                                //var xPosition = parseFloat(d3.select(this).attr("cx", function(d){return x(year)}));
                                //var yPosition = parseFloat(d3.select(this).attr("cy", -50));
                            
                                div.transition()
                                    .duration(200)
                                    .style("opacity", .9);

                                div.html("Name: "+name+
                                        "<br/> Year: "+year+
                                        "<br/> Alter Ego: "+alterego+
                                        "<br/> Origin: "+json.data.results[0].description)
                                .style("left", d3.select(this).attr("x")+ "px")
                                .style("right",d3.select(this).attr("y")+ "px");
                            })
                            .on("mouseout", function(d){
                                div.transition()
                                    .duration(500)
                                    .style("opacity", 0);
        })
                                
			}
            
        });
        
	});
    
    
    
    }
     
     
     
 });

function zoomed() {
  //call the zoom.translate vector with the array returned from panLimit()
  zoom.translate(panLimit());
  svg.select(".x.axis").call(xAxis);
  svg.selectAll("image").attr("transform", "translate(" + d3.event.translate[0] + "," + 0 + ")scale(" + d3.event.scale + ")");
  div.attr("transform", "translate(" + d3.event.translate[0] + "," + 0 + ")scale(" + d3.event.scale + ")");
  
}

