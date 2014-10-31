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

/**
 * HXL builder
 */
function HXLBuilder(opt) {
    if (!opt) opt = {};
    this._index = -1;
    this._data = null;
}

HXLBuilder.prototype.parse = function(rawData) {
    this._rawData = rawData;
    this._index = 0;
    this.dataset = new HXLDataset();
    this.dataset.columns = this._findTagRow();

    var startRowNumber = this._index;

    rawRow = this._getRow();
    while (rawRow) {
        var row = new HXLRow({
            "values": rawRow,
            "rowNumber": this._index - 1 - startRowNumber,
            "sourceRowNumber": this._index - 1,
        });
        this.dataset.rows.push(row);
        rawRow = this._getRow();
    }

    return this.dataset;
}

HXLBuilder.prototype._findTagRow = function() {
    var rawRow = this._getRow();
    while (rawRow != null) {
        var rawRow = this._getRow();
        var columns = this._tryTagRow(rawRow);
        if (columns) {
            return columns;
        }
    }
    throw "HXL tag row not found";
}

HXLBuilder.TAG_REGEXP = /^\s*#([A-Za-z][0-9A-Za-z_]+)\s*$/;

HXLBuilder.prototype._tryTagRow = function(row) {
    var seenTag = false;
    var columns = [];
    for (i in row) {
        if (row[i]) {
            var matches = HXLBuilder.TAG_REGEXP.exec(row[i]);
            if (matches) {
                // FIXME - kludgey
                var lastRow = this._getLastRow();
                columns.push(new HXLColumn({"hxlTag": row[i], "headerString": lastRow[i], "columnNumber": i, "sourceColumnNumber": i}));
                seenTag = true;
            } else {
                return false;
            }
        }
    }
    if (seenTag) {
        return columns;
    } else {
        return false;
    }
}

HXLBuilder.prototype._getLastRow = function() {
    // FIXME this is kind of kludgey
    if (this._index > 1) {
        return this._rawData[this._index - 2];
    } else {
        return [];
    }
}

HXLBuilder.prototype._getRow = function() {
    if (this._index < this._rawData.length) {
        return this._rawData[this._index++];
    } else {
        return null;
    }
}

// end
