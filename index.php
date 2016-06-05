<!doctype html>
<html>
<head>
    <title>Unit test for zkJS</title>
    <link rel="stylesheet" href="spec/lib/mocha.css"/>
</head>
<body>

    <ul class="days" id="days" style="font-size: 20px;">
        <li class="day" id="day-1">Monday</li>
        <li class="day" id="day-2">Tuesday</li>
        <li class="day" id="day-3">Wednesday</li>
        <li class="day" id="day-4">Thursday</li>
        <li class="day" id="day-5">Friday</li>
        <li class="day" id="day-6">Saturday</li>
        <li class="day" id="day-7">Sunday</li>
    </ul>


    <div id="mocha"></div>

    <script src="core/zk.js"></script>
    <script src="entity/stringEntity.js"></script>
    <script src="entity/arrayEntity.js"></script>
    <script src="entity/convertorEntity.js"></script>
    <script src="entity/edgeEntity.js"></script>
    <script src="entity/errorEntity.js"></script>
    <script src="entity/nodeEntity.js"></script>
    <script src="spec/lib/mocha.js"></script>
    <script src="spec/lib/chai.js"></script>

    <script>
        mocha.ui('bdd');
        mocha.reporter('html');
        var chaiExpect = chai.expect;
        var chaiAssert = chai.assert;
    </script>

    <script src="spec/stringEntitySpec/eachSpec.js"></script>
    <script src="spec/nodeEntitySpec/$Spec.js"></script>

    <script>
        
        mocha.run();
    </script>

</body>
</html>