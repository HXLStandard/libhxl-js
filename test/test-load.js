

QUnit.module("hxl.load", {
    setup: function () {
        this.url = "http://hxlstandard.github.io/libhxl-js/test/test-data/sample-data.csv";
    }
});

QUnit.test("load dataset directly", function(assert) {
    var done = assert.async();
    hxl.load(this.url, function (dataset) {
        assert.ok(dataset);
        assert.ok(dataset.columns.length > 5);
        done();
    });
});

QUnit.test("load dataset via HXL Proxy", function(assert) {
    var done = assert.async();
    hxl.proxy(this.url, function (dataset) {
        assert.ok(dataset);
        assert.ok(dataset.columns.length > 5);
        done();
    }, true);
});
