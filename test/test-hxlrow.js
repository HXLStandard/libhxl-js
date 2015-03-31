/**
 * HXLRow tests
 */

COLUMNS = ["#org+funder", "#org+impl", "#adm1+code"];

VALUES = ["Donor", "NGO", "Region"];

QUnit.module("HXLRow", {
    setup: function () {
        this.row = new HXLRow(VALUES, COLUMNS.map(function(spec) { return HXLColumn.parse(spec); }));
    }
});

QUnit.test("row created", function(assert) {
    assert.ok(this.row);
});

QUnit.test("values", function(assert) {
    assert.deepEqual(this.row.values, VALUES);
});

QUnit.test("columns", function(assert) {
    assert.deepEqual(this.row.columns.map(function(col) { return col.displayTag; }), COLUMNS);
});

QUnit.test("get one value", function(assert) {
    assert.equal(this.row.get("#org"), "Donor");
    assert.equal(this.row.get("#org+funder"), "Donor");
    assert.equal(this.row.get("#org-funder"), "NGO");
    assert.equal(this.row.get("#org+impl"), "NGO");
    assert.equal(this.row.get("#org-impl"), "Donor");
});

QUnit.test("get all values", function(assert) {
    assert.deepEqual(this.row.getAll("#org"), ["Donor", "NGO"]);
    assert.deepEqual(this.row.getAll("#org+impl"), ["NGO"]);
    assert.deepEqual(this.row.getAll("#org-impl"), ["Donor"]);
});

// end
