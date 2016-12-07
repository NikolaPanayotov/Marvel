var minN = 1900
    maxN = 2020
var minDate = new Date(minN - 8.64e7),
    maxDate = new Date(maxN + 8.64e7);
var yMin = 0
    yMax = 100

var margin = {top: 20, right: 20, bottom: 30, left: 35},
    width = 660 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var plotChart = d3.select('#chart').classed('chart', true).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var plotArea = plotChart.append('g')
    .attr('clip-path', 'url(#plotAreaClip)');

plotArea.append('clipPath')
    .attr('id', 'plotAreaClip')
    .append('rect')
    .attr({ width: width, height: height });

var xScale = d3.time.scale()
    .domain([minDate, maxDate])
    .range([0, width]),
    yScale = d3.scale.linear()
    .domain([yMin, yMax]).nice()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .ticks(5),
    yAxis = d3.svg.axis()
    .scale(yScale)
    .orient('left');

plotChart.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

plotChart.append('g')
    .attr('class', 'y axis')
    .call(yAxis);

var navWidth = width,
    navHeight = 100 - margin.top - margin.bottom;

var navChart = d3.select('#chart').classed('chart', true).append('svg')
    .classed('navigator', true)
    .attr('width', navWidth + margin.left + margin.right)
    .attr('height', navHeight + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var navXScale = d3.time.scale()
        .domain([minDate, maxDate])
        .range([0, navWidth]),
    navYScale = d3.scale.linear()
        .domain([yMin, yMax])
        .range([navHeight, 0]);

var navXAxis = d3.svg.axis()
    .scale(navXScale)
    .orient('bottom');

navChart.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + navHeight + ')')
    .call(navXAxis);

var navData = d3.svg.area()
    .x(function (d) { return navXScale(d.date); })
    .y0(navHeight)
    .y1(function (d) { return navYScale(d.close); });

var navLine = d3.svg.line()
    .x(function (d) { return navXScale(d.date); })
    .y(function (d) { return navYScale(d.close); });


var viewport = d3.svg.brush()
    .x(navXScale)
    .on("brush", function () {
        xScale.domain(viewport.empty() ? navXScale.domain() : viewport.extent());
        redrawChart();
    });

function redrawChart() {
    plotChart.select('.x.axis').call(xAxis);
}

var zoom = d3.behavior.zoom()
    .x(xScale)
    .on('zoom', function() {
        if (xScale.domain()[0] < minDate) {
	    var x = zoom.translate()[0] - xScale(minDate) + xScale.range()[0];
            zoom.translate([x, 0]);
        } else if (xScale.domain()[1] > maxDate) {
	    var x = zoom.translate()[0] - xScale(maxDate) + xScale.range()[1];
            zoom.translate([x, 0]);
        }
        redrawChart();
        updateViewportFromChart();
    });

function updateViewportFromChart() {

    if ((xScale.domain()[0] <= minDate) && (xScale.domain()[1] >= maxDate)) {

        viewport.clear();
    }
    else {

        viewport.extent(xScale.domain());
    }

    navChart.select('.viewport').call(viewport);
}

var overlay = d3.svg.area()
    .x(function (d) { return xScale(d.date); })
    .y0(0)
    .y1(height);


viewport.on("brushend", function () {
        updateZoomFromChart();
    });

function updateZoomFromChart() {

    zoom.x(xScale);
    
    var fullDomain = maxDate - minDate,
        currentDomain = xScale.domain()[1] - xScale.domain()[0];

    var minScale = currentDomain / fullDomain,
        maxScale = minScale * 20;

    zoom.scaleExtent([minScale, maxScale]);
}

var daysShown = 30;


redrawChart();
updateZoomFromChart();