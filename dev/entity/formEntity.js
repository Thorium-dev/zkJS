zk().register(function FORM($this){
    var $self = this, $box = $this.toolbox;
    $box.each($this, function () { $self[this.k] = this.v });

    var $forms = $box.toArray(document.forms);

    /**
     * Permet d'obtenir les formulaires de la page.
     *
     * @method get
     * @param {array|string} names Tableau ou chaîne de caratères contenant le nom des formulaires.
     * @return {FORM|array}
     * @since 1.0
     */
    this.get = function (names) {
        if(names === undefined){ return $forms }
        if($box.is(names, "string")){ names = names.split(/[ ,]/); }
        if($box.is(names, "array")){
            var res = [];
            $box.each(names, function () {
                var f = document.forms[this.v];
                if(f){ res.push(f) }
            });
            $forms = res;
        }
        return this;
    }






}, {}, {});