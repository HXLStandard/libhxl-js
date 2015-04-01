////////////////////////////////////////////////////////////////////////
// Test various HXL filters
////////////////////////////////////////////////////////////////////////

/**
 * HXLFilter tests
 */

QUnit.module("HXLFilters", {
    setup: function () {
        this.test_data = [
            ['Pointless header'],
            ['Organisation', 'Sector', 'Province'],
            ['#org', '#sector+cluster', '#adm1'],
            ['Org 1', 'WASH', 'Coastal Province'],
            ['Org 2', 'Health', 'Mountain Province'],
            ['Org 3', 'Protection', 'Coastal Province']
        ];
        this.dataset = new HXLDataset(this.test_data);
    }
});

// HXLFilter

QUnit.test("identity filter", function(assert) {
    var filter = new HXLFilter(this.dataset);
    assert.deepEqual(filter.columns, this.dataset.columns);
    assert.deepEqual(filter.rows, this.dataset.rows);
});

// HXLSelectFilter

QUnit.test("select filter value string predicate", function(assert) {
    var filter = new HXLSelectFilter(this.dataset, [
        ['#adm1', 'Coastal Province']
    ]);
    assert.deepEqual(filter.columns, this.dataset.columns);
    assert.equal(filter.rows.length, 2);
    assert.deepEqual(filter.getValues('#adm1'), ['Coastal Province']);
});

QUnit.test("select filter value function predicate", function(assert) {
    var filter = new HXLSelectFilter(this.dataset, [
        ['#sector+cluster', function(value) { return value != 'Protection'; }]
    ]);
    assert.equal(filter.rows.length, 2);
    assert.deepEqual(filter.getValues('#sector'), ['WASH', 'Health']);
});

QUnit.test("select filter row predicate", function(assert) {
    var filter = new HXLSelectFilter(this.dataset, [
        [null, function(row) { return (row.get('#org') == 'Org 1' && row.get('#adm1') == 'Coastal Province'); }]
    ]);
    assert.equal(filter.rows.length, 1);
});

// HXLCutFilter

QUnit.test("cut filter whitelist", function(assert) {
    var filter = new HXLCutFilter(this.dataset, [], ['#sector']);
    assert.deepEqual(filter.columns.map(function (col) {
        return col.displayTag;
    }), ['#sector+cluster']);
});

QUnit.test("cut filter blacklist", function(assert) {
    var filter = new HXLCutFilter(this.dataset, ['#sector'], []);
    assert.deepEqual(filter.columns.map(function (col) {
        return col.displayTag;
    }), ['#org', '#adm1']);
});

// HXLCountFilter

QUnit.test("count filter single column", function(assert) {
    var filter = new HXLCountFilter(this.dataset, ['#adm1']);
    assert.equal(filter.rows.length, 2);
    assert.deepEqual(filter.columns.map(
        function (col) { return col.displayTag; }
    ), ['#adm1', '#count_num']);
});

QUnit.test("count filter multiple columns", function(assert) {
    var filter = new HXLCountFilter(this.dataset, ['#sector', '#adm1']);
    assert.equal(filter.rows.length, 3);
    assert.deepEqual(filter.columns.map(
        function (col) { return col.displayTag; }
    ), ['#sector+cluster', '#adm1', '#count_num']);
});

QUnit.test("test numeric aggregation", function(assert) {
    var source = new HXLCountFilter(this.dataset, ['#sector', '#adm1']);
    var filter = new HXLCountFilter(source, ['#adm1'], '#count_num');
    assert.equal(filter.rows.length, 2);
    assert.deepEqual(filter.rows.map(function (row) { return row.values; }), [
        ['Coastal Province', 2, 2, 1, 1, 1],
        ['Mountain Province', 1, 1, 1, 1, 1]
    ]);
    assert.deepEqual(filter.columns.map(
        function (col) { return col.displayTag; }
    ), ['#adm1', '#count_num', '#count_num+sum', '#count_num+avg', '#count_num+min', '#count_num+max']);
});

// end
