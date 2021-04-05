var d3 = require("d3");

class SQL{
    constructor(that,interactor){
        this.init_query_button(that);
        this.interactor = interactor;

    }
    init_query_button(that){
        const self = this;
		d3.select(that.el).select('#btnQuery').on('click',function(){
			const query = d3.select(that.el).select('#inputSQL').node().value
			self.interactor.query_sql(query)
		})
        d3.select(that.el).select('#tabSQL').on('click',function(){
            d3.select(that.el).select('#btnQuery').on('click',null)
            d3.select(that.el).select('#btnQuery').on('click',function(){
				const query = d3.select(that.el).select('#inputSQL').node().value
                self.interactor.query_sql(query)
            })
        })
        
    }
}

var view = {
	SQL:SQL
}

module.exports = view;