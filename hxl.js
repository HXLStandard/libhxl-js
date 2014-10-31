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
function HXLDataset(opt) {
    if (!opt) opt = {};
    this.url = _default_arg(opt.url, null);
    this.columns = _default_arg(opt.columns, []);;
    this.rows = _default_arg(opt.rows, []);
}

/**
 * A HXL column definition.
 */
function HXLColumn(opt) {
    if (!opt) opt = {};
    this.hxlTag = _default_arg(opt.hxlTag, null);
    this.lang = _default_arg(opt.lang, null);
    this.headerString = _default_arg(opt.headerString, null);
    this.columnNumber = _default_arg(opt.columnNumber, -1);
    this.sourceColumnNumber = _default_arg(opt.sourceColumnNumber, -1);
}

/**
 * A row of HXL data.
 */
function HXLRow(opt) {
    if (!opt) opt = {};
    this.rowNumber = _default_arg(opt.rowNumber, -1);
    this.sourceRowNumber = _default_arg(opt.sourceRowNumber, -1)
    this.values = _default_arg(opt.values, []);
    this.columns = _default_arg(opt.columns, []);
}

/**
 * Get one value for a HXL tag.
 */
HXLRow.prototype.get = function(hxlTag, index) {
    index = _default_arg(index, 0);
    for (i in this.columns) {
        if (this.columns[i].hxlTag == hxlTag) {
            if (index == 0) {
                return this.values[i];
            }
            index -= 1;
        }
    }
    return false;
}

/**
 * Get all values for a HXL tag.
 */
HXLRow.prototype.getAll = function(hxlTag) {
    values = [];
    for (i in this.columns) {
        if (this.columns[i].hxlTag == hxlTag) {
            values.push(this.values[i]);
        }
    }
    return values;
}

// end
