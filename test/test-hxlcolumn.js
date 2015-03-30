/**
 * Unit tests for libhxl-js
 *
 * Run in your browser by opening the file index.html
 *
 * Started October 2014 by David Megginson
 */

var TEST_DATA = [
    ['Organisation', 'Sector', 'Province'],
    ['#org', '#sector', '#adm1'],
    ['Org 1', 'WASH', 'Coastal Province'],
    ['Org 2', 'Health', 'Mountain Province'],
    ['Org 3', 'Protection', 'Coastal Province']
];


/**
 * HXLDataset tests
 */
QUnit.module("HXLColumn", {
    setup: function () {
        this.column = HXLColumn.parse("#adm1+code+pcode", "Region");
    }
});

QUnit.test("column created", function(assert) {
    assert.ok(this.column);
});

QUnit.test("header ok", function(assert) {
    assert.equal(this.column.header, "Region");
});

QUnit.test("tag parsed", function(assert) {
    assert.equal(this.column.tag, "#adm1");
});

QUnit.test("attributes ok", function(assert) {
    assert.equal(this.column.attributes.length, 2);
    assert.ok(this.column.attributes.indexOf("code") > -1);
    assert.ok(this.column.attributes.indexOf("pcode") > -1);
});

QUnit.test("display tag", function(assert) {
    assert.equal(this.column.displayTag(), "#adm1+code+pcode");
});

QUnit.test("bad tag", function(assert) {

    assert.ok(HXLColumn.parse("#0abc") === null);

    var seen_exception = false;
    try {
        HXLColumn.parse("#0abc", null, true);
    } catch (e) {
        seen_exception = true;
    }
    assert.ok(seen_exception);
});


// end
