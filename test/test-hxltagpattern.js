/**
 * HXLTagPattern tests
 */

QUnit.module("HXLTagPattern", {
    setup: function () {
        this.pattern = HXLTagPattern.parse("#adm1+code-iso");
        this.column = HXLColumn.parse("#adm1+code+pcode", "Region");
    }
});

QUnit.test("pattern created", function(assert) {
    assert.ok(this.pattern);
});

QUnit.test("tag ok", function(assert) {
    assert.equal(this.pattern.tag, "#adm1");
});

QUnit.test("include ok", function(assert) {
    assert.deepEqual(this.pattern.include_attributes, ['code']);
});

QUnit.test("exclude ok", function(assert) {
    assert.deepEqual(this.pattern.exclude_attributes, ['iso']);
});

QUnit.test("positive match", function(assert) {
    assert.ok(this.pattern.match(this.column));
});

QUnit.test("bad pattern", function(assert) {
    // no exception
    assert.ok(HXLTagPattern.parse("#abc+x=y") === null);
    // exception requested
    var seen_exception = false;
    try {
        HXLTagPattern.parse("#abc+x=y", true);
    } catch (e) {
        seen_exception = true;
    }
    assert.ok(seen_exception);
});

// end
