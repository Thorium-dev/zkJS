<!doctype html>
<html>
<head>
    <title>Unit test for zkJS</title>
    <link rel="stylesheet" href="lib/mocha.css"/>

    <style>
        .suite {
            width: 80%;
        }
        .replay {
            background-color: #2f6fad !important;
            color: #000066 !important;
        }
    </style>

</head>
<body>

    <div id="mocha"></div>

    <script src="../dev/core/zk.js"></script>
    <script src="../dev/entity/nodeEntity.js"></script>

    <script src="lib/mocha.js"></script>
    <script src="lib/chai.js"></script>

    <script>
        mocha.ui('bdd');
        mocha.reporter('html');
        var chaiExpect = chai.expect;
        var chaiAssert = chai.assert;
    </script>

    <script src="entity/stringSpec.js"></script>
    <script src="entity/ajaxSpec.js"></script>

    <script>
        mocha.run();
    </script>

</body>
</html>