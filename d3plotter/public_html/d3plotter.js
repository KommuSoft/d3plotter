var dsid = 0;
var width = 800;
var height = 600;
var margin = {top: 35, right: 100, bottom: 75, left: 100};

/*
 * Parameter names and handlers
 *  - svg | node to plot to |
 * 
 */

var d3plotter = function() {


    var result = {};


    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;

    function splitList(x, delim) {
        delim = orDefault(delim, ",");
        if (isEffective(x)) {
            return x.split(delim);
        } else {
            return new Array();
        }
    }

    function orDefault(x, dflt) {
        if (isEffective(x)) {
            return x;
        } else {
            return dflt;
        }
    }

    function isDefined(x) {
        return (typeof x !== 'undefined');
    }

    function isEffective(x) {
        return (typeof x !== 'undefined' && x !== null);
    }

    function normalizeName(original) {
        return original.replace(/\s+/g, '');
    }

    function getParamNames(func) {
        var fnStr = func.toString().replace(STRIP_COMMENTS, '');
        var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
        if (result === null)
            result = [];
        return result;
    }
    result.getParamNames = getParamNames;

    var handlers = {
        xcol: function(x) {
            return orDefault(x, null);
        },
        dfile: function(x) {
            return x;
        },
        ycols: function(x) {
            return splitList(x);
        },
        y2cols: function(x) {
            return splitList(x);
        },
        naxis: function(x) {
            return splitList(x);
        },
        filled: function(x) {
            return isEffective(x);
        }
    };
    result.handlers = handlers;

    function handleParameter(name, x) {
        return x;
    }
    result.handleParameter = handleParameter;

    result.invoke = function(func, svg, divnode) {
        var args = getParamNames(func);
        var attr = new Array();
        attr.push(svg);
        for (var i = 1; i < args.length; i++) {//1: 0 is svg
            attr.push(handlers[args[i]](divnode.attr(args[i])));
        }
        func.apply(func, attr);
    };

    function nameAxis(svg, naxis) {
        if (naxis !== null) {
            svg.append("text").attr("transform", "translate(" + (width / 2) + " ," + (height + 2 * margin.bottom / 3) + ")").attr("class", "chart axisname").style("text-anchor", "middle").text(naxis[0]);
            svg.append("text").attr("transform", "rotate(-90)").attr("y", 0 - margin.left).attr("x", 0 - (height / 2)).attr("dy", "1em").attr("class", "chart axisname").style("text-anchor", "middle").text(naxis[1]);
        }
    }

    function plotRows(svg, dfile, xcol, ycols, y2cols, naxis, filled) {
        var datsid = dsid++;
        var heii = height;
        var widi = width;
        var margi = jQuery.extend({}, margin);
        xcol = orDefault(xcol, "rowindexnumber");
        var legendSpace = widi / (ycols.length + y2cols.length);
        var thex = d3.scale.linear().range([0, widi]);
        var they = d3.scale.linear().range([heii, 0]);
        var xAxis = d3.svg.axis().scale(thex).orient("bottom");
        var yAxis = d3.svg.axis().scale(they).orient("left");
        var they2 = they;
        var y2Axis = yAxis;
        if (y2cols.length > 0) {
            they2 = d3.scale.linear().range([heii, 0]);
            y2Axis = d3.svg.axis().scale(they2).orient("right");
        }
        var lines = new Array();
        var active = new Object();
        for (var i = 0; i < ycols.length; i++) {
            var ycolsi = ycols[i];
            if (filled) {
                lines.push(d3.svg.area().x(function(d) {
                    return thex(d[xcol]);
                }).y0(heii).y1(function(d) {
                    return they(d[this]);
                }.bind(ycolsi)));
            } else {
                lines.push(d3.svg.line().x(function(d) {
                    return thex(d[xcol]);
                }).y(function(d) {
                    return they(d[this]);
                }.bind(ycolsi)));
            }
            active[ycols[i]] = 1;
        }
        for (var i = 0; i < y2cols.length; i++) {
            var ycolsi = y2cols[i];
            lines.push(d3.svg.line().x(function(d) {
                return thex(d.rowindexnumber);
            }).y(function(d) {
                return they2(d[this]);
            }.bind(ycolsi)));

            active[y2cols[i]] = 1;
        }

        d3.csv(dfile, function(error, data) {
            var minx = 0;
            var maxx = 1e-6;
            var miny = 1;
            var maxy = 0;
            var miny2 = 0;
            var maxy2 = 1e-6;
            var rowi = 0;
            data.forEach(function(d) {
                d.rowindexnumber = rowi++;
                var res = +d[xcol];
                minx = Math.min(minx, res);
                maxx = Math.max(maxx, res);
                for (var i = 0; i < ycols.length; i++) {
                    ycoli = ycols[i];
                    var res = +d[ycoli];
                    d[ycoli] = res;
                    miny = Math.min(miny, res);
                    maxy = Math.max(maxy, res);
                }
                for (var i = 0; i < y2cols.length; i++) {
                    ycoli = y2cols[i];
                    var res = +d[ycoli];
                    d[ycoli] = res;
                    miny2 = Math.min(miny2, res);
                    maxy2 = Math.max(maxy2, res);
                }
            });
            thex.domain([minx, maxx]);
            if (y2cols.length > 0x00) {
                they2.domain([miny2, maxy2]);
            }
            they.domain([miny, maxy]);
            var color = d3.scale.category10();
            color.domain(ycols);
            var filline = (filled) ? "area" : "line";
            for (var i = 0; i < ycols.length; i++) {//TODO: unique identifiers per plot
                if (filled) {
                    svg.append("path").attr("class", filline).attr("id", "d" + datsid + "plot" + normalizeName(ycols[i])).attr("d", lines[i](data)).attr("data-legend", ycols[i]).style("fill", color(ycols[i]));
                } else {
                    svg.append("path").attr("class", filline).attr("id", "d" + datsid + "plot" + normalizeName(ycols[i])).attr("d", lines[i](data)).attr("data-legend", ycols[i]).style("stroke", color(ycols[i]));
                }
                svg.append("text").attr("x", (legendSpace / 2) + i * legendSpace).attr("y", heii + margi.bottom - 5).attr("class", "legend").style("fill", color(ycols[i])).on("click", function() {
                    active[this] = 1 - active[this];
                    d3.select("#d" + datsid + "plot" + normalizeName(this)).transition().duration(100).style("opacity", active[this]);
                }.bind(ycols[i])).text(ycols[i]);
            }
            for (var i = ycols.length; i < lines.length; i++) {//TODO: unique identifiers per plot
                var j = i - ycols.length;
                svg.append("path").attr("class", "line d3y2").attr("id", "d" + datsid + "plot" + normalizeName(y2cols[j])).attr("d", lines[i](data)).attr("data-legend", y2cols[j]).style("stroke", color(y2cols[j]));
                svg.append("text").attr("x", (legendSpace / 2) + i * legendSpace).attr("y", heii + margi.bottom - 5).attr("class", "legend").style("fill", color(y2cols[j])).on("click", function() {
                    active[this] = 1 - active[this];
                    d3.select("#d" + datsid + "plot" + normalizeName(this)).transition().duration(100).style("opacity", active[this]);
                }.bind(y2cols[j])).text(y2cols[j]);
            }
            svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + heii + ")").call(xAxis);
            svg.append("g").attr("class", "y axis").call(yAxis);
            if (y2cols.length > 0x00) {
                svg.append("g").attr("class", "y axis d3y2").attr("transform", "translate(" + (widi - 30) + " ,0)").call(y2Axis);
            }
            nameAxis(svg, naxis);
        });
    }
    result.plotRows = plotRows;

    function plotNetwork(svg, dfile) {
        var datsid = dsid++;
        var thex = d3.scale.linear().range([0, width]).domain([0, 1]);
        var they = d3.scale.linear().range([height, 0]).domain([0, 1]);

        function fx(d) {
            return d.x;
        }
        ;
        function fy(d) {
            return d.y;
        }
        ;

        var rollup = d3.rollup().x(function(d) {
            return fx(d);
        }).y(function(d) {
            return fy(d);
        });

        d3.json(dfile, function(json) {
            var graph = rollup(json);

            var link = svg.selectAll(".link")
                    .data(graph.links)
                    .enter().append("g")
                    .attr("class", "networklink");

            svg.selectAll(".networklink")
                    .data(graph.links)
                    .append("path")
                    .attr("class", function(d) {
                        return "link " + "from" + d.source.nodes[0].Number + " to" + d.target.nodes[0].Number;
                    })
                    .attr("id", function(d) {
                        return "link" + "from" + d.source.nodes[0].Number + "to" + d.target.nodes[0].Number;
                    })
                    .attr("d", function(d) {
                        var sx = d.source.x, sy = d.source.y,
                                tx = d.target.x, ty = d.target.y, dx = tx - sx, dy = ty - sy;
                        var dr = 2 * Math.sqrt(dx * dx + dy * dy), dry = dr, la = 0, sw = 1, xr = 0;//console.log(dr);
                        if (dx === 0 && dy === 0) {
                            xr = 47;
                            la = 1;
                            sw = 0;
                            dr = 30;
                            dry = 20;
                            tx = +tx + 0.0001;
                            ty = +ty + 0.0001;
                        }
                        return "M" + sx + "," + sy + "A" + dr + "," + dry + " " + xr + " " + la + "," + sw + " " + tx + "," + ty;
                    })
                    .style("stroke", "grey")
                    .style("stroke-width", function(d) {
                        return d.links[0].thick;
                    });

            var node = svg.selectAll(".node")
                    .data(graph.nodes)
                    .enter().append("g")
                    .attr("class", "node")
                    .style("pointer-events", "all")
                    .append("circle")
                    .attr("cx", function(d, i) {
                        return d.x
                    })
                    .attr("cy", function(d, i) {
                        return d.y
                    })
                    .attr("r", function(d, i) {
                        return +d.nodes[0].r;
                    })
                    //.attr("filter", "url(#f3)")
                    .style("fill", function(d, i) {
                        return d.nodes[0].fill;
                    })
                    .style("stroke", "grey")
                    .style("stroke-width", "2")
                    .on("mouseover", function(d) {

                        var xPosition = thex(50 + parseFloat(d3.select(this).attr("cx")));
                        var yPosition = they(10 + parseFloat(d3.select(this).attr("cy")));

                        /*d3.selectAll(".to" + d.nodes[0].Number + ":not(.pathlabel)")
                         .transition()
                         .duration(10)
                         .style("stroke", "orange")
                         .style("display", "block")
                         .style("stroke-opacity", ".7")
                         ;*/

                        d3.selectAll(".from" + d.nodes[0].Number + ":not(.pathlabel)")
                                .transition()
                                .duration(10)
                                .style("stroke", function(d) {
                                    return d.links[0].color;
                                })
                                .style("display", "block")
                                .style("stroke-opacity", ".7")
                                ;

                        /*d3.selectAll(".pathlabel.to" + d.nodes[0].Number)
                         .style("fill", "orange")
                         .style("stroke", "white")
                         .style("display", "block");*/

                        d3.selectAll(".pathlabel.from" + d.nodes[0].Number)
                                .style("fill", "blue")
                                .style("stroke", "white")
                                .style("display", "block");

                        d3.select(this).style("fill", "LightGoldenRodYellow");

                        /*d3.select("#tooltip")
                         .style("left", xPosition + "px")
                         .style("top", yPosition + "px")
                         .select("#name")
                         .text(d.nodes[0].name);
                         
                         d3.select("#tooltip")
                         .select("#number")
                         .text(d.nodes[0].Number);
                         
                         d3.select("#tooltip")
                         .select("#pos")
                         .text(d.nodes[0].Position);
                         
                         d3.select("#tooltip").classed("hidden", false);*/

                    })
                    .on("mouseout", function(d) {

                        /*d3.selectAll(".to" + d.nodes[0].Number + ":not(.pathlabel)")
                         .style("stroke", "grey")
                         .style("stroke-opacity", ".2");*/

                        d3.selectAll(".from" + d.nodes[0].Number + ":not(.pathlabel)")
                                .style("stroke", "grey")
                                .style("stroke-opacity", ".2");

                        d3.selectAll(".pathlabel")
                                .style("fill", "grey")
                                .style("display", "none");

                        //d3.select("#tooltip").classed("hidden", true);
                        d3.select(this).style("fill", d.nodes[0].fill);
                    });

            svg.selectAll(".node")
                    .data(graph.nodes)
                    .append("text")
                    .text(function(d, i) {
                        return d.nodes[0].Text;
                    })
                    .attr("x", function(d, i) {
                        return d.x;
                    })
                    .attr("y", function(d, i) {
                        return d.y;
                    })
                    .style("font-family", "sans-serif")
                    .style("font-size", "11px")
                    .style("text-anchor", "middle")
                    .style("dominant-baseline", "central")
                    .style("stroke", "black")
                    .style("pointer-events", "none");

            svg.selectAll("textpaths")
                    .data(graph.links)
                    .enter()
                    .append("text")
                    .style("font-size", "12px")
                    .attr("class", "texts")
                    .attr("x", "0")
                    .attr("y", "0")
                    .append("textPath")
                    .attr("class", function(d) {
                        return "pathlabel " + "from" + d.source.nodes[0].Number + " to" + d.target.nodes[0].Number;
                    })
                    .attr("xlink:href", function(d) {
                        return '#' + "link" + "from" + d.source.nodes[0].Number + "to" + d.target.nodes[0].Number
                    })
                    .text(function(d) {
                        return d.value;
                    })
                    .attr("startOffset", "40%")
                    .style("stroke", "black")
                    .attr("filter", "url(#f3)")
                    .style("fill", "white")
                    .style("font-family", "sans-serif")
                    .style("display", "none");
        });
    }

    result.plotNetwork = plotNetwork;

    function plotDot(svg, dot) {
        //var g = graphlibDot.parse('digraph G {rankdir=LR;  subgraph cluster_0 {    style=filled;    color=lightgrey;    node [style=filled,color=white];    a0 -> a1 -> a2 -> a3;    label = "process #1";  }  subgraph cluster_1 {    node [style=filled];    b0 -> b1 -> b2 -> b3;    label = "process #2";    color=blue  }  start -> a0;  start -> b0;  a1 -> b3;  b2 -> a3;  a3 -> a0;  a3 -> end;  b3 -> end;  start [shape=Mdiamond];  end [shape=Msquare];}');
        var g = graphlibDot.parse(dot);
        //{ rank = same;

        // Render the graphlib object using d3.
        var renderer = new dagreD3.Renderer();
        var d3g = svg.append("g");
        renderer.run(g, d3g);


        // Optional - resize the SVG element based on the contents.
        var bbox = svg.getBBox();
        svg.style.width = bbox.width + 40.0 + "px";
        svg.style.height = bbox.height + 40.0 + "px";
    }

    result.plotDot = plotDot;

    function plotBars(svg, dfile, namecol, valuecols, naxis) {
        var datsid = dsid;
        var legendSpace = width / valuecols.length;
        var thex = d3.scale.ordinal().rangeBands([0, width], 0.2);
        var they = d3.scale.linear().range([height, 0]);
        var xAxis = d3.svg.axis().scale(thex).orient("bottom");
        var yAxis = d3.svg.axis().scale(they).orient("left");

        var active = new Object();
        for (var i = 0; i < valuecols.length; i++) {
            active[valuecols[i]] = 1;
        }

        d3.csv(dfile, function(error, data) {
            var maxy = 1e-6;
            var rowi = 0;
            var namesa = new Array();
            var bars = new Array();
            data.forEach(function(d) {
                d.rowindexnumber = rowi;
                rowi++;
                var sumi = 0;
                for (var i = 0; i < valuecols.length; i++) {
                    var ycoli = valuecols[i];
                    var res = +d[ycoli];
                    d[ycoli] = res;
                    sumi += res;
                    bars.push(d);
                    namesa.push(d[namecol]);
                }
                maxy = Math.max(maxy, sumi);
            });
            thex.domain(namesa);
            they.domain([0, 1.2 * maxy]);
            var color = d3.scale.category10();
            color.domain(valuecols);


            function reorder() {
                for (var i = 0; i < bars.length; i++) {
                    var old = 0;
                    for (var j = 0; j < valuecols.length; j++) {
                        var vali = old + bars[i][valuecols[j]];
                        svg.append("g").append("rect")
                                .attr("x", thex(bars[i][namecol]))
                                .attr("y", they(vali))
                                .attr("height", they(old) - they(vali))
                                .attr("width", thex.rangeBand()).style("fill", color(valuecols[j]));
                        old = vali;
                    }
                }
            }

            reorder();
            for (var i = 0; i < valuecols.length; i++) {
                svg.append("text").attr("x", (legendSpace / 2) + i * legendSpace).attr("y", height + margin.bottom - 5).attr("class", "legend").style("fill", color(valuecols[i])).text(valuecols[i]);
            }
            svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
            svg.append("g").attr("class", "y axis").call(yAxis);
            nameAxis(svg, naxis);
        })
    }

    result.plotBars = plotBars;

    function plotGroupedBars(svg, dfile, xcol, gcol, ycols, naxis) {
        var datsid = dsid;
        var legendSpace = width / ycols.length;
        var thex = d3.scale.ordinal().rangeBands([0, width], 0.2);
        var they = d3.scale.linear().range([height, 0]);
        var xAxis = d3.svg.axis().scale(thex).orient("bottom");
        var yAxis = d3.svg.axis().scale(they).orient("left");

        var active = new Object();
        for (var i = 0; i < ycols.length; i++) {
            active[ycols[i]] = 1;
        }

        d3.csv(dfile, function(error, data) {
            var maxy = 1e-6;
            var rowi = 0;
            var namesa = new Array();
            var bars = new Object(), bari = null;
            data.forEach(function(d) {
                d.rowindexnumber = rowi;
                rowi++;
                var sumi = 0;
                var ni = d[xcol];
                var ci = d[gcol];
                for (var i = 0; i < ycols.length; i++) {
                    var ycoli = ycols[i];
                    var res = +d[ycoli];
                    d[ycoli] = res;
                    sumi += res;
                }
                maxy = Math.max(maxy, sumi);
                //alert(ci + "/" + ni + "/" + JSON.stringify(bars));
                namesa.push(ni);
                if (!bars[ni]) {
                    bars[ni] = new Array();
                }
                bars[ni].push(d);
            });
            thex.domain(namesa);
            they.domain([0, 1.2 * maxy]);
            var color = d3.scale.category10();
            color.domain(ycols);


            function reorder() {
                for (var i = 0; i < namesa.length; i++) {
                    var bari = bars[namesa[i]];
                    for (var k = 0; k < bari.length; k++) {
                        var old = 0;
                        for (var j = 0; j < ycols.length; j++) {
                            var vali = old + bari[k][ycols[j]];
                            svg.append("g").append("rect")
                                    .attr("x", thex(namesa[i]) + (k + 0.5) * thex.rangeBand() / bari.length)
                                    .attr("y", they(vali))
                                    .attr("height", they(old) - they(vali))
                                    .attr("width", thex.rangeBand() / (2 * bari.length - 1)).style("fill", color(ycols[j]));
                            old = vali;
                        }
                    }
                }
            }

            reorder();
            for (var i = 0; i < ycols.length; i++) {
                svg.append("text").attr("x", (legendSpace / 2) + i * legendSpace).attr("y", height + margin.bottom - 5).attr("class", "legend").style("fill", color(ycols[i])).text(ycols[i]);
            }
            svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
            svg.append("g").attr("class", "y axis").call(yAxis);
            nameAxis(svg, naxis);
        })
    }
    result.plotGroupedBars = plotGroupedBars;
    return result;
}();

//detection of automatic tags and its automatic plotting replacement
$(function() {
    var plotid = 0;
    $('*[plotter]').each(function() {
        try {
            var $this = $(this);
            width = +800 - margin.left - margin.right, height = +600 - margin.top - margin.bottom;//ordflt($this.attr("width"), 800)
            //var plotfunc = window[$this.attr("plotter")];
            var plotter = $this.attr("plotter");
            $this.attr('id', 'plotid' + plotid);
            var rootdiv = d3.select('#plotid' + plotid);
            var svgr = rootdiv.append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
            var svg = svgr.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            var plotfunc = d3plotter[plotter];
            d3plotter.invoke(plotfunc, svg, $this);
            plotid++;
        //*
        } catch (e) {
            console.error(e);
        }//*/
    })
});