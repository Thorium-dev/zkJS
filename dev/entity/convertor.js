var convertorObjectByType = {
    "string": function ($box, value, first, second) {
        var res = {};
        if(first === undefined){
            res[0] = value;
        }else {
            var s = value.split(first);
            $box.each(s, function () {
                var v = this.v;
                if(second){
                    v = v.split(second);
                    res[v[0]] = v[1];
                }else{
                    res[this.i] = v;
                }
            });
        }
        return res;
    },
    "array": function ($box, value) {
        var res = {};
        $box.each(value, function () {
            res[this.i] = this.v;
        });
        return res;
    }
};
zk().register(function CONVERTOR($this) {
    var $self = this, $box = $this.toolbox;
    $box.each($this, function () { $self[this.k] = this.v });

    /**
     * Permet convertir une chaîne de caractères en nombre.
     *
     * @method number
     * @param {string} value
     * @return {number|null}
     * @since 1.0
     */
    this.number = function (value) {
        try{
            return eval(((value+"").replace(/[^\d\+\-\*\/%\.]+/g, "")).replace(/^(?:[^\d]+)|(?:[^\d]+)$/g, ""));
        } catch (e){
            return null;
        }
    };

    /**
     * Permet convertir un élément en tableau.
     *
     * @method array
     * @param {*} value
     * @return {array}
     * @since 1.0
     */
    this.array = function (value) {
        return [].slice.call(value)
    };

    /**
     * Permet convertir un élément en objet.
     *
     * @method object
     * @param {string|array} value
     * @param {string} first
     * @param {string} second
     * @return {object}
     * @since 1.0
     */
    this.object = function (value, first, second) {
        var type = $box.is(value);
        if(convertorObjectByType.hasOwnProperty(type)){
            value = convertorObjectByType[type]($box, value, first, second);
        }
        return value;
    };

}, {}, {});