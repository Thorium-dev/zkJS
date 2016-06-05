describe("Unit test for stringEntity", function() {
    var str = "abcdef";

    describe("Test each method", function () {
        it("Loop 'abcdef'", function() {
            var i = 0;
            zk().toolbox.each(str, function () {
                i++;
            });
            chaiExpect(i).equal(6, "Fail when loop 'abcdef'")
        });
        zk().toolbox.each(str, function () {
            it("Test char " + this.v, function () {
                chaiExpect(this.v).equal(str[this.i]);
            });
        });
    });


});
