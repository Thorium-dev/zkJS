zk().register(function Document($this){
    var self = this; zk().toolbox.each($this, function () { self[this.k] = this.v });

}, {

    "on": function (events, callback) {
        return forDocumentWindowOnEvent(this, events, callback, document);
    },
    "off": function (events) {
        return forNodeOffEvent(this, events, document);
    },
    "trigger": function (events) {
        return forNodeTriggerEvent(this, events, document);
    },

    /**
     * Permet d'ajouter l'évènement click.
     *
     * @method click
     * @param {function} callback Fonction qui sera exécutée par l'évènement.
     * @return {Document}
     * @since 1.0
     */
    "click": function (callback) {
        return this.on("click", callback);
    },
    /**
     * Permet d'ajouter l'évènement mousedown.
     *
     * @method mousedown
     * @param {function} callback Fonction qui sera exécutée par l'évènement.
     * @return {Document}
     * @since 1.0
     */
    "mousedown": function (callback) {
        return this.on("mousedown", callback);
    },
    /**
     * Permet d'ajouter l'évènement mouseup.
     *
     * @method mouseup
     * @param {function} callback Fonction qui sera exécutée par l'évènement.
     * @return {Document}
     * @since 1.0
     */
    "mouseup": function (callback) {
        return this.on("mouseup", callback);
    },
    /**
     * Permet d'ajouter l'évènement mousemove.
     *
     * @method mousemove
     * @param {function} callback Fonction qui sera exécutée par l'évènement.
     * @return {Document}
     * @since 1.0
     */
    "mousemove": function (callback) {
        return this.on("mousemove", callback);
    },
    /**
     * Permet d'ajouter l'évènement keydown.
     *
     * @method keydown
     * @param {function} callback Fonction qui sera exécutée par l'évènement.
     * @return {Document}
     * @since 1.0
     */
    "keydown": function (callback) {
        return this.on("keydown", callback);
    },
    /**
     * Permet d'ajouter l'évènement keyup.
     *
     * @method keyup
     * @param {function} callback Fonction qui sera exécutée par l'évènement.
     * @return {Document}
     * @since 1.0
     */
    "keyup": function (callback) {
        return this.on("keyup", callback);
    },
    /**
     * Permet d'ajouter l'évènement keypress.
     *
     * @method keypress
     * @param {function} callback Fonction qui sera exécutée par l'évènement.
     * @return {Document}
     * @since 1.0
     */
    "keypress": function (callback) {
        return this.on("keypress", callback);
    },


}, {});