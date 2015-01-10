plotdatatype = {
    Numeric: 0,
    String: 1,
    Date: 2,
    Time: 3
}

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

function nameAxis(svg, naxis) {
    if (naxis != null) {
        svg.append("text").attr("transform", "translate(" + (width / 2) + " ," + (height + 2 * margin.bottom / 3) + ")").style("text-anchor", "middle").text(naxis[0]);
        svg.append("text").attr("transform", "rotate(-90)").attr("y", 0 - margin.left).attr("x", 0 - (height / 2)).attr("dy", "1em").style("text-anchor", "middle").text(naxis[1]);
    }
}

function normalizeName(original) {
    return original.replace(/\s+/g, '');
}

function plotRows(svg, dfile, xcol, ycols, y2cols, naxis) {//todo y2 if not null
    var datsid = dsid;
    var legendSpace = width / ycols.length;
    var thex = d3.scale.linear().range([0, width]);
    var they = d3.scale.linear().range([height, 0]);
    var they2 = d3.scale.linear().range([height, 0]);
    var xAxis = d3.svg.axis().scale(thex).orient("bottom");
    var yAxis = d3.svg.axis().scale(they).orient("left");
    var y2Axis = d3.svg.axis().scale(they2).orient("right");
    var lines = new Array();
    var active = new Object();
    for (var i = 0; i < ycols.length; i++) {
        var ycolsi = ycols[i];
        lines.push(d3.svg.line().x(function(d) {
            return thex(d.rowindexnumber);
        }).y(function(d) {
            return they(d[this]);
        }.bind(ycolsi)));

        active[ycols[i]] = 1;
    }

    d3.csv(dfile, function(error, data) {
        var miny = 0;
        var maxy = 1e-6;
        var rowi = 0;
        data.forEach(function(d) {
            d.rowindexnumber = rowi;
            rowi++;
            for (var i = 0; i < ycols.length; i++) {
                var ycoli = ycols[i];
                var res = +d[ycoli];
                d[ycoli] = res;
                miny = Math.min(miny, res);
                maxy = Math.max(maxy, res);
            }
        });
        thex.domain([0, rowi + 1]);
        they.domain([miny, maxy]);
        they2.domain([miny, maxy]);
        var color = d3.scale.category10();
        color.domain(ycols);
        for (var i = 0; i < lines.length; i++) {//TODO: unique identifiers per plot
            svg.append("path").attr("class", "line").attr("id", "d" + datsid + "plot" + normalizeName(ycols[i])).attr("d", lines[i](data)).attr("data-legend", ycols[i]).style("stroke", color(ycols[i]));
            svg.append("text").attr("x", (legendSpace / 2) + i * legendSpace).attr("y", height + margin.bottom - 5).attr("class", "legend").style("fill", color(ycols[i])).on("click", function() {
                active[this] = 1 - active[this];
                d3.select("#d" + datsid + "plot" + normalizeName(this)).transition().duration(100).style("opacity", active[this]);
            }.bind(ycols[i])).text(ycols[i]);
        }
        svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
        svg.append("g").attr("class", "y axis").call(yAxis);
        svg.append("g").attr("class", "y axis").attr("transform", "translate(" + (width - 30) + " ,0)").call(y2Axis);
        nameAxis(svg, naxis);
    });
}

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

function plotGroupedBars(svg, dfile, namecol, groupcol, valuecols, naxis) {
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
        var bars = new Object(), bari = null;
        data.forEach(function(d) {
            d.rowindexnumber = rowi;
            rowi++;
            var sumi = 0;
            var ni = d[namecol];
            var ci = d[groupcol];
            for (var i = 0; i < valuecols.length; i++) {
                var ycoli = valuecols[i];
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
        color.domain(valuecols);


        function reorder() {
            for (var i = 0; i < namesa.length; i++) {
                var bari = bars[namesa[i]];
                for (var k = 0; k < bari.length; k++) {
                    var old = 0;
                    for (var j = 0; j < valuecols.length; j++) {
                        var vali = old + bari[k][valuecols[j]];
                        svg.append("g").append("rect")
                                .attr("x", thex(namesa[i]) + (k + 0.5) * thex.rangeBand() / bari.length)
                                .attr("y", they(vali))
                                .attr("height", they(old) - they(vali))
                                .attr("width", thex.rangeBand() / (2 * bari.length - 1)).style("fill", color(valuecols[j]));
                        old = vali;
                    }
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

//detection of automatic tags and its automatic plotting replacement
var plotid = 0;
$('[plotter]').each(function() {
    var $this = $(this);
    var margin = {top: 35, right: 100, bottom: 75, left: 100}, width = 800 - margin.left - margin.right, height = 600 - margin.top - margin.bottom;
    var rootdiv = d3.select($this);
    var plotfunc = window[$this.attr("plotter")];
    var file = $this.attr("dfile");
    var svgr = rootdiv.append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
    var svg = svgr.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    plotRows(svg, file, "Month", ["AAPL", "GOOG", "MSFT", "IBM"], null, ["Time", "Stock quote"]);
    //$this.attr()
    //$this.html(SizeFormatting.format($this.attr('data-sizeformat')));
});