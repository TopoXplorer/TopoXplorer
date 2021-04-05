var d3 = require("d3");
const {lasso} =require('./util/lasso-selection');
const {CANVAS_WIDTH,CANVAS_HEIGHT,tableau10} = require('./util/constant');
const { style } = require("d3");

class Projection{
    constructor(that,proj,labels,interactor){
        this.projection = proj
        this.create(that,proj,labels)
        this.init_query_button(that);
        this.interactor = interactor;
        this.interactor.set_projection(this)
        this.selected_idx = []

    }
    create(that,proj,labels){
        console.log('proj:create')
        const self = this;
        var canvas = d3.select(that.el).select('#canvasProj');
        var divLabels = d3.select(that.el).select('#projLabels');
        divLabels.selectAll('*').remove();

        const context = canvas.node().getContext('2d'),
        path = d3.geoPath().context(context);
    
        var extentX = d3.extent(proj,d=>d[0]),
            extentY = d3.extent(proj,d=>d[1]),
            x = d3.scaleLinear().domain(extentX).range([10,CANVAS_WIDTH-10]),
            y = d3.scaleLinear().domain(extentY).range([10,CANVAS_HEIGHT-25-10]),
            width = CANVAS_WIDTH,
            height = CANVAS_HEIGHT-25
        
        const data = proj.map(d=>[x(d[0]),y(d[1])])
        const data_by_labels = data.reduce(function(rv, x,i) {
            var key = labels[i];
            (rv[key] = rv[key] || []).push(x);
            return rv;
          }, {})
        const data_group = Object.values(data_by_labels);
    
        let i = 0
        for (let key in data_by_labels){
            divLabels.append('div')
                        .style('display','inline-block')
                        .style('width','15px')
                        .style('height','15px')
                        .style('border','solid black 1px')
                        .style('background-color',tableau10[i%tableau10.length])
            divLabels.append('label')
                        .style('display','inline-block')
                        .style('vertical-align','middle')
                        .style('margin-left','5px')
                        .style('margin-right','5px')
                        .text(key)
            i += 1
        }
        function draw(polygon) {
            context.clearRect(0, 0, width, height);
            context.beginPath();
            path({
            type: "LineString",
            coordinates: polygon
            });
            context.fillStyle = "rgba(0,0,0,.1)";
            context.fill("evenodd");
            context.lineWidth = 1.5;
            context.stroke();
    
            const selected = polygon.length > 2 ? [] : data;
            self.selected_idx = polygon.length > 2 ? [] : [...Array(data.length).keys()];
            let i = 0
            for (const d of data) {
                const contains =
                    polygon.length > 2 &&
                    d3.polygonContains(polygon, d) &&
                    selected.push(d) &&
                    self.selected_idx.push(i);
                i += 1
            }
    
            data_group.forEach((d,i) => {
                context.beginPath();
                path.pointRadius(1.5)({ type: "MultiPoint", coordinates: d });
                context.fillStyle = tableau10[i%tableau10.length];
                context.fill();
            });
    
    
            if (polygon.length > 2) {
            context.beginPath();
            path.pointRadius(2.5)({ type: "MultiPoint", coordinates: selected });
            context.fillStyle = "red";
            context.fill();
            }
            // self.selected_idx = selected
            // context.canvas.value = { polygon, selected };
            // context.canvas.dispatchEvent(new CustomEvent('input'));
        }
        draw([]);
    
        d3.select(context.canvas)
        .call(lasso().on("start lasso end", draw))
    }
    init_query_button(that){
        const self = this;
        d3.select(that.el).select('#tabProjection').on('click',function(){
            d3.select(that.el).select('#btnQuery').on('click',null)
            d3.select(that.el).select('#btnQuery').on('click',function(){
                self.interactor.query_data_projection(self.selected_idx)
            })
        })
        
    }
}

var view = {
	Projection:Projection
}

module.exports = view;