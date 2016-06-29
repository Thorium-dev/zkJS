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
     * @param {*} constraint Contrainte à appliquer sur l'attribut. Cas d'utilisation :
     *                       - "/url/" => $self.config.get("validator.url");
     *                       - "/date.fr/" => $self.config.get("validator.date.fr");
     *                       - "==10" => La valeur est égale à 10
     *                       - "!='myString'" => La valeur est différente de 'myString'
     *                       - "myString" => La valeur est égale à 'myString'
     *                       - /\d+/ => La valeur doit correspondre à l'expression régulière.
     *                       - true => Dans les autres cas, on fait une égalité stricte. Ici, la valeur doit être true
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

    /**
     * Permet de valider un objet Node.
     *
     * @method validate
     * @param {*} node L'objet Node qui sera validé.
     * @return {VALIDATOR}
     * @since 1.0
     */
    this.validate = function (node) {
        $isValid = true;
        if(!$box.isEmpty($asserts)){
            node = $self.entity.get("Node").set(node).get()[0];
            if(node){
                $box.each($asserts, function () {
                    var k = this.k, v = this.v,
                        value = $box.trim($moreAttr.hasOwnProperty(k) ? $moreAttr[k](node) : node.getAttribute(k));
                    $box.each(v.constraints, function () {

                        var type  = $box.is(this.v), ok = true;
                        if(type == "string"){
                            if(/^\/.*\/$/.test(this.v)){
                                this.v = $box.trim(this.v, "[\/ ]");
                                this.v = $self.config.get("validator." + this.v);
                                ok = this.v.test(value);
                            }else{
                                if(/^(?:==|===|!=|!==|<=|>=|<|>)/.test(this.v)){
                                    try {
                                        ok = (new Function("","return '" + value + "'" + this.v))();
                                    }catch (e){
                                        console.log(e);
                                    }
                                }else {
                                    ok = (value === this.v);
                                }
                            }
                        }else{
                            if(type == "regexp"){
                                ok = this.v.test(value);
                            }else{
                                ok = (this.v === value);
                            }
                        }
                        if(!ok){
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
        if(!$isValid && $message){ $self.entity.get("Node").set($view).html($message) }
        return $self
    };

    /**
     * Permet de connaître l'état de la validation. A utiliser après la fonction validate.
     *
     * @method isValid
     * @return {boolean}
     * @since 1.0
     */
    this.isValid = function () {
        return $isValid
    };


}, {}, {});