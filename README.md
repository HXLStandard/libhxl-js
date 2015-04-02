libhxl-js
=========

JavaScript support library for the Humanitarian Exchange Language (HXL) data standard.

http://hxlstandard.org

# Overview

This library supports high-level filtering and aggregation operations on HXL datasets.  

# Processing data

## Load a dataset from the web:

Requires that the Papa Parse CSV library be loaded before HXL (there
is a copy bundled in lib/, with permission):

    hxl.load('http://example.org/dataset.csv', function (dataset) {
        console.log('Dataset has ' + dataset.columns.length + ' columns.');
    });

The HXL library will soon also support autodetecting the availability
of D3 and JQuery-based CSV parsing.

## Create a dataset from array data

    var rawData = [
        [ "Organisation", "Cluster", "Province" ],
        [ "#org", "#sector", "#adm1" ],
        [ "Org A", "WASH", "Coastal Province" ],
        [ "Org B", "Health", "Mountain Province" ],
        [ "Org C", "Education", "Coastal Province" ],
        [ "Org A", "WASH", "Plains Province" ],
    ];

    var dataset = hxl.wrap(rawData);

## Process columns

    dataset.columns.forEach(function (column, index) {
        console.log("Column " + index + " is " + column.displayTag);
    });

## Process rows

(D3- and JQuery-style "each" is also available):

    dataset.forEach(function (row, index) {
        console.log(row.values);
        console.log("The value of #adm1 in this row is " + row.get('#adm1'));      
    });

## Unique values in a column

    var unique_values = dataset.getValues('#org');

# Filters

Filters create a new virtual version of the dataset, on the fly. The
original dataset is unmodified.

## Column filtering

### Include only specific columns

    dataset.withColumns(['#org', '#sector', '#adm1']).each(...);

### Remove specific columns

    dataset.withoutColumns('#contact+email').each(...);

## Row filtering

### Include only specific rows

    dataset.withRows('#sector=WASH').each(...);

### Remove specific rows

    dataset.withoutRows('#status=Unreleased').each(...);

### Test an entire row

    dataset.withRows(function (row) { 
        return row.get('#population+targeted+num') < row.get('#population+affected+num');
    }).each(...);

## Aggregation

### Count values of #adm1

    dataset.count('#adm1').each(...);

### Count combinations of #adm1 and #sector

    dataset.count(['#adm1', '#sector']).each(...);

## Chain filters together

Count #adm only in the WASH sector:

    dataset.withRows('#sector=WASH').count('#adm1').each(...);

# Tests

To run the unit tests, open the file tests/index.html in a modern web browser.
