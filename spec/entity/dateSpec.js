describe("Unit test for dateEntity", function() {

    describe("Test to creating date entity", function () {
        it("Date entity should be exist", function() {
            var box = zk().toolbox;
            chaiExpect(box.is(zk("Date"))).eql("date")
        });

    });

    describe("Test about year", function () {
        it("Year should have two chars", function() {
            chaiExpect(zk("Date").set("2016-06-26").y()).eql("16")
        });
        it("Should get full year", function() {
            chaiExpect(zk("Date").set("2016-06-26").yy()).eql("2016")
        });
        it("Year should increase", function() {
            chaiExpect(zk("Date").set("2016-06-26").y("+2").y()).eql("18")
        });
        it("Year should decrease", function() {
            chaiExpect(zk("Date").set("2016-06-26").yy("-2").yy()).eql("2014")
        });

    });


});


