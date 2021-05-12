/**
 * hxl.classes.Row tests
 */

QUnit.module("hxl.classes.Row", {
    setup: function () {
        this.columns = ["#org+funder", "#org+impl", "#adm1+code"];
        this.values = ["Donor", "NGO", "Region"];
        this.dataset = new hxl.classes.Dataset([this.columns, this.values]);
        this.row = new hxl.classes.Row(this.values, this.dataset.columns, this.dataset);
    }
});

QUnit.test("row created", function(assert) {
    assert.ok(this.row);
});

QUnit.test("values", function(assert) {
    assert.deepEqual(this.row.values, this.values);
});

QUnit.test("columns", function(assert) {
    assert.deepEqual(this.row.columns.map(function(col) { return col.displayTag; }), this.columns);
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
