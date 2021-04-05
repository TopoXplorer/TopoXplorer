var d3 = Object.assign(require("d3"),require('./util/colorbar'));
const {CANVAS_WIDTH,CANVAS_HEIGHT} = require('./util/constant');

class Matrix{
  constructor(that,data,names,interactor){
    this.create(that,data,names);
    this.interactor = interactor;
    this.interactor.set_matrix(this);
    this.current_transform = d3.zoomIdentity;
  }
  create(that,data,names){
    console.log('similarity:create')
    const self=this;
    const width = CANVAS_WIDTH;
    const height = CANVAS_HEIGHT
    const x = d3.scaleBand().domain(names).range([0, width]).padding(0.1)
    self.xScale = x
    const svg = d3.select(that.el).select('#svgSim')
                  .call(d3.zoom()
                      .extent([[0, 0], [width, height]])
                      .scaleExtent([0.1, 8])
                      .on("zoom", function(transform){
                        self.zoomed(transform)
                      }));


    const g = svg.append('g').attr('class','matrix')
    const xaxis = svg
                  .append('g')
                  .attr('class','x-axis')
                   .attr('transform',`translate(0,${height})`)
                  .call(d3.axisBottom(x));
          xaxis.select(".domain").remove();
    const yaxis = svg
                  .append('g')
                  .attr('class','y-axis')
                   .attr('transform',`translate(0,0)`)
                  .call(d3.axisLeft(x));
          yaxis.select(".domain").remove();
    xaxis.selectAll("text")
      .attr('transform','rotate(90)')
      .style("text-anchor", "start")
      .attr("dx", ".8em")
      .attr("dy", "-.5em");
    const cells = []
    data.forEach((d,i)=>d.forEach((c,j)=>{
      if (i>j) cells.push({x:names[j],y:names[i],v:c});
    }))
    
    var colorScale = d3.scaleSequential(d3.interpolateCividis).domain([0,1]);

    const gCells = g.selectAll('.cell')
    .data(cells)
    .join('rect')
    .attr('class','cell')
    .attr('transform',d=>`translate(${[x(d.x),x(d.y)]})`)
    .attr('x',0)
    .attr('y',0)
    .attr('width',x.bandwidth())
    .attr('height',x.bandwidth())
    .attr('fill',d=>colorScale(d.v))
    .on('click', function(event,d){
      self.interactor.reorder_main_graph([d.x,d.y])
    })
    
    
    var cb = d3.colorbarH(colorScale, 100,10)
    const legend = svg
                  .append('g')
                  .attr('class','legend')
                   .attr('transform',`translate(${width-120},20)`)
                  .call(cb);
    legend.append('text')
          .text('Topological Similarity')
          .style('font-size','.5em')
          .attr('dy','-0.3em')
    .style("text-anchor", "start")

    this.legend = legend
    this.xaxis = xaxis
    this.yaxis = yaxis
    this.gCells = gCells
    this.g = g
                

  }
  zoomed({transform}) {
    this.current_transform = transform
    const rect_size = this.xScale.bandwidth()
    const width = CANVAS_WIDTH;
    const x = this.xScale
    this.legend.attr('transform',`translate(${transform.apply([width-120,20])}) scale(${transform.k})`)
    this.xaxis.attr('transform',`translate(${transform.apply([0,width])}) scale(${transform.k})`)
    this.yaxis.attr('transform',`translate(${transform.apply([0,0])}) scale(${transform.k})`)
    this.gCells.attr("transform", d => `translate(${transform.apply([x(d.x),x(d.y)])})`)
            .attr('width',rect_size*transform.k)
  .attr('height',rect_size*transform.k);
  }
  refresh(data,names){
    const width = CANVAS_WIDTH;
    const rect_size = this.xScale.bandwidth()
    const transform = this.current_transform;
    const self = this;
    
    this.xScale.domain(names)
    this.xaxis
        .call(d3.axisBottom(this.xScale))
        .select(".domain").remove()
        .attr('transform',`translate(${transform.apply([0,width])}) scale(${transform.k})`);

    this.yaxis
        .call(d3.axisLeft(this.xScale))
        .select(".domain").remove()
        .attr('transform',`translate(${transform.apply([0,0])}) scale(${transform.k})`);

    const cells = []
    data.forEach((d,i)=>d.forEach((c,j)=>{
      if (i>j) cells.push({x:names[j],y:names[i],v:c});
    }))

    var colorScale = d3.scaleSequential(d3.interpolateCividis).domain([0,1]);
    const x = this.xScale
    this.gCells = this.g.selectAll('.cell')
    .data(cells)
    .join('rect')
    .attr('class','cell')
    .on('click', function(event,d){
        self.interactor.reorder_main_graph([d.x,d.y])
      })
    this.gCells
    .transition()
	.duration(200)
    .attr("transform", d => `translate(${transform.apply([x(d.x),x(d.y)])})`)
    .attr('width',rect_size*transform.k)
    .attr('height',rect_size*transform.k)
    .attr('x',0)
    .attr('y',0)
    .attr('fill',d=>colorScale(d.v))

  }
}


var view = {
	Matrix:Matrix
}

module.exports = view;