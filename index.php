<!doctype html>
<html>
<head>
    <title>zkJS dev version</title>
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


    <script src="dev/core/zk.js"></script>
    <script src="dev/entity/convertorEntity.js"></script>
    <script src="dev/entity/documentEntity.js"></script>
    <script src="dev/entity/edgeEntity.js"></script>
    <script src="dev/entity/errorEntity.js"></script>
    <script src="dev/entity/nodeEntity.js"></script>
    <script src="dev/entity/dateEntity.js"></script>

    <script>


        console.log(zk("date").M());


    </script>

</body>
</html>