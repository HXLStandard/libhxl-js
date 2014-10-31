libhxl-js
=========

JavaScript support library for the Humanitarian Exchange Language (HXL) data standard.

http://hxlstandard.org

# Overview

This library will be designed for use in client-size applications,
including fully-browser-based apps: it will allow loading a HXL
dataset directly into a browser client and manipulating it there.

The library may eventually include integration points with popular
client-side libraries like [jQuery](http://jquery.com/),
[D3](http://d3js.org/), and [AngularJS](https://angularjs.org/) (to be
decided).

# Installation

Place the file hxl.js somewhere accessible to your HTML page, and then
include it like this (substituting the appropriate path):

```
<script src="hxl.js"></script>
```

# Tests

libhxl-js uses the [QUnit](http://qunitjs.com/) library from jQuery
for unit testing.  All of the required code is included. To run the
tests, simply open the file test/index.html in your browser.

**Note:** the bundled QUnit code is _not_ Public Domain, but is
 distributed under the [MIT
 License](http://en.wikipedia.org/wiki/MIT_License). This testing code
 is not required to deploy libhxl.js.

_TODO_
