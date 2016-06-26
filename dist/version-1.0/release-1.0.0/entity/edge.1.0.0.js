zk().register(function EDGE($this) {
    var $self = this,
        $box = $this.toolbox,
        $edges = ["top", "right", "bottom", "left"],
        $edgesValues = [null, null, null, null];
    $box.each($this, function () { $self[this.k] = this.v });

    /**
     * Permet d'obtenir un tableau contenant les valeurs pour chaque côté.
     *
     * @method get
     * @return {Array}
     * @since 1.0
     */
    this.get = function () {
        return $edgesValues
    };
    /**
     * Permet de définir dans un même temps les valeurs pour les quatre côtés.
     *
     * @method set
     * @param {*} value
     * @return {EDGE}
     * @since 1.0
     */
    this.set = function (value) {
        if(!$box.is(value, "array")){ value = [value] }
        value = value.slice(0, 4);
        value = value.concat($edgesValues.slice(value.length));
        $box.each(value, function () {
            $self[$edges[this.i]](this.v)
        });
        return $self
    };
    /**
     * Permet de définir ou d'obtenir la valeur du bord supérieur.
     *
     * @method top
     * @param {*} value
     * @return {*}
     * @since 1.0
     */
    this.top = function (value) {
        if(value === undefined){ return $edgesValues[0] }
        $edgesValues[0] = value;
        return $self
    };
    /**
     * Permet de définir ou d'obtenir la valeur du bord droit.
     *
     * @method right
     * @param {*} value
     * @return {*}
     * @since 1.0
     */
    this.right = function (value) {
        if(value === undefined){ return $edgesValues[1] }
        $edgesValues[1] = value;
        return $self
    };
    /**
     * Permet de définir ou d'obtenir la valeur du bord inférieur.
     *
     * @method bottom
     * @param {*} value
     * @return {*}
     * @since 1.0
     */
    this.bottom = function (value) {
        if(value === undefined){ return $edgesValues[2] }
        $edgesValues[2] = value;
        return $self
    };
    /**
     * Permet de définir ou d'obtenir la valeur du bord gauche.
     *
     * @method left
     * @param {*} value
     * @return {*}
     * @since 1.0
     */
    this.left = function (value) {
        if(value === undefined){ return $edgesValues[3] }
        $edgesValues[3] = value;
        return $self
    };

}, {}, {});