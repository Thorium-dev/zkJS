<!doctype html>
<html>
<head>
    <title>Unit test for zkJS</title>
    <link rel="stylesheet" href="spec/lib/mocha.css"/>
    <style>
        ul.days {
            display: inline-block;
            border: 1px solid red;
            vertical-align: top;
        }
        #days{
            padding-top: 20px;
            width: 300px;
        }
        #days1{
            padding-top: 100px;
        }
    </style>
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
<!--    <ul class="days" id="days1" style="font-size: 20px;">-->
<!--        <li class="day" id="day-1">Monday</li>-->
<!--        <li class="day" id="day-2">Tuesday</li>-->
<!--        <li class="day" id="day-3">Wednesday</li>-->
<!--        <li class="day" id="day-4">Thursday</li>-->
<!--        <li class="day" id="day-5">Friday</li>-->
<!--        <li class="day" id="day-6">Saturday</li>-->
<!--        <li class="day" id="day-7">Sunday</li>-->
<!--    </ul>-->


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
    <script src="spec/nodeEntitySpec/nodeEntitySpec.js"></script>

    <script>

//        ($("#day-3").on("click", function cal1(){ alert("click")}));
//        ($("#days li#day-3").on("click", function cal2(){}));
        $("#day-3").on("over click", function() {
            console.log(this);
        });
        mocha.run();
    </script>

</body>
</html>