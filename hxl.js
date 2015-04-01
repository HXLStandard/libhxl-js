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

/**
 * Return this data source wrapped in a HXLSelectFilter
 *
 * @param predicates a list of patterns and predicates.  See
 * HXLSelectFilter for details.
 * @return a new data source, including only selected data rows.
 */
HXLSource.prototype.select = function(predicates) {
    return new HXLSelectFilter(this, predicates);
}

/**
 * Return this data source wrapped in a HXLCutFilter
 *
 * @param blacklist a list of tag patterns that may not be included.
 * @param whitelist (optional) if present, only tag patterns in this list may be included.
 * @return a new data source, including only selected columns.
 */
HXLSource.prototype.cut = function(blacklist, whitelist) {
    return new HXLCutFilter(this, blacklist, whitelist);
}

/**
 * Return this data source wrapped in a HXLCountFilter
 *
 * @param patterns a list of tag patterns for which to count the
 * unique combinations 
 * @param aggregate (optional) a single numeric tag pattern for which
 * to produce aggregate values
 * @return a new data source, including the aggregated data.
 */
HXLSource.prototype.count = function(patterns, aggregate) {
    return new HXLCountFilter(this, patterns, aggregate);
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
    } else if (!pattern) {
        if (use_exception) {
            throw new Error("No tag pattern provided");
        } else {
            return null;
        }
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
 * var filter = new HXLSelectFilter(source,
 *   { pattern: '#adm1', test: 'Coastal Region' },
 *   { pattern: '#people_num', test: function(v) { return v > 1000; } }
 * ]);
 *
 * Predicates are always "OR"'d together. If you need
 * a logical "AND", then chain another select filter.
 *
 * @param source the HXLSource
 * @param predicates a list of predicates, each of 
 * has a "test" property (and optionally, a "pattern" property).
 */
function HXLSelectFilter(source, predicates) {
    HXLFilter.call(this, source);
    this.predicates = this._compile_predicates(predicates);
}

HXLSelectFilter.prototype = Object.create(HXLFilter.prototype);
HXLSelectFilter.prototype.constructor = HXLSelectFilter;

/**
 * Override HXLFIlter.iterator to return only select rows.
 *
 * @return an iterator object that will skip rows that fail to pass at
 * least one of the predicates.
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
    var i;
    for (i = 0; i < predicates.length; i++) {
        if (predicates[i].pattern) {
            predicates[i].pattern = HXLTagPattern.parse(predicates[i].pattern);
        }
    }
    return predicates;
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
        if (predicate.pattern) {
            var values = row.getAll(predicate.pattern);
            for (var j = 0; j < values.length; j++) {
                if (typeof predicate.test == 'function') {
                    // apply a function to the value
                    if (predicate.test(values[i])) {
                        return true;
                    }
                } else {
                    // compare anything else to the value
                    if (predicate.test == values[i]) {
                        return true;
                    }
                }
            }
        } 

        // If the first part is not set, then it's a row predicate
        // test the whole row at once
        else {
            if (typeof predicate.test == 'function') {
                return predicate.test(row);
            } else {
                throw new Error('Row predicates must be functions: ' + predicate.test);
            }
        }
    }
    return false;
}


////////////////////////////////////////////////////////////////////////
// HXLCutFilter class
////////////////////////////////////////////////////////////////////////

/**
 * HXL filter class to remove columns from a dataset.
 *
 * @param source the HXL data source (may be another filter).
 * @param blacklist a list of HXL tagspecs that must not be included.
 * @param whitelist if present, a list of the *only* HXL tagspecs allowed.
 */
function HXLCutFilter(source, blacklist, whitelist) {
    HXLFilter.call(this, source);

    // pre-compile the blacklist
    if (blacklist) {
        this.blacklist = blacklist.map(function (pattern) { return HXLTagPattern.parse(pattern, true); });
    } else {
        this.blacklist = [];
    }

    // pre-compile the whitelist
    if (whitelist) {
        this.whitelist = whitelist.map(function (pattern) { return HXLTagPattern.parse(pattern, true); });
    } else {
        this.whitelist = [];
    }
}

HXLCutFilter.prototype = Object.create(HXLFilter.prototype);
HXLCutFilter.prototype.constructor = HXLCutFilter;

/**
 * Override HXLFilter.getColumns to return only the allowed columns.
 *
 * This method triggers lazy processing that also saves the indices for
 * slicing the data itself.
 *
 * @return a list of HXLColumn objects.
 */
HXLCutFilter.prototype.getColumns = function() {
    var column, columns, indices, i, j, include_tag;
    if (typeof(this._savedColumns) == 'undefined') {

        // we haven't extracted the columns before, so do it now
        columns = [];
        indices = [];

        // check all of the columns against the blacklist & whiteslist
        for (i = 0; i < this.source.columns.length; i++) {

            column = this.source.columns[i];

            // start by assuming we can include the columns
            include_tag = true;

            // check the blacklist
            for (j = 0; j < this.blacklist.length; j++) {
                if (this.blacklist[j].match(column)) {
                    include_tag = false;
                }
            }

            // check the whitelist (if present)
            if (include_tag && this.whitelist) {
                for (j = 0; j < this.whitelist.length; j++) {
                    if (!this.whitelist[j].match(column)) {
                        include_tag = false;
                    }
                }
            }

            // if we survived to here, save the column and index
            if (include_tag) {
                columns.push(column);
                indices.push(i);
            }
        }

        // save the columns and indices for future use
        this._savedColumns = columns;
        this._savedIndices = indices;
    }

    // return the saved columns
    return this._savedColumns;
}

/**
 * Override HXLFilter.iterator to get data with some columns removed.
 *
 * @return an iterator object to read the modified data rows.
 */
HXLCutFilter.prototype.iterator = function () {
    var outer = this;
    var iterator = this.source.iterator();
    return {
        next: function() {
            var i, values;
            var columns = outer.columns; // will trigger lazy column processing
            var row = iterator.next();
            if (row) {
                // Use the saved indices to slice values
                values = [];
                for (i = 0; i < outer._savedIndices.length; i++) {
                    values.push(row.values[outer._savedIndices[i]]);
                }
                return new HXLRow(values, columns);
            } else {
                // end of data
                return null;
            }
        }
    }
}


////////////////////////////////////////////////////////////////////////
// HXLCountFilter class
////////////////////////////////////////////////////////////////////////

/**
 * HXL filter to count and aggregate data.
 *
 * By default, this filter put out a dataset with the selected tags
 * and a new tag #count_num giving the number of times each
 * combination of values appears. If the aggregate tag pattern is
 * present, the filter will also produce a column with the sum,
 * average (mean), minimum, and maximum values for the tag, attaching
 * the attributes +sum, +avg, +min, and +max to the core tag.
 *
 * @param source the HXL data source (may be another filter).
 * @param patterns a list of tag patterns (strings or HXLTagPattern
 * objects) whose values make up a shared key.
 */
function HXLCountFilter(source, patterns, aggregate) {
    HXLFilter.call(this, source);
    if (patterns) {
        this.patterns = patterns.map(function (pattern) { return HXLTagPattern.parse(pattern, true); });
    } else {
        throw new Error("No tag patterns specified");
    }
    if (aggregate) {
        this.aggregate = HXLTagPattern.parse(aggregate, true);
    } else {
        this.aggregate = null;
    }
}

HXLCountFilter.prototype = Object.create(HXLFilter.prototype);
HXLCountFilter.prototype.constructor = HXLCountFilter;

/**
 * Override HXLFilter.getColumns to return only the columns for the aggregation report.
 *
 * Will list the tags that match the patterns provided in the
 * constructor, as well as a #count_num tag, and aggregation tags if
 * the aggregation parameter was included.
 *
 * @return a list of HXLColumn objects
 */
HXLCountFilter.prototype.getColumns = function() {
    var cols, indices, tagspec;
    if (!this._savedColumns) {
        cols = [];
        indices = [];
        for (var i = 0; i < this.source.columns.length; i++) {
            for (var j = 0; j < this.patterns.length; j++) {
                if (this.patterns[j].match(this.source.columns[i])) {
                    cols.push(this.source.columns[i]);
                    indices.push(i);
                    break;
                }
            }
        }
        cols.push(HXLColumn.parse('#count_num'));
        if (this.aggregate) {
            tagspec = this.aggregate.tag;
            cols.push(HXLColumn.parse(tagspec + '+sum'));
            cols.push(HXLColumn.parse(tagspec + '+avg'));
            cols.push(HXLColumn.parse(tagspec + '+min'));
            cols.push(HXLColumn.parse(tagspec + '+max'));
        }
        this._savedColumns = cols;
        this._savedIndices = indices;
    }
    return this._savedColumns;
}

/**
 * Override HXLFilter.iterator to return a set of rows with aggregated values.
 *
 * Each row represents a unique set of values and the number of times
 * it occurs.
 *
 * @return an iterator over the aggregated data.
 */
HXLCountFilter.prototype.iterator = function() {
    var columns = this.columns; // will trigger lazy column creation
    var data = this._aggregateData();
    var pos = 0;
    return {
        next: function () {
            if (pos < data.length) {
                return new HXLRow(data[pos++], columns);
            } else {
                return null;
            }
        }
    };
}

/**
 * Monster ugly function to aggregate data.
 * FIXME: can I decompose this into smaller parts?
 */
HXLCountFilter.prototype._aggregateData = function() {
    var row, key, values, value, entry, aggregates;
    var data_map = {};
    var aggregate_map = {};
    var data = [];
    var iterator = this.source.iterator();

    // Make a unique map of data values
    while (row = iterator.next()) {
        key = this._makeKey(row);

        // Always do a count
        if (data_map[key]) {
            data_map[key] += 1;
        } else {
            data_map[key] = 1;
        }

        // Aggregate numeric values if requested
        if (this.aggregate) {
            // try parsing, and proceed only if it's numeric
            value = parseFloat(row.get(this.aggregate));
            if (!isNaN(value)) {
                entry = aggregate_map[key];
                if (entry) {
                    // Not the first value
                    entry.total++;
                    entry.sum += value;
                    entry.avg = (entry.avg * (entry.total - 1) + value) / entry.total;
                    entry.min = (value < entry.min ? value : entry.min);
                    entry.max = (value > entry.max ? value : entry.max);
                } else {
                    // the first value
                    aggregate_map[key] = {
                        total: 1,
                        sum: value,
                        avg: value,
                        min: value,
                        max: value
                    }
                }
            }
        }
    }

    // Generate the data from the map
    for (key in data_map) {

        // Retrieve the values from the key
        values = key.split("\0");

        // Add the count
        values.push(data_map[key]);

        // Add other aggregates if requested
        if (this.aggregate) {
            entry = aggregate_map[key];
            if (entry) {
                values = values.concat([
                    entry.sum,
                    entry.avg,
                    entry.min,
                    entry.max
                ]);
            } else {
                values = values.concat([
                    '', '', '', ''
                ]);
            }
        }

        // Row is finished.
        data.push(values);
    }

    // return all the rows
    return data;
}

/**
 * Construct a unique key from the requested values in a row of data.
 *
 * @return the unique key as a single string.
 */
HXLCountFilter.prototype._makeKey = function(row) {
    var i, index;
    var values = [];
    for (i = 0; i < this._savedIndices.length; i++) {
        values.push(row.values[this._savedIndices[i]]);
    }
    return values.join("\0");
}

// end
