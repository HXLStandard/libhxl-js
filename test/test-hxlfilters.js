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

QUnit.test("identity filter", function(assert) {
    var filter = new HXLFilter(this.dataset);
    assert.deepEqual(filter.columns, this.dataset.columns);
    assert.deepEqual(filter.rows, this.dataset.rows);
});

QUnit.test("select filter", function(assert) {
    var filter;

    // Test a string predicate
    filter = new HXLSelectFilter(this.dataset, [
        ['#adm1', 'Coastal Province']
    ]);
    assert.deepEqual(filter.columns, this.dataset.columns);
    assert.equal(filter.rows.length, 2);
    assert.deepEqual(filter.getValues('#adm1'), ['Coastal Province']);

    // Test a function predicate
    filter = new HXLSelectFilter(this.dataset, [
        ['#sector+cluster', function(value) { return value != 'Protection'; }]
    ]);
    assert.equal(filter.rows.length, 2);
    assert.deepEqual(filter.getValues('#sector'), ['WASH', 'Health']);

    // Test a full-row predicate
    filter = new HXLSelectFilter(this.dataset, [
        [null, function(row) { return (row.get('#org') == 'Org 1' && row.get('#adm1') == 'Coastal Province'); }]
    ]);
    assert.equal(filter.rows.length, 1);
});

// end
