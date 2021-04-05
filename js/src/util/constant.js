var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;

var TABLE_CHART_WIDTH = 150;
var TABLE_HEIGHT = 230;

var tableau10 = ["#4e79a7","#F28E2B","#E15759","#76B7B2","#59A14F","#EDC948","#B07AA1","#FF9DA7","#9C755F","#BAB0AC"];

var wrapText = function(text, width) {
	text.each(function() {
	  var text = d3.select(this),
		  words = text.text().split(/\s+/).reverse(),
		  word,
		  line = [],
		  lineNumber = 0,
		  lineHeight = 1.1, // ems
		  y = text.attr("y"),
		  dy = parseFloat(text.attr("dy")),
		  tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em")
	  while (word = words.pop()) {
		line.push(word)
		tspan.text(line.join(" "))
		if (tspan.node().getComputedTextLength() > width) {
		  line.pop()
		  tspan.text(line.join(" "))
		  line = [word]
		  tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word)
		}
	  }
	})
  }

exports.tableau10 = tableau10;
exports.wrapText = wrapText;
exports.CANVAS_WIDTH = CANVAS_WIDTH;
exports.CANVAS_HEIGHT = CANVAS_HEIGHT;
exports.TABLE_HEIGHT = TABLE_HEIGHT;
exports.TABLE_CHART_WIDTH = TABLE_CHART_WIDTH;

