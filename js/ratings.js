const dataUrl = "https://raw.githubusercontent.com/micmasaphi/d3js/master/data/albums.csv";

const margin = {top: 50, right: 30, bottom: 50, left: 40},
    width = parseInt(d3.select("#chart").style("width")) - margin.left - margin.right,
    height = parseInt(d3.select("#chart").style("height")) - margin.top - margin.bottom;

var tooltip = d3.select('body').append('div')
	.style('position','absolute')
	.style('padding','0 10px')
	.style('background','white')
	.style('opacity',0)

var myChart = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style('background','#E7E0CB')

var summaryTable = d3.select("#summary_table").append("table");

var g = myChart.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv(dataUrl, function(error, data) {
		if(error) throw error;

		// rows aren't fully populated; get individual column counts
        var counts = new Map();
        counts.set('mc_rating',0);
        counts.set('usr_rating',0);

  		data = data.filter(function(d) {
        	if(isNaN(d.mc_rating) || d.mc_rating==='') {
            	return false;
        	} else {
        		let ct = counts.get('mc_rating');
	        	counts.set('mc_rating', ct+1);
        	}
        	if(isNaN(d.usr_rating) || d.usr_rating==='') {
        		return false;
        	} else {
        		let ct = counts.get('usr_rating');
	        	counts.set('usr_rating', ct+1); 
        	}
	        d.mc_rating = parseInt(d.mc_rating, 10); 
	        d.usr_rating = parseInt(d.usr_rating*10, 10);
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
		.thresholds(binCount)
		(data);

	var bins_usr = d3.histogram()
		.value(function(d) { return d.usr_rating; })
		.domain(x.domain())
		.thresholds(x.ticks(binCount))
		(data);

	var y = d3.scaleLinear()
	    .domain([0, d3.max(bins, function(d) { return d.length; })])
	    .range([height, 0]);

	var y_usr = d3.scaleLinear()
	    .domain([0, d3.max(bins_usr, function(d) { return d.length; })])
	    .range([height, 0]);

	var color = d3.scaleLinear()
		.domain([0, d3.max(bins, function(d) { return d.length; })]) // using y-value to color
		.range(["#92c5de","#0571b0"]);

	var color_usr = d3.scaleLinear()
		.domain([0, d3.max(bins_usr, function(d) { return d.length; })]) // using y-value to color
		.range(["#ffb2ae","#ff392e"]);

    var bar_mc = g.selectAll(".bar_mc")
	  .data(bins)
	  .enter().append("g")
	    .attr("class", "bar_mc")
	    .attr("transform", function(d) { return "translate(" + x(d.x0) + ",0)"; });//return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

	/* METACRITIC RATINGS */
	bar_mc.append("rect")
	    .attr("x", 1)
	   	.attr("width", x(bins[0].x1) - x(bins[0].x0) - 3)
	   	.attr("height",0)
	   	.attr("y",y(0))
	   	.attr("fill", function(d) {return color(d.length)})

	   	.on('mouseover', function(d) {
		tooltip.transition()
			.duration(50)
			.style('opacity',0.9);

		tooltip.html("<strong>MetaCritic:</strong> " + d.length + ", " + (d.x0) + "-" + (d.x1))
			.attr('class','tooltip tooltip_mc')
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
	/* END METACRITIC RATINGS */

	/* USR RATINGS */
	var bar_usr = g.selectAll(".bar_usr")
	  .data(bins_usr)
	  .enter().append("g")
	    .attr("class", "bar_usr")
	    .attr("transform", function(d) { return "translate(" + x(d.x0) + ",0)"; });//return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

	bar_usr.append("rect")
	    .attr("x", (x(bins_usr[0].x1) - x(bins_usr[0].x0)-3)/3)
	   	.attr("width", (x(bins_usr[0].x1) - x(bins_usr[0].x0))/3)
	   	.attr("height",0)
	   	.attr("y",y_usr(0))
	   	.attr("fill", function(d) {return color_usr(d.length)})

	   	.on('mouseover', function(d) {
		tooltip.transition()
			.duration(50)
			.style('opacity',0.9);

		tooltip.html("<strong>Users:</strong> " + d.length + ", " + (d.x0) + "-" + (d.x1))
			.attr('class','tooltip tooltip_usr')
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
	/* END USR RATINGS */

	/* TRANSITIONS AND AXES */

	// transition bars one at a time
	d3.selectAll("rect").transition() 
	    .delay(function(d, i) {
				return i*30;
		})
	    .duration(1000)
	    .attr("y", function(d) { return y_usr(d.length)})
	    .attr("height", function(d) { return height - y_usr(d.length); })  	

	// x-axis
	g.append("g")
	    .attr("class", "axis axis--x")
	    .attr("transform", "translate(0," + height + ")")
	    .call(d3.axisBottom(x));

	// y-axis
    g.append("g")
    	.attr("class", "axis axis--y")
    	.call(d3.axisRight(y))

    // y-axis title
    myChart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 + margin.left/2)
      .attr("x",0 - (height+margin.top+margin.bottom) / 2)
      .attr("class","axis_text axis--y")
      .style("text-anchor", "middle")
      .text("Review Count");  

    // x-axis title
    myChart.append("text")             
      .attr("class","axis_text axis--y")
      .attr("transform",
            "translate(" + ((width+margin.left+margin.right)/2) + " ," + 
                           (height + margin.top + margin.bottom/2 + 10) + ")")
      .style("text-anchor", "middle")
      .text("Overall Review Score");

    /* SUMMARY TABLE SETUP */
	const mcAvg = d3.mean(data, function(d) { return d.mc_rating});
    const mcMed = d3.median(data, function(d) { return d.mc_rating});
    const usrAvg = d3.mean(data, function(d) { return d.usr_rating});
    const usrMed = d3.median(data, function(d) { return d.usr_rating});
    const mcSd = d3.deviation(data, function(d) { return d.mc_rating});
    const usrSd = d3.deviation(data, function(d) { return d.usr_rating});

    var summaryStatistics = [
    	["Count",counts.get('mc_rating'),counts.get('usr_rating')],
    	["Mean", mcAvg.toFixed(1), usrAvg.toFixed(1)],
    	["Median", mcMed, usrMed],
    	["StDev", mcSd.toFixed(1), usrSd.toFixed(1)],
    ]

    var tableHeader = summaryTable.append("thead");
    tableHeader.selectAll("th")
    	.data(["","MetaCritic Rating","User Rating"])
    	.enter()
    	.append("th")
    	.text(function(d) { return d});

    var tableBody = summaryTable.append("tbody");
    var tableRows = tableBody.selectAll("tr")
    	.data(summaryStatistics)
    	.enter()
    	.append("tr")
    		.selectAll("td")
    		.data(function(d) { return d})
   			.enter()
   			.append("td")
   			.text(function(d) { return d});
});


