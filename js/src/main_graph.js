var d3 = require("d3");
var legend = require('./util/legend')
var g = require('./graph');
var Graph = g.Graph;
require('./style.css');
var $  = require('jquery');
var containerWidth = 670;
var left = 205;
var top = 230
class MainGraph{
	constructor(that,labels,method_names,graphs,interactor){
		this.interactor = interactor;
		this.method_names = method_names
		this.interactor.set_main_graph(this);
		this.create(that,labels,method_names,graphs)
		this.color_div = d3.select(that.el).select('#graphLabels')
		this.create_labels();
		
	}
	create(that,labels,method_names,graphs){
		console.log('main_graph:create')
		this.graphs = {}
		const self = this
		// <input type="text" name="name" id="basic" value="">

		// console.log(graphs)
		var div = d3.select(that.el).select('#topoComparisonView');
		div.selectAll('*').remove();
		let i = 0, j=0
		let rowPosition = []
		for (let method_name of method_names){
			if((i+1)*left>containerWidth){
				j+=1
				i=0
			}
			var row = div.append('div')
						.style('position','absolute')
						.style('border','solid lightgrey 1px')
						.style('left',`${i*left+10}px`)
						.style('top',`${j*top+40}px`)
			row.append('div')
				.attr('class','row')
				.append('label')
				.text(method_name)
			let graph = graphs[method_name]['G_attr'],
				graph_choice = parseInt(graphs[method_name]['graph_choice'])
			const g = new Graph(row,graph[graph_choice],labels,200,200,this.interactor,true,method_name);
			i+=1
			this.graphs[method_name] = {row:row,graph:g}
			this.color_scale = g.color

		}

		div.append('input')
			.attr('type','text')
			.attr('value',"")
			.style('position','absolute')
			.style('left',`${10}px`)
			.style('top',`${10}px`)
			.on('input',function(){
				self.filterRows(this.value)
			})
	}
	filterRows(val){
		let i = 0, j=0
		this.keyword = val
		for (let method_name in this.graphs){
			if (method_name.includes(val)){
				if((i+1)*left>containerWidth){
					j+=1
					i=0
				}
				this.graphs[method_name].row
						.style('left',`${i*left+10}px`)
						.style('top',`${j*top+40}px`)
						.style('display',null)
				i += 1
			}else{
				this.graphs[method_name].row.style('display','none')
				continue
			}
		}
	}
	create_labels(){
		var div = this.color_div;
		var domain = this.color_scale.domain()
		if (typeof domain[0] !== 'string'){
			// console.log(domain)
			div.selectAll('*').remove()
			div.append('label').text(domain[0].toPrecision(3)).style('display','inline-block')
			legend.color_legend({node:div,color:this.color_scale,height:15,marginTop:5,marginBottom:0,tickSize:0,width:100})
			div.append('label').text(domain.length>2?domain[2].toPrecision(3):domain[1].toPrecision(3)).style('display','inline-block')
		}else{
			div.selectAll('*').remove()
			for(let d of domain){
				div.append('div')
                        .style('display','inline-block')
                        .style('width','15px')
                        .style('height','15px')
                        .style('border','solid black 1px')
                        .style('background-color',this.color_scale(d))
						.style('vertical-align','middle')
				div.append('label')
                        .style('display','inline-block')
                        .style('vertical-align','middle')
                        .style('margin-left','5px')
                        .style('margin-right','5px')
                        .text(d)
			}
		}
	}
	reorder_graph(chosen_methods){
		// console.log(chosen_methods)
		let priority = [], remaining = [];
		for (let c of this.method_names){
			if (chosen_methods.indexOf(c) !== -1){
				priority.push(c)
			}else{
				remaining.push(c)
			}
		}

		let i = 0, j=0;
		let result = priority.concat(remaining);
		for (let method_name of result){
			if (!method_name.includes(this.keyword)){
				continue
			}
			if((i+1)*left>containerWidth){
				j+=1
				i=0
			}
			this.graphs[method_name].row
				.style('left',`${i*left+10}px`)
				.style('top',`${j*top+40}px`)
			i+=1
		}
	}
	refresh_graph(labels,method_names,graphs){
		for (let method_name of method_names){
			let graph = graphs[method_name]['G_attr'],
			graph_choice = parseInt(graphs[method_name]['graph_choice'])
			this.graphs[method_name].graph.refresh_graph(labels,graph[graph_choice])
			this.color_scale = this.graphs[method_name].graph.color
		}
		this.create_labels()
	}
	change_graph(method_name,graph,labels){
		this.graphs[method_name].graph.refresh_graph(labels,graph)
	}
	refresh_graph_content(labels){
		for (let method_name in this.graphs){
			this.graphs[method_name].graph.refresh_graph_labels(labels)
			this.color_scale = this.graphs[method_name].graph.color
		}
		this.create_labels()
	}
}

var view = {
	MainGraph:MainGraph
}

module.exports = view;