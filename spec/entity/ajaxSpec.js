describe("Unit test for ajaxEntity", function() {

    describe("Test for node response", function () {
        it("Should response be a node", function() {
            var box = zk().toolbox;
            zk("Ajax")
                .url("src/entity/ajax.php")
                .method("post").type("node")
                .success(function () {
                    chaiExpect(box.is(this.response)).eql("node")
                }).send();

        });
        it("Should response be a node (Shortcut)", function() {
            var box = zk().toolbox;
            zk("Ajax").send("src/entity/ajax.php $post $node", function () {
                chaiExpect(box.is(this.response)).eql("node")
            });

        });
    });


});
