

QUnit.module("hxl.load", {
    setup: function () {
        this.url = "https://raw.githubusercontent.com/HXLStandard/libhxl-js/main/test/test-data/sample-data.csv";
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
