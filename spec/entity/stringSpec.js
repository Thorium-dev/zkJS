describe("Unit test for stringEntity", function() {
    var str = "abcdef";

    describe("Test for each method", function () {
        it("Should loop 'abcdef'", function() {
            var i = 0;
            zk().toolbox.each(str, function () {
                i++;
            });
            chaiExpect(i).equal(6, "Fail when loop 'abcdef'")
        });
        zk().toolbox.each(str, function () {
            it("Should be '" + this.v + "' char", function () {
                chaiExpect(this.v).equal(str[this.i]);
            });
        });
    });


});
