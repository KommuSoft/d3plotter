# Parameters

In `d3plotter`, the name of the parameters also implies how the parameters are parsed as well as the type and semantics. In this file we give a summary.


| Name  | Functions  | Type  | Handler | Comment |
|---|---:|---|---|---|
| `svg`            | `0` | d3 **node** element | none | |
| `dfile`          | `123` | **string** containing filename | `.attr` | |
| `xcol`,`gcol`    | `3` | **string** of csv column | `orDefault(null)`  | `gcol` is used to a a *"groupby"* directive |
| `ycols`,`y2cols` | `123` | **lis**t of strings of the csv columns to be plotted | `splitArguments` |  |
| `naxis`          | `123` | **list** of strings of the axis | `splitArguments` | |
| `filled`         | `1--` | **boolean** determining whether the lines should be filled | `isDefined` | |

List of functions:

| # | Function |
|---|---|
| 0 | &lt;all&gt; |
| 1 | `plotRows` |
| 2 | `plotBars` |
| 3 | `plotGroupedBars` |