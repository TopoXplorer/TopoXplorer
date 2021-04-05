var d3 = require("d3");

const TABLE_WIDTH = 220, BARCHART_HEIGHT = 60


class Explanation{
	constructor(that,interactor){
		this.create(that);
		this.interactor = interactor;
		this.interactor.set_explanation(this);
		this.keyword = ''
	}
	create(that){
		console.log('table explanation:create')
	
		this.svg = d3.select(that.el).select('#svgExplanation');
		this.svg.selectAll('*').remove();
		// var width = TABLE_WIDTH
		// this.svg.style('min-width',`${width}px`)
	}
	clear(){
		this.svg.selectAll('*').remove();
	}
	draw(exp_name,exp,extent,std){
		this.svg.selectAll('*').remove();
		var margin_height = 20
		var height = BARCHART_HEIGHT * (exp[0].length + 2) + margin_height
		this.svg.attr('height',height)
		var x = d3.scaleLinear().domain([-3,3]).range([10,TABLE_WIDTH-30])
		var y = margin_height,median = exp[1],lq = exp[0], uq = exp[2]
		for(let i = 0; i< median.length; i++){
			if (median[i] > 3){
				median[i] = 3
			}
			if (median[i] < -3){
				median[i] = -3
			}
			let _x = median[i]>0?x(0):x(median[i]),
				w = Math.abs(x(0) - x(median[i]))
			this.svg.append('text')
					.attr('x',x(0))
					.attr('y',y)
					.text(exp_name[i])
					.attr('font-size',10)
					.attr('text-anchor','middle')

			this.svg.append('rect')
					.attr('x',_x)
					.attr('y',y + 10)
					.attr('width',w)
					.attr('height',20)
					.attr('fill','#34888c')
			
			// this.svg.append('line')
			// 		.attr('x1',median[i]>0?_x + w - x(lq[i]):_x - x(lq[i]))
			// 		.attr('y1',y + 10)
			// 		.attr('x2',median[i]>0?_x + w - x(lq[i]):_x - x(lq[i]))
			// 		.attr('y2',y + 30)
			// 		.attr('stroke','black')

			// this.svg.append('line')
			// 		.attr('x1',median[i]>0?_x + w + x(uq[i]):_x + x(uq[i]))
			// 		.attr('y1',y + 10)
			// 		.attr('x2',median[i]>0?_x + w + x(uq[i]):_x + x(uq[i]))
			// 		.attr('y2',y + 30)
			// 		.attr('stroke','black')

			// this.svg.append('line')
			// 		.attr('x1',median[i]>0?_x + w - x(lq[i]):_x - x(lq[i]))
			// 		.attr('y1',y + 20)
			// 		.attr('x2',median[i]>0?_x + w + x(uq[i]):_x + x(uq[i]))
			// 		.attr('y2',y + 20)
			// 		.attr('stroke','black')

			this.svg.append('g')
					.attr('transform',`translate(${0},${y + 10 + 20})`)
					.call(d3.axisBottom(x).ticks(3))

			y += BARCHART_HEIGHT
		}
		
	}

}

var view = {
	Explanation:Explanation
}

module.exports = view;