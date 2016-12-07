var margin = {top:500, right: 20, bottom: 200, left: 40},
    width = 970 - margin.left - margin.right,
    height = 15;
  

var panExtent = {x: [1930,2020]};

var nameArray = [];

var x = d3.scale.linear()
    .domain([1960, 1980])
    .range([0, width]);

//implements zoom functionality for the top bar
var zoom = d3.behavior.zoom()
    .x(x)
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

//adds an svg element to the body, on which the x axis will be placed
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + 40)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(zoom);

//adds a rectangle to appear as a timeline for the visualization
svg.append("rect")
    .attr("width", width)
    .attr("height", height);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(5)
    .tickSize(-80)
    .tickFormat(d3.format("d"));

//the graph is finally drawn to appear by the red rectangle to make a timeline
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

//---------NAV BAR---------
var navWidth = width,
    navHeight = 50;

//second svg element is added to the body to be used for the navigation bar
var navsvg = d3.select("body").append("svg")
    .classed('navigator', true)
    .attr("width", width + margin.left + margin.right)
    .attr("height", 70)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//second scale is added. This one contains the full span of data (1935-2020)
var navChart = d3.scale.linear()
    .domain([1935, 2020])
    .range([0, width]);

//axis is declared here
var navAxis = d3.svg.axis()
    .scale(navChart)
    .orient("bottom")
    .ticks(10)
    .tickSize(-80)
    .tickFormat(d3.format("d"));

//axis is drawn onto the navsvg element and scaled accordingly
navsvg.append("g")
    .attr("class", "viewport")
    .attr("class", "nav axis")
    .attr("transform", "translate(0," + -450 + ")")
    .call(navAxis);
//rectangle is drawn to represent the overall timeline
navsvg.append("rect")
    .attr("class", "navBar")
    .attr("width", width)
    .attr("y", -490)
    .attr("height", 40);

//---------NAV BAR END---------

//---------BRUSH-----------
//a viewport showing the current window viewed is defined as a brush element (for simplicity)
var viewport = d3.svg.brush()
//var viewport = navsvg.append('rect')
    .x(navChart)
/*
    .on("brush", function () {
        //console.log(viewport.empty());
        x.domain(viewport.empty() ? navChart.domain() : viewport.extent());
        redrawChart();
    });
    */
//viewport is appended to the navsvg element, and stays on the rect, to appear as a window
navsvg.append("g")
    .attr("class", "viewport")
    .call(viewport)
    .selectAll("rect")
    .attr("y", -490)
    .attr("height", navHeight-10);
//---------BRUSH END-----------

//viewport.on("brushend", function () {
//        updateZoomFromChart();
//    });

//Define Basic Tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    //.attr("x", 0)
    
//Define Second Tooltip containing random comic cover
var tooltip2 = d3.select("body").append("tooltip2")
    .attr("class", "tooltip2")
    .style("opacity", 0);

//Define Third Tooltip containing an enlarged thumbnail of the hero, as well as their stats and bio
var tooltip3 = d3.select("body").append("tooltip3")
    .attr("class", "tooltip3")
    .style("opacity", 0);

//Create Event Description
//Create Event Description
var tooltip4 = d3.select("body").append("tooltip4")
    .attr("class", "tooltip4")
    .style("opacity", 0);

//Define domain limits when panning not to exceed the bounds of var panExtent
function panLimit() {
		ty = 0;
    
    var divisor = { w: width / ((x.domain()[1]-x.domain()[0])*zoom.scale())},
		minX = -(((x.domain()[0]-x.domain()[1])*zoom.scale())+(panExtent.x[1]-(panExtent.x[1]-(width/divisor.w)))),
        maxX = -(((x.domain()[0]-x.domain()[1]))+(panExtent.x[1]-panExtent.x[0]))*divisor.w*zoom.scale(),
        
        //Resets timeline if domain limits are exceeded when panning
        tx = x.domain()[0] < panExtent.x[0] ? 
				minX : 
				x.domain()[x.length] > panExtent.x[1] ? 
					maxX : 
					zoom.translate()[0];
	
	return [tx,ty];
}

 
//GET THE DATA
 d3.csv("test.csv",function(error, data){
    var yearCheck = []
    var wfCount = 0;
     
    data.forEach(function(d){
            d.name = d.name;
            d.year = +d.year; 
            d.nemesis = d.nemesis;
            d.Intelligence = +d.Intelligence;
            d.Speed = +d.Speed;
            d.Strength = +d.Strength;
            d.Durability = +d.Durability;
            d.FightingSkills = +d.FightingSkills;
        
    });
     
    
     nameArray = data;
     
     
     //PREVENT IMAGE OVERLAP------------------------------------------------------------------------------
     //CHECK IF ANY CHARACTERS WERE CREATED DURING THE SAME YEAR
     //IF THEY DO, ADJUST THE Y POSITION ACCORDINGLY
     
     //Increment through the data array read from the csv
     for(var i=0; i<data.length; i++){
        
        //count resets for every year in the csv file
        var count = 0;
         
         //check how many times the current year appears
         //in the array yearCheck
        for(var j = 0; j < yearCheck.length; j++) {
            if(yearCheck[j] == data[i]["year"]) {
                //Increment count. This keeps tack of how
                //many characters were created during the same year
                count++;
            }
        }

         //If count is less than zero, then it is the first
         //instance that a character is being associated with the 
         //given year and default y position is chosen. Otherwise
         //change the y position of the image based on count
        var ypos = (count <= 0 ? -40 : (-40 * (count+1)))
        
        
        yearCheck.push(data[i]["year"]);
         
         //call function getCharacterInfo() this 
         //is where the character info and images are called
         //from the MARVEL API
        getCharacterInfo(data[i]["name"], data[i]["year"], data[i]["alterego"], ypos, data[i]["nemesis"], data[i]["Intelligence"], data[i]["Speed"], data[i]["Strength"], data[i]["Durability"], data[i]["FightingSkills"]);
     }
     
     
      // waterfall
//        var promise = Array.from({
//            length: 51
//        }).reduce(function(acc) {
//            return acc.then(function(res) {
//                /*return getItemPage(currentPage)*/return getCharacterInfo(data[wfCount]["name"], data[wfCount]["year"], data[wfCount]["alterego"], ypos, data[wfCount]["nemesis"], data[wfCount]["Intelligence"], data[wfCount]["Speed"], data[wfCount]["Strength"], data[wfCount]["Durability"], data[wfCount]["FightingSkills"]).then(function(result) {
//                    res.push(result)
//                    return res
//                })
//            })
//        }, Promise.resolve([]))
//        
//        return promise
     
     
     
function getCharacterInfo(name, year, alterego, ypos, nemesis, intelligence, speed, strength, durability, fighting){
    //is it possible to return just the data.data.results[0]?
	return new Promise(function(resolve, reject){
        //figure out how to do md5 hash dynamically with no hard coding in JS
        
        //FIRST API CALL to MARVEL API to obtain info specifically about characters and detect for errors or if a character doesn't exist
        //return error. Or if csv data for d.name is incorrect then return error
		//d3.json('http://gateway.marvel.com:80/v1/public/characters?name=' + name +'&ts=1480481937207' + '&apikey=' + '1a163e490587daaa559777d07cf71e25' + '&hash=20daa9e21915a9eb08f4d91cddd69c1b', function(err, json){
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
                wfCount++
				resolve(json.data.results[0]);
                
                console.log(json.data.results[0]);
                //console.log(json.data.results[0].description);
                //get the character icon here

                
               
                //console.log(yearCheck);
                
                //Bind data from the CSV and the JSON images obtained from the MARVEL API to the timeline
                var img = svg.append("svg:image")
                             .data(data)
                             .attr("id", "marvel_avatar")
                            //From the previous call to MARVELS API we got info on each character including their thumbnails. Append
                            //the thumbnail to the timeline and format its size and position. Overlapping images are handled before
                            //calling getCharacterinfo() by changing the y position for characters created in the same year
                             .attr("xlink:href", json.data.results[0].thumbnail.path + '.' + json.data.results[0].thumbnail.extension)
                             .attr("width", 30)
                             .attr("height", 30)
                             .attr("x", function(d) {return x(year);})
                             .attr("y", ypos )
                             .call(zoom)
                
                            //Mouseover on images will create 4 different tooltips
                            //TOOLTIP 1: BASIC INFO CONTAINING NAME OF CHARACTER, YEAR, ALTER EGO --- Obtained from CSV
                            //TOOLTIP 2: DISPLAYS RANDOM EVENT ABOVE TIMELINE THAT FEATURES CHARACTER AND ITS PUBLICATION YEARS
                            //TOOLTIP 3: DISPLAYS ZOOMED IN PROFILE BIO AND STATS
                            //TOOLTIP 4: DISPLAYS DESCRIPTION OF THE RANDOMLY GENERATED EVENT IN TOOLTIP 2 AND POSSIBLY A LINK TO THE WIKI
                             .on("mouseover", function(d){
                                
                                 //First basic tooltip tranistion
                                 //and formatiing
                                
                                 
                                 //TOOLTIP1 BEGIN------------------------------------------
                                 //Displays name year and alter ego data from csv
                                 div.transition()
                                    .duration(200)
                                    .style("opacity", .9);
                                    

                                div.html(name+
                                        "<br/>"+year+
                                        "<br/>"+alterego)
                                    .style("left", 130 + "px")		
                                    .style("top", 200 + "px");
                                 
                                 //TOOLTIP 1 END-------------------------------------------------------------------------------------------------------------
                                 
                                 
                                 
                                 //TOOLTIP2 BEGIN
                                 //The MARVEL API creates an object array of object arrays for each character
                                 //Calling the event object array returns an array containing 20 elements with the story titles
                                 //This will allow us to call random story events that contain the character we specified
                                var randomEvent = Math.floor(Math.random()*json.data.results[0].events.items.length-1)+0;
                                 console.log(json.data.results[0].events.items.length);
               
                                 //In order to obtain the image for the story titles we have to make a separate
                                 //call to Marvel's API to gather info on the event which includes the thumbnails
                                 //But to call the events we need the character id which was obtained from the first call
                                 //to the MARVEL API on the character info. This determines which character's stories you're accessing 
                                var charID = json.data.results[0].id;

                                 //Store the name of any of the event obtained from the FIRST API CALL
                                var eventName = json.data.results[0].events.items[randomEvent].name;
                                 
                              
                                 //Tooltip 2 appears when hovering over image
                                 tooltip2.transition()
                                    .duration(200)
                                    .style("opacity", .9);
                                 
                                 
                                 //2ND CALL TO MARVEL API: Obtain data and json files of story events specified to the characters obtained from the FIRST CALL TO MARVEL API. This means we mainly want to 
                                 //obtain the json files containing the data on the publication years of the randomly generated event that we stored in eventName and the corresponding thumbnail to the story
                                 //d3.json('http://gateway.marvel.com:80/v1/public/characters/'+charID+'/events?name='+eventName+'&ts=1480481937207' + '&apikey=' + '1a163e490587daaa559777d07cf71e25' + '&hash=20daa9e21915a9eb08f4d91cddd69c1b', function(err, charEvent){
                                d3.json('http://gateway.marvel.com:80/v1/public/characters/'+charID+'/events?name='+eventName+'&ts=1480481937207' + '&apikey=' + '772a59c75a72e2e7b7d6ce62b0a8be7a' + '&hash=6c31cce8b0841376453f6b096157537e', function(err, charEvent){
                                     
                                //If title is not found return error or if marvels api produces error return error
                                    if (err !== null){
                                        //setError("Error from the Marvel API. " + err.statusText);
                                        console.log(err)
                                        //reject(null);
                                    }
                                    else if (charEvent.data === null || charEvent.data.count === 0){
                                        console.log("Error: " + name + " is not finding anyone in the API. This app isn't very smart, so please play around with spaces and dashes on compound words (ie, Spider-man) to find a character.");
                        //                console.log(err)
                                        //reject(null);
                                    }
                                    else {
                                 
                                 
                                //tooltip2 will contain publication years and the thumbnails for the story events obtained
                                //from the 2ND CALL TO MARVEL API
                                  tooltip2.html("<br/>"+charEvent.data.results[0].title+
                                               "<br/>Published:"+charEvent.data.results[0].start+
                                               "<br/>")
                                    .style("left",830+"px")
                                    .style("top",200+"px") 
                                    .append("img")
                                    .attr("src", charEvent.data.results[0].thumbnail.path + '.' + charEvent.data.results[0].thumbnail.extension)
                                    .attr("width",165)
                                    .attr("height",240)
                                    .style("left", 10)
                                    .style("top", 10);
                                 
                                          
                                 //TOOLTIP 4 BEGIN
                                 tooltip4.transition()
                                    .duration(500)
                                    .style("opacity", .9)
                                    .style("left",1200+"px")
                                    .style("top", 200+"px");
                                        
                                tooltip4.html("<br/>"+charEvent.data.results[0].title+" Summary:"+
                                         "<p id ="+"'eventDescription'>"+"<br/>"+charEvent.data.results[0].description+"<p/>");
                                 //TOOLTIP 4 END
                                 
                            
                                    
                                    }
                                 })
                                 
                                 //TOOLTIP 2 END------------------------------------------------------------------------------------------------------------
                                 
                                 //TOOLTIP 3 BEGIN----------------------------------------------------------------------------------------------------------
                                 tooltip3.transition()
                                    .duration(200)
                                    .style("opacity", .9);
                                    

                                tooltip3.html(json.data.results[0].description+
                                            "<br/><br/>Stats(1-7)"+"<p id ="+"'eventDescription'>"+
                                            "<Nemesis: "+nemesis+
                                            "<br/>Intelligence: "+intelligence+
                                            "<br/>Speed: "+speed+
                                            "<br/>Strength: "+strength+
                                            "<br/>Durability: "+durability+
                                            "<br/>Fighting Skills: "+fighting+
                                             "<br/><p/>")
                                    .style("left", 50 + "px")		
                                    .style("top", 320 + "px")
                                    .append("img")
                                    .attr("src", json.data.results[0].thumbnail.path + '.' + json.data.results[0].thumbnail.extension)
                                    .attr("width",150)
                                    .attr("height",150)
                                    .style("left", 10)
                                    .style("top", 10)
                                 //TOOLTIP 3 END------------------------------------------------------------------------------------------------------------
                                 
                                 //
                            })
                            .on("mouseout", function(d){
                                div.transition()
                                    .duration(500)
                                    .style("opacity", 0);
                                
                                tooltip2.transition()
                                    .duration(500)
                                    .style("opacity",0);
                                
                                tooltip3.transition()
                                    .duration(500)
                                    .style("opacity",0);
                                
                                tooltip4.transition()
                                    .duration(500)
                                    .style("opacity",0);
                                
                            })
                
                var circle = svg.append("circle")
                                .attr("cx", function(d) {return x(year)+15;})
                                .attr("cy", ypos+15)
                                .attr("r", 18.5)
                                .style("fill", "none")
                                .style("stroke", "white")
                                .style("stroke-width",6.9);
           
			}
            
        });
        
	});
    
    
    
    }
     
     
     
 });

function navLimit() {
		ty = 0;
    
    var divisor = { w: width / ((navChart.domain()[1]-navChart.domain()[0])*zoom.scale())},
		minX = -(((navChart.domain()[0]-navChart.domain()[1])*zoom.scale())+(panExtent.x[1]-(panExtent.x[1]-(width/divisor.w)))),
        maxX = -(((navChart.domain()[0]-navChart.domain()[1]))+(panExtent.x[1]-panExtent.x[0]))*divisor.w*zoom.scale(),
        
        tx = navChart.domain()[0] < panExtent.x[0] ? 
				minX : 
				navChart.domain()[navChart.length] > panExtent.x[1] ? 
					maxX : 
					zoom.translate()[0];
	//console.log([tx,ty]);
	return [tx,ty];
}


//set the width and height for the navigation chart
function zoomed() {
  //call the zoom.translate vector with the array returned from panLimit()
  zoom.translate(panLimit());
  svg.select(".x.axis").call(xAxis);
  svg.selectAll("image").attr("transform", "translate(" + d3.event.translate[0] + "," + 0 + ")scale(" + d3.event.scale + ")")
  svg.selectAll("circle").attr("transform", "translate(" + d3.event.translate[0] + "," + 0 + ")scale(" + d3.event.scale + ")");
  updateViewportFromChart();
}


function redrawChart() {
    //zoom.translate(navLimit())
    svg.select('.x.axis').call(xAxis);
    //console.log(svg.selectAll('image').attr('x'));
    //svg.selectAll("image").attr("  trasform", "translate(" + d3.event.translate[0] + "," + 0 + ")scale(" + d3.event.scale + ")");
    //svg.selectAll("circle").attr("transform", "translate(" + d3.event.translate[0] + "," + 0 + ")scale(" + d3.event.scale + ")");
}

//function allowing the viewport position to be updated based on the panning and zooming of the top chart
function updateViewportFromChart() {
    if ((x.domain()[0] <= 1935) && (x.domain()[1] >= 2020)) {
        viewport.clear();
    }
    else {
        viewport.extent(x.domain());
    }
    navsvg.select('.viewport').call(viewport);
}

//function getCharacterEvent(characterID, eventTitle){
    
    
    
//}