zk().register(function VALIDATOR($this) {
    var $self = this, $box = $this.toolbox;
    $box.each($this, function () {
        $self[this.k] = this.v
    });

    var moreAttr = {
            "class": function () {

            },
            "id": function () {

            },
            "text": function () {

            },
            "content": function () {

            },
            "html": function () {

            },
        },
        isValid = true,
        asserts = {
            /*"id": {
             "constraints": [],
             "messages": [],
             "views": []
             }*/
        },
        errors = {
            "id": {
                "constraints": [],
                "messages": [],
                "views": []
            }
        };

    /**
     * Permet de définir une contrainte
     *
     * @method assert
     * @param {String} attr Nom de l'attribut ou contenu à contraindre.
     * @param {*} constraint Contraint à appliquer sur l'attribut.
     * @param {String|Function} [message] Message d'erreur.
     * @param {*} [view] La vue qui contiendra le message d'erreur.
     * @return {VALIDATOR}
     * @since 1.0
     */
    this.assert = function (attr, constraint, message, view) {
        if (attr !== undefined && constraint !== undefined) {
            attr += "";
            if (!asserts[attr]) {
                asserts[attr] = { "constraints": [], "messages": [], "views": [] };
            }
            var cons = asserts[attr]["constraints"];
            cons.push(constraint);
            asserts[attr]["constraints"] = cons;
            var mess = asserts[attr]["messages"];
            mess.push(message);
            asserts[attr]["messages"] = mess;
            var v = asserts[attr]["views"];
            v.push(view);
            asserts[attr]["views"] = v;
        }
        return $self
    };

    /**
     * Permet de définir une contrainte
     *
     * @method add
     * @param {String} attr Nom de l'attribut ou contenu à contraindre.
     * @param {*} constraint Contraint à appliquer sur l'attribut.
     * @param {String|Function} [message] Message d'erreur.
     * @param {*} [view] La vue qui contiendra le message d'erreur.
     * @return {VALIDATOR}
     * @since 1.0
     */
    this.add = function (attr, constraint, message, view) {
        return $self.assert(attr, constraint, message, view)
    };

    this.validate = function (node) {

    };

    this.message = function (message, view) {

    };

    this.isValid = function () {

    };


}, {}, {});