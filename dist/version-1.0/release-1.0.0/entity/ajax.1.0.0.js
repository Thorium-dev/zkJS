APP.register(function AJAX($this) {
    var $self = this, xhr = null, $request = null, $box = $this.toolbox;
    $box.each($this, function () { $self[this.k] = this.v });
    var settings = {
            "method": "get",
            "datas": {},
            "headers": {'X-Requested-With': 'XMLHttpRequest'},
            "url": null,
            "type": "text",
            "state": {},
            "status": {},
            "success": null,
            "error": null,
        },
        xhrMethodType = {
            "get": function () {
                var datas = "";
                $box.each(settings.datas, function () {
                    datas += "&" + this.k + "=" + encodeURIComponent(this.v);
                });
                datas = datas.slice(1);
                xhr.open("GET", settings.url + "?" + datas, true);
                $box.each(settings.headers, function () {
                    xhr.setRequestHeader(this.k, this.v)
                });
                xhr.send(null);
            },
            "post": function () {
                xhr.open("POST", settings.url, true);
                $box.each(settings.headers, function () {
                    xhr.setRequestHeader(this.k, this.v)
                });
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                var datas = "";
                $box.each(settings.datas, function () {
                    datas += "&" + this.k + "=" + this.v;
                });
                datas = datas.slice(1);
                xhr.send(datas);
            }
        },
        getResponseByType = {
            "text": function () {
                return xhr.responseText
            },
            "xml": function () {
                return xhr.responseXML || xhr.responseText;
            },
            "html": function () {
                return this.xml()
            },
            "json": function () {
                var rep = xhr.responseText;
                try {
                    rep = JSON.parse(rep)
                } catch (e) {
                    console.log(e)
                }
                return rep
            },
            "node": function () {
                var rep = this.json();
                if ($box.is(rep, "object")) {
                    rep = createElementByObject($this, rep);
                }
                return $self.entity.get("node").set(rep)
            },
        },
        convertXhrState = {
            "0": "init",
            "1": "create",
            "2": "send",
            "3": "beforeDone",
            "4": "done"
        },
        allXhrState = {
            "init": 0,
            "create": 1,
            "beforeSend": 1,
            "send": 2,
            "afterSend": 3,
            "beforeDone": 3,
            "done": 4,
        };

    if (window.XMLHttpRequest || window.ActiveXObject) {
        if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        } else {
            xhr = new XMLHttpRequest();
        }
    }

    /**
     * Permet d'envoyer la requête ajax.
     * @method send
     * @param {String} [url] Configuration rapide pour envoyer une requête ajax. Exemple : "http://ajax.fr/ $get $json"
     * @param {Function} [successCallback] Fonction à exécuter en cas de success.
     * @param {Function} [errorCallback] Fonction à exécuter en cas d'echec.
     * @return {AJAX}
     * @since 1.0
     */
    this.send = function (url, successCallback, errorCallback) {
        if (xhr) {
            if($box.is(url, "string") && url){
                url = url.replace(/ +/g, " ").replace(/ = /g, "=");
                url = url.replace(/\$(\w+)/g, function (str, s) {
                    if(getResponseByType.hasOwnProperty(s.toLowerCase())){
                        $self.type(s)
                    }
                    if(xhrMethodType.hasOwnProperty(s.toLowerCase())){
                        $self.method(s)
                    }
                    return ""
                });
                $self.url(url);
                if($box.is(successCallback, "function")){ settings.success = successCallback }
                if($box.is(errorCallback, "function")){ settings.error = errorCallback }
            }
            $request = null;
            settings.headers["Content-Type"] = "text/" + settings.type;
            settings.headers["X-Requested-With"] = "XMLHttpRequest";
            xhrMethodType[settings.method]();
            xhr.onreadystatechange = function () {
                var request = {};
                request.method = settings.method;
                request.datas = settings.datas;
                request.datas = settings.datas;
                request.url = settings.url;
                request.type = settings.type;
                request.headers = xhr.getAllResponseHeaders();
                request.response = null;
                request.textResponse = xhr.responseText;
                request.xmlResponse = xhr.responseXML;
                request.state = xhr.readyState;
                request.status = xhr.status;
                request.success = false;
                request.error = false;
                var state = settings.state[convertXhrState[xhr.readyState]];
                if (state) {
                    state.apply(request)
                }
                var status = settings.status[xhr.status];
                if (status) {
                    status.apply(request)
                }
                if (xhr.readyState == 4) {
                    if (xhr.status == 200 || xhr.status == 0) {
                        request.success = true;
                        request.response = getResponseByType[request.type]();
                        var success = settings.success;
                        if (success) {
                            success.apply(request)
                        }
                    } else {
                        request.error = true;
                        var error = settings.error;
                        if (error) {
                            error.apply(request)
                        }
                    }
                }
                $request = request;
            };
        }
        return $self
    };

    /**
     * Permet d'envoyer la requête ajax.
     * @method execute
     * @param {String} [url] Configuration rapide pour envoyer une requête ajax. Exemple : "http://zkjs.fr/ $get $json"
     * @param {Function} [successCallback] Fonction à exécuter en cas de success.
     * @param {Function} [errorCallback] Fonction à exécuter en cas d'echec.
     * @return {AJAX}
     * @since 1.0
     */
    this.execute = function (url, successCallback, errorCallback) {
        return this.send(url, successCallback, errorCallback)
    };

    /**
     * Si la requête est terminée, elle permet d'obtenir la réponse.
     * @method response
     * @return {*}
     * @since 1.0
     */
    this.response = function () {
        return $request ? $request.response : null
    };

    /**
     * Permet d'obtenir ou de définir la méthode de la requête.
     * @method method
     * @param {String} [value] La valeur de la méthode.
     * @return {*}
     * @since 1.0
     */
    this.method = function (value) {
        if (value === undefined) {
            return settings.method
        }
        value = (value + "").toLowerCase();
        if (xhrMethodType.hasOwnProperty(value)) {
            settings.method = value;
        }
        return $self;
    };

    /**
     * Permet d'obtenir ou de définir les données à transmettre au serveur.
     * @method datas
     * @param {String|Object} [name] Clé de la valeur ou objet contenant clé/valeur.
     * @param {String} [value] Valeur de la clé.
     * @return {*}
     * @since 1.0
     */
    this.datas = function (name, value) {
        if (name === undefined) {
            return settings.datas
        }
        var nameType = $box.is(name);
        if (nameType === "string") {
            settings.datas[name] = value
        }
        if (nameType === "object") {
            settings.datas = name;
        }
        return $self;
    };

    /**
     * Permet d'obtenir ou de définir les en-têtes d'une requête.
     * @method headers
     * @param {String|Object} [name] Clé de la valeur ou objet contenant clé/valeur.
     * @param {String} [value] Valeur de la clé.
     * @return {*}
     * @since 1.0
     */
    this.headers = function (name, value) {
        if (name === undefined) {
            return $request ? $request.headers : settings.headers
        }
        var nameType = $box.is(name);
        if (nameType === "string") {
            settings.headers[name] = value
        }
        if (nameType === "object") {
            settings.headers = name;
        }
        return $self;
    };

    /**
     * Permet d'obtenir ou de définir l'url de la requête.
     * @method url
     * @param {String} [url] Url de la requête.
     * @return {*}
     * @since 1.0
     */
    this.url = function (url) {
        if (url === undefined) {
            return settings.url
        }
        settings.url = url;
        return $self
    };

    /**
     * Permet d'obtenir ou de définir le type de données qui doit être renvoyé par le serveur.
     * @method type
     * @param {String} [value] Valeur de la clé.
     * @return {*}
     * @since 1.0
     */
    this.type = function (value) {
        if (value === undefined) {
            return settings.type
        }
        if (getResponseByType.hasOwnProperty(value)) {
            settings.type = value;
        }
        return $self
    };

    /**
     * Permet d'obtenir l'etat de la requête ou de définir une fonction à exécuter quand la requête se trouve dans un état.
     *      - 0 : L'objet XHR a été créé, mais pas encore initialisé (la méthode open n'a pas encore été appelée)
     *      - 1 : L'objet XHR a été créé, mais pas encore envoyé (avec la méthode send )
     *      - 2 : La méthode send vient d'être appelée
     *      - 3 : Le serveur traite les informations et a commencé à renvoyer des données
     *      - 4 : Le serveur a fini son travail, et toutes les données sont réceptionnées
     * @method state
     * @param {String|Object} [name] Nom de l'etat ou objet contenant nom/fonction.
     * @param {Function} [callback] Fonction à exécuter.
     * @return {*}
     * @since 1.0
     */
    this.state = function (name, callback) {
        if (name) {
            return $request ? $request.state : null
        }
        var nameType = $box.is(name);
        if (nameType !== "string") {
            nameType = {};
            nameType[name] = callback;
            name = nameType;
            nameType = "object";
        } else {
            settings.state = {};
        }
        if (nameType === "object") {
            $box.each(name, function () {
                if (allXhrState.hasOwnProperty(this.k)) {
                    var state = allXhrState[this.k];
                    state = convertXhrState[state];
                    if ($box.is(this.v, "function")) {
                        settings.state[state] = this.v;
                    }
                }
            });
        }
        return $self;
    };

    /**
     * Permet d'obtenir le code status ou de définir une fonction à exécuter pour un code status.
     * @method status
     * @param {String|Object} [code] Code status ou objet contenant code/fonction.
     * @param {Function} [callback] Fonction à exécuter.
     * @return {*}
     * @since 1.0
     */
    this.status = function (code, callback) {
        if (code === undefined) {
            return $request ? $request.status : null
        }
        var codeType = $box.is(code);
        if (codeType !== "object") {
            codeType = {};
            codeType[code] = callback;
            code = codeType;
            codeType = "object";
        } else {
            settings.status = {};
        }
        if (codeType === "object") {
            $box.each(code, function () {
                if ($box.is(this.v, "function")) {
                    settings.status[this.k + ""] = this.v;
                }
            });
        }
        return $self;
    };

    /**
     * Permet d'obtenir ou de définir une fonction à exécuter pour une requête réussite.
     * @method success
     * @param {Function} [callback] Fonction à exécuter.
     * @return {*}
     * @since 1.0
     */
    this.success = function (callback) {
        if (callback === undefined) {
            return $request ? $request.success : null
        }
        if ($box.is(callback, "function")) {
            settings.success = callback
        }
        return $self
    };

    /**
     * Permet d'obtenir ou de définir une fonction à exécuter pour une requête en echec.
     * @method error
     * @param {Function} [callback] Fonction à exécuter.
     * @return {*}
     * @since 1.0
     */
    this.error = function (callback) {
        if (callback === undefined) {
            return $request ? $request.error : null
        }
        if ($box.is(callback, "function")) {
            settings.error = callback
        }
        return $self
    };

    // Racourcis pour state

    /**
     * Permet de définir une fonction à exécuter avant l'envoie de la requête.
     * @method beforeSend
     * @param {Function} [callback] Fonction à exécuter.
     * @return {*}
     * @since 1.0
     */
    this.beforeSend = function (callback) {
        return this.state("beforeSend", callback)
    };

    /**
     * Permet de définir une fonction à exécuter après l'envoie de la requête.
     * @method afterSend
     * @param {Function} [callback] Fonction à exécuter.
     * @return {*}
     * @since 1.0
     */
    this.afterSend = function (callback) {
        return this.state("afterSend", callback)
    };

    /**
     * Permet de définir une fonction à exécuter quand le serveur traite les informations et commence à renvoyer des données
     * @method afterSend
     * @param {Function} [callback] Fonction à exécuter.
     * @return {*}
     * @since 1.0
     */
    this.beforeDone = function (callback) {
        return this.state("beforeDone", callback)
    };

    /**
     * Permet d'obtenir ou de définir une fonction à exécuter pour une requête terminée.
     * @method done
     * @param {Function} [callback] Fonction à exécuter.
     * @return {*}
     * @since 1.0
     */
    this.done = function (callback) {
        return this.state("done", callback)
    };

}, {}, {});