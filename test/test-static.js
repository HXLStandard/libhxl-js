/**
 * static methods tests
 */

QUnit.module("hxl", {});

QUnit.test("normalise whitespace", function(assert) {
    assert.equal("xx YY", hxl.normaliseSpace("    xx\n YY\t"));
});

QUnit.test("normalise string", function(assert) {
    assert.equal("xx yy", hxl.normaliseString("    xx\n YY\t"));
});

// end
