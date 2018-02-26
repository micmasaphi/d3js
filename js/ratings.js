const dataUrl = "https://raw.githubusercontent.com/micmasaphi/d3js/master/data/albums.csv";

const margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var tooltip = d3.select('body').append('div')
	.style('position','absolute')
	.style('padding','0 10px')
	.style('background','white')
	.style('opacity',0)

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

        // converting data into base-10 integers
        // (TODO: will need to convert usr_ratings to float eventually...)
		data = data.filter(function(d){
        	if(isNaN(d.mc_rating)){
            	return false;
        	}
        d.mc_rating = parseInt(d.mc_rating, 10);
        return true;

    });

	// TODO: pick a binning method!
	const binCount = 20; //Math.floor(Math.sqrt(data.length));

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

	var color = d3.scaleLinear()
		.domain([0, d3.max(bins, function(d) { return d.length; })]) // using y-value to color
		.range(["#92c5de","#0571b0"]);

    var bar = g.selectAll(".bar")
	  .data(bins)
	  .enter().append("g")
	    .attr("class", "bar")
	    .attr("transform", function(d) { return "translate(" + x(d.x0) + ",0)"; });//return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

	bar.append("rect")
	    .attr("x", 1)
	   	.attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
	   	.attr("height",0)
	   	.attr("y",y(0))
	   	.attr("fill", function(d) {return color(d.length)})

	   	.on('mouseover', function(d) {
		tooltip.transition()
			.duration(50)
			.style('opacity',0.9);

		tooltip.html(d.length + ", " + (d.x0) + "-" + (d.x1))
			.style('left', (d3.event.pageX)+'px')
			.style('top', (d3.event.pageY)+'px')

		mouseColor = this.style.fill;
			d3.select(this)
			.style('opacity',0.5)
			.style('fill','white');
		})
		.on('mouseout', function(d) {
			tooltip.transition()
			.style('opacity',0);

		d3.select(this)
			.transition()
			.style('opacity',1.0)
			.style('fill', mouseColor);
		})

	// transition bars one at a time
	d3.selectAll("rect").transition()
	    .delay(function(d, i) {
				return i*30;
		})
	    .duration(1000)
	    .attr("y", function(d) { return y(d.length)})
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
    	.call(d3.axisRight(y))
});


