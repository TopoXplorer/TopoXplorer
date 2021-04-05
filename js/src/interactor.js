var d3 = require("d3");

class Interator{
	constructor(main){
		this.graphs = []
		this.main = main
		this.set_combo_box()
	}
	set_combo_box(){
		let self = this
		let features = this.main.model.get('table_columns')
		features = ['prediction'].concat(features); //,'accuracy'
		d3.select(this.main.el).select('#combobox')
						.selectAll("option")
						.data(features)
						.join('option')
						.attr('value',d=>d)
						.text(d=>d)
		d3.select(this.main.el)
			.select('#combobox')
			.on('change',function(){
				// console.log('change option')
				let f = d3.select(this).node().value
				// console.log(f)
				self.main.model.set('labels_name',f)
				self.main.touch()
			})

	}
	reorder_main_graph(chosen){
		this.main_graph.reorder_graph(chosen);
	}
	reset_graph_lasso(graph){
		for (let _graph of this.graphs){
			if (graph !== _graph){
				_graph.draw_lasso([]);
			}
		}
	}
	lasso_change(idx,method_name){
		this.main.model.set('lasso_index', idx)
		this.main.model.set('lasso_method_name',method_name)
		this.main.touch()
	}
	query_data_projection(idx){
		this.reset_graph_lasso();
		// console.log(idx)
		this.main.model.set('query_index', idx)
		this.main.touch()
	}
	select_graph(method_name,graph){
		let choice = this.meta_graph.change_graph(method_name,graph),
			labels = this.main.model.get('labels'),
            graphs = this.main.model.get('graph')
		this.main_graph.change_graph(method_name,graphs[method_name]['G_attr'][choice],labels)
		this.main.model.set('updated_method',[method_name,choice])
		this.main.touch()
	}
	query_sql(query){
		this.main.model.set('sql_query',query)
		this.main.touch()
	}

	set_projection(projection){
		this.projection = projection
	}
	add_graph(graph){
		this.graphs.push(graph)
	}
	set_main_graph(main_graph){
		this.main_graph = main_graph
	}
	set_meta_graph(meta_graph){
		this.meta_graph = meta_graph
	}
	set_distribution(distribution){
		this.distribution = distribution
	}
	set_matrix(matrix){
		this.matrix = matrix
	}
	set_table(table){
		this.table = table
	}
	set_explanation(explanation){
		this.explanation = explanation
	}
	get_projection_coordinates(){
		return this.projection.projection
	}
}

module.exports = {
	Interator: Interator
}