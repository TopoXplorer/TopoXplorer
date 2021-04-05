var d3 = require("d3");
const {lasso} = require('./util/lasso-selection');

class Graph {
	constructor(div,graph,labels,width,height,interactor,withButton,method_name){
		this.method_name = method_name;
		this.projection = interactor.get_projection_coordinates()
		this.withButton = withButton;
		this.create(div,graph,labels,width,height)
		this.interactor = interactor
		this.interactor.add_graph(this);
		this.selected_nodes = [];
		
	}
	create(div,graph,labels,width,height){
		let that = this;
		this.width = width
		this.height = height
		let links = []
		
		for( let source in graph.links){
			for(let target of graph.links[source]){
			links.push(Object.create({source:source,target:target}))
			}
		}
		let nodes= []
		let color = that.get_color_labels(labels);
		this.color = color

		for( let node in graph.nodes){
			nodes.push(Object.create({name:node,size:graph.nodes[node].length,idx:graph.nodes[node]}))
		}
		this.generate_node_attributes(nodes,labels)
		// console.log(nodes[0])
		that.nodes = nodes;
		const simulation = d3.forceSimulation(nodes)
			.force("link", d3.forceLink(links).id(d => d.name))
			.force("charge", d3.forceManyBody())
			.force("center", d3.forceCenter(width / 2, height / 2))
			.stop();

		for (let i=0;i<1;i++){
			simulation.tick()
		}

		const sizeScale = d3.scaleLinear().domain([0,labels.length]).range([0,20])
		this.sizeScale = sizeScale

		const extentX = d3.extent(nodes,d=>d.x),
		extentY = d3.extent(nodes,d=>d.y),
		x = d3.scaleLinear().range([0,width]).domain(extentX),
		y = d3.scaleLinear().range([0,height]).domain(extentY)
	
		nodes.forEach((d,i)=>{
		nodes[i].x = x(d.x);
		nodes[i].y = y(d.y);
		})

		const zoom = d3.zoom()
			.extent([[0, 0], [width, height]])
			.scaleExtent([0.1, 20])
			.on("zoom", function(transform){
				that.zoomed(transform);
			});

		const svg = div.append("svg")
			.attr('width',width)
			.attr('height', height)
			
		this.svg = svg
		var g = svg
			.append('g')
			
		
		that.path = d3.geoPath()
		that.l = svg.append("path").attr("class", "lasso")

		let _lasso = lasso()//.on("start lasso", that.draw_lasso)

		const link = g.append("g")
			.attr("stroke", "grey")
			.attr("stroke-opacity", 0.3)
		link
			.selectAll("line")
			.data(links)
			.join("line")
			.attr("stroke-width", 1)
			.attr("x1", d => d.source.x)
			.attr("y1", d => d.source.y)
			.attr("x2", d => d.target.x)
			.attr("y2", d => d.target.y);
		
		const pie = d3.pie()
				.sort(null)
				.value(d => d.value)
				
		const node = g.append("g")
		node.selectAll(".component")
			.data(nodes)
			.join('g')
			.attr('class','component')
			.each(function(d){
				that.render_node(d3.select(this),d,color)
			})
			.attr('transform',d=>`translate(${d.x},${d.y})`)
			
		this.node = node;
		this.link = link;

		// node;
		if (! this.withButton){
			svg.on('click',()=>{
				that.interactor.select_graph(that.method_name,that)
			})
			return //quit
		}

		svg.call(zoom); 

		var buttonG=svg.append('g')
					.attr('transform',`translate(${width-15},${10})`)
		
		const zoomButton = buttonG
			.append('text')
			.attr('y','0em')
			// .attr('class', 'fas')
			.attr('fill','black')
			.attr("font-family","FontAwesome")
  			.text(function(d) { return '\uf00e'; }); //zoom
		
		const lassoButton =buttonG
			.append('text')
			.attr('y','1.1em')
			.attr('fill','lightgrey')
			.attr("font-family","FontAwesome")
  			.text(function(d) { return '\uf248'; }); //brush
		
		const resetButton = buttonG
			.append('text')
			.attr('y','2.2em')
			.attr('fill','black')
			.attr("font-family","FontAwesome")
  			.text(function(d) { return '\uf01e'; }); //reload
		
		zoomButton.on('click',()=>{
			zoomButton.attr('fill','black')
			lassoButton.attr('fill','lightgrey')
			svg.on(".zoom", null);
			_lasso.on("start lasso end", null)
			svg.call(zoom)
		})
		
		lassoButton.on('click',()=>{
			lassoButton.attr('fill','black')
			zoomButton.attr('fill','lightgrey')
			svg.on(".zoom", null);
			_lasso.on("start lasso end", null)
			_lasso.on("start lasso",(p)=>{
				that.draw_lasso(p);
			})
			_lasso.on("end",(p)=>{
				that.draw_lasso(p);
				that.interactor.reset_graph_lasso(that)
				let selection = that.selected_nodes.map(d=>d.idx)
				selection = [].concat.apply([], selection)
				selection = [...new Set(selection)]
				that.interactor.lasso_change(selection,that.method_name)
			})
			svg.call(_lasso)
		})
		resetButton.on('click',()=>{
			// current_transform = d3.zoomIdentity;
			that.draw_lasso([])
			svg.call(zoom.transform, d3.zoomIdentity)
			that.current_transform = d3.zoomIdentity;
		})

		
	}
	refresh_graph(labels,graph){
		console.log('graph:refresh_graph')
		this.current_transform = d3.zoomIdentity;
		// this.graph = graph
		let that = this;
		let links = []
		const width =  this.width, height = this.height
		
		for( let source in graph.links){
			for(let target of graph.links[source]){
			links.push(Object.create({source:source,target:target}))
			}
		}
		let nodes = []

		//TODO: change it according to attribute choices
		let color = that.get_color_labels(labels);
		this.color = color

		let n_size = 0
		for( let node in graph.nodes){
			n_size += graph.nodes[node].length
		}
		for( let node in graph.nodes){
			nodes.push(Object.create({name:node,size:graph.nodes[node].length,idx:graph.nodes[node]}))
		}
		this.generate_node_attributes(nodes,labels)

		that.nodes = nodes;
		const simulation = d3.forceSimulation(nodes)
			.force("link", d3.forceLink(links).id(d => d.name))
			.force("charge", d3.forceManyBody())
			.force("center", d3.forceCenter(width / 2, height / 2))
			.stop();

		for (let i=0;i<1;i++){
			simulation.tick()
		}

		const sizeScale = d3.scaleLinear().domain([0,d3.min([n_size,labels.length])]).range([0,20])
		this.sizeScale = sizeScale
		
		const extentX = d3.extent(nodes,d=>d.x),
		extentY = d3.extent(nodes,d=>d.y),
		x = d3.scaleLinear().range([0,width]).domain(extentX),
		y = d3.scaleLinear().range([0,height]).domain(extentY)

		nodes.forEach((d,i)=>{
		nodes[i].x = x(d.x);
		nodes[i].y = y(d.y);
		})

	that.link
		.selectAll("line")
		.data(links)
		.join("line")
		.attr("stroke-width", 1)
		.attr("x1", d => d.source.x)
		.attr("y1", d => d.source.y)
		.attr("x2", d => d.target.x)
		.attr("y2", d => d.target.y);
	
	that.node
		.selectAll(".component")
		.data(nodes)
		.join('g')
		.attr('class','component')
		.each(function(d){
			that.render_node(d3.select(this),d,color)
		})
		.attr('transform',d=>`translate(${d.x},${d.y})`)
	
	}
	generate_node_attributes(nodes,labels){
		const projection = this.projection
		if (typeof labels[0] === 'string'){
			let uniqueGroups = [...new Set(labels)]
			nodes.forEach((item,i)=>{
				let dist = uniqueGroups.reduce((r,i)=>{r[i]=0; return r},{})
				for(let n of item.idx){
					dist[labels[n]]+=1;
				}
				dist = Object.entries(dist).map((e) => ( { value: e[1],class:e[0] } ))
				nodes[i].dist = dist
				nodes[i].type = 'categorical'
			})
		}else{
			nodes.forEach((item,i)=>{
				let dist = []
				for(let n of item.idx){
					dist.push(labels[n])
				}
				dist = d3.mean(dist)
				nodes[i].dist = dist
				nodes[i].type = 'numerical'
			})
		}
		
		nodes.forEach((item,i)=>{
			let x = 0, y = 0
			for(let i of item.idx){
			x += projection[i][0]
			y += projection[i][1]
			}
			x = x / item.idx.length
			y = y / item.idx.length
			nodes[i].fx = x
			nodes[i].fy = y
		})

	}
	render_node(g,_d,color){
		g.selectAll('*').remove();
		if (_d.type === 'categorical'){
			const pie = d3.pie()
			.sort(null)
			.value(d => d.value)

			const arc = d3.arc()
				.innerRadius(0)
				.outerRadius(this.sizeScale(_d.size))
			
			const arcs = pie(_d.dist);
			// console.log(d.dist)
			g.selectAll("path")
				.data(arcs)
				.join("path")
				.attr("fill", d => color(d.data.class))
				.attr("d", arc)

			g.append('circle')
				.attr('cx',0)
				.attr('cy',0)
				.attr('r',this.sizeScale(_d.size))
				.attr('fill','none')
				.style('stroke-width', '1px')
					.style('stroke','black')

		}else{
			g.append('circle')
				.attr('cx',0)
				.attr('cy',0)
				.attr('r',this.sizeScale(_d.size))
				.attr('fill',color(_d.dist))
				.style('stroke-width', '1px')
					.style('stroke','black')
		}
	}
	refresh_graph_labels(labels){
		const that = this
		let color = that.get_color_labels(labels);
		this.color = color;
		this.generate_node_attributes(this.nodes,labels)
		that.node
			.selectAll(".component")
			.each(function(d){
				that.render_node(d3.select(this),d,color)
			})
	}
	get_color_labels(labels){
		// console.log(typeof labels[0],labels[0])
		if (typeof labels[0] === 'string'){
			return d3.scaleOrdinal(d3.schemeTableau10).domain([...new Set(labels)])
		}else{
			const extent = d3.extent(labels)
			if ((extent[0] > 0 ) == (extent[1] > 0)){ // same sign
				return d3.scaleSequential(d3.interpolateReds).domain(extent)
			}else{
				return d3.scaleDiverging(d3.interpolateRdBu).domain([extent[0],0,extent[1]])
			}
		}
	}
	zoomed({transform}) {
		const that = this
		that.node
			.selectAll('.component')
			.attr('transform',d=>`translate(${transform.apply([d.x,d.y])})scale(${transform.k})`)

		that.link
			.selectAll("line")
			.attr("x1", d => (d.source.x*transform.k+transform.x))
			.attr("y1", d => (d.source.y*transform.k+transform.y))
			.attr("x2", d => (d.target.x*transform.k+transform.x))
			.attr("y2", d => (d.target.y*transform.k+transform.y));

		that.current_transform = transform;
	
	}
	draw_lasso(polygon) {
		const that = this;
		const transform = that.current_transform
		that.l.datum({
		type: "LineString",
		coordinates: polygon
		}).attr("d", that.path);

		that.selected_nodes =  [];//polygon.length > 2 ? [] : that.nodes;
		// note: d3.polygonContains uses the even-odd rule
		// which is reflected in the CSS for the lasso shape
		that.node
		.selectAll('.component')
		.each(function(d){
		if(polygon.length > 2){
				let x = d.x,
					y = d.y
				if (transform !== undefined){
				x = x * transform.k+transform.x
				y = y * transform.k+transform.y
				}
				if(d3.polygonContains(polygon, [x,y]) && that.selected_nodes.push(d)){

				d3.select(this).selectAll("circle")
					.style('stroke-width', '1.5px')
					.style('stroke','black')
				return
				}
		}
			// d3.select(this).selectAll("path")
			// 		.style('stroke-width', '1px')
			// 		.style('stroke','black')
			d3.select(this).selectAll("circle")
					.style('stroke-width', '1px')
					.style('stroke','black')
		
		})
	}
}



module.exports = {
	Graph: Graph
}