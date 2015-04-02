////////////////////////////////////////////////////////////////////////
// Test various HXL filters
////////////////////////////////////////////////////////////////////////

//
// hxl.classes.BaseFilter
//

QUnit.module("hxl.classes.BaseFilters", {
    setup: function () {
        this.test_data = [
            ['Pointless header'],
            ['Organisation', 'Sector', 'Province', 'Targeted'],
            ['#org', '#sector+cluster', '#adm1', '#population+num'],
            ['Org 1', 'WASH', 'Coastal Province', '300'],
            ['Org 2', 'Health', 'Mountain Province', '400'],
            ['Org 3', 'Protection', 'Coastal Province', '500']
        ];
        this.dataset = hxl.wrap(this.test_data);
    }
});

QUnit.test("identity filter", function(assert) {
    var filter = new hxl.classes.BaseFilter(this.dataset);
    assert.deepEqual(filter.columns, this.dataset.columns);
    assert.deepEqual(filter.rows, this.dataset.rows);
});


//
// hxl.classes.RowFilter
//

QUnit.test("row filter value string predicate", function(assert) {
    var predicates = [
        { pattern: '#adm1', test: 'Coastal Province'}
    ];
    var filter = new hxl.classes.RowFilter(this.dataset, predicates);
    assert.deepEqual(filter.columns, this.dataset.columns);
    assert.equal(filter.rows.length, 2);
    assert.deepEqual(filter.getValues('#adm1'), ['Coastal Province']);

    // test convenience methods
    assert.deepEqual(filter.columns, this.dataset.withRows(predicates).columns);
    assert.deepEqual(filter.rows, this.dataset.withRows(predicates).rows);
});

QUnit.test("row filter predicate parsing", function(assert) {
    assert.deepEqual(
        this.dataset.withRows('#adm1=Coastal Province').getValues('#adm1'),
        ['Coastal Province']
    );
    assert.deepEqual(
        this.dataset.withRows('#adm1!=Coastal Province').getValues('#adm1'),
        ['Mountain Province']
    );
    assert.deepEqual(
        this.dataset.withRows('#population<400').getValues('#org'),
        ['Org 1']
    );
    assert.deepEqual(
        this.dataset.withRows('#population<=400').getValues('#org'),
        ['Org 1', 'Org 2']
    );
    assert.deepEqual(
        this.dataset.withRows('#population>400').getValues('#org'),
        ['Org 3']
    );
    assert.deepEqual(
        this.dataset.withRows('#population>=400').getValues('#org'),
        ['Org 2', 'Org 3']
    );
    assert.deepEqual(
        this.dataset.withRows('#adm1~^Coast').getValues('#org'),
        ['Org 1', 'Org 3']
    );
    assert.deepEqual(
        this.dataset.withRows('#adm1!~^Coast').getValues('#org'),
        ['Org 2']
    );
});

QUnit.test("row filter invert", function(assert) {
    var predicates = [
        { pattern: '#adm1', test: 'Coastal Province'}
    ];
    var filter = new hxl.classes.RowFilter(this.dataset, predicates, true);
    assert.deepEqual(filter.columns, this.dataset.columns);
    assert.equal(filter.rows.length, 1);
    assert.deepEqual(filter.getValues('#adm1'), ['Mountain Province']);

    // test convenience methods
    assert.deepEqual(filter.columns, this.dataset.withoutRows(predicates).columns);
    assert.deepEqual(filter.rows, this.dataset.withoutRows(predicates).rows);
});

QUnit.test("row filter value function predicate", function(assert) {
    var predicates = [
        {
            pattern: '#sector+cluster', 
            test: function(value) { return value != 'Protection'; }
        }
    ];
    var filter = new hxl.classes.RowFilter(this.dataset, predicates);
    assert.equal(filter.rows.length, 2);
    assert.deepEqual(filter.getValues('#sector'), ['WASH', 'Health']);

    // test convenience methods
    assert.deepEqual(filter.columns, this.dataset.withRows(predicates).columns);
    assert.deepEqual(filter.rows, this.dataset.withRows(predicates).rows);
    assert.deepEqual(filter.columns, this.dataset.withRows('#sector+cluster!=Protection').columns);
    assert.deepEqual(filter.rows, this.dataset.withRows('#sector+cluster!=Protection').rows);
});

QUnit.test("row filter row predicate", function(assert) {
    var predicates = [
        {
            test: function(row) { return (row.get('#org') == 'Org 1' && row.get('#adm1') == 'Coastal Province'); }
        }
    ];
    var filter = new hxl.classes.RowFilter(this.dataset, predicates);
    assert.equal(filter.rows.length, 1);

    // test convenience methods
    assert.deepEqual(filter.columns, this.dataset.withRows(predicates).columns);
    assert.deepEqual(filter.rows, this.dataset.withRows(predicates).rows);
});


//
// hxl.classes.ColumnFilter
//

QUnit.test("column filter whitelist", function(assert) {
    var blacklist = [];
    var whitelist = ['#sector'];
    var filter = new hxl.classes.ColumnFilter(this.dataset, blacklist, whitelist);
    assert.deepEqual(filter.columns.map(function (col) {
        return col.displayTag;
    }), ['#sector+cluster']);
    assert.deepEqual(filter.rows.map(function (row) {
        return row.values;
    }), this.test_data.slice(3).map(function (data) {
        return [data[1]];
    }));

    // test that the convenience methods work
    assert.deepEqual(filter.columns, this.dataset.withColumns(whitelist).columns);
    assert.deepEqual(filter.values, this.dataset.withColumns(whitelist).values);
});

QUnit.test("column filter blacklist", function(assert) {
    var blacklist = ['#sector'];
    var filter = new hxl.classes.ColumnFilter(this.dataset, blacklist);
    assert.deepEqual(filter.columns.map(function (col) {
        return col.displayTag;
    }), ['#org', '#adm1', '#population+num']);
    assert.deepEqual(filter.rows.map(function (row) {
        return row.values;
    }), this.test_data.slice(3).map(function (data) {
        return [data[0], data[2], data[3]];
    }));

    // test that the convenience methods work
    assert.deepEqual(filter.columns, this.dataset.withoutColumns(blacklist).columns);
    assert.deepEqual(filter.rows, this.dataset.withoutColumns(blacklist).rows);
});


//
// hxl.classes.CountFilter
//

QUnit.test("count filter single column", function(assert) {
    var patterns = ['#adm1'];
    var filter = new hxl.classes.CountFilter(this.dataset, patterns);
    assert.equal(filter.rows.length, 2);
    assert.deepEqual(filter.columns.map(
        function (col) { return col.displayTag; }
    ), ['#adm1', '#count_num']);

    // test that the convenience methods work
    assert.deepEqual(filter.columns, this.dataset.count(patterns).columns);
    assert.deepEqual(filter.rows, this.dataset.count(patterns).rows);
});

QUnit.test("count filter multiple columns", function(assert) {
    var patterns = ['#sector', '#adm1'];
    var filter = new hxl.classes.CountFilter(this.dataset, patterns);
    assert.equal(filter.rows.length, 3);
    assert.deepEqual(filter.columns.map(
        function (col) { return col.displayTag; }
    ), ['#sector+cluster', '#adm1', '#count_num']);

    // test that the convenience methods work
    assert.deepEqual(filter.columns, this.dataset.count(patterns).columns);
    assert.deepEqual(filter.rows, this.dataset.count(patterns).rows);
});

QUnit.test("test numeric aggregation", function(assert) {
    var source = new hxl.classes.CountFilter(this.dataset, ['#sector', '#adm1']);
    var patterns = ['#adm1'];
    var aggregate = '#count_num';
    var filter = new hxl.classes.CountFilter(source, patterns, aggregate);
    assert.equal(filter.rows.length, 2);
    assert.deepEqual(filter.rows.map(function (row) { return row.values; }), [
        ['Coastal Province', 2, 2, 1, 1, 1],
        ['Mountain Province', 1, 1, 1, 1, 1]
    ]);
    assert.deepEqual(filter.columns.map(
        function (col) { return col.displayTag; }
    ), ['#adm1', '#count_num', '#count_num+sum', '#count_num+avg', '#count_num+min', '#count_num+max']);

    // test that the convenience methods work
    assert.deepEqual(filter.columns, source.count(patterns, aggregate).columns);
    assert.deepEqual(filter.rows, source.count(patterns, aggregate).rows);
});

// end
