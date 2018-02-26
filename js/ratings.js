const dataUrl = "https://raw.githubusercontent.com/micmasaphi/d3js/master/data/albums.csv";

const margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var myChart = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style('background','#E7E0CB')

var g = myChart.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv(dataUrl, function(error, data) {
		if(error) throw error;

		/*
			could also go with d.mc_rating = +d.mc_rating
			(http://learnjsdata.com/read_data.html)
			but that might not filter NaN; need to consider 
			two-column case for usr_rating
        */
		data = data.filter(function(d){
        	if(isNaN(d.mc_rating)){
            	return false;
        	}
        d.mc_rating = parseInt(d.mc_rating, 10);
        return true;

    });

	const binCount = Math.floor(Math.sqrt(data.length));


	var x = d3.scaleLinear()
		.domain([0,100])
    	.range([0, width]);

    var bins = d3.histogram()
		.value(function(d) { return d.mc_rating; })
		.domain(x.domain())
		.thresholds(x.ticks(binCount))
		(data);

	var y = d3.scaleLinear()
	    .domain([0, d3.max(bins, function(d) { return d.length; })])
	    .range([height, 0]);

    var bar = g.selectAll(".bar")
	  .data(bins)
	  .enter().append("g")
	    .attr("class", "bar")
	    .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });//return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

	bar.append("rect")
	    .attr("x", 1)
	   	.attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
	    .transition()
	    	.duration(1000)
	    	.attr("height", function(d) { return height - y(d.length); })
	    	
	    

	/*bar.append("text")
	    .attr("dy", ".75em")
	    .attr("y", 6)
	    .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
	    .attr("text-anchor", "middle")
	    .text(function(d) { return d.length; });*/		

	g.append("g")
	    .attr("class", "axis axis--x")
	    .attr("transform", "translate(0," + height + ")")
	    .call(d3.axisBottom(x));

    g.append("g")
    	.attr("class", "axis axis--y")
    	//.attr("transform", "translate(0," + height + ")")
    	.call(d3.axisRight(y))
});


