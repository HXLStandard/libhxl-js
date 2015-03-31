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
// HXLSource class
////////////////////////////////////////////////////////////////////////

/**
 * Abstract base class for any HXL data source.
 * Derived classes must define getColumns() and iterator()
 */
function HXLSource() {
    var prototype = Object.getPrototypeOf(this);
    Object.defineProperty(this, 'columns', {
        enumerable: true,
        get: prototype.getColumns
    });
    Object.defineProperty(this, 'rows', {
        enumerable: true,
        get: prototype.getRows
    });
    Object.defineProperty(this, 'headers', {
        enumerable: true,
        get: prototype.getHeaders
    });
    Object.defineProperty(this, 'tags', {
        enumerable: true,
        get: prototype.getTags
    });
    Object.defineProperty(this, 'displayTags', {
        enumerable: true,
        get: prototype.getDisplayTags
    });
}

/**
 * Get an array of row objects.
 *
 * This method might be highly inefficient, depending on the
 * implementation in the derived class. Normally, it's best
 * to go through the rows using an iterator.
 *
 * @return An array of HXLRow objects.
 */
HXLSource.prototype.getRows = function () {
    var row;
    var rows = [];
    var iterator = this.iterator();
    while (row = iterator.next()) {
        rows.push(row);
    }
    return rows;
}

/**
 * Get an array of string headers.
 */
HXLSource.prototype.getHeaders = function () {
    return this.columns.map(function (col) { return col.header; });
}

/**
 * Get an array of tags.
 */
HXLSource.prototype.getTags = function () {
    return this.columns.map(function (col) { return col.tag; });
}

/**
 * Get an array of tagspecs.
 */
HXLSource.prototype.getDisplayTags = function () {
    return this.columns.map(function (col) { return col.displayTag; });
}

/**
 * Get the minimum value for a column
 */
HXLSource.prototype.getMin = function(pattern) {
    var min, row, value;
    var iterator = this.iterator();
    var pattern = HXLTagPattern.parse(pattern); // more efficient to precompile
    while (row = iterator.next()) {
        value = row.get(pattern);
        if (min === null || (value !== null && value < min)) {
            min = value;
        }
    }
    return min;
}

/**
 * Get the minimum value for a column
 */
HXLSource.prototype.getMax = function(pattern) {
    var max, row, value;
    var iterator = this.iterator();

    pattern = HXLTagPattern.parse(pattern); // more efficient to precompile
    while (row = iterator.next()) {
        value = row.get(pattern);
        if (max === null || (value !== null && value > max)) {
            max = value;
        }
    }
    return max;
}

/**
 * Get a list of unique values for a tag
 */
HXLSource.prototype.getValues = function(pattern) {
    var row;
    var iterator = this.iterator();
    var value_map = {};

    pattern = HXLTagPattern.parse(pattern); // more efficient to precompile
    while (row = iterator.next()) {
        value_map[row.get(pattern)] = true;
    }
    return Object.keys(value_map);
}


////////////////////////////////////////////////////////////////////////
// HXLDataset class
////////////////////////////////////////////////////////////////////////

/**
 * An original HXL dataset (including the raw data)
 * Derived from HXLSource
 */
function HXLDataset(rawData) {
    HXLSource.call(this);
    this._rawData = rawData;
    this._tagRowIndex = null;
    this._savedColumns = null;
}

HXLDataset.prototype = Object.create(HXLSource.prototype);
HXLDataset.prototype.constructor = HXLDataset;

/**
 * Get an array of column definitions.
 */
HXLDataset.prototype.getColumns = function() {
    var cols, tags_index, tagspec, header;
    if (this._savedColumns == null) {
        cols = [];
        tags_index = this._getTagRowIndex();
        if (tags_index > -1) {
            for (var i = 0; i < this._rawData[tags_index].length; i++) {
                tagspec = this._rawData[tags_index][i];
                header = null;
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
    var i;
    if (this._tagRowIndex == null) {
        for (i = 0; i < 25 && i < this._rawData.length; i++) {
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
    var seenTag, seenNonTag, i;
    for (i = 0; i < row.length; i++) {
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
    var result = spec.match(/^\s*(#[A-Za-z][A-Za-z0-9_]*)((\s*\+[A-Za-z][A-Za-z0-9_]*)*)?\s*$/);
    var attributes = [];
    if (result) {
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
    var attribute, i;

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
    var result, include_attributes, exclude_attributes, attribute_specs, i;
    if (pattern instanceof HXLTagPattern) {
        // If this is already parsed, then just return it.
        return pattern;
    } else {
        result = pattern.match(/^\s*(#[A-Za-z][A-Za-z0-9_]*)((?:\s*[+-][A-Za-z][A-Za-z0-9_]*)*)\s*$/);
        if (result) {
            include_attributes = [];
            exclude_attributes = [];
            attribute_specs = result[2].split(/\s*([+-])/).filter(function(item) { return item; });
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
    var i;
    pattern = HXLTagPattern.parse(pattern, true);
    for (i = 0; i < this.columns.length && i < this.values.length; i++) {
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
    var i;
    var pattern = HXLTagPattern.parse(pattern, true);
    var values = [];
    for (i = 0; i < this.columns.length && i < this.values.length; i++) {
        if (pattern.match(this.columns[i])) {
            values.push(this.values[i]);
        }
    }
    return values;
}

////////////////////////////////////////////////////////////////////////
// HXLFilter base class (override for specific filters).
////////////////////////////////////////////////////////////////////////

function HXLFilter(source) {
    HXLSource.call(this);
    this.source = source;
}

HXLFilter.prototype = Object.create(HXLSource.prototype);
HXLFilter.prototype.constructor = HXLFilter;

HXLFilter.prototype.getColumns = function() {
    return this.source.getColumns();
}

HXLFilter.prototype.iterator = function() {
    return this.source.iterator();
}


////////////////////////////////////////////////////////////////////////
// HXLSelectFilter class
////////////////////////////////////////////////////////////////////////

/**
 * HXL filter class to select rows from a source.
 *
 * Usage:
 *
 * // select all rows where #adm1 is the Coastal Region
 * // *or* the population is greater than 1,000
 * var filter = new HXLSelectFilter(source, [
 *   ['#adm1', 'Coastal Region'],
 *   ['#people_num', function(v) { return v > 1000; }]
 * ]);
 *
 * Predicates are always "OR"'d together. If you need
 * a logical "AND", then chain another select filter.
 *
 * @param source the HXLSource
 * @param predicates a list of predicates, each of 
 * which is a list of two items.
 */
function HXLSelectFilter(source, predicates) {
    HXLFilter.call(this, source);
    this.predicates = this._compile_predicates(predicates);
    console.log(this.predicates);
}

HXLSelectFilter.prototype = Object.create(HXLFilter.prototype);
HXLSelectFilter.prototype.constructor = HXLSelectFilter;

/**
 * Filtering iterator.
 */
HXLSelectFilter.prototype.iterator = function() {
    var iterator = this.source.iterator();
    var outer = this;
    return {
        next: function() {
            var row;
            while (row = iterator.next()) {
                if (outer._try_predicates(row)) {
                    return row;
                }
            }
            return null;
        }
    }
}

/**
 * Precompile the tag patterns in the predicates.
 */
HXLSelectFilter.prototype._compile_predicates = function(predicates) {
    return predicates.map(function(predicate) {
        if (predicate[0]) {
            return [HXLTagPattern.parse(predicate[0]), predicate[1]];
        } else {
            return [null, predicate[1]];
        }
    });
}

/**
 * Return success if _any_ of the predicates succeeds.
 */
HXLSelectFilter.prototype._try_predicates = function(row) {
    var predicate;

    // Try every predicate on the row
    for (var i = 0; i < this.predicates.length; i++) {
        predicate = this.predicates[i];

        // If the first part is set, then it's a tag pattern
        // test only the values with hashtags that match
        if (predicate[0]) {
            var values = row.getAll(predicate[0]);
            for (var j = 0; j < values.length; j++) {
                if (typeof predicate[1] == 'function') {
                    // apply a function to the value
                    if (predicate[1](values[i])) {
                        return true;
                    }
                } else {
                    // compare anything else to the value
                    if (predicate[1] == values[i]) {
                        return true;
                    }
                }
            }
        } 

        // If the first part is not set, then it's a row predicate
        // test the whole row at once
        else {
            if (typeof predicate[1] == 'function') {
                return predicate[1](row);
            } else {
                throw new Error('Row predicates must be functions: ' + predicate[1]);
            }
        }
    }
    return false;
}
