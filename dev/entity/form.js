/**
 * Attribut html pour VALIDATOR.assert :
 *      pattern data-zk-assert data-zk-constraint
 *      data-zk-message
 *      data-zk-view
 *
 */

zk().register(function FORM($this){
    var $self = this, $box = $this.toolbox, $node = zk().get("Node");
    $box.each($this, function () { $self[this.k] = this.v });
    var $forms = $box.toArray(document.forms), $isValid = true, $validators = {}, $errors = {}, $state = undefined;

    // Le formulaire est envoyé que s'il est valide
    zk().get("Node").set($forms).on("submit.zkFormEntitySubmitEvent", function () {
        var form = zk().get("Form").set(this.target);
        form.validate();
        if(!form.isValid()){
            this.e.preventDefault();
            this.e.defaultPrevented = true;
            this.e.returnValue = false;
        }
    });

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
    };

    /**
     * Permet de définir des formulaires.
     *
     * @method set
     * @param {*} selector Sélecteur pour les formulaires.
     * @return {FORM}
     * @since 1.0
     */
    this.set = function (selector) {
        var nodes = zk().get("Node").set(selector);
        $forms = [];
        nodes.each(function () {
            if((this.v.nodeName).toLowerCase() === "form"){
                $forms.push(this.v);
            }
        });
        return $self;
    };

    /**
     * Permet de valider des formulaires.
     *
     * @method validate
     * @param {Function} callback Fonction qui sera exécutée à chaque validation
     * @return {FORM}
     * @since 1.0
     */
    this.validate = function (callback) {
        $errors = {}, $state = true;
        $box.each($forms, function () {
            var elements = this.v.elements;
            $box.each(elements, function () {
                if(this.v.hasAttribute("pattern") || this.v.hasAttribute("data-zk-assert") || this.v.hasAttribute("data-zk-constraint")){
                    $node = $node.set(this.v);
                    var id = $node.ID(true).ID(),
                        message = this.v.getAttribute("data-zk-message"),
                        view = this.v.getAttribute("data-zk-view"),
                        constraint = this.v.getAttribute("data-zk-assert") || this.v.getAttribute("data-zk-constraint");
                    if(this.v.hasAttribute("pattern")){ constraint = new RegExp(this.v.getAttribute("pattern")); }
                    var validator = zk().get("Validator");
                    validator.assert("val", constraint, message, view);
                    validator.validate(this.v, callback);
                    if(!validator.isValid()){ $isValid = false; }
                    $validators[id] = validator;
                    if(!validator.isValid()){
                        $errors[id] = validator.getErrors();
                    }
                }

            });
        });
        return this;
    };

    /**
     * Permet d'obtenir l'état de la validation.
     *
     * @method isValid
     * @return {boolean}
     * @since 1.0
     */
    this.isValid = function () {
        return $isValid
    };

    /**
     * Permet d'obtenir les objets Validator utilisés pour la validation.
     *
     * @method getValidators
     * @return {object}
     * @since 1.0
     */
    this.getValidators = function () {
        return $validators
    };

    /**
     * Permet d'obtenir les erreurs générées lors de la validation.
     *
     * @method getErrors
     * @return {object}
     * @since 1.0
     */
    this.getErrors = function () {
        return $errors
    };


}, {}, {});