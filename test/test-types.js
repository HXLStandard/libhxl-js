/**
 * hxl.classes.TagPattern tests
 */

QUnit.module("hxl.types", {
    setup: function () {
	// no-op
    }
});

QUnit.test("is number", function(assert) {
    assert.ok(hxl.types.isNumber("100.0"));
    assert.ok(hxl.types.isNumber(100.0));
    assert.ok(hxl.types.isNumber("   100.0   "));
    assert.ok(hxl.types.isNumber("1, 100  "));
    
    assert.ok(!hxl.types.isNumber("foo"));
});

QUnit.test("to number", function(assert) {
    assert.equal(100, hxl.types.toNumber("100.0"));
    assert.equal(100, hxl.types.toNumber(100.0));
    assert.equal(100.1, hxl.types.toNumber("100.1"));
    assert.equal(1100, hxl.types.toNumber("1, 100  "));

    assert.ok(isNaN(hxl.types.toNumber("foo")));
});

// end
