var $ = require("jquery")
require('jquery-ui/ui/widgets/tabs');
require('jquery-ui/ui/widgets/button');
// require("jquery-ui/themes/base/all.css");
require('./jquery-ui-theme/jquery-ui.theme.min.css');
require('./style.css');


const {CANVAS_WIDTH, CANVAS_HEIGHT, TABLE_WIDTH, TABLE_HEIGHT} = require('./util/constant')

var create = function(that){
	console.log('layout:create')
	var html = `
	<div class="row" style='width:1000px;margin: 0px'>
		<div style="width: 300px; float: left;">
			<div class="tab" style="width: 300px; margin: 4px">
				<ul>
					<li><a id='tabSQL' href="#sqlview">SQL Query</a></li>
					<li><a id='tabProjection' href="#projectionview">Projection Query</a></li>	
				</ul>
				<div id="sqlview" style='height:300px; display:flex;flex-direction:column;'>
					<label>SELECT * FROM df WHERE</label>
					<textarea id='inputSQL' style="box-sizing:border-box; width:100%;height:100%;resize:none;" placeholder="condition 1 & condition 2 | condition 3 ..."></textarea>
				</div>
				<div id="projectionview" style='height:300px;padding:0px;'>
				<div id='projLabels'></div>
				<canvas id='canvasProj' width=${CANVAS_WIDTH} height=${CANVAS_HEIGHT-25}></canvas>
				</div>
				<div>
					<button id='btnQuery' class="ui-button ui-widget ui-corner-all" style="width: 100%;">Query</button>
				</div>
			</div>
			<div style="width: 300px; margin: 4px; padding-left:5px;">
				<div class="toolbar ui-widget-header ui-corner-all">
				<label>Explanation Similarity View</label>
				</div>
				<div id="matrixview" class="ui-widget-content ui-corner-all no_selection" style="width: 300px;margin: -5px;">
				<svg id='svgSim' width=${CANVAS_WIDTH} height=${CANVAS_HEIGHT}></svg>
				</div>
			</div>
		</div>
		<div style="width: 700px; float: left;margin-top:3px;">
			<div class="toolbar ui-widget-header ui-corner-all" style="margin-left:10px;margin-right:18px; margin-bottom:0px;">
			<select style='display: inline-block; color:black;' id="combobox" >
			</select>
			<div style='display: inline-block;' id='graphLabels'></div>
			</div>
			<div class='tab' style="width: 674px; margin-left: 10px; float: left;">
				<ul>
                    <li><a href="#topoComparisonView">Explanation Topology Comparison</a></li>
                    <li><a href="#topoMetaView">Resolutions</a></li>	
                </ul>
				<div id="topoComparisonView" style='height:365px; width:660px; overflow-y:scroll; position:relative;'>
					
                </div>
				<div id="topoMetaView" style=' height:365px; overflow-y:scroll;'>
					
                </div>
			</div>
			<div class='tab' style="width: 450px; margin-left: 10px; float: left;">
                <ul>
                    <li><a href="#dataview">Data Distribution</a></li>
                    <li><a id='datatabletab' href="#datatableview">Data Table</a></li>	
                </ul>
                <div id="dataview" style='height:230px;overflow-x:scroll;overflow-y:hidden;'>
					<div>
						<svg id='svgDistribution'></svg>
					</div>
                </div>
                <div id="datatableview" style='height:230px;padding:0'>
					<table id="datatable" class="display" width="100%"></table>
                </div>
			</div>
			<div style="width: 220px; margin-left: 4px; float: left;">
				<div class="toolbar ui-widget-header ui-corner-all" style="margin-left:0px;">
					<label>Explanation Details</label>
				</div>
				<div id="explanationdetailview" class="ui-widget-content ui-corner-all no_selection" style="width: 220px; height:237px;margin-top:-5px; overflow-x:hidden; overflow-y:scroll;">
					<svg id='svgExplanation' width='220'></svg>
				</div>
			</div>

		</div>
	</div>
	`
	$( that.el ).append(html)
	$( that.el ).find( ".tab" ).tabs();
	$( that.el ).find( "button" ).button();
	$( that.el ).parent().parent().parent().removeClass('output_scroll');
}

var view = {
	create:create
}

module.exports = view;

/* <div style="width: 220px; margin-left: 4px; float: left;">
				<div class="toolbar ui-widget-header ui-corner-all" style="margin-left:0px;">
				<label>Explanation Details</label>
				</div>
				<div id="explanationdetailview" class="ui-widget-content ui-corner-all no_selection" style="width: 220px; height:237px;margin-top:-5px;">
				</div>
			</div> */