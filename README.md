libhxl-js
=========

JavaScript support library for the Humanitarian Exchange Language (HXL) data standard.

http://hxlstandard.org

# Overview

This library supports high-level filtering and aggregation operations on HXL datasets.  

# Processing data

Creating a dataset from an array of arrays (normally, you would read the data over the web rather than initialising it statically):

```
var rawData = [
    [ "Organisation", "Cluster", "Province" ],
    [ "#org", "#sector", "#adm1" ],
    [ "Org A", "WASH", "Coastal Province" ],
    [ "Org B", "Health", "Mountain Province" ],
    [ "Org C", "Education", "Coastal Province" ],
    [ "Org A", "WASH", "Plains Province" ],

];
var dataset = new HXLDataset(rawData);
```

Reading the columns

```
for (var i = 0; i < dataset.columns.length; i++) {
    console.log("Column " + i + " is " + dataset.columns[i].displayTag);
}
```

Reading the data rows:

```
var row, iterator = dataset.iterator();
while (row = iterator.next()) {
    console.log(row.values);
    console.log("The value of #adm1 in this row is " + row.get('#adm1'));      
}
```

Getting all unique values for the column tagged "#org":

```
var unique_values = dataset.getValues('#org');
```


# Filters

The following example modifies a dataset on the fly to country the number of times each value of #adm1 appears, but only for the WASH #sector:

```
var filtered = dataset.select({ pattern:'#sector', test:'WASH' }).count(['#adm1']);
```

The original dataset remains unmodified.


# Tests

To run the unit tests, open the file tests/index.html in a modern web browser.
