/**
 * Unit tests for libhxl-js
 *
 * Run in your browser by opening the file index.html
 *
 * Started October 2014 by David Megginson
 */

// HXLDataset tests

QUnit.test("create dataset", function(assert) {
    var dataset = new HXLDataset();
    assert.ok(dataset, "created dataset");
    assert.equal(dataset.url, null, "dataset.url defaults to null");
});

QUnit.test("dataset constructor params", function(assert) {
    var url = 'http://example.org/dataset.csv';

    var dataset = new HXLDataset({"url": url});
    assert.equal(dataset.url, url, "dataset.url assigned in constructor");
});

// HXLColumn tests

QUnit.test("create column", function(assert) {
    var column = new HXLColumn();
    assert.ok(column, "created column");
    assert.equal(column.hxlTag, null, "column.hxlTag defaults to null");
    assert.equal(column.lang, null, "column.lang defaults to null");
    assert.equal(column.headerString, null, "column.headerString defaults to null");
    assert.equal(column.columnNumber, -1, "column.columnNumber defaults to -1");
    assert.equal(column.sourceColumnNumber, -1, "column.sourceColumnNumber defaults to -1");
});

QUnit.test("column constructor params", function(assert) {
    var hxlTag = "#org";
    var lang = "fr";
    var headerString = "Organisation";
    var columnNumber = 5;
    var sourceColumnNumber = 4;

    var column = new HXLColumn({
        "hxlTag": hxlTag,
        "lang": lang,
        "headerString": headerString,
        "columnNumber": columnNumber,
        "sourceColumnNumber": sourceColumnNumber
    });
    assert.equal(column.hxlTag, hxlTag, "column.hxlTag assigned in constructor");
    assert.equal(column.lang, lang, "column.lang assigned in constructor");
    assert.equal(column.headerString, headerString, "column.headerString assigned in constructor");
    assert.equal(column.columnNumber, columnNumber, "colum.columnNumber assigned in constructor");
    assert.equal(column.sourceColumnNumber, sourceColumnNumber, "colum.sourceColumnNumber assigned in constructor");
});

// HXLRow tests

QUnit.test("create row", function(assert) {
    var row = new HXLRow();
    assert.ok(row, "created row");
    assert.equal(row.rowNumber, -1, "row.rowNumber defaults to -1");
    assert.equal(row.sourceRowNumber, -1, "row.sourceRowNumber defaults to -1");
    assert.deepEqual(row.values, [], "row.values defaults to []");
});

QUnit.test("row constructor params", function(assert) {
    var rowNumber = 5;
    var sourceRowNumber = 7;
    var values = ['a', 'b', 'c'];

    var row = new HXLRow({
        'rowNumber': rowNumber,
        'sourceRowNumber': sourceRowNumber,
        'values': values
    });
    assert.ok(row, "created row");
    assert.equal(row.rowNumber, rowNumber, "row.rowNumber defaults to -1");
    assert.equal(row.sourceRowNumber, sourceRowNumber, "row.sourceRowNumber defaults to -1");
    assert.deepEqual(row.values, values, "row.values defaults to []");
});

QUnit.test("row value lookups", function(assert) {
    var tag = "#org";
    var value1 = "UNICEF";
    var value2 = "Save the Children";

    var columns = [
        new HXLColumn({"hxlTag": "#country"}),
        new HXLColumn({"hxlTag": tag}),
        new HXLColumn({"hxlTag": tag})
    ];
    var values = ['Colombia', value1, value2];

    var row = new HXLRow({"columns": columns, "values": values});
    assert.equal(row.get(tag), value1, "row.get(tag)");
    assert.equal(row.get(tag, 0), value1, "row.get(tag, 0)");
    assert.equal(row.get(tag, 1), value2, "row.get(tag, 1)");

    assert.deepEqual(row.getAll(tag), [value1, value2], "row.getAll(tag)");
    
});

// end
