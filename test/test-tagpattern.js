/**
 * hxl.classes.TagPattern tests
 */

QUnit.module("hxl.classes.TagPattern", {
    setup: function () {
        this.pattern = hxl.classes.TagPattern.parse("#adm1+code-iso");
        this.column = hxl.classes.Column.parse("#adm1+code+pcode", "Region");
    }
});

QUnit.test("pattern created", function(assert) {
    assert.ok(this.pattern);
});

QUnit.test("tag ok", function(assert) {
    assert.equal(this.pattern.tag, "#adm1");
});

QUnit.test("include ok", function(assert) {
    assert.deepEqual(this.pattern.includeAttributes, ['code']);
});

QUnit.test("exclude ok", function(assert) {
    assert.deepEqual(this.pattern.excludeAttributes, ['iso']);
});

QUnit.test("positive match", function(assert) {
    assert.ok(this.pattern.match(this.column));
});

QUnit.test("embedded whitespace", function(assert) {
    assert.ok(hxl.classes.TagPattern.parse('#adm1 +foo'));
    assert.ok(hxl.classes.TagPattern.parse(' #adm1+foo'));
    assert.ok(hxl.classes.TagPattern.parse(' #adm1+foo '));
    assert.ok(hxl.classes.TagPattern.parse(' #adm1+foo '));
});

QUnit.test("bad pattern", function(assert) {
    // no exception
    assert.ok(hxl.classes.TagPattern.parse("#abc+x=y") === null);
    // exception requested
    var seen_exception = false;
    try {
        hxl.classes.TagPattern.parse("#abc+x=y", true);
    } catch (e) {
        seen_exception = true;
    }
    assert.ok(seen_exception);
});

QUnit.test("absolute pattern", function(assert) {
    var pattern = hxl.classes.TagPattern.parse("#foo+x!");
    assert.ok(pattern);
    assert.ok(pattern.match("#foo+x"));
    assert.ok(!pattern.match("#foo+y+x"))
});

// end
