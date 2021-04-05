var d3 = require("d3");
const {TABLE_CHART_WIDTH, TABLE_HEIGHT} = require('./util/constant')
const margin_top = 10, margin_left=50



class Distribution{
	constructor(that,data,interactor){
		this.create(that,data);
		this.interactor = interactor;
		this.interactor.set_distribution(this);
	}
	create(that,data){
		console.log('table distribution:create')
	
		this.svg = d3.select(that.el).select('#svgDistribution');
		this.svg.selectAll('*').remove();
		var width = TABLE_CHART_WIDTH * (data.length + 1), height = TABLE_HEIGHT
		this.svg.style('min-width',`${width}px`).style('min-height',`${height}px`)
	
		this.svg.append('g').attr('class','chart');
		this.refreshMain(data);
	}
	refreshMain(data){
		console.log(data)
		var height = TABLE_HEIGHT
		var g = this.svg.select('.chart')
		let total_rows = d3.sum(data[0].distribution),
		barScale = d3.scaleLinear()
					.domain([0,total_rows])
					.range([0,TABLE_CHART_WIDTH*0.7])
		for (let d of data){
			
			let scale = d3.scaleBand()
					.domain(d.edges)
					.rangeRound([0, height - margin_top * 5 - 10])
					
			// if (d.type === 'numeric'){
				
			// }else{
			// 	d.scale = scale.padding(0.3)
			// }
			d.scale = scale.padding(0.1)
			
		}
		this.total_rows = total_rows
		var xScale = d3.scaleLinear()
				.domain([0,data.length-1])
				.range([margin_left,TABLE_CHART_WIDTH * data.length])
		
		this.x_axes_g = g.selectAll('.x-axis')
			.data(data)
			.join('g')
			.attr('class','x-axis')
			.attr('transform',(d,i)=>`translate(${xScale(i)},${margin_top + 10})`)
			.each(function(d){
				let scale = d3.axisLeft(d.scale)
				d3.select(this)
					.selectAll('.barLabel').remove();
				d3.select(this)
					.call(d.type==='numeric'?scale.tickFormat(d3.format(".3n")):scale)
				d3.select(this)
					.append('text')
					.attr('class','barLabel')
					.attr('y',-10)
					.attr('text-anchor','middle')
					.attr('fill','black')
					.text(d.name)
			})
	
		g.selectAll('.mainBarCharts')
			.data(data)
			.join('g')
			.attr('class','mainBarCharts')
			.attr('transform',(d,i)=> `translate(${xScale(i)},${margin_top+10})`)
			.each(function(d){
				d3.select(this)
					.selectAll('.mainBar')
					.data(d.distribution)
					.join('rect')
					.attr('class','mainBar')
					.transition()
					.duration(200)
					.attr('width', _d =>barScale(_d))
					.attr('height',d.scale.bandwidth())
					.attr('x',0)
					.attr('y',(_d,i)=>d.type==='numeric'?d.scale(d.edges[i]) + d.scale.bandwidth() * 1.1:d.scale(d.edges[i]))
					.attr('fill','#34888c')
				
			})
		g.selectAll('.highlightBarCharts').remove()

	}
	refreshHighlight(data){
		console.log('table distribution:refreshHighlight')
		var height = TABLE_HEIGHT
		var g = this.svg.select('.chart')
		let total_rows = this.total_rows,
		barScale = d3.scaleLinear()
					.domain([0,total_rows])
					.range([0,TABLE_CHART_WIDTH*0.7])
		for (let d of data){
			let scale = d3.scaleBand()
					.domain(d.edges)
					.rangeRound([0, height - margin_top * 5 - 10])
					
			// if (d.type === 'numeric'){
				
			// }else{
			// 	d.scale = scale.padding(0.3)
			// }
			d.scale = scale.padding(0.1)
		}
		var xScale = d3.scaleLinear()
				.domain([0,data.length-1])
				.range([margin_left,TABLE_CHART_WIDTH * data.length])

		g.selectAll('.highlightBarCharts')
			.data(data)
			.join('g')
			.attr('class','highlightBarCharts')
			.attr('transform',(d,i)=> `translate(${xScale(i)},${margin_top+10})`)
			.each(function(d){
				d3.select(this)
					.selectAll('.highlightBar')
					.data(d.distribution)
					.join('rect')
					.attr('class','highlightBar')
					.transition()
					.duration(200)
					.attr('width', _d =>barScale(_d))
					.attr('height',d.scale.bandwidth())
					.attr('x',0)
					.attr('y',(_d,i)=>d.type==='numeric'?d.scale(d.edges[i]) + d.scale.bandwidth() * 1.1:d.scale(d.edges[i]))
					.attr('fill','#c994c7')
				
			})
	}
}

var view = {
	Distribution:Distribution
}

module.exports = view;