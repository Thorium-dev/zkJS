<!doctype html>
<html>
<head>
    <title>zkJS dev version</title>
    <link rel="stylesheet" href="styles/stylesheets/datetimepicker.css"/>
    <style>

    </style>
</head>
<body>

    <div class="date-container">




    </div>

    <button style="color: red; font-size: 18px">Slide</button>


    <script src="dev/core/zk.js"></script>
    <script src="dev/entity/convertorEntity.js"></script>
    <script src="dev/entity/documentEntity.js"></script>
    <script src="dev/entity/errorEntity.js"></script>
    <script src="dev/entity/nodeEntity.js"></script>
    <script src="dev/entity/routerEntity.js"></script>
    <script src="dev/entity/formEntity.js"></script>
    <script src="dev/entity/validatorEntity.js"></script>
    <script src="dev/ui/dateTimePickerEntity.js"></script>

    <script>

        zk("datetimepicker").container(".date-container");

        console.log($("button").removeAttr("style"));


    </script>

</body>
</html>