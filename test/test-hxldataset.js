/**
 * HXLDataset tests
 */

var TEST_DATA = [
    ['Pointless header'],
    ['Organisation', 'Sector', 'Province'],
    ['#org', '#sector+cluster', '#adm1'],
    ['Org 1', 'WASH', 'Coastal Province'],
    ['Org 2', 'Health', 'Mountain Province'],
    ['Org 3', 'Protection', 'Coastal Province']
];

QUnit.module("HXLDataset", {
    setup: function () {
        this.dataset = new HXLDataset(TEST_DATA);
    }
});

QUnit.test("dataset created", function(assert) {
    assert.ok(this.dataset);
});

QUnit.test("headers", function(assert) {
    assert.deepEqual(this.dataset.headers, TEST_DATA[1]);
});

QUnit.test("tags", function(assert) {
    assert.notDeepEqual(this.dataset.tags, TEST_DATA[2]);
    assert.deepEqual(this.dataset.displayTags, TEST_DATA[2]);
});

QUnit.test("columns", function(assert) {
    assert.deepEqual(this.dataset.columns.map(function (col) { return col.header; }), TEST_DATA[1]);
    assert.deepEqual(this.dataset.columns.map(function (col) { return col.displayTag; }), TEST_DATA[2]);
});

QUnit.test("rows", function(assert) {
    assert.deepEqual(this.dataset.rows.map(function (row) { return row.values; }), TEST_DATA.slice(3));
});

QUnit.test("iterator", function(assert) {
    var iterator = this.dataset.iterator();
    var index = 3;
    var row = null;
    while (row = iterator.next()) {
        assert.deepEqual(row.values, TEST_DATA[index]);
        index++;
    }
});

QUnit.test("values", function(assert) {
    assert.deepEqual(this.dataset.getValues('#adm1'), ['Coastal Province', 'Mountain Province']);
});

// end
