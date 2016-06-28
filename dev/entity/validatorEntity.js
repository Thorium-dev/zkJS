zk().register(function VALIDATOR($this) {
    var $self = this, $box = $this.toolbox;
    $box.each($this, function () {
        $self[this.k] = this.v
    });

    var $moreAttr = {

            "text": function (node) {
                return node.textContent;
            },
            "content": function (node) {
                return node.textContent
            },
            "html": function (node) {
                return node.innerHTML
            },

        },
        $isValid = true,
        $message = null,
        $view = null,
        $asserts = {
            /*"id": {
             "constraints": [],
             "messages": [],
             "views": []
             }*/
        },
        $errors = {
            /*"id": {
                "constraints": [],
                "messages": [],
                "views": []
            }*/
        };
    function addConstInObject(attr, constraint, message, view, obj){
        if (!obj[attr]) {
            obj[attr] = { "constraints": [], "messages": [], "views": [] };
        }
        var cons = obj[attr]["constraints"];
        cons.push(constraint);
        obj[attr]["constraints"] = cons;
        var mess = obj[attr]["messages"];
        mess.push(message);
        obj[attr]["messages"] = mess;
        var v = obj[attr]["views"];
        v.push(view);
        obj[attr]["views"] = v;
    }

    /**
     * Permet de définir une contrainte
     *
     * @method assert
     * @param {String} attr Nom de l'attribut ou contenu à contraindre.
     * @param {*} constraint Contraint à appliquer sur l'attribut.
     * @param {String|Function} [message] Message d'erreur.
     * @param {*} [view] Sélecteur de la vue qui contiendra le message d'erreur.
     * @return {VALIDATOR}
     * @since 1.0
     */
    this.assert = function (attr, constraint, message, view) {
        if (attr !== undefined && constraint !== undefined) {
            attr += "";
            addConstInObject(attr, constraint, message, view, $asserts)
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

    /**
     * Permet de définir un message et une vue pour les messages d'erreurs.
     *
     * @method message
     * @param {String|Function} [message] Message d'erreur.
     * @param {*} [view] La vue qui contiendra le message d'erreur.
     * @return {VALIDATOR}
     * @since 1.0
     */
    this.message = function (message, view) {
        $message = message; $view = view;
        return $self
    };

    this.validate = function (node) {
        $isValid = true;
        if(!$box.isEmpty($asserts)){
            node = $self.entity.get("Node").set(node).get()[0];
            if(node){
                $box.each($asserts, function () {
                    var k = this.k, v = this.v,
                        value = $moreAttr.hasOwnProperty(k) ? $moreAttr[k](node) : node.getAttribute(k);
                    $box.each(v.constraints, function () {
                        // @TODO : Elargir les contraintes
                        if(!this.v.test(value)){
                            $isValid = false;
                            var msg = v.messages[this.i], vw = v.views[this.i];
                            addConstInObject(k, this.v, msg, vw, $errors);
                            if(msg !== undefined){
                                $self.entity.get("Node").set(vw).html(msg)
                            }
                        }
                    });
                });
            }
        }
        if(!$isValid && $message){
            $self.entity.get("Node").set($view).html($message)
        }
        return $self
    };

    this.isValid = function () {

    };


}, {}, {});