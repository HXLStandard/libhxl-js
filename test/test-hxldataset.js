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
QUnit.module("HXLDataset", {
    setup: function () {
        this.dataset = new HXLDataset(TEST_DATA);
    }
});

QUnit.test("dataset created", function(assert) {
    assert.ok(this.dataset);
});

QUnit.test("headers", function(assert) {
    assert.equal(TEST_DATA[0], this.dataset.headers);
});

QUnit.test("tags", function(assert) {
    assert.equal(TEST_DATA[1], this.dataset.tags);
});

QUnit.test("columns", function(assert) {
    assert.ok(this.dataset.columns);
    for (var i = 0; i < this.dataset.columns.length; i++) {
        assert.equal(TEST_DATA[0][i], this.dataset.columns[i].header);
        assert.equal(TEST_DATA[1][i], this.dataset.columns[i].tag);
    }
});

QUnit.test("rows", function(assert) {
    var iterator = this.dataset.iterator();
    var index = 2;
    while (row = iterator.next()) {
        assert.ok(row);
        for (var i = 0; i < row.values.length; i++) {
            assert.equal(TEST_DATA[index][i], row.get(TEST_DATA[1][i]));
        }
        index++;
    }
});

QUnit.test("values", function(assert) {
    assert.deepEqual(['Coastal Province', 'Mountain Province'], this.dataset.getValues('#adm1'));
});

// end
