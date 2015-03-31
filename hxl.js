/**
 * Simple HXL library.
 *
 * This isn't a full-featured HXL library; it focusses on datasets
 * that have already had tags expanded, and includes mainly filtering
 * operations that are useful to support mapping and visualisation.
 *
 * @author David Megginson
 * @date Started 2015-02
 */


////////////////////////////////////////////////////////////////////////
// HXLDataset class
////////////////////////////////////////////////////////////////////////

/**
 * Top-level wrapper for a HXL dataset.
 */
function HXLDataset(rawData) {
    this._rawData = rawData;
    this._tagRowIndex = null;
    this._savedColumns = null;
    Object.defineProperty(this, 'headers', {
        enumerable: true,
        get: HXLDataset.prototype.getHeaders
    });
    Object.defineProperty(this, 'tags', {
        enumerable: true,
        get: HXLDataset.prototype.getTags
    });
    Object.defineProperty(this, 'displayTags', {
        enumerable: true,
        get: HXLDataset.prototype.getDisplayTags
    });
    Object.defineProperty(this, 'columns', {
        enumerable: true,
        get: HXLDataset.prototype.getColumns
    });
}

/**
 * Get an array of string headers.
 */
HXLDataset.prototype.getHeaders = function () {
    return this.columns.map(function (col) { return col.header; });
}

/**
 * Get an array of tags.
 */
HXLDataset.prototype.getTags = function () {
    return this.columns.map(function (col) { return col.tag; });
}

/**
 * Get an array of tags.
 */
HXLDataset.prototype.getDisplayTags = function () {
    return this.columns.map(function (col) { return col.displayTag; });
}

/**
 * Get an array of column definitions.
 */
HXLDataset.prototype.getColumns = function() {
    if (this._savedColumns == null) {
        var cols = [];
        var tags_index = this._getTagRowIndex();
        if (tags_index > -1) {
            for (var i = 0; i < this._rawData[tags_index].length; i++) {
                var tagspec = this._rawData[tags_index][i];
                var header = null;
                if (tags_index > 0) {
                    header = this._rawData[tags_index-1][i];
                }
                cols.push(HXLColumn.parse(tagspec, header, true));
            }
            this._savedColumns = cols;
        } else {
            throw "No HXL hashtag row found.";
        }
    }
    return this._savedColumns;
}

/**
 * Get the minimum value for a column
 */
HXLDataset.prototype.getMin = function(pattern) {
    var iterator = this.iterator();
    var min = null;
    var row;

    pattern = HXLTagPattern.parse(pattern); // more efficient to precompile
    while (row = iterator.next()) {
        var value = row.get(pattern);
        if (min === null || (value !== null && value < min)) {
            min = value;
        }
    }
    return min;
}

/**
 * Get the minimum value for a column
 */
HXLDataset.prototype.getMax = function(pattern) {
    var iterator = this.iterator();
    var max = null;
    var row;

    pattern = HXLTagPattern.parse(pattern); // more efficient to precompile
    while (row = iterator.next()) {
        var value = row.get(pattern);
        if (max === null || (value !== null && value > max)) {
            max = value;
        }
    }
    return max;
}

/**
 * Get a list of unique values for a tag
 */
HXLDataset.prototype.getValues = function(pattern) {
    var iterator = this.iterator();
    var value_map = {};
    var row;

    pattern = HXLTagPattern.parse(pattern); // more efficient to precompile
    while (row = iterator.next()) {
        value_map[row.get(pattern)] = true;
    }
    return Object.keys(value_map);
}

/**
 * Get an iterator through all the rows in the dataset.
 */
HXLDataset.prototype.iterator = function() {
    var index = this._getTagRowIndex() + 1;
    var columns = this.columns;
    var rawData = this._rawData;
    return {
        next: function() {
            if (index < rawData.length) {
                return new HXLRow(rawData[index++], columns);
            } else {
                return null;
            }
        }
    };
}

/**
 * Get the index of the tag row.
 */
HXLDataset.prototype._getTagRowIndex = function() {
    if (this._tagRowIndex == null) {
        for (var i = 0; i < 25 && i < this._rawData.length; i++) {
            if (this._isTagRow(this._rawData[i])) {
                this._tagRowIndex = i;
                return this._tagRowIndex;
            }
        }
        throw "No HXL tag row found."
    } else {
        return this._tagRowIndex;
    }
}

HXLDataset.prototype._isTagRow = function(row) {
    var seenTag = false;
    var seenNonTag = false;
    for (var i = 0; i < row.length; i++) {
        if (row[i]) {
            if (HXLTagPattern.parse(row[i])) {
                seenTag = true;
            } else {
                seenNonTag = true;
            }
        }
    }
    return (seenTag && !seenNonTag);
}

////////////////////////////////////////////////////////////////////////
// HXLColumn class
////////////////////////////////////////////////////////////////////////

/**
 * Wrapper for a HXL column definition.
 */
function HXLColumn(tag, attributes, header) {
    this.tag = tag;
    this.attributes = attributes;
    this.header = header;
    Object.defineProperty(this, 'displayTag', {
        enumerable: true,
        get: HXLColumn.prototype.getDisplayTag
    });
}

/**
 * Create a display tagspec for the column.
 */
HXLColumn.prototype.getDisplayTag = function() {
    return [this.tag].concat(this.attributes.sort()).join('+');
};

/**
 * Parse a tag spec into its parts.
 */
HXLColumn.parse = function(spec, header, use_exception) {
    result = spec.match(/^\s*(#[A-Za-z][A-Za-z0-9_]*)((\s*\+[A-Za-z][A-Za-z0-9_]*)*)?\s*$/);
    if (result) {
        var attributes = []
        if (result[2]) {
            // filter out empty values
            attributes = result[2].split(/\s*\+/).filter(function(attribute) { return attribute; });
        }
        return new HXLColumn(result[1], attributes, header);
    } else if (use_exception) {
        throw "Bad tag specification: " + spec;
    } else {
        return null;
    }
}


////////////////////////////////////////////////////////////////////////
// HXLTagPattern class
////////////////////////////////////////////////////////////////////////

/**
 * Wrapper for a HXL column definition.
 */
function HXLTagPattern(tag, include_attributes, exclude_attributes) {
    this.tag = tag;
    this.include_attributes = include_attributes;
    this.exclude_attributes = exclude_attributes;
}

HXLTagPattern.prototype.match = function(column) {

    // tags must match
    if (this.tag != column.tag) {
        return false;
    }

    // include attributes must be present
    for (i = 0; i < this.include_attributes.length; i++) {
        attribute = this.include_attributes[i];
        if (column.attributes.indexOf(attribute) < 0) {
            return false;
        }
    }

    // exclude attributes must not be present
    for (i = 0; i < this.exclude_attributes.length; i++) {
        attribute = this.exclude_attributes[i];
        if (column.attributes.indexOf(attribute) > -1) {
            return false;
        }
    }

    return true;
}

HXLTagPattern.parse = function(pattern, use_exception) {
    if (pattern instanceof HXLTagPattern) {
        // If this is already parsed, then just return it.
        return pattern;
    } else {
        var result = pattern.match(/^\s*(#[A-Za-z][A-Za-z0-9_]*)((?:\s*[+-][A-Za-z][A-Za-z0-9_]*)*)\s*$/);
        if (result) {
            var include_attributes = [];
            var exclude_attributes = [];
            var attribute_specs = result[2].split(/\s*([+-])/).filter(function(item) { return item; });
            for (i = 0; i < attribute_specs.length; i += 2) {
                if (attribute_specs[i] == "+") {
                    include_attributes.push(attribute_specs[i+1]);
                } else {
                    exclude_attributes.push(attribute_specs[i+1]);
                }
            }
            return new HXLTagPattern(result[1], include_attributes, exclude_attributes);
        } else if (use_exception) {
            throw "Bad tag pattern: " + pattern;
        } else {
            return null;
        }
    }
}

HXLTagPattern.toString = function() {
    var s = this.tag;
    if (this.include_tags) {
        s += "+" + this.include_tags.join("+");
    }
    if (this.exclude_tags) {
        s += "-" + this.exclude_tags.join("-");
    }
    return s;
}

////////////////////////////////////////////////////////////////////////
// HXLRow class
////////////////////////////////////////////////////////////////////////

/**
 * Wrapper for a row of HXL data.
 */
function HXLRow(values, columns) {
    this.values = values;
    this.columns = columns;
}

/**
 * Look up a value by tag.
 */
HXLRow.prototype.get = function(pattern) {
    pattern = HXLTagPattern.parse(pattern, true);
    for (var i = 0; i < this.columns.length && i < this.values.length; i++) {
        if (pattern.match(this.columns[i])) {
            return this.values[i];
        }
    }
    return null;
}

/**
 * Look up all values with a specific tag.
 */
HXLRow.prototype.getAll = function(pattern) {
    pattern = HXLTagPattern.parse(pattern, true);
    values = [];
    for (var i = 0; i < this.columns.length && i < this.values.length; i++) {
        if (pattern.match(this.columns[i])) {
            values.push(this.values[i]);
        }
    }
    return values;
}

////////////////////////////////////////////////////////////////////////
// HXLFilter base class (override for specific filters).
////////////////////////////////////////////////////////////////////////

function HXLFilter(dataset) {
    this.dataset = dataset;
    Object.defineProperty(this, 'headers', {
        enumerable: true,
        get: HXLDataset.prototype.getHeaders
    });
    Object.defineProperty(this, 'tags', {
        enumerable: true,
        get: HXLDataset.prototype.getTags
    });
    Object.defineProperty(this, 'columns', {
        enumerable: true,
        get: HXLDataset.prototype.getColumns
    });
}

HXLFilter.prototype.getHeaders = function() {
    return this.dataset.getHeaders();
}

HXLFilter.prototype.getTags = function() {
    return this.dataset.getTags();
}

HXLFilter.prototype.getColumns = function() {
    return this.dataset.getColumns();
}

HXLFilter.prototype.iterator = function() {
    return this.dataset.iterator();
}
