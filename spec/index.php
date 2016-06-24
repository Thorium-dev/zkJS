<!doctype html>
<html>
<head>
    <title>Unit test for zkJS</title>
    <link rel="stylesheet" href="lib/mocha.css"/>

</head>
<body>

    <div id="mocha"></div>

    <script src="../dev/core/zkjs.js"></script>
    <script src="../dev/entity/stringEntity.js"></script>
    <script src="../dev/entity/arrayEntity.js"></script>
    <script src="../dev/entity/convertorEntity.js"></script>
    <script src="../dev/entity/edgeEntity.js"></script>
    <script src="../dev/entity/errorEntity.js"></script>
    <script src="../dev/entity/nodeEntity.js"></script>
    <script src="../dev/entity/documentEntity.js"></script>
    <script src="../dev/entity/windowEntity.js"></script>
    <script src="../dev/entity/ajaxEntity.js"></script>
    <script src="lib/mocha.js"></script>
    <script src="lib/chai.js"></script>

    <script>
        mocha.ui('bdd');
        mocha.reporter('html');
        var chaiExpect = chai.expect;
        var chaiAssert = chai.assert;
    </script>

    <script src="node/stringSpec.js"></script>

    <script>
        mocha.run();
    </script>

</body>
</html>