libhxl-js
=========

JavaScript support library for the Humanitarian Exchange Language (HXL) data standard.

http://hxlstandard.org

## Overview

This library supports high-level filtering and aggregation operations
on HXL datasets.  Auto-generated API documentation (which may or may
not be up to date) is available at https://hxlstandard.github.io/libhxl-js/

## Usage

### Load a CSV dataset from the web:

Requires that the Papa Parse CSV library be loaded before HXL (there
is a copy bundled in lib/, with permission):

    hxl.load('http://example.org/dataset.csv', function (dataset) {
        console.log('Dataset has ' + dataset.columns.length + ' columns.');
    });

The HXL library will soon also support autodetecting the availability
of D3 and JQuery-based CSV parsing.

### Create a dataset from array data

    var rawData = [
        [ "Organisation", "Cluster", "Province" ],
        [ "#org", "#sector", "#adm1" ],
        [ "Org A", "WASH", "Coastal Province" ],
        [ "Org B", "Health", "Mountain Province" ],
        [ "Org C", "Education", "Coastal Province" ],
        [ "Org A", "WASH", "Plains Province" ],
    ];

    var dataset = hxl.wrap(rawData);
    console.log('Dataset has ' + dataset.columns.length + ' columns');
    
### Read a remote JSON-encoded HXL dataset

    fetch("http://example.org/data/sample.hxl.json").then(r => {
        r.json().then(rawData => {
            let dataset = hxl.wrap(rawData);
            console.log('Dataset has ' + dataset.columns.length + ' columns');
        });
    });
    
## Classes

### hxl.classes.Source

*Note:* Any method that takes a hxl.classes.TagPattern as an argument can accept a
string representation instead (e.g. "#affected+f-adults"). Any method
that takes a list of TagPatterns as an argument can accept a single
pattern (as above) or list of patterns.

#### Properties

Property | Data type | Description
-- | -- | --
columns | array of hxl.classes.Column | All the column objects for the dataset
rows | array of hxl.classes.Row | All the row objects for the dataset (excluding header and hashtag row)
rawData | array of arrays | Get all the raw row data for the dataset (excluding header and hashtag row)
headers | array of strings | Get all the text headers as strings
tags | array of strings | Get all the hashtags (without attributes) as strings
displayTags | array of strings | Get all the hasthag specs (with attributes) as strings

#### Row iteration methods

Method | Description
-- | -- | --
each(callback) | iterator through each row of the dataset, invoking _callback_ with the row, dataset, and row number as arguments
forEach(callback) | synonym for _each()_
iterator() | return a simple iterator with a next() function (but not done(); it returns null when finished)

#### Aggregate methods

Use these methods to extract aggregate values from the dataset.

Method | Result | Description
-- | -- | --
getSum(tagPattern) | number | Sum of all numeric values in the first column matching _tagPattern_
getMin(tagPattern) | number | Lowest of all numeric values in the first column matching _tagPattern_
getMax(tagPattern) | number | Highest of all numeric values in the first column matching _tagPattern_
getValues(tagPattern) | array | List of unique values in the first column matching _tagPattern_

#### Filter methods

The return value from a filter is always a new (virtual) dataset with the filter applied.

Method | Description
-- | --
withRows(predicates) | Include only rows matching (any of) _predicates_
withoutRows(predicates) | Include only rows _not_ matching (any of) _predicates_
withColumns(tagPatterns) | Include only columns matching (any of) _tagPatterns_
withoutColumns(tagPatterns) | Include only columns _not_ matching (any of) _tagPatterns_
count(tagPatterns, aggregate=null) | Aggregate data (like in a pivot table) for the columns matching _tagPatterns,_ and optionally produce aggregate values for the first column matching the tag pattern _aggregate_
rename(tagPattern, spec, header=null, index=0) | Rename the _index_ column matching _tagPattern_ to use the hashtag and attributes _spec_ and optionally the new header _header_
sort(tagPatterns, reverse=false) | Sort the dataset using columns matching tagPatterns as keys, with numeric comparison where possible
preview(maxRows=10) | Filter to a maximum of _maxRows_ rows.
catch() | Create a permanent copy of the data at this point in the pipeline, so that earlier filters don't have to be rerun.
index() | Number repeated tag specs by adding the attributes +i0, +i1, etc to simplify processing.

#### Other methods

Method | Result | Description
-- | -- | --
isNumbery(tagPattern) | boolean | Return true if the first column matching _tagPattern_ contains mainly numbers
iterator() | object | Return a simple iterator with a next() method for reading through the rows (returns null at the end)
exportArray() | array of arrays | Export the whole dataset as an array of arrays (including the headers and hashtag row)
hasColumn(tagPattern) | boolean | true if the dataset has at least one column matching _tagPattern_ 
getMatchingColumns(tagPattern) | array of int | List of 0-based indices for columns matching _tagPattern_


## Filter examples

Filters create a new virtual version of the dataset, on the fly. The
original dataset is unmodified.

### Column filtering

#### Include only specific columns

    dataset.withColumns(['#org', '#sector', '#adm1']).each(...);

#### Remove specific columns

    dataset.withoutColumns('#contact+email').each(...);

### Row filtering

#### Include only specific rows

    dataset.withRows('#sector=WASH').each(...);

#### Remove specific rows

    dataset.withoutRows('#status=Unreleased').each(...);

#### Test an entire row

    dataset.withRows(function (row) { 
        return row.get('#population+targeted+num') < row.get('#population+affected+num');
    }).each(...);

### Aggregation

#### Count values of #adm1

    dataset.count('#adm1').each(...);

#### Count combinations of #adm1 and #sector

    dataset.count(['#adm1', '#sector']).each(...);

### Chain filters together

Count #adm only in the WASH sector:

    dataset.withRows('#sector=WASH').count('#adm1').each(row => {
        // do something with each row
    });
    
or

    var iterator = dataset.iterator();
    var row = iterator.next();
    while (row != null) {
        // do something with each row
        row = iterator.next();
    }
    

## Tests

To run the unit tests, open the file tests/index.html in a modern web browser. You may need to install them in a web server to avoid cross-domain errors in browsers with strict security models.
