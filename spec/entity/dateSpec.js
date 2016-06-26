describe("Unit test for dateEntity", function() {

    describe("Test to creating date entity", function () {
        it("Date entity should be exist", function() {
            var box = zk().toolbox;
            chaiExpect(box.is(zk("Date"))).eql("date")
        });

    });

    describe("Test for year", function () {
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

    describe("Test for short named month", function () {
        it("Month should be 'Jui'", function() {
            chaiExpect(zk("Date").set("2016-06-26").M()).eql("Jui")
        });
        it("Month should be 'Juin'", function() {
            chaiExpect(zk("Date").set("2016-06-26").M(4)).eql("Juin")
        });
        it("Month should be 'Sep'", function() {
            chaiExpect(zk("Date").set("2016-09-02").M()).eql("Sep")
        });
    });

    describe("Test for full named month", function () {
        it("Month should be 'Septembre'", function() {
            chaiExpect(zk("Date").set("2016-09-02").MM()).eql("Septembre")
        });
    });

    describe("Test for short named day", function () {
        it("Day should be 'Dim'", function() {
            chaiExpect(zk("Date").set("2016-06-26").D()).eql("Dim")
        });
    });

    describe("Test for full named day", function () {
        it("Day should be 'Vendredi'", function() {
            chaiExpect(zk("Date").set("2016-09-02").DD()).eql("Vendredi")
        });
    });

    describe("Test for month", function () {
        it("Month should be '8'", function() {
            chaiExpect(zk("Date").set("2016-08-02").m()).eql("8")
        });
        it("Month should be '08'", function() {
            chaiExpect(zk("Date").set("2016-08-02").mm()).eql("08")
        });
        it("Month should be '10'", function() {
            chaiExpect(zk("Date").set("2016-08-02").mm("+2").m()).eql("10")
        });
    });

    describe("Test for format function", function () {
        it("Date should be 'Lundi 27 Juin 2016'", function() {
            chaiExpect(zk("Date").set("2016-06-26").format("%DD %dd+1 %MM %yy")).eql("Lundi 27 Juin 2016")
        });

    });


});


