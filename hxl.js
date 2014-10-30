/**
 * JavaScript library for the Humanitarian Exchange Language (HXL).
 *
 * Started October 2014 by David Megginson
 * License: Public Domain
 * Documentation: http://hxlstandard.org
 */

/**
 * A HXL dataset
 */
function HXLDataset(url) {
    this.url = url;
    this.columns = [];
    this.rows = [];
    if (url) {
        // TODO load from URL
        // TODO maybe also accept list of data
    }
}

/**
 * A HXL column definition.
 */
function HXLColumn() {
    this.headerString = [];
    this.hxlTag = [];
    this.lang = [];
    this.columnNumber = -1;
    this.sourceColumnNumber = -1;
}

/**
 * A row of HXL data.
 */
function HXLRow() {
    this.values = [];
    this.rowNumber = -1;
    this.sourceRowNumber = -1;
}

/**
 * Get one value for a HXL tag.
 */
HXLRow.prototype.get = function(hxlTag, index) {
    if (typeof(index) == undefined) index = 0;
    // TODO
}

/**
 * Get all values for a HXL tag.
 */
HXLRow.prototype.getAll = function(hxlTag) {
    // TODO
}

// end
