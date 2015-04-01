

QUnit.module("hxl.load", {
    setup: function () {
        this.url = 'https://docs.google.com/spreadsheets/d/1_TFjKh_rcZmYFjgEDhDXoya16piFZHMpmZgLzrqlS5Y/export?format=csv&gid=2125848767&single=true';
    }
});

QUnit.test("load dataset", function(assert) {
    var done = assert.async();
    hxl.load(this.url, function (dataset) {
        assert.ok(dataset);
        assert.ok(dataset.columns.length > 5);
        done();
    });
});
