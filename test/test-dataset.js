/**
 * hxl.classes.Dataset tests
 */

QUnit.module("hxl.classes.Dataset", {
    setup: function () {
        this.test_data = [
            ['Pointless header'],
            ['Organisation', 'Second organisation', 'Sector', 'Province', 'Number reached'],
            ['#org', '#org', '#sector+cluster', '#adm1', '#reached'],
            ['Org 1', 'Org 1b', 'WASH', 'Coastal Province', '200'],
            ['Org 2', '', 'Health', 'Mountain Province', '300'],
            ['Org 3', '', 'Protection', 'Coastal Province', '400']
        ];
        this.dataset = new hxl.wrap(this.test_data);
    }
});

QUnit.test("dataset created", function(assert) {
    assert.ok(this.dataset);
});

QUnit.test("object-style JSON", function(assert) {
    let data = [
        {'#org': 'Org 1', '#sector+cluster': 'WASH', '#adm1': 'Coastal Province', '#reached': '200'},
        {'#org': 'Org 2', '#adm1': 'Mountain Province', '#reached': '300'},
        {'#org': 'Org 3', '#reached': '400', '#sector+cluster': 'Protection', '#adm1': 'Coastal Province'}
    ];
    dataset = hxl.wrap(data);
    assert.deepEqual(dataset.displayTags, ['#org', '#sector+cluster', '#adm1', '#reached']);
    assert.deepEqual(dataset.rawData, [
        ["Org 1", "WASH", "Coastal Province", "200"],
        ["Org 2", "", "Mountain Province", "300"],
        ["Org 3", "Protection", "Coastal Province", "400"]
    ]);
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

QUnit.test("dataset export", function(assert) {
    assert.deepEqual(this.dataset.exportArray(), this.test_data.slice(1));
    assert.deepEqual(this.dataset.exportArray(false), this.test_data.slice(1));
    assert.deepEqual(this.dataset.exportArray(true), this.test_data.slice(2));
});

QUnit.test("partly-tagged dataset", function(assert) {
    // confirm no null columns when not tagged
    var dataset = hxl.wrap([
        ['header', 'header', 'header'],
        ['#tag', '', '#tag'],
        ['a', 'b', 'c'],
        ['d', 'e', 'f']
    ]);
    dataset.columns.forEach((column) => {
        assert.ok(column);
    });
});

QUnit.test("rows", function(assert) {
    assert.deepEqual(this.dataset.rows.map(function (row) { return row.values; }), this.test_data.slice(3));
});

QUnit.test("raw data", function(assert) {
    assert.deepEqual(this.test_data.slice(3), this.dataset.rawData);
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

QUnit.test("min", function(assert) {
    assert.equal(this.dataset.getMin('#reached'), 200);
});

QUnit.test("max", function(assert) {
    assert.equal(this.dataset.getMax('#reached'), 400);
});

QUnit.test("sum", function(assert) {
    assert.equal(this.dataset.getSum('#reached'), 900);
});

QUnit.test("unique values", function(assert) {
    assert.deepEqual(this.dataset.getValues('#adm1'), ['Coastal Province', 'Mountain Province']);
});

QUnit.test("raw values", function(assert) {
    assert.deepEqual(this.dataset.getRawValues('#adm1'), ['Coastal Province', 'Mountain Province', 'Coastal Province']);
});

QUnit.test("numbery", function(assert) {
    assert.ok(!this.dataset.isNumbery('#org'));
    assert.ok(this.dataset.isNumbery('#reached'));
});

// end
