/**
 * hxl.classes.Dataset tests
 */

QUnit.module("hxl.classes.Dataset", {
    setup: function () {
        this.test_data = [
            ['Pointless header'],
            ['Organisation', 'Sector', 'Province'],
            ['#org', '#sector+cluster', '#adm1'],
            ['Org 1', 'WASH', 'Coastal Province'],
            ['Org 2', 'Health', 'Mountain Province'],
            ['Org 3', 'Protection', 'Coastal Province']
        ];
        this.dataset = new hxl.classes.Dataset(this.test_data);
    }
});

QUnit.test("dataset created", function(assert) {
    assert.ok(this.dataset);
});

QUnit.test("headers", function(assert) {
    assert.deepEqual(this.dataset.headers, this.test_data[1]);
});

QUnit.test("tags", function(assert) {
    assert.notDeepEqual(this.dataset.tags, this.test_data[2]);
    assert.deepEqual(this.dataset.displayTags, this.test_data[2]);
});

QUnit.test("columns", function(assert) {
    assert.deepEqual(this.dataset.columns.map(function (col) { return col.header; }), this.test_data[1]);
    assert.deepEqual(this.dataset.columns.map(function (col) { return col.displayTag; }), this.test_data[2]);
});

QUnit.test("rows", function(assert) {
    assert.deepEqual(this.dataset.rows.map(function (row) { return row.values; }), this.test_data.slice(3));
});

QUnit.test("iterator", function(assert) {
    var iterator = this.dataset.iterator();
    var index = 3;
    var row = null;
    while (row = iterator.next()) {
        assert.deepEqual(row.values, this.test_data[index]);
        index++;
    }
});

QUnit.test("each", function(assert) {
    var test_data = this.test_data;
    assert.equal(this.dataset.each(function (row, dataset, rowNumber) {
        assert.deepEqual(row.values, test_data[rowNumber + 3]);
    }), 3);
});

QUnit.test("values", function(assert) {
    assert.deepEqual(this.dataset.getValues('#adm1'), ['Coastal Province', 'Mountain Province']);
});

// end
