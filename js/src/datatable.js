var d3 = require("d3");
var $  = require('jquery');
var dt = require('datatables.net-jqui');



class DataTable{
	constructor(that,data,columns,interactor){
		this.table = null;
		this.created = false;
		this.create(that,data,columns);
		this.interactor = interactor;
		this.interactor.set_table(this)
	}
	create(that,data,columns){
		console.log('table:create')
		this.table = $( that.el ).find( "#datatable").DataTable({
			data:data,
			columns:columns.map(d=>({title:d,width:200})),
			scrollX: true,
			scrollY:'150px',
			searching: false,
			paging: true,
			info: false,
			columnDefs: [
				{
					width:'200px',
					render: function (d) {
						return "<div style='white-space:normal;word-wrap:break-word; width:200px;'>" + d + "</div>";
					},
					targets: '_all'
				},
			 ]
		})
		$( that.el ).find( "#datatabletab").on('click',function(e){
			if(!this.created){
				table.columns.adjust();
				this.created = true;
			}
			
		})
	}
}

var view = {
	DataTable:DataTable
}

module.exports = view;