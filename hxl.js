/**
 * JavaScript library for the Humanitarian Exchange Language (HXL).
 *
 * Started October 2014 by David Megginson
 * License: Public Domain
 * Documentation: http://hxlstandard.org
 */

function _default_arg(value, default_value) {
    if (typeof(value) === 'undefined') {
        return default_value;
    } else {
        return value;
    }
}

/**
 * A HXL dataset
 */
function HXLDataset(url) {
    this.url = url;
    this.columns = [];
    this.rows = [];
}

/**
 * A HXL column definition.
 */
function HXLColumn(hxlTag, lang, headerString, columnNumber, sourceColumnNumber) {
    this.hxlTag = _default_arg(hxlTag, null);
    this.lang = _default_arg(lang, null);
    this.headerString = _default_arg(headerString, null);
    this.columnNumber = _default_arg(columnNumber, -1);
    this.sourceColumnNumber = _default_arg(sourceColumnNumber, -1);
}

/**
 * A row of HXL data.
 */
function HXLRow(rowNumber, sourceRowNumber, values) {
    this.rowNumber = _default_arg(rowNumber, -1);
    this.sourceRowNumber = _default_arg(sourceRowNumber, -1)
    this.values = _default_arg(values, []);
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
