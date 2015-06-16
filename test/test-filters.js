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
            ['Organisation', 'Second organisation', 'Sector', 'Province', 'Targeted'],
            ['#org', '#org', '#sector+cluster', '#adm1', '#population+num'],
            ['Org 1', 'Org 1a', 'WASH', 'Coastal Province', '300'],
            ['Org 2', '', 'Health', 'Mountain Province', '400'],
            ['Org 3', '', 'Protection', 'Coastal Province', '500']
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
        this.dataset.withRows(' #adm1 -foo =Coastal Province').getValues('#adm1'),
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

QUnit.test("row filter normalised strings", function(assert) {
    assert.deepEqual(this.dataset.withRows('#adm1=  coastal   province ').getValues('#org'), ['Org 1', 'Org 3']);
});

QUnit.test("row filter value function predicate", function(assert) {
    var test_function = function(value) { return value != 'Protection'; };
    var predicates = [
        {
            pattern: '#sector+cluster', 
            test: test_function
        }
    ];
    var filter = new hxl.classes.RowFilter(this.dataset, predicates);
    assert.equal(filter.rows.length, 2);
    assert.deepEqual(filter.getValues('#sector'), ['WASH', 'Health']);

    // test convenience methods
    assert.deepEqual(filter.columns, this.dataset.withRows(predicates).columns);
    assert.deepEqual(filter.rows, this.dataset.withRows(predicates).rows);
});

QUnit.test("row filter row predicate", function(assert) {
    var test_function = function(row) { return (row.get('#org') == 'Org 1' && row.get('#adm1') == 'Coastal Province'); };
    var predicates = [
        {
            test: test_function
        }
    ];
    var filter = new hxl.classes.RowFilter(this.dataset, predicates);
    assert.equal(filter.rows.length, 1);

    // test convenience methods
    assert.deepEqual(filter.columns, this.dataset.withRows(predicates).columns);
    assert.deepEqual(filter.rows, this.dataset.withRows(predicates).rows);
    assert.deepEqual(filter.columns, this.dataset.withRows(test_function).columns);
    assert.deepEqual(filter.rows, this.dataset.withRows(test_function).rows);
});


//
// hxl.classes.ColumnFilter
//

QUnit.test("column filter whitelist", function(assert) {
    var patterns = ['#sector'];
    var filter = new hxl.classes.ColumnFilter(this.dataset, patterns);
    assert.deepEqual(filter.columns.map(function (col) {
        return col.displayTag;
    }), ['#sector+cluster']);
    assert.deepEqual(filter.rows.map(function (row) {
        return row.values;
    }), this.test_data.slice(3).map(function (data) {
        return [data[2]];
    }));

    // test that the convenience methods work
    assert.deepEqual(filter.columns, this.dataset.withColumns(patterns).columns);
    assert.deepEqual(filter.values, this.dataset.withColumns(patterns).values);
    assert.deepEqual(filter.values, this.dataset.withColumns('#sector').values);
});

QUnit.test("column filter blacklist", function(assert) {
    var patterns = ['#sector'];
    var filter = new hxl.classes.ColumnFilter(this.dataset, patterns, true);
    assert.deepEqual(filter.columns.map(function (col) {
        return col.displayTag;
    }), ['#org', '#org', '#adm1', '#population+num']);
    assert.deepEqual(filter.rows.map(function (row) {
        return row.values;
    }), this.test_data.slice(3).map(function (data) {
        return [data[0], data[1], data[3], data[4]];
    }));

    // test that the convenience methods work
    assert.deepEqual(filter.columns, this.dataset.withoutColumns(patterns).columns);
    assert.deepEqual(filter.rows, this.dataset.withoutColumns(patterns).rows);
    assert.deepEqual(filter.rows, this.dataset.withoutColumns('#sector').rows);
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
    assert.deepEqual(filter.rows, this.dataset.count('#adm1').rows);
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


//
// HXL.classes.RenameFilter
//

QUnit.test("replace all matches", function(assert) {
    var expectedTags = ['#org+foo', '#org+foo', '#sector+cluster', '#adm1', '#population+num'];
    // test class directly
    var filter = new hxl.classes.RenameFilter(this.dataset, '#org', '#org+foo');
    assert.deepEqual(filter.displayTags, expectedTags);
    // test filter function
    filter = this.dataset.rename('#org', '#org+foo');
    assert.deepEqual(filter.displayTags, expectedTags);
});

QUnit.test("replace only one match", function(assert) {
    var expectedTags = ['#org', '#org+foo', '#sector+cluster', '#adm1', '#population+num'];
    // test class directly
    var filter = new hxl.classes.RenameFilter(this.dataset, '#org', '#org+foo', undefined, 1);
    assert.deepEqual(filter.displayTags, expectedTags);
    // test filter function
    filter = this.dataset.rename('#org', '#org+foo', undefined, 1);
    assert.deepEqual(filter.displayTags, expectedTags);
});

// end
