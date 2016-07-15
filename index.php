<!doctype html>
<html>
<head>
    <title>zkJS dev version</title>
    <link rel="stylesheet" href="styles/stylesheets/selectpicker.css"/>
    <style>

    </style>
</head>
<body>


    <button id="show">Show</button>
    <button id="hide">Hide</button>
    <button id="values">Values</button>
    <button id="destroy">Destroy</button>
    <button id="show-header">Show Header</button>
    <button id="hide-header">Hide Header</button>
    <button id="multiple">Multiple</button>
    <button id="single">Single</button>

    <form action="ajax.php" method="post">
        <label for="days">Selectionner un test</label>
        <select name="days" style="display: none">
            <option value="Test 1">Test 1</option>
            <option value="Test 2">Test 2</option>
            <option value="Test 3">Test 3</option>
            <option value="Test 4">Test 4</option>
            <option value="Test 5">Test 5</option>
            <option value="Test 6">Test 6</option>
            <option value="Lorem ipsum dolor sit amet.">Lorem ipsum dolor sit amet.</option>
        </select>
        <input type="submit" value="Envoyer" />
    </form>


    <script src="dev/core/zk.js"></script>
    <script src="dev/entity/convertorEntity.js"></script>
    <script src="dev/entity/documentEntity.js"></script>
    <script src="dev/entity/errorEntity.js"></script>
    <script src="dev/entity/nodeEntity.js"></script>
    <script src="dev/entity/routerEntity.js"></script>
    <script src="dev/entity/formEntity.js"></script>
    <script src="dev/entity/validatorEntity.js"></script>
    <script src="dev/ui/dateTimePickerEntity.js"></script>
    <script src="dev/ui/selectPickerEntity.js"></script>

    <script>

        var sel = zk("selectpicker").set("select");

        sel.label("label");

        $("button#show").click(function () {
            sel.show();
        });
        $("button#hide").click(function () {
            sel.hide();
        });

        $("button#values").click(function () {
            sel.val(["Test 3", "Test 4"]);
        });
        $("button#destroy").click(function () {
            sel.destroy();
        });
        $("button#show-header").click(function () {
            sel.header(true);
        });
        $("button#hide-header").click(function () {
            sel.header(false);
        });

        $("button#multiple").click(function () {
            sel.multiple(true);
        });

        $("button#single").click(function () {
            sel.multiple(false);
        });


    </script>

</body>
</html>