describe("Unit test for nodeEntity", function() {

    describe("Test $ selector", function () {
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


});
