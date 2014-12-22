# Samples

This page contains samples that document the functions implemented in `d3plotter.js` a (higher level) library that provides common commands to plot `.csv` data.

This sample page lists the provided methods together with an example and notes on how to use the function as well as how it is implemented.

Some of the plotters are interactive. Since the plots are generated with JavaScript on the webpage (and not binaries containing the expected result), the interaction works on this page as well.

## Bugs?

Bugs can be reported using the [issues](https://github.com/KommuSoft/d3plotter/issues) page on GitHub.

## Functions

Below, the functions are listed with links to the corresponding anchor:

 - [`plotBars`](#plotbars);
 - [`plotGroupedBars`](#plotgroupedbars); and
 - [`plotRows`](#plotrows).

The first arguments of every such function are:

 - `svg`: The `<svg>` element to draw content to; and
 - `dfile`: The name of the `.csv` file (including extension) where the data to plot, originates from.

Each *function section* is structured as follows:

 - **data format**: The expected format of the data: do we expect numerical, alphanumerical or another format of data, how should the data be represented (rows/columns)
 - **arguments**: What parameters can be set and how is it done.
 - **sample**: A sample of the expected output for a given data file.
 - **interaction**: a description of the interaction that occurs when a user hovers or clicks on certain elements.

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

### Sample

**HTML**

```HTML
<div id="sample-plotrows"></div>
```

**JavaScript**

```JavaScript
var margin = {top: 35, right: 100, bottom: 75, left: 100}, width = 800 - margin.left - margin.right, height = 600 - margin.top - margin.bottom;
var rootdiv = d3.select("#sample-plotrows");
var dsid = 91;
var svgr = rootdiv.append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
var svg = svgr.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
plotGroupedBars(svg, "","","",[""], [""]);
```

**Output**

<div id="sample-plotrows"></div>

### Interaction

## `PlotBars`

## `PlotGroupedBars`