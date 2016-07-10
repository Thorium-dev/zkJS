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
            "val": function (node) {
                return zk().get("Node").set(node).val();
            },
            "value": function (node) {
                return this.val(node);
            }

        },
        $isValid = true,
        $message = null,
        $view = null,
        $validators = {
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
            addConstInObject(attr, constraint, message, view, $validators)
        }
        return $self
    };

    /**
     * Voir la fonction assert
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
     * Voir la fonction assert
     *
     * @method constraint
     * @param {String} attr Nom de l'attribut ou contenu à contraindre.
     * @param {*} constraint Contraint à appliquer sur l'attribut.
     * @param {String|Function} [message] Message d'erreur.
     * @param {*} [view] La vue qui contiendra le message d'erreur.
     * @return {VALIDATOR}
     * @since 1.0
     */
    this.constraint = function (attr, constraint, message, view) {
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
     * La fonction reçoit en argument l'objet this avec :
     *      - this.isValid : L'état de la validation
     *      - this.message : Le message global
     *      - this.view : La vue global pour le message global
     *      - this.validators : Objet contenant la liste des validateurs
     *      - this.errors : Les erreurs générées par la validation
     *      - this.node : Elément sur lequel se fait la validation
     *
     * @method validate
     * @param {*} node L'objet Node qui sera validé.
     * @param {Function} callback Fonction qui sera exécutée après la validation.
     * @return {VALIDATOR}
     * @since 1.0
     */
    this.validate = function (node, callback) {
        $isValid = true;
        if(!$box.isEmpty($validators)){
            node = $self.entity.get("Node").set(node).get()[0];
            if(node){
                $box.each($validators, function () {
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
                if($box.is(callback, "function")){
                    callback.apply({
                        isValid: $isValid,
                        message: $message,
                        view: $view,
                        validators: $validators,
                        errors: $errors,
                        node: node,
                    });
                }
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

    /**
     * Permet d'obtenir les erreurs générées par la contrainte.
     *
     * @method getErrors
     * @return {object}
     * @since 1.0
     */
    this.getErrors = function () {
        return $errors
    };


}, {}, {});