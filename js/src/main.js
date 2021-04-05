// 'use strict';

var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
var layout = require('./layout');
var projection  = require('./projection')
var matrix =require('./matrix')
var table = require('./datatable')
var distribution = require('./tableDistribution')
var meta_graph = require('./meta_graph')
var main_graph = require('./main_graph')
var interactor = require('./interactor')
var sqlpanel = require('./sqlpanel')
var explanation = require('./tableExplanation')


// var d3 = require('d3');
// See example.py for the kernel counterpart to this file.


// Custom Model. Custom widgets models must at least provide default values
// for model attributes, including
//
//  - `_view_name`
//  - `_view_module`
//  - `_view_module_version`
//
//  - `_model_name`
//  - `_model_module`
//  - `_model_module_version`
//
//  when different from the base class.

// When serialiazing the entire widget state for embedding, only values that
// differ from the defaults will be specified.
var HelloModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name : 'HelloModel',
        _view_name : 'HelloView',
        _model_module : 'TopoXplorer',
        _view_module : 'TopoXplorer',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0',
        projection : [],
        labels: [],
        similarity: [],
        method_names: [],
        table_data: [],
        table_columns: [],
        table_distribution: [],
        lasso_index: [],
        highlight_distribution: [],
        query_index: [],
        updated_method: [],
        labels_name: 'prediction',
        sql_query: '',
        lasso_method_name: '',
        exp_average: []
    })
});


// Custom View. Renders the widget model.
var HelloView = widgets.DOMWidgetView.extend({
    // Defines how the widget gets rendered into the DOM
    render: function() {
        
        layout.create(this);
        this.interactor_create();

        this.projection_create();
        this.sql_create();
        this.matrix_create();
        this.table_create();
        this.explanation_create();
        this.distribution_create();
        this.meta_graph_create();
        this.main_graph_create();


        
        // Observe changes in the value traitlet in Python, and define
        // a custom callback.
        this.model.on('change:highlight_distribution', this.lasso_changed, this);
        this.model.on('change:similarity', this.similarity_changed, this)
        this.model.on('change:table_distribution',this.table_changed,this)
        this.model.on('change:graph',this.graph_changed,this)
        this.model.on('change:labels',this.labels_name_changed,this)
        this.model.on('change:exp_average',this.explanation_changed,this)
        
    },

    projection_create: function() {
        var proj = this.model.get('projection'),
            labels = this.model.get('labels')
        this.projection = new projection.Projection(this,proj,labels,this.interactor)
        // console.log(this.model.get('projection'))
    },
    sql_create: function(){
        this.sql = new sqlpanel.SQL(this,this.interactor)
    },

    matrix_create: function(){
        var sim = this.model.get('similarity');
        var names = this.model.get('method_names')
        this.matrix = new matrix.Matrix(this,sim,names,this.interactor)
        
    },

    table_create: function(){
        var data = this.model.get('table_data');
        var columns = this.model.get('table_columns');
        this.table = new table.DataTable(this,data,columns,this.interactor)
    },

    distribution_create: function(){
        var data = this.model.get('table_distribution')
        this.distribution = new distribution.Distribution(this,data,this.interactor)
    },
    explanation_create: function(){
        this.explanation = new explanation.Explanation(this,this.interactor)
    },
    meta_graph_create: function(){
        var labels = this.model.get('labels'),
            graphs = this.model.get('graph'),
            names = this.model.get('method_names')
        this.meta_graph = new meta_graph.MetaGraph(this,labels,names,graphs,this.interactor)
    },

    main_graph_create: function(){
        var labels = this.model.get('labels'),
            graphs = this.model.get('graph'),
            names = this.model.get('method_names')
        this.main_graph = new main_graph.MainGraph(this,labels,names,graphs,this.interactor)
    },

    interactor_create: function(){
        this.interactor = new interactor.Interator(this);
    },

    lasso_changed: function(){
        let highlight_distribution = this.model.get('highlight_distribution')
        this.distribution.refreshHighlight(highlight_distribution)
    },

    similarity_changed: function(){
        console.log('sim change')
        var sim = this.model.get('similarity');
        var names = this.model.get('method_names')
        this.matrix.refresh(sim,names)
    },

    table_changed: function(){
        var data = this.model.get('table_distribution')
        this.distribution.refreshMain(data)
    },

    graph_changed: function(){
        var labels = this.model.get('labels'),
            graphs = this.model.get('graph'),
            names = this.model.get('method_names')

        this.main_graph.refresh_graph(labels,names,graphs)
        this.meta_graph.refresh_graph(labels,names,graphs)
        this.explanation.clear()
    },

    labels_name_changed: function(){
        var labels = this.model.get('labels')
        this.main_graph.refresh_graph_content(labels)
        this.meta_graph.refresh_graph_content(labels)
    },

    explanation_changed: function(){
        var exp_average = this.model.get('exp_average')
        console.log(exp_average)
        this.explanation.draw(exp_average[0],exp_average[1],exp_average[2],exp_average[3])
    }

});


module.exports = {
    HelloModel: HelloModel,
    HelloView: HelloView
};
