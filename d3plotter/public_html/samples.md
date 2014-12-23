# Samples
<link rel="stylesheet" href="d3plotter.cssset">
<script language="JavaScript" src="d3/d3.min.js"></script>
<script language="JavaScript" src="d3plotter.js"></script>

This page contains samples that document the functions implemented in `d3plotter.js` a (higher level) library that provides common commands to plot `.csv` data.

This sample page lists the provided methods together with an example and notes on how to use the function as well as how it is implemented.

Some of the plotters are interactive. Since the plots are generated with JavaScript on the webpage (and not binaries containing the expected result), the interaction works on this page as well.

## Bugs?

Bugs can be reported using the [issues](https://github.com/KommuSoft/d3plotter/issues) page on GitHub.

## Usage

One needs to include the [`d3plotter.css`](d3plotter.css) stylesheet and the [`d3plotter.js`](d3plotter.js) javascript file.

## Functions

Below, the functions are listed with links to the corresponding anchor:

 - [`plotBars`](#plotbars);
 - [`plotGroupedBars`](#plotgroupedbars); and
 - [`plotRows`](#plotrows).

The following variables are implicit: they must be defined before and are assumed to be set before calling the method:

 - `width`: the width of the canvas;
 - `height`: the height of the canvas;
 - `dsid`: the 

The first arguments of every such function are:

 - `svg`: The `<svg>` element to draw content to; and
 - `dfile`: The name of the `.csv` file (including extension) where the data to plot, originates from.

Each *function section* is structured as follows:

 - **data format**: The expected format of the data: do we expect numerical, alphanumerical or another format of data, how should the data be represented (rows/columns)
 - **arguments**: What parameters can be set and how is it done.
 - **sample**: A sample of the expected output for a given data file.
 - **interaction**: a description of the interaction that occurs when a user hovers or clicks on certain elements.

Data is categorized in the following datatypes:

 - `Numeric`: numeric values, these values can be positive or negative can be an integer or a real number;
 - `String`: textual data, for instance names;
 - `Date`: a specific day in a specific month in a specific year.
 - `Time`: a certain moment in a day (specified by hours, minutes and seconds).

## `PlotRows`

This function plots one or more functions with a varying *x*-axis. The data can be plotted on at most two *y*-axes.

### Data format

The `.csv` file is structured as follows:

> Minimum **two** columns. The columns should be named (alphanumerical values on
> the first row of the `.csv` file). The *x* row contains numerical data
> preferably ordered the *y* row(s) should contain numerical data as well.

The function will detect the bounds of the *x* and *y* axes and plot the
accordingly by printing lines between each *(x,y)* tuple. If the *x* rows
are not ordered, the line will move back.

### Arguments

Besides the arguments introduced in the [introduction](#functions), the following
arguments must be given.

 - `xcol`: The name of the column that contains the values for the *x*-axis, if `null` the row number is used.
 - `ycols`: A list of names of the columns to plot with the first *y*-axis, if `null` no graphs are plot with that axis.
 - `y2cols`: A list of names of the columns to plot with the second *y*-axis, if `null` no graphs are plot with that axis.
 - `naxis`: The name of the *x*, *y* and *y2* axis, if `null`, the axes are not named, if length does not match 3, the known axis are labeled.

### Sample

**HTML**

```HTML
<div id="sample-plotrows"></div>
```

**JavaScript**

```JavaScript
var margin = {top: 35, right: 100, bottom: 75, left: 100}, width = 800 - margin.left - margin.right, height = 600 - margin.top - margin.bottom;
var rootdiv = d3.select("#sample-plotrows");
var dsid = 1;
var svgr = rootdiv.append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
var svg = svgr.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
plotRows(svg,"csvfiles/stocks-alter.csv","Month",["AAPL","GOOG","MSFT","IBM"],null,["Time","Stock quote"]);
```

**Output**

<div id="sample-plotrows"></div>
<script language="JavaScript">
var margin = {top: 35, right: 100, bottom: 75, left: 100}, width = 800 - margin.left - margin.right, height = 600 - margin.top - margin.bottom;
var rootdiv = d3.select("#sample-plotrows");
var dsid = 1;
var svgr = rootdiv.append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
var svg = svgr.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
plotRows(svg,"csvfiles/stocks-alter.csv","Month",["AAPL","GOOG","MSFT","IBM"],null,["Time","Stock quote"]);
</script>

### Interaction

## `PlotBars`

## `PlotGroupedBars`