/**
 * hxl.classes.Column tests
 */

QUnit.module("hxl.classes.Column", {
    setup: function () {
        this.column = hxl.classes.Column.parse("#adm1+code+pcode", "Region");
    }
});

QUnit.test("column created", function(assert) {
    assert.ok(this.column);
});

QUnit.test("header ok", function(assert) {
    assert.equal(this.column.header, "Region");
});

QUnit.test("tag parsed", function(assert) {
    assert.equal(this.column.tag, "#adm1");
});

QUnit.test("attributes ok", function(assert) {
    assert.equal(this.column.attributes.length, 2);
    assert.ok(this.column.attributes.indexOf("code") > -1);
    assert.ok(this.column.attributes.indexOf("pcode") > -1);
});

QUnit.test("display tag", function(assert) {
    assert.equal(this.column.displayTag, "#adm1+code+pcode");
});

QUnit.test("bad tag", function(assert) {
    // no exception
    assert.ok(hxl.classes.Column.parse("#0abc") === null);
    // exception
    var seen_exception = false;
    try {
        hxl.classes.Column.parse("#0abc", null, true);
    } catch (e) {
        seen_exception = true;
    }
    assert.ok(seen_exception);
});


// end
