const dataUrl = "https://raw.githubusercontent.com/micmasaphi/d3js/master/albums.json";

const margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


// set the ranges
var x = d3.scaleLinear()
          .rangeRound([0, width]);
var y = d3.scaleLinear()
          .range([height, 0]);

// set the parameters for the histogram
var histogram = d3.histogram()
    .value(function(d) { return d.mc_rating; })
    .domain(x.domain());
    //.thresholds(x.ticks(5));

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style('background','#E7E0CB')
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json(
	dataUrl, 
	function(error, data) {
		if(error) throw error;

  		var bins = histogram(data);
  		y.domain([0, d3.max(bins, function(d) { return d.length; })]);

  		// append the bar rectangles to the svg element
  	svg.selectAll("rect")
      	.data(bins)
      	.enter().append("rect")
      	.attr("class", "bar")
      	.attr("x", 1)
      	.attr("transform", function(d) {
		  	return "translate(" + x(d.x0) + "," + y(d.length) + ")"; 
		})
      	.attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
      	.attr("height", function(d) { return height - y(d.length); });

  	// add the x Axis
  	svg.append("g")
    	.attr("transform", "translate(0," + height + ")")
    	.call(d3.axisBottom(x));

  	// add the y Axis
  	svg.append("g")
     	.call(d3.axisLeft(y));

});