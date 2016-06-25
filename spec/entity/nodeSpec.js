describe("Unit test for nodeEntity", function() {

    describe("Test for $ selector", function () {
        it("$ selector with string parameter", function() {
            chaiExpect($("#days").get()).eql([document.querySelector("#days")])
        });
        it("$ selector with object parameter", function() {
            var li = $({"name": "li", "content": "Tuesday"}).get()[0];
            chaiExpect(li).equal(document.querySelector("li#day-2"));
            var days1 = $({"attr-class": "day"}).get();
            var days2 = zk("Convertor").array(document.querySelectorAll(".day"));
            chaiExpect(days1).eql(days2)
        });

    });

    describe("Test for get function", function () {

        it("get function with string parameter", function() {
            var li = $("#days li").get("li").get("#day-5").get()[0];
            chaiExpect(li).equal(document.querySelector("li#day-5"));

        });

    });


});
