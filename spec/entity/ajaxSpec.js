describe("Unit test for ajaxEntity", function() {

    describe("Test for node response", function () {
        it("Response should be a node type", function() {
            var box = zk().toolbox;
            zk("Ajax")
                .url("src/entity/ajax.php")
                .method("post").type("node")
                .success(function () {
                    chaiExpect(box.is(this.response)).eql("node")
                }).send();

        });
        it("Response should be a node type (Shortcut)", function() {
            var box = zk().toolbox;
            zk("Ajax").send("src/entity/ajax.php $post $node", function () {
                chaiExpect(box.is(this.response)).eql("node")
            });

        });
    });


});
