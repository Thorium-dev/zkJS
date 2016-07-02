
zk().register(function ROUTER($this){
    var $self = this, $location = window.location;
    zk().toolbox.each($this, function () { $self[this.k] = this.v });

    /**
     * Permet d'obtenir l'url de la page courante ou de définir une nouvelle url. Par exemple : http://zkjs.fr/spec/
     *
     * @method url
     * @param {string} [url]
     * @return {ROUTER}
     * @since 1.0
     */
    this.url = function (url) {
        if(url === undefined){ return $location.href; }
        $location.href = url + "";
        return this;
    };

    /**
     * Permet d'obtenir la partie de l'URL qui suit le symbole "#" ou de la définir.
     *
     * @method hash
     * @param {string} [hash]
     * @return {ROUTER}
     * @since 1.0
     */
    this.hash = function (hash) {
        if(hash === undefined){ return $location.hash.slice(1); }
        $location.hash = "#" + hash;
        return this;
    };

    /**
     * Permet d'obtenir le nom de l'hôte (sans son numéro de port) ou de le définir. Par exemple : zkjs.fr
     *
     * @method host
     * @param {string} [host]
     * @return {ROUTER}
     * @since 1.0
     */
    this.host = function (host) {
        if(host === undefined){ return $location.host; }
        $location.host = "" + host;
        return this;
    };



}, {}, {});