libhxl-js
=========

JavaScript support library for the Humanitarian Exchange Language (HXL) data standard.

http://hxlstandard.org

# Overview

This library supports high-level filtering and aggregation operations on HXL datasets.  For example, the following code produces a list of all the unique values in the column tagged "#org":

```
var unique_values = dataset.getValues('#org');
```

# Tests

To run the unit tests, open the file tests/index.html in a modern web browser.
