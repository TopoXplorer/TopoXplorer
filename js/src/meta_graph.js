var d3 = require("d3");
var g = require('./graph');
var Graph = g.Graph;
require('./style.css');
var $  = require('jquery');

class MetaGraph {
	constructor(that,labels,method_names,graphs,interactor){
		this.interactor = interactor;
		this.interactor.set_meta_graph(this);
		this.create(that,labels,method_names,graphs);
		
		
	}
	create(that,labels,method_names,graphs){
		console.log('meta_graph:create')
		this.metaGraphs = {}
		var div = d3.select(that.el).select('#topoMetaView');
		div.selectAll('*').remove();
		for (let method_name of method_names){
			this.metaGraphs[method_name] = []
			var row = div.append('div')
						.attr('class','row graphRow')
			row.append('div')
				.attr('class','row')
				.append('label')
				.text(method_name)
			
			let smRow = row.append('div')
						.attr('class','row')
			let graph_choice = parseInt(graphs[method_name]['graph_choice'])
			let i = 0
			for (let graph of graphs[method_name]['G_attr']){
				let _div = smRow.append('div')
						.style('display','inline-block')
				this.metaGraphs[method_name].push(
					new Graph(_div,graph,labels,150,150,this.interactor,false,method_name)
				)
				if (graph_choice === i){
					this.metaGraphs[method_name][i].svg.style('border','1px solid grey')
				}
				i += 1
			}
		}
	}
	change_graph(method_name,graph){
		let i = 0, choice;
		for (let g of this.metaGraphs[method_name]){
			if(g === graph){
				g.svg.style('border','1px solid grey')
				choice = i 
			}else{
				g.svg.style('border',null)
			}
			i += 1
		}
		return choice
	}
	refresh_graph(labels,method_names,graphs){
		for (let method_name of method_names){
			let graph = graphs[method_name]['G_attr'],
			choice =  graphs[method_name]['graph_choice'],
			i = 0
			for(let g of graph){
				this.metaGraphs[method_name][i].refresh_graph(labels,g)
				if (i === choice){
					this.metaGraphs[method_name][i].svg.style('border','1px solid grey')
				}else{
					this.metaGraphs[method_name][i].svg.style('border',null)
				}
				i += 1
			}
		}
	}
	refresh_graph_content(labels){
		for (let method_name in this.metaGraphs){
			for(let g of this.metaGraphs[method_name]){
				g.refresh_graph_labels(labels)
			}
		}
	}
}

var view = {
	MetaGraph:MetaGraph
}

module.exports = view;