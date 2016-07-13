zk().register(function DATETIMEPICKER($this){
    var $self = this, $box = $this.toolbox;
    zk().toolbox.each($this, function () { $self[this.k] = this.v });

    var $container = null;

    /**
     * Permet de définir son conteneur.
     *
     * @method container
     * @param {*} selector Sélecteur pour l'objet Node.
     * @return {DATETIMEPICKER}
     * @since 1.0
     */
    this.container = function (selector) {
        $container = zk().get("Node").set(selector).class("zk-datetime-container");
        return $self;
    };


}, {}, {});