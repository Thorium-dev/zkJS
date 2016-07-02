zk().register(function ROUTER($this){
    var $self = this, $location = window.location, $box = $this.toolbox;
    $box.each($this, function () { $self[this.k] = this.v });

    var s = $location.search.slice(1);
    var $vars = s ? zk().get("Convertor").object(s, "&", "=") : {};

    /**
     * Permet d'obtenir l'url de la page courante ou de définir une nouvelle url. Par exemple : http://zkjs.fr/spec/
     *
     * @method url
     * @param {string} [url]
     * @return {ROUTER|string}
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
     * @return {ROUTER|string}
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
     * @return {ROUTER|string}
     * @since 1.0
     */
    this.host = function (host) {
        if(host === undefined){ return $location.host; }
        $location.host = "" + host;
        return this;
    };

    /**
     * Permet d'obtenir le chemin (relativement à l'hôte) ou de le définir. Par exemple : /zkjs.fr
     *
     * @method path
     * @param {string} [path]
     * @return {ROUTER|string}
     * @since 1.0
     */
    this.path = function (path) {
        if(path === undefined){ return $location.path || ""; }
        // @TODO : Revoir après la création des autres méthodes
        $location.path = "" + path;
        return this;
    };

    /**
     * Permet d'obtenir le numéro de port de l'URL ou de le définir.
     *
     * @method port
     * @param {string} [port]
     * @return {ROUTER|string} Si l'URL n'a pas de port, une chaîne de caractères vide est renvoyée.
     * @since 1.0
     */
    this.port = function (port) {
        if(port === undefined){ return $location.port || ""; }
        $location.port = "" + port;
        return this;
    };

    /**
     * Permet d'obtenir le protocole de l'URL ou de le définir. Par exemple : http
     *
     * @method protocol
     * @param {string} [protocol]
     * @return {ROUTER|string}
     * @since 1.0
     */
    this.protocol = function (protocol) {
        if(protocol === undefined){ return $location.protocol.slice(0, -1) || ""; }
        $location.protocol = "" + protocol;
        return this;
    };

    /**
     * Permet d'obtenir les variables transmises à l'url ou de définir des variables.
     *
     * @method vars
     * @param {string} [name]
     * @return {object|string}
     * @since 1.0
     */
    this.vars = function (name) {
        if (name === undefined) { return $vars }
        return $vars[name];
    };

    /**
     * Permet de recharger le document depuis l'URL actuelle. forceget est une valeur booléenne, qui lorsqu'elle vaut true force la page à être rechargée depuis le serveur. Si elle vaut false ou n'est pas précisée, le navigateur peut recharger la page depuis son cache.
     *
     * @method reload
     * @param {boolean} [forceget]
     * @return {ROUTER}
     * @since 1.0
     */
    this.reload = function (forceget) {
        $location.reload(forceget);
        return this;
    };

    /**
     * Permet d'obtenir l'url de la page lié à la page courante.
     *
     * @method referrer
     * @return {string}
     * @since 1.0
     */
    this.referrer = function () {
        return document.referrer;
    };



}, {}, {});