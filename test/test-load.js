

QUnit.module("hxl.load", {
    setup: function () {
        this.url = 'https://docs.google.com/spreadsheets/d/1_TFjKh_rcZmYFjgEDhDXoya16piFZHMpmZgLzrqlS5Y/export?format=csv&gid=2125848767&single=true';
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
