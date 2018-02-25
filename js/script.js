var bardata = [];

for(var i=0; i<50; i++) {
	bardata.push(Math.round(Math.random()*100+10,1));
}

bardata.sort(function compareNumbers(a, b) {
	return a - b;
})

var margin = {top: 30, right: 30, bottom: 40, left: 50};

var height = 400 - margin.top - margin.bottom,
	width  = 600 - margin.left - margin.right,
	barWidth = 50,
	barOffset = 5;


var tooltip = d3.select('body').append('div')
	.style('position','absolute')
	.style('padding','0 10px')
	.style('background','white')
	.style('opacity',0)

var colors = d3.scaleLinear()
	//.domain([0, bardata.length]) // using x-value to color
	.domain([0, d3.max(bardata)]) // using y-value to color
	.range(['#FFB832','#C61C6F']);

var mouseColor;

var yScale = d3.scaleLinear()
	.domain([0, d3.max(bardata)])
	.range([0, height]);

var xScale = d3.scaleBand()
	.domain(d3.range(0, bardata.length))
	.rangeRound([0, width])
	.paddingInner(0.1);

var mychart = d3.select('#chart').append('svg')
	.style('background','#E7E0CB')
	.attr('width',width + margin.left + margin.right)
	.attr('height',height + margin.top + margin.bottom)
	.append('g')
	.attr('transform','translate(' + margin.left + ',' + margin.top + ')')
	//.style('background','#C9D7D6') //background color for chart
	.selectAll('rect').data(bardata)
	.enter().append('rect')
		.style('fill', function(d) {
			return colors(d);
		})
		.attr('width', xScale.bandwidth())
		.attr('x', function(d,i) {
			return xScale(i);
		})
		.attr('height',0)
		.attr('y',height)


	.on('mouseover', function(d) {
		tooltip.transition()
			.style('opacity',0.9);

		tooltip.html(d)
			.style('left', (d3.event.pageX)+'px')
			.style('top', (d3.event.pageY)+'px')

		mouseColor = this.style.fill;
		d3.select(this)
			.style('opacity',0.5)
			.style('fill','yellow');
	})
	.on('mouseout', function(d) {
		tooltip.transition()
			.style('opacity',0);

		d3.select(this)
			.transition()
			.style('opacity',1.0)
			.style('fill', mouseColor);
	})

mychart.transition()
	.attr('height', function(d) {
		return yScale(d);
	})
	.attr('y', function(d) {
		return height - yScale(d);
	})
	.delay(function(d, i) {
		return i*20;
	})
	.duration(1000)
	.ease(d3.easeElastic);

var yGuideScale = d3.scaleLinear()
	.domain([0,d3.max(bardata)])
	.range([height, 0]);

var yAxis = d3.axisRight(yGuideScale)
	.ticks(10);

var yGuide = d3.select('svg').append('g')
	yAxis(yGuide);

	yGuide.attr('transform','translate('+ margin.left +', '+ margin.top +')');
	yGuide.selectAll('path')
		.style({'fill':'none','stroke':'#000'})

var xGuideScale = d3.scaleLinear()
	.domain([0, bardata.length])
	.range([0,width])

var xAxis = d3.axisTop(xGuideScale)
	.tickValues(xScale.domain().filter(function(d,i) {
		return !(i % (bardata.length/5));
	}));

var xGuide = d3.select('svg').append('g')
	xAxis(xGuide)

	xGuide.attr('transform','translate('+ margin.left +', '+ (height+margin.top) + ')');

