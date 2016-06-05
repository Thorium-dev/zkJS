<!doctype html>
<html>
<head>
    <title>Unit test for zkJS</title>
    <link rel="stylesheet" href="spec/lib/mocha.css"/>
</head>
<body>

    <ul class="jours" id="jours" style="font-size: 20px;">
        <li class="jour" id="jour-1">Monday</li>
        <li class="jour" id="jour-2">Tuesday</li>
        <li class="jour" id="jour-3">Wednesday</li>
        <li class="jour" id="jour-4">Thursday</li>
        <li class="jour" id="jour-5">Friday</li>
        <li class="jour" id="jour-6">Saturday</li>
        <li class="jour" id="jour-7">Sunday</li>
    </ul>


    <div id="mocha"></div>

    <script src="core/zk.js"></script>
    <script src="entity/stringEntity.js"></script>
    <script src="spec/lib/mocha.js"></script>
    <script src="spec/lib/chai.js"></script>

    <script>
        mocha.ui('bdd');
        mocha.reporter('html');
        var chaiExpect = chai.expect;
        var chaiAssert = chai.assert;
    </script>

    <script src="spec/stringEntitySpec/eachSpec.js"></script>

    <script> mocha.run(); </script>

</body>
</html>