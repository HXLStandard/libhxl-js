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
QUnit.module("HXLTagPattern", {
    setup: function () {
        this.pattern = HXLTagPattern.parse("#adm1+code-iso");
        this.column = HXLColumn.parse("#adm1+code+pcode", "Region");
    }
});

QUnit.test("pattern created", function(assert) {
    assert.ok(this.pattern);
});

QUnit.test("tag ok", function(assert) {
    assert.equal(this.pattern.tag, "#adm1");
});

QUnit.test("include ok", function(assert) {
    assert.deepEqual(['code'], this.pattern.include_attributes);
});

QUnit.test("exclude ok", function(assert) {
    assert.deepEqual(['iso'], this.pattern.exclude_attributes);
});

// end
