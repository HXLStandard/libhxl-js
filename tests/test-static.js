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

QUnit.test("normalise year", function(assert) {
    assert.equal('2017', hxl.normaliseDate('2017'));
});

QUnit.test("normalise year-month", function(assert) {
    assert.equal('2017-01', hxl.normaliseDate('2017-01'));
});

QUnit.test("normalise quarter", function(assert) {
    assert.equal('2017Q1', hxl.normaliseDate('2017Q1'));
});

QUnit.test("normalise mm-dd date", function(assert) {
    assert.equal('2017-01-13', hxl.normaliseDate('1/13/17'));
});

QUnit.test("normalise dd-mm date", function(assert) {
    assert.equal('2017-01-13', hxl.normaliseDate('13/1/17'));
});

QUnit.test("force dd-mm date", function(assert) {
    assert.equal('2017-01-02', hxl.normaliseDate('2/1/17', true));
});

QUnit.test("force mm-dd date", function(assert) {
    assert.equal('2017-02-01', hxl.normaliseDate('2/1/17', false));
});

QUnit.test("month name", function(assert) {
    assert.equal('2017-01-02', hxl.normaliseDate('2 Jan/17'));
});

// end
