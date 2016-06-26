(function ($W) {
    'use strict';


    var THIS = this, ID = parseInt(Math.random() * 1000000000000),
        windowID = (ID++) + parseInt(Math.random() * 1000),
        documentID = (ID++) + parseInt(Math.random() * 1000);

    var APP = {
        // Raccourcis vers _ENTITY_
        "register": function (entityFunc, methods, parameters) {
            return this._ENTITY_.register(entityFunc, methods, parameters);
        },
        "get": function (entity) {
            return this._ENTITY_.get(entity);
        },
        // Raccourcis vers _CONTAINER_
        "getContainer": function (path) {
            return this._CONTAINER_.get(path);
        },
        "setContainer": function (path, value) {
            return this._CONTAINER_.set(path, value);
        },
        "removeContainer": function (path) {
            return this._CONTAINER_.remove(path);
        },
        "is": function (el, type) {
            return this._TOOLBOX_.is(el, type)
        },
    };

    function _CONTAINER_() {
        var _CONTAINER_ = {};
        this.get = function (path) {
            var arrayPath = ("" + path).split(".");
            var n = arrayPath.length, temp = _CONTAINER_;
            for (var i = 0; i < n; i++) {
                temp = temp[arrayPath[i]];
                if (temp === undefined) {
                    return null
                }
            }
            return temp;
        };
        this.set = function (path, value) {
            if (value !== undefined) {
                var arrayPath = ("" + path).split(".");
                var n = arrayPath.length, temp = _CONTAINER_;
                for (var i = 0; i < n - 1; i++) {
                    if (temp[arrayPath[i]] === undefined) {
                        temp[arrayPath[i]] = {}
                    }
                    temp = temp[arrayPath[i]];
                }
                var v = temp[arrayPath[n - 1]];
                if (!APP.is(v, "object") && v !== undefined) {
                    if (!APP.is(v, "array")) {
                        v = [v]
                    }
                    value = v.concat(value);
                }
                temp[arrayPath[n - 1]] = value;
            }
            return _CONTAINER_;
        };
        this.remove = function (path) {
            var arrayPath = ("" + path).split(".");
            var n = arrayPath.length, temp = _CONTAINER_;
            for (var i = 0; i < n - 1; i++) {
                temp = temp[arrayPath[i]];
                if (temp === undefined) {
                    return _CONTAINER_
                }
            }
            delete temp[arrayPath[n - 1]];
            return _CONTAINER_;
        };
    }
    APP._CONTAINER_ = new _CONTAINER_();
    APP.container = APP._CONTAINER_;

    function _TOOLBOX_() {
        var self = this;

        /**
         * Permet de connaître ou de tester le type d'un élément.
         * @method is
         * @param {*} el Objet de référence.
         * @param {string} type Si ce paramètre est indiqué, on teste le type de l'élément, sinon on obtient son type.
         * @return {boolean|string}
         * @since 1.0
         */
        this.is = function (el, type) {
            if (el === null) {
                return null
            }
            var t = (typeof el).toLowerCase();
            if (t === 'object') {
                el = String(el.constructor).toLowerCase();
                if (/^(?:function|object) ([a-z0-9-]+)\(?/.test(el)) {
                    t = RegExp.$1;
                    if (/^html[a-z]*element$/.test(t)) {
                        t = 'nodeelement'
                    }
                } else {
                    t = undefined
                }
            }
            var type2 = type;
            if (type !== undefined && type !== null) {
                if (!/\bregexp\b/i.test(String(type.constructor))) {
                    type2 = new RegExp('\\b' + type + '\\b', 'i')
                }
            }
            if(t === "htmldocument"){ t = "document" }
            return (type === undefined || !t) ? t : (type2.test(t))
        };
        /**
         * Permet de supprimer des caractères au début et à la fin d'une chaîne
         *
         * @method trim
         * @param {string} el Objet de référence.
         * @param {string|RegExp} [reg] Masque de recherche. Par défaut, le masque est un espace.
         * @param {string} [direction] La direction. Deux valeurs possibles "l" pour la gauche et "r" pour la droite.
         * @return {string}
         * @since 1.0
         */
        this.trim = function (el, reg, direction) {
            if (!self.is(el, "string")) { return el }
            var debut = null, fin = null;
            if (reg === undefined) { reg = ' ' }
            if(self.is(reg, "string")){ reg = new RegExp(reg) }
            self.each(el, function () {
                if(!reg.test(this.v)){ debut = this.i - 1; return APP.get("Error") }
            });
            self.each(el, function () {
                if(!reg.test(this.all[this.z])){ fin = this.z + 1; return APP.get("Error") }
            });
            if(/l|r/.test(direction)){
                if(direction === "l"){
                    if(debut > -1){ el = el.slice(debut+1) }
                }else {
                    if(fin > -1){ el = el.slice(0, fin) }
                }
            }else{
                if(fin > -1){ el = el.slice(0, fin) }
                if(debut > -1){ el = el.slice(debut+1) }
            }
            return el;
        };
        var doEachByObj = {
            string: function (el, f, args) {
                var i, k, elType = self.is(el), r, ob;
                if(elType === "string"){ el = el.split("") }
                k = el.length;
                for (i = 0; i < k; i++) {
                    ob = {i: i, z: k - 1 - i, k: i, v: el[i], l: k, all: el};
                    r = f.apply(ob, args);
                    if (self.is(r, "error")) {
                        if(elType === "string"){ el = el.join("") }
                        return el
                    }
                    if (r === undefined) { r = el[i] }
                    el[i] = r;
                }
                if(elType === "string"){ el = el.join("") }
                return el;
            },
            number: function (el, f, args) {
                el = Math.abs(el);
                for (var i = 0; i < el; i++) {
                    var r = f.apply({i: i, z: el - 1 - i, all: el}, args);
                    if (self.is(r, "error")) { return el }
                }
                return el
            },
            array: function (el, f, args) {
                return doEachByObj.string(el, f, args)
            },
            object: function (el, f, args) {
                var i, r, ob;
                for (i in el) {
                    if (el.hasOwnProperty(i)) {
                        ob = {i: i, k: i, v: el[i], all: el};
                        r = f.apply(ob, args);
                        if (self.is(r, "error")) { return el }
                        if (r === undefined) { r = el[i] }
                        el[i] = r;
                    }
                }
                return el
            },
            node: function (el, f, args) {
                var i, k, nodes = el.get(), r, ob;
                k = nodes.length;
                for (i = 0; i < k; i++) {
                    ob = {i: i, z: k - 1 - i, k: i, v: nodes[i], l: k, all: nodes};
                    r = f.apply(ob, args);
                    if (self.is(r, "error")) {
                        el.set(nodes);
                        return el;
                    }
                    if (r === undefined) { r = nodes[i] }
                    nodes[i] = r;
                }
                el.set(nodes);
                return el;
            },
            nodeelement: function (el, f, args) {
                return doEachByObj.string(self.toArray(el.childNodes), f, args);
            },
            nodelist: function (el, f, args) {
                return doEachByObj.string(self.toArray(el), f, args);
            },
            htmlcollection: function (el, f, args) {
                return doEachByObj.nodelist(el, f, args);
            },
        };
        /**
         * Permet de parcourir des objets.
         * La fonction reçoit en argument l'objet this avec :
         *        - this.i : Index en cours
         *        - this.z : Index en cours en partant de la fin
         *        - this.v : Valeur de l'index en cours
         *        - this.l : La taille totale de l'élément en cours. N'existe pour les objets litéraux
         *        - this.all : L'élément sur lequel la méthode s'applique
         * @method each
         * @param {*} el Objet à parcourir.
         * @param {function} callback Fonction à executer à chaque tour.
         * @param {array} args Les arguments de la fonction callback.
         * @return {*}
         * @since 1.0
         */
        this.each = function (el, callback, args) {
            if (self.is(callback, 'function')) {
                var t = self.is(el);
                if (doEachByObj.hasOwnProperty(t)) {
                    if (args === undefined) { args = [] }
                    if (!self.is(args, 'array')) { args = [args] }
                    el = doEachByObj[t](el, callback, args);
                }
            }
            return el
        };
        /**
         * Permet de convertir un objet en tableau.
         *
         * @method toArray
         * @param {*} el Objet à convertir.
         * @return {array}
         * @since 1.0
         */
        this.toArray = function (el) {
            return [].slice.call(el)
        };
        /**
         * Permet de trier les tableaux dans l'ordre croissant.
         *
         * @method nSort
         * @param {array} el Tableau à trier.
         * @return {array}
         * @since 1.0
         */
        this.nSort = function (el) {
            return el.sort(function (a, b) {
                if (a < b) {
                    return -1
                } else if (a > b) {
                    return 1
                } else {
                    return 0
                }
            })
        };
        /**
         * Permet de trier les tableaux dans l'ordre décroissant.
         *
         * @method nSortD
         * @param {array} el Tableau à trier.
         * @return {array}
         * @since 1.0
         */
        this.nSortD = function (el) {
            return el.sort(function (a, b) {
                if (a > b) {
                    return -1
                } else if (a < b) {
                    return 1
                } else {
                    return 0
                }
            })
        };
        /**
         * Elle supprime les éléments dupliqués d'un tableau.
         * Le tableau est trié par ordre croissant ou décroissant selon la valeur de isDesc.
         * Par défaut, le trie est croissant.
         *
         * @method removeDuplicate
         * @param {array} el Tableau à traiter.
         * @param {boolean} isDesc Boolean qui indique l'ordre croissant ou décroissant. Par défaut : false
         * @return {array}
         * @since 1.0
         */
        this.removeDuplicate = function (el, isDesc) {
            var res = [], r;
            el = (isDesc !== true) ? self.nSort(el) : self.nSortD(el);
            self.each(el, function () {
                var v = this.v;
                if (r !== v) {
                    res.push(v);
                    r = v
                }
            });
            return res
        };
        function indexAndIndexes(el, value, what) {
            if(!self.is(el, "string|array")){ return el }
            var pType = self.is(value);
            var basePath = "_ENTITY_._PARAMETERS_." + self.is(el) + "." + what + ".";
            var f = APP.getContainer(basePath + pType);
            return f ? f(el, value) : APP.getContainer(basePath + "other")(el, value);
        }
        /**
         * Permet d'obtenir l'index d'une valeur dans un objet.
         *
         * @method index
         * @param {*} el Objet de référence.
         * @param {*} value Elément recherché.
         * @return {int} Elle renvoie -1 si la valeur n'a pas été trouvé.
         * @since 1.0
         */
        this.index = function (el, value) {
            return indexAndIndexes(el, value, "index")
        };
        /**
         * Permet d'obtenir les index d'une valeur.
         *
         * @method indexes
         * @param {*} el Objet de référence.
         * @param {*} value Elément recherché.
         * @return {array} Si la valeur n'existe pas, elle renvoie un tableau vide.
         * @since 1.0
         */
        this.indexes = function (el, value) {
            return indexAndIndexes(el, value, "indexes")
        };
        /**
         * Permet d'obtenir le dernier index d'une valeur.
         *
         * @method lastIndex
         * @param {*} el Objet de référence.
         * @param {*} value Elément recherché.
         * @return {array} Si la valeur n'existe pas, elle renvoie un tableau vide.
         * @since 1.0
         */
        this.lastIndex = function (el, value) {
            if(!self.is(el, "string|array")){ return el }
            var indexes = self.indexes(el, value), l = indexes.length;
            return l ? indexes[l - 1] : -1;
        };
        /**
         * Permet de compter le nombre de fois q'une valeur existe dans un élément.
         *
         * @method count
         * @param {string|array} el Objet dans lequel se fera la recherche.
         * @param {*} value Elément recherché.
         * @return {int} Si la valeur n'existe pas, elle renvoie 0.
         * @since 1.0
         */
        this.count = function (el, value) {
            if(!self.is(el, "string|array")){ return el }
            return self.indexes(el, value).length
        };
        /**
         * Permet de vérifier si une valeur existe dans un objet.
         *
         * @method has
         * @param {string|array} el Objet dans lequel se fera la recherche.
         * @param {*} value Elément recherché.
         * @return {boolean} Renvoie true en cas de succès et false dans le cas contraire.
         * @since 1.0
         */
        this.has = function (el, value) {
            if(!self.is(el, "string|array")){ return el }
            return (self.index(el, value) + 1) ? true : false
        };
        /**
         * Permet de renverser une chaîne de caractères ou un tableau.
         *
         * @method reverse
         * @param {string|array} el Chaîne de caratères ou tableau à traiter.
         * @return {string|array}
         * @since 1.0
         */
        this.reverse = function (el) {
            if(!self.is(el, "string|array")){ return el }
            var res = self.is(el, "string") ? "" : [];
            self.each(el, function () {
                res = res.concat(el[this.z])
            });
            return res;
        };
        /**
         * Permet de transformer une chaîne de caractères en camel case.
         *
         * @method camelCase
         * @param {string} el Chaîne de caratères à traiter.
         * @param {string} separators Les séparateurs.
         * @return {string}
         * @since 1.0
         */
        this.camelCase = function (el, separators) {
            if (!self.is(el, "string") || !self.is(separators, "string")) {
                return el
            }
            el = el.split(new RegExp("["+separators+"]", "g"));
            return self.each(el, function () {
                if(this.i > 0){
                    return self.upperFirst(this.v)
                }
            }).join("");
        };
        /**
         * Permet de transformer une chaîne de caractères en snake case.
         *
         * @method snakeCase
         * @param {string} el Chaîne de caratères à traiter.
         * @param {string} separators Les séparateurs.
         * @return {string}
         * @since 1.0
         */
        this.snakeCase = function (el, separators) {
            if(!self.is(el, "string|array")){ return el }
            el = el.split(new RegExp("["+separators+"]", "g"));
            return el.join("_");
        };
        /**
         * Permet de transformer une chaîne de caractères en link case.
         *
         * @method linkCase
         * @param {string} el Chaîne de caratères à traiter.
         * @param {string} separators Les séparateurs.
         * @return {string}
         * @since 1.0
         */
        this.linkCase = function (el, separators) {
            if(!self.is(el, "string|array")){ return el }
            el = el.split(new RegExp("["+separators+"]", "g"));
            return el.join("-");
        };
        /**
         * Permet de générer un identifiant unique.
         *
         * @method generateID
         * @param {window|document|void} [object]
         * @return {Integer}
         * @since 1.0
         */
        this.generateID = function (object) {
            if(object === window){ return windowID }
            if(object === document){ return documentID }
            return (ID++) + parseInt(Math.random() * 1000);
        };
        /**
         * Permet de savoir si un objet est vide.
         * @method isEmpty
         * @param {*} object Objet de référence.
         * @return {boolean}
         * @since 1.0
         */
        this.isEmpty = function (object) {
            for(var k in object){ return false }
            return true;
        };

        // GET

        function getFirstLast(el, value, firstLast) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            var path = "_ENTITY_._PARAMETERS_." + elType + ".get" + firstLast + ".";
            if (value === undefined) { value = 1 }
            var f = APP.getContainer(path + self.is(value));
            return f ? f(el, value) : APP.getContainer(path + "other")();
        }
        /**
         * Permet d'obtenir les premiers éléments d'un objet.
         *
         * @method getFirst
         * @param {*} el Objet de référence.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.getFirst = function (el, value) {
            return getFirstLast(el, value, "First")
        };
        /**
         * Permet d'obtenir le ou les éléments qui se trouvent au milieu.
         *
         * @method getMiddle
         * @param {*} el Objet de référence.
         * @return {*}
         * @since 1.0
         */
        this.getMiddle = function (el) {
            if(!self.is(el, "string|array")){ return el }
            var l = el.length, n = parseInt(l / 2);
            return (l % 2) ? el.slice(n, n + 1) : el.slice(n - 1, n + 1)
        };
        /**
         * Permet d'obtenir les derniers éléments.
         *
         * @method getLast
         * @param {*} el Objet de référence.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.getLast = function (el, value) {
            return getFirstLast(el, value, "Last")
        };
        /**
         * Permet d'obtenir les éléments qui se situent avant index.
         *
         * @method getBefore
         * @param {*} el Objet de référence.
         * @param {*} index
         * @return {*}
         * @since 1.0
         */
        this.getBefore = function (el, index) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            return APP.getContainer("_ENTITY_._PARAMETERS_." + elType + ".getBefore.other")(el, index);
        };
        /**
         * Permet d'obtenir les éléments qui se situent après index.
         *
         * @method getAfter
         * @param {*} el Objet de référence.
         * @param {*} index
         * @return {*}
         * @since 1.0
         */
        this.getAfter = function (el, index) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            return APP.getContainer("_ENTITY_._PARAMETERS_." + elType + ".getAfter.other")(el, index);
        };
        /**
         * Permet d'obtenir une ou plusieurs plages d'un objet.
         *
         * @method getBetween
         * @param {*} el Objet de référence.
         * @param {*} indexes On peut indiquer plusieurs plages.
         * @return {*}
         * @since 1.0
         */
        this.getBetween = function (el, indexes) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            if (indexes === undefined) { indexes = 0 }
            return APP.getContainer("_ENTITY_._PARAMETERS_." + elType + ".getBetween.array")(el, indexes);
        };
        /**
         * Permet d'obtenir des éléments qui se trouvent à des index spécifiés.
         *
         * @method getAt
         * @param {*} el Objet de référence.
         * @param {int|array} indexes Le tableau doit contenir des entiers.
         * @return {*}
         * @since 1.0
         */
        this.getAt = function (el, indexes) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            return APP.getContainer("_ENTITY_._PARAMETERS_." + elType + ".getAt.array")(el, indexes);
        };
        /**
         * Permet d'obtenir des valeurs.
         *
         * @method get
         * @param {*} el Objet de référence.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.get = function (el, value) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            var path = "_ENTITY_._PARAMETERS_." + elType + ".get.";
            if (value === undefined) { return el }
            var f = APP.getContainer(path + self.is(value));
            return f ? f(el, value) : APP.getContainer(path + "other")(el);
        };

        // REMOVE

        function rmFirstLast(el, param, firstLast) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            var basePath = "_ENTITY_._PARAMETERS_." + elType + ".";
            var path = basePath + "remove" + firstLast + ".";
            if (param === undefined) { param = 1 }
            var f = APP.getContainer(path + self.is(param));
            return f ? f(el, param) : APP.getContainer(path + "other")(el, param);
        }
        /**
         * Permet de supprimer les premiers éléments.
         *
         * @method removeFirst
         * @param {*} el Objet de référence.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.removeFirst = function (el, value) {
            return rmFirstLast(el, value, "First")
        };
        /**
         * Permet de supprimer le ou les éléments qui se trouvent au milieu.
         *
         * @method removeMiddle
         * @param {*} el Objet de référence.
         * @return {*}
         * @since 1.0
         */
        this.removeMiddle = function (el) {
            if(!self.is(el, "string|array")){ return el }
            var l = el.length, x = (l % 2) ? 1 : 2, n = parseInt(l / 2);
            return el.slice(0, (x == 2) ? n - 1 : n).concat(el.slice(n + x - (x - 1)));
        };
        /**
         * Permet de supprimer les derniers éléments.
         *
         * @method removeFirst
         * @param {*} el Objet de référence.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.removeLast = function (el, value) {
            return rmFirstLast(el, value, "Last")
        };
        function rmBeforeAfter(el, param, what, argType) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            return APP.getContainer("_ENTITY_._PARAMETERS_." +
                elType + ".remove" + what + "." + argType)(el, param);
        }
        /**
         * Permet de supprimer les éléments qui se situent avant index.
         *
         * @method removeBefore
         * @param {*} el Objet de référence.
         * @param {*} index
         * @return {*}
         * @since 1.0
         */
        this.removeBefore = function (el, index) {
            return rmBeforeAfter(el, index, 'Before', 'other')
        };
        /**
         * Permet de supprimer les éléments qui se situent après index.
         *
         * @method removeAfter
         * @param {*} el Objet de référence.
         * @param {*} index
         * @return {*}
         * @since 1.0
         */
        this.removeAfter = function (el, index) {
            return rmBeforeAfter(el, index, 'After', 'other')
        };
        /**
         * Permet de supprimer une plage.
         *
         * @method removeBetween
         * @param {*} el Objet de référence.
         * @param {*} indexes Il faut indiquer une seule plage.
         * @return {*}
         * @since 1.0
         */
        this.removeBetween = function (el, indexes) {
            return rmBeforeAfter(el, indexes, 'Between', 'array')
        };
        /**
         * Permet de supprimer des éléments qui se trouvent à des index spécifiés.
         *
         * @method removeAt
         * @param {*} el Objet de référence.
         * @param {int|array} indexes Le tableau doit contenir des entiers.
         * @return {*}
         * @since 1.0
         */
        this.removeAt = function (el, indexes) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            var basePath = "_ENTITY_._PARAMETERS_." + elType + ".";
            var path = basePath + "removeAt.";
            var f = APP.getContainer(path + self.is(indexes));
            return f ? f(el, indexes) : el;
        };
        /**
         * Permet de supprimer des valeurs.
         *
         * @method remove
         * @param {*} el Objet de référence.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.remove = function (el, value) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            if (value === undefined) { return el }
            var path = "_ENTITY_._PARAMETERS_." + elType + ".remove.";
            var f = APP.getContainer(path + self.is(value));
            return f ? f(el, value) : APP.getContainer(path + "other")(el, value);
        };

        // ADD

        function addFirstLast(el, value, firstLast) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            if (value === undefined) { return el }
            var path = "_ENTITY_._PARAMETERS_." + elType + ".add" + firstLast + ".other";
            return APP.getContainer(path)(el, value);
        }
        /**
         * Permet d'ajouter des valeurs au début.
         *
         * @method addFirst
         * @param {*} el Objet de référence.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.addFirst = function (el, value) {
            return addFirstLast(el, value, "First")
        };
        /**
         * Permet d'ajouter des valeurs au milieu.
         *
         * @method addMiddle
         * @param {*} el Objet de référence.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.addMiddle = function (el, value) {
            if(!self.is(el, "string|array")){ return el }
            var l = el.length, n = parseInt(l / 2);
            return doSlice(el, n, n, value);
        };
        /**
         * Permet d'ajouter des valeurs à la fin.
         *
         * @method addLast
         * @param {*} el Objet de référence.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.addLast = function (el, value) {
            return addFirstLast(el, value, "Last")
        };
        function addBeforeAfter(el, index, value, beforeAfter) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            if (value === undefined) { return el }
            var path = "_ENTITY_._PARAMETERS_." + elType + ".add" + beforeAfter + ".other";
            return APP.getContainer(path)(el, index, value);
        }
        /**
         * Permet d'ajouter des éléments avant des index.
         *
         * @method addBefore
         * @param {*} el Objet de référence.
         * @param {*} index
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.addBefore = function (el, index, value) {
            return addBeforeAfter(el, index, value, "Before")
        };
        /**
         * Permet d'ajouter des éléments après des index.
         *
         * @method addAfter
         * @param {*} el Objet de référence.
         * @param {*} index
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.addAfter = function (el, index, value) {
            return addBeforeAfter(el, index, value, "After")
        };
        /**
         * Permet d'ajouter des valeurs à des positions spécifiques.
         *
         * @method addAt
         * @param {*} el Objet de référence.
         * @param {*} index
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.addAt = function (el, index, value) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            if (value === undefined) { return el }
            var path = "_ENTITY_._PARAMETERS_." + elType + ".addAt.array";
            return APP.getContainer(path)(el, index, value);
        };
        /**
         * Permet d'ajouter des valeurs.
         *
         * @method add
         * @param {*} el Objet de référence.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.add = function (el, value) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            if (value === undefined) { return el }
            var path = "_ENTITY_._PARAMETERS_." + elType + ".addLast.other";
            return APP.getContainer(path)(el, value);
        };

        // CHANGE

        function changeFirstLast(el, oldValue, newValue, firstLast) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            if (oldValue === undefined) { return el }
            if (newValue === undefined) { newValue = oldValue; oldValue = 1 }
            var basePath = "_ENTITY_._PARAMETERS_." + elType + ".";
            var path = basePath + "change" + firstLast + "." + ( (self.is(oldValue) === 'number') ? 'number' : 'other' );
            return APP.getContainer(path)(el, oldValue, newValue);
        }
        /**
         * Permet de changer les premiers éléments.
         *
         * @method changeFirst
         * @param {*} el Objet de référence.
         * @param {*} oldValue
         * @param {*} newValue
         * @return {*}
         * @since 1.0
         */
        this.changeFirst = function (el, oldValue, newValue) {
            return changeFirstLast(el, oldValue, newValue, "First")
        };
        this.changeMiddle = function (el, value) {
            if(!self.is(el, "string|array")){ return el }
            return self.addMiddle(self.removeMiddle(el), value);
        };
        /**
         * Permet de changer les derniers éléments.
         *
         * @method changeLast
         * @param {*} el Objet de référence.
         * @param {*} oldValue
         * @param {*} newValue
         * @return {*}
         * @since 1.0
         */
        this.changeLast = function (el, oldValue, newValue) {
            return changeFirstLast(el, oldValue, newValue, "Last")
        };
        function changeBeforeAfter(el, index, value, beforeAfter) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            if (index === undefined || value === undefined) { return el }
            var basePath = "_ENTITY_._PARAMETERS_." + elType + ".";
            var path = basePath + "change" + beforeAfter + ".other";
            return APP.getContainer(path)(el, index, value);
        }
        /**
         * Permet de changer les éléments qui se situent avant index.
         *
         * @method changeBefore
         * @param {*} el Objet de référence.
         * @param {*} index
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.changeBefore = function (el, index, value) {
            return changeBeforeAfter(el, index, value, "Before")
        };
        /**
         * Permet de changer les éléments qui se situent après index.
         *
         * @method changeAfter
         * @param {*} el Objet de référence.
         * @param {*} index
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.changeAfter = function (el, index, value) {
            return changeBeforeAfter(el, index, value, "After")
        };
        /**
         * Permet de changer une plage.
         *
         * @method changeBetween
         * @param {*} el Objet de référence.
         * @param {*} indexes Il faut indiquer une seule plage.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.changeBetween = function (el, indexes, value) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            if (indexes === undefined || value === undefined) { return el }
            var path = "_ENTITY_._PARAMETERS_." + elType + ".changeBetween.array";
            return APP.getContainer(path)(el, indexes, value);
        };
        /**
         * Permet de changer des éléments qui se trouvent à des index spécifiés.
         *
         * @method changeAt
         * @param {*} el Objet de référence.
         * @param {*} indexes
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.changeAt = function (el, indexes, value) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            if (indexes === undefined || value === undefined) { return el }
            var path = "_ENTITY_._PARAMETERS_." + elType + ".changeAt.array";
            return APP.getContainer(path)(el, indexes, value);
        };
        /**
         * Permet de changer des valeurs.
         *
         * @method change
         * @param {*} el Objet de référence.
         * @param {*} oldValue
         * @param {*} newValue
         * @return {*}
         * @since 1.0
         */
        this.change = function (el, oldValue, newValue) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            if (oldValue === undefined || newValue === undefined) { return el }
            var path = "_ENTITY_._PARAMETERS_." + elType + ".change.";
            var f = APP.getContainer(path + self.is(oldValue));
            return f ? f(el, oldValue, newValue) : APP.getContainer(path + "other")(el, oldValue, newValue);
        };

        // UPPER

        function upperLowerFirstLast(el, value, firstLast, upperLower) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            if (value === undefined) { value = 1 }
            var path = "_ENTITY_._PARAMETERS_." + elType +
                ".upper" + firstLast + "." + self.is(value);
            var f = APP.getContainer(path);
            return f ? f(el, value, upperLower) : el;
        }
        /**
         * Permet de mettre en majuscule les premiers éléments.
         *
         * @method upperFirst
         * @param {*} el Objet de référence.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.upperFirst = function (el, value) {
            return upperLowerFirstLast(el, value, "First", "Upper")
        };
        /**
         * Permet de mettre en majuscule les derniers éléments.
         *
         * @method upperLast
         * @param {*} el Objet de référence.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.upperLast = function (el, value) {
            return upperLowerFirstLast(el, value, "Last", "Upper")
        };
        function upperLowerMiddle(el, upperLower) {
            if(!self.is(el, "string|array")){ return el }
            var l = el.length, x = (l % 2) ? 1 : 2, n = parseInt(l / 2);
            return doSlice(el, (x == 2) ? n - 1 : n, n + x - (x - 1), upperLowerTab((x == 1) ? el.slice(n, n + 1) : el.slice(n - 1, n + 1), upperLower));
        }
        /**
         * Permet de mettre en majuscule les éléments au milieu.
         *
         * @method upperMiddle
         * @param {*} el Objet de référence.
         * @return {*}
         * @since 1.0
         */
        this.upperMiddle = function (el) {
            return upperLowerMiddle(el, "Upper")
        };
        function upperLowerBeforeAfter(el, index, beforeAfter, upperLower) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            var path = "_ENTITY_._PARAMETERS_." + elType +
                ".upper" + beforeAfter + ".other";
            return APP.getContainer(path)(el, index, upperLower);
        }
        /**
         * Permet de mettre en majuscule les éléments qui se situent avant index.
         *
         * @method upperBefore
         * @param {*} el Objet de référence.
         * @param {*} index
         * @return {*}
         * @since 1.0
         */
        this.upperBefore = function (el, index) {
            return upperLowerBeforeAfter(el, index, "Before", "Upper")
        };
        /**
         * Permet de mettre en majuscule les éléments qui se situent après index.
         *
         * @method upperAfter
         * @param {*} el Objet de référence.
         * @param {*} index
         * @return {*}
         * @since 1.0
         */
        this.upperAfter = function (el, index) {
            return upperLowerBeforeAfter(el, index, "After", "Upper")
        };
        function upperLowerBetween(el, indexes, upperLower) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            if (indexes === undefined) { return el }
            var path = "_ENTITY_._PARAMETERS_." + elType +
                ".upperBetween.array";
            return APP.getContainer(path)(el, indexes, upperLower);
        }
        /**
         * Permet de mettre en majuscule une ou plusieurs plages.
         *
         * @method upperBetween
         * @param {*} el Objet de référence.
         * @param {*} indexes
         * @return {*}
         * @since 1.0
         */
        this.upperBetween = function (el, indexes) {
            return upperLowerBetween(el, indexes, "Upper")
        };
        function upperLowerAt(el, indexes, upperLower) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            if (indexes === undefined) { return el }
            var path = "_ENTITY_._PARAMETERS_." + elType +
                ".upperAt." + self.is(indexes);
            var f = APP.getContainer(path);
            return f ? f(el, indexes, upperLower) : el;
        }
        /**
         * Permet de mettre en majuscule des éléments qui se trouvent à des index spécifiés.
         *
         * @method upperAt
         * @param {*} el Objet de référence.
         * @param {int|array} indexes
         * @return {*}
         * @since 1.0
         */
        this.upperAt = function (el, indexes) {
            return upperLowerAt(el, indexes, "Upper")
        };
        function upperLower(el, indexes, upperLower) {
            var elType = self.is(el);
            if(!/string|array/.test(elType)){ return el }
            if (indexes === undefined) { indexes = el }
            var path = "_ENTITY_._PARAMETERS_." + elType +
                ".upper." + self.is(indexes);
            var f = APP.getContainer(path);
            return f ? f(el, indexes, upperLower) : el;
        }
        /**
         * Permet de mettre en majuscule des valeurs.
         *
         * @method upper
         * @param {*} el Objet de référence.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.upper = function (el, value) {
            return upperLower(el, value, "Upper")
        };

        // LOWER

        /**
         * Permet de mettre en minuscule les premiers éléments.
         *
         * @method lowerFirst
         * @param {*} el Objet de référence.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.lowerFirst = function (el, value) {
            return upperLowerFirstLast(el, value, "First", "Lower")
        };
        /**
         * Permet de mettre en minuscule les derniers éléments.
         *
         * @method lowerLast
         * @param {*} el Objet de référence.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.lowerLast = function (el, value) {
            return upperLowerFirstLast(el, value, "Last", "Lower")
        };
        /**
         * Permet de mettre en minuscule les éléments au milieu.
         *
         * @method lowerMiddle
         * @param {*} el Objet de référence.
         * @return {*}
         * @since 1.0
         */
        this.lowerMiddle = function (el) {
            return upperLowerMiddle(el, "Lower")
        };
        /**
         * Permet de mettre en minuscule les éléments qui se situent avant index.
         *
         * @method lowerBefore
         * @param {*} el Objet de référence.
         * @param {*} index
         * @return {*}
         * @since 1.0
         */
        this.lowerBefore = function (el, index) {
            return upperLowerBeforeAfter(el, index, "Before", "Lower")
        };
        /**
         * Permet de mettre en minuscule les éléments qui se situent après index.
         *
         * @method lowerAfter
         * @param {*} el Objet de référence.
         * @param {*} index
         * @return {*}
         * @since 1.0
         */
        this.lowerAfter = function (el, index) {
            return upperLowerBeforeAfter(el, index, "After", "Lower")
        };
        /**
         * Permet de mettre en minuscule une ou plusieurs plages.
         *
         * @method lowerBetween
         * @param {*} el Objet de référence.
         * @param {*} indexes
         * @return {*}
         * @since 1.0
         */
        this.lowerBetween = function (el, indexes) {
            return upperLowerBetween(el, indexes, "Lower")
        };
        /**
         * Permet de mettre en minuscule des éléments qui se trouvent à des index spécifiés.
         *
         * @method lowerAt
         * @param {*} el Objet de référence.
         * @param {int|array} indexes
         * @return {*}
         * @since 1.0
         */
        this.lowerAt = function (el, indexes) {
            return upperLowerAt(el, indexes, "Lower")
        };
        /**
         * Permet de mettre en minuscule des valeurs.
         *
         * @method lower
         * @param {*} el Objet de référence.
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.lower = function (el, value) {
            return upperLower(el, value, "Lower")
        };

    }
    APP._TOOLBOX_ = new _TOOLBOX_();
    APP.toolbox = APP._TOOLBOX_;

    function _ENTITY_() {
        /**
         * Function register
         *
         * Elle permet l'enregistrement des entités et leurs méthodes dans le container.
         * Une entité par chemin.
         *
         * @param entityFunc
         *      Une fonction nommée, par exemple function Array(){ ... }
         * @param methods
         *      Un objet contenant les méthodes de l'entité.
         *      Par exemple :
         *      {
         *          'getFirst': function(){},
         *          'removeLast': function(){}
         *      }
         * @param parameters
         *      Un objet contenant les fonctions à exécuter selon le type de l'argument
         *      Par exemple : { "getFirst.string": function(){}, "getFirst.number": function(){} }
         * @return {APP/false}
         */
        this.register = function (entityFunc, methods, parameters) {
            if ((typeof(entityFunc)).toLowerCase() !== 'function') {
                return false
            }
            var name = entityFunc.name;
            if (!name || APP._CONTAINER_.get("_ENTITY_." + (name.toLowerCase()))) {
                return false
            }
            if (!APP.is(methods, "object")) {
                methods = {}
            }
            APP._TOOLBOX_.each(methods, function () {
                entityFunc.prototype[this.k] = this.v;
            });
            APP.setContainer("_ENTITY_." + (name.toLowerCase()), entityFunc);
            if (!APP.is(parameters, "object")) {
                parameters = {}
            }
            APP._TOOLBOX_.each(parameters, function () {
                APP.setContainer("_ENTITY_._PARAMETERS_." + (name.toLowerCase()) + "." + this.k, this.v);
            });
            return APP;
        };
        this.get = function (entityName) {
            entityName = (""+entityName).toLowerCase();
            var entity = APP.getContainer("_ENTITY_." + entityName);
            if(entity){
                var $this = {
                    "parameters": APP.getContainer("_ENTITY_._PARAMETERS_." + entityName),
                    "toolbox": APP.toolbox,
                    "entity": APP.entity,
                    "container": APP.container,
                    "event": APP.event,
                };
                entity = new entity($this);
            }
            return Object.freeze(entity);
        };
    }
    APP._ENTITY_ = new _ENTITY_();
    APP.entity = APP._ENTITY_;

    function _EVENT_(){
        var self = this;
        this.get = function (path) {
            return APP.container.get("_ENTITY_._EVENTS_." + path);
        };
        this.set = function (path, value) {
            return APP.container.set("_ENTITY_._EVENTS_." + path, value);
        };
        this.remove = function (path) {
            return APP.container.remove("_ENTITY_._EVENTS_." + path);
        }
    }
    APP._EVENT_ = new _EVENT_();
    APP.event = APP._EVENT_;

    function _CONFIG_(){
        var self = this;
        this.get = function (key) {

        };
        this.set = function (key, value) {

        };
        this.remove = function (key) {

        }
    }
    APP._CONFIG_ = new _CONFIG_();
    APP.config = APP._CONFIG_;


    // array.min.js
    Array.prototype.each=function(b,a){return APP.toolbox.each(this,b,a)};var arrayIndexPath="_ENTITY_._PARAMETERS_.array.index.";APP.setContainer(arrayIndexPath+"other",function(c,d){var a=c.length;for(var b=0;b<a;b++){if(c[b]===d){return b}}return -1});APP.setContainer(arrayIndexPath+"regexp",function(c,d){var a=c.length;for(var b=0;b<a;b++){if(APP.toolbox.is(c[b],"string|number")&&d.test(c[b])){return b}}return -1});Array.prototype.index=function(a){return APP.toolbox.index(this,a)};var arrayIndexesPath="_ENTITY_._PARAMETERS_.array.indexes.";APP.setContainer(arrayIndexesPath+"other",function(d,e){var a=d.length,b=[];for(var c=0;c<a;c++){if(d[c]===e){b.push(c)}}return b});APP.setContainer(arrayIndexesPath+"regexp",function(d,e){var a=d.length,b=[];for(var c=0;c<a;c++){if(APP.toolbox.is(d[c],"string|number")&&e.test(d[c])){b.push(c)}}return b});Array.prototype.indexes=function(a){return APP.toolbox.indexes(this,a)};Array.prototype.lastIndex=function(a){return APP.toolbox.lastIndex(this,a)};Array.prototype.count=function(a){return APP.toolbox.count(this,a)};Array.prototype.has=function(a){return APP.toolbox.has(this,a)};Array.prototype.reverse=function(){return APP.toolbox.reverse(this)};var arrayGetFirstPath="_ENTITY_._PARAMETERS_.array.getFirst.";APP.setContainer(arrayGetFirstPath+"other",function(){return[]});APP.setContainer(arrayGetFirstPath+"number",function(a,b){return(b<1)?[]:a.slice(0,b)});APP.setContainer(arrayGetFirstPath+"string",function(a,b){return APP.getContainer(arrayGetFirstPath+"regexp")(a,new RegExp(b))});APP.setContainer(arrayGetFirstPath+"regexp",function(c,d){var a=c.length;for(var b=0;b<a;b++){if(d.test(c[b])){return[c[b]]}}return[]});Array.prototype.getFirst=function(a){return APP.toolbox.getFirst(this,a)};Array.prototype.getMiddle=function(){return APP.toolbox.getMiddle(this)};var arrayGetLastPath="_ENTITY_._PARAMETERS_.array.getLast.";APP.setContainer(arrayGetLastPath+"other",function(){return[]});APP.setContainer(arrayGetLastPath+"number",function(a,b){return(b<1)?[]:a.slice(-b)});APP.setContainer(arrayGetLastPath+"string",function(a,b){return APP.getContainer(arrayGetLastPath+"regexp")(a,new RegExp(b))});APP.setContainer(arrayGetLastPath+"regexp",function(c,d){var a=c.length;for(var b=(a-1);b+1;b--){if(d.test(c[b])){return[c[b]]}}return[]});Array.prototype.getLast=function(a){return APP.toolbox.getLast(this,a)};var arrayGetBeforePath="_ENTITY_._PARAMETERS_.array.getBefore.";APP.setContainer(arrayGetBeforePath+"other",function(c,b,a){var d=APP.toolbox;if(!d.is(b,"number")){b=d.index(c,b)}if(b>-1){return a?c.slice(b+1):c.slice(0,b)}return[]});Array.prototype.getBefore=function(a){return APP.toolbox.getBefore(this,a)};var arrayGetAfterPath="_ENTITY_._PARAMETERS_.array.getAfter.";APP.setContainer(arrayGetAfterPath+"other",function(b,a){return APP.getContainer(arrayGetBeforePath+"other")(b,a,true)});Array.prototype.getAfter=function(a){return APP.toolbox.getAfter(this,a)};var arrayGetBetweenPath="_ENTITY_._PARAMETERS_.array.getBetween.";APP.setContainer(arrayGetBetweenPath+"array",function(g,c){var h=APP.toolbox,e,a,d=[];if(!h.is(c,"array")){c=[c]}if(c.length%2){c.push(g.length-1)}a=c.length;for(e=0;e<a;e+=2){var f=[c[e],c[e+1]];for(var b=0;b<2;b++){if(!h.is(f[b],"number")){f[b]=h.index(g,f[b])}if(f[b]<0){f[b]=false}}if(h.is(f[0],"number")&&h.is(f[1],"number")){f=h.nSort(f);d=d.concat(g.slice(f[0]+1,f[1]))}}return d});Array.prototype.getBetween=function(a){return APP.toolbox.getBetween(this,a)};var arrayGetAtPath="_ENTITY_._PARAMETERS_.array.getAt.";APP.setContainer(arrayGetAtPath+"array",function(d,b){var e=APP.toolbox,f,a=d.length,c=e.is(d,"string")?"":[];if(!e.is(b,"array")){b=[b]}e.each(b,function(){f=this.v;if(e.is(f,"number")&&f>-1){if(f<a){c=c.concat(d[f])}}});return c});Array.prototype.getAt=function(a){return APP.toolbox.getAt(this,a)};var arrayGetPath="_ENTITY_._PARAMETERS_.array.get.";APP.setContainer(arrayGetPath+"string",function(a,b){return APP.getContainer(arrayGetPath+"regexp")(a,new RegExp(b))});APP.setContainer(arrayGetPath+"regexp",function(b,c){var a=[];APP.toolbox.each(b,function(){if(c.test(this.v)){a.push(this.v)}});return a});APP.setContainer(arrayGetPath+"number",function(a,b){return(b<0)?a.slice(b):a.slice(0,b)});APP.setContainer(arrayGetPath+"array",function(b,c){var a=[];APP.toolbox.each(c,function(){var d=APP.getContainer(arrayGetPath+APP.toolbox.is(this.v));if(d){a=a.concat(d(b,this.v))}});return a});Array.prototype.get=function(a){return APP.toolbox.get(this,a)};Array.prototype.removeDuplicate=function(a){return APP.toolbox.removeDuplicate(this,a)};var arrayRemoveFirstPath="_ENTITY_._PARAMETERS_.array.removeFirst.";APP.setContainer(arrayRemoveFirstPath+"number",function(a,b){return(b<1)?a:a.slice(b)});APP.setContainer(arrayRemoveFirstPath+"other",function(c,d){var b,a=c.length;for(b=0;b<a;b++){if(c[b]==d){c.splice(b,1);return c}}return c});APP.setContainer(arrayRemoveFirstPath+"regexp",function(c,d){var b,a=c.length;for(b=0;b<a;b++){if(d.test(c[b])){c.splice(b,1);return c}}return c});Array.prototype.removeFirst=function(a){return APP.toolbox.removeFirst(this,a)};Array.prototype.removeMiddle=function(){return APP.toolbox.removeMiddle(this)};var arrayRemoveLastPath="_ENTITY_._PARAMETERS_.array.removeLast.";APP.setContainer(arrayRemoveLastPath+"number",function(a,b){return(b<1)?this:a.slice(0,-b)});APP.setContainer(arrayRemoveLastPath+"other",function(c,d){var b,a=c.length;for(b=a-1;b>-1;b--){if(c[b]==d){c.splice(b,1);return c}}return c});APP.setContainer(arrayRemoveLastPath+"regexp",function(c,d){var b,a=c.length;for(b=a-1;b>-1;b--){if(d.test(c[b])){c.splice(b,1);return c}}return c});Array.prototype.removeLast=function(a){return APP.toolbox.removeLast(this,a)};var arrayRemoveBeforePath="_ENTITY_._PARAMETERS_.array.removeBefore.";APP.setContainer(arrayRemoveBeforePath+"other",function(b,a){var c=APP.toolbox;if(!c.is(a,"number")){a=c.index(b,a)}if(a>-1){return b.slice(a)}return b});Array.prototype.removeBefore=function(a){return APP.toolbox.removeBefore(this,a)};var arrayRemoveAfterPath="_ENTITY_._PARAMETERS_.array.removeAfter.";APP.setContainer(arrayRemoveAfterPath+"other",function(b,a){var c=APP.toolbox;if(!c.is(a,"number")){a=c.index(b,a)}if(a>-1){return b.slice(0,a+1)}return b});Array.prototype.removeAfter=function(a){return APP.toolbox.removeAfter(this,a)};var arrayRemoveBetweenPath="_ENTITY_._PARAMETERS_.array.removeBetween.";APP.setContainer(arrayRemoveBetweenPath+"array",function(c,a){var d=APP.toolbox;if(!d.is(a,"array")){a=[a]}if(a.length%2){a.push(c.length-1)}a=a.slice(0,2);for(var b=0;b<2;b++){if(!d.is(a[b],"number")){a[b]=d.index(c,a[b])}if(a[b]<0){a[b]=false}}if(d.is(a[0],"number")&&d.is(a[1],"number")){a=d.nSort(a);c=c.slice(0,a[0]+1).concat(c.slice(a[1]))}return c});Array.prototype.removeBetween=function(a){return APP.toolbox.removeBetween(this,a)};var arrayRemoveAtPath="_ENTITY_._PARAMETERS_.array.removeAt.";APP.setContainer(arrayRemoveAtPath+"number",function(b,a){return APP.getContainer(arrayRemoveAtPath+"array")(b,[a])});APP.setContainer(arrayRemoveAtPath+"array",function(b,a){var c=APP.toolbox;a=c.removeDuplicate(a,true);c.each(a,function(){var d=this.v;if(c.is(d,"number")&&d>-1){b=b.slice(0,d).concat(b.slice(d+1))}});return b});Array.prototype.removeAt=function(a){return APP.toolbox.removeAt(this,a)};var arrayRemovePath="_ENTITY_._PARAMETERS_.array.remove.";APP.setContainer(arrayRemovePath+"other",function(b,c){var a=[];APP.toolbox.each(b,function(){if(c!==this.v){a.push(this.v)}});return a});APP.setContainer(arrayRemovePath+"regexp",function(b,c){var a=[];APP.toolbox.each(b,function(){if(!c.test(this.v)){a.push(this.v)}});return a});APP.setContainer(arrayRemovePath+"number",function(a,b){return(b<0)?a.slice(0,b):a.slice(b)});APP.setContainer(arrayRemovePath+"array",function(b,d){var a=[],c=APP.toolbox;c.each(d,function(){a=a.concat(c.indexes(b,this.v))});return APP.getContainer(arrayRemoveAtPath+"array")(b,a)});Array.prototype.remove=function(a){return APP.toolbox.remove(this,a)};var arrayAddFirstPath="_ENTITY_._PARAMETERS_.array.addFirst.";APP.setContainer(arrayAddFirstPath+"other",function(a,b){if(!APP.toolbox.is(b,"array")){b=[b]}return b.concat(a)});Array.prototype.addFirst=function(a){return APP.toolbox.addFirst(this,a)};Array.prototype.addMiddle=function(a){return APP.toolbox.addMiddle(this,a)};var arrayAddLastPath="_ENTITY_._PARAMETERS_.array.addLast.";APP.setContainer(arrayAddLastPath+"other",function(a,b){if(!APP.toolbox.is(b,"array")){b=[b]}return a.concat(b)});Array.prototype.addLast=function(a){return APP.toolbox.addLast(this,a)};function doSlice(c,d,b,a){d=d||0;b=b||d;d=c.slice(0,d);b=c.slice(b);return(a!==undefined)?d.concat(a).concat(b):d.concat(b)}var arrayAddBeforePath="_ENTITY_._PARAMETERS_.array.addBefore.";APP.setContainer(arrayAddBeforePath+"other",function(b,a,d){var c=APP.toolbox;if(!c.is(a,"number")){a=c.index(b,a)}if(a>-1){if(!c.is(d,"array")){d=[d]}return doSlice(b,a,a,d)}return b});Array.prototype.addBefore=function(a,b){return APP.toolbox.addBefore(this,a,b)};var arrayAddAfterPath="_ENTITY_._PARAMETERS_.array.addAfter.";APP.setContainer(arrayAddAfterPath+"other",function(b,a,d){var c=APP.toolbox;if(!c.is(a,"number")){a=c.index(b,a)}if(a>-1){if(!c.is(d,"array")){d=[d]}return doSlice(b,a+1,a+1,d)}return b});Array.prototype.addAfter=function(a,b){return APP.toolbox.addAfter(this,a,b)};var arrayAddAtPath="_ENTITY_._PARAMETERS_.array.addAt.";APP.setContainer(arrayAddAtPath+"array",function(b,a,d){var c=APP.toolbox;if(c.is(d,"array")){d=d[0]}if(d!==undefined){if(!c.is(a,"array")){a=[a]}a=c.removeDuplicate(a,true);c.each(a,function(){if(c.is(this.v,"number")){b=APP.getContainer(arrayAddBeforePath+"other")(b,this.v,d)}})}return b});Array.prototype.addAt=function(a,b){return APP.toolbox.addAt(this,a,b)};Array.prototype.add=function(a){return APP.toolbox.add(this,a)};var arrayChangeFirstPath="_ENTITY_._PARAMETERS_.array.changeFirst.";APP.setContainer(arrayChangeFirstPath+"number",function(b,a,c){if(a>0){b=APP.getContainer(arrayAddFirstPath+"other")(b.slice(a),c)}return b});APP.setContainer(arrayChangeFirstPath+"other",function(c,b,e){var d=APP.toolbox,a=d.index(c,b);if(a>-1){c[a]=e}return c});Array.prototype.changeFirst=function(a,b){return APP.toolbox.changeFirst(this,a,b)};Array.prototype.changeMiddle=function(a){return APP.toolbox.changeMiddle(this,a)};var arrayChangeLastPath="_ENTITY_._PARAMETERS_.array.changeLast.";APP.setContainer(arrayChangeLastPath+"number",function(b,a,c){if(a>0){b=APP.getContainer(arrayAddLastPath+"other")(b.slice(0,-a),c)}return b});APP.setContainer(arrayChangeLastPath+"other",function(d,c,f){var e=APP.toolbox,b=e.indexes(d,c),a=b[b.length-1];if(a){d[a]=f}return d});Array.prototype.changeLast=function(a,b){return APP.toolbox.changeLast(this,a,b)};var arrayChangeBeforePath="_ENTITY_._PARAMETERS_.array.changeBefore.";APP.setContainer(arrayChangeBeforePath+"other",function(c,b,e){var d=APP.toolbox;var a=d.removeBefore(c,b);if(a.length<c.length){c=d.addFirst(a,e)}return c});Array.prototype.changeBefore=function(a,b){return APP.toolbox.changeBefore(this,a,b)};var arrayChangeAfterPath="_ENTITY_._PARAMETERS_.array.changeAfter.";APP.setContainer(arrayChangeAfterPath+"other",function(c,b,e){var d=APP.toolbox;var a=d.removeAfter(c,b);if(a.length<c.length){c=d.addLast(a,e)}return c});Array.prototype.changeAfter=function(a,b){return APP.toolbox.changeAfter(this,a,b)};var arrayChangeBetweenPath="_ENTITY_._PARAMETERS_.array.changeBetween.";APP.setContainer(arrayChangeBetweenPath+"array",function(c,a,e){var d=APP.toolbox;if(!d.is(a,"array")){a=[a]}if(a.length%2){a.push(c.length-1)}a=a.slice(0,2);for(var b=0;b<2;b++){if(!d.is(a[b],"number")){a[b]=d.index(c,a[b])}if(a[b]<0){a[b]=false}}if(d.is(a[0],"number")&&d.is(a[1],"number")){a=d.nSort(a);c=c.slice(0,a[0]+1).concat(e).concat(c.slice(a[1]))}return c});Array.prototype.changeBetween=function(a,b){return APP.toolbox.changeBetween(this,a,b)};var arrayChangeAtPath="_ENTITY_._PARAMETERS_.array.changeAt.";APP.setContainer(arrayChangeAtPath+"array",function(b,a,d){var c=APP.toolbox;if(c.is(a,"number")){a=[a]}a=c.removeDuplicate(a,true);c.each(a,function(){var e=this.v;if(c.is(e,"number")&&e>-1){b[e]=d}});return b});Array.prototype.changeAt=function(a,b){return APP.toolbox.changeAt(this,a,b)};var arrayChangePath="_ENTITY_._PARAMETERS_.array.change.";APP.setContainer(arrayChangePath+"other",function(b,a,c){return APP.toolbox.each(b,function(){if(a===this.v){return c}})});APP.setContainer(arrayChangePath+"regexp",function(b,a,c){return APP.toolbox.each(b,function(){if(a.test(this.v)){return c}})});APP.setContainer(arrayChangePath+"number",function(b,a,c){return APP.toolbox["change"+(a<0?"Last":"First")](b,Math.abs(a),c)});APP.setContainer(arrayChangePath+"array",function(c,b,e){var a=[],d=APP.toolbox;d.each(b,function(){a=a.concat(d.indexes(c,this.v))});return APP.getContainer(arrayChangeAtPath+"array")(c,a,e)});Array.prototype.change=function(a,b){return APP.toolbox.change(this,a,b)};var arrayUpperFirstPath="_ENTITY_._PARAMETERS_.array.upperFirst.";APP.setContainer(arrayUpperFirstPath+"number",function(c,e,d){if(e>0){var a=c.length;if(e>a){e=a}for(var b=0;b<e;b++){if(APP.toolbox.is(c[b],"string")){c[b]=c[b]["to"+d+"Case"]()}}}return c});APP.setContainer(arrayUpperFirstPath+"string",function(c,e,d){var b,a=c.length;for(b=0;b<a;b++){if(c[b]==e){if(APP.toolbox.is(c[b],"string")){c[b]=c[b]["to"+d+"Case"]();return c}}}return c});APP.setContainer(arrayUpperFirstPath+"regexp",function(c,e,d){var b,a=c.length;for(b=0;b<a;b++){if(e.test(c[b])){if(APP.toolbox.is(c[b],"string")){c[b]=c[b]["to"+d+"Case"]();return c}}}return c});Array.prototype.upperFirst=function(a){return APP.toolbox.upperFirst(this,a)};var arrayUpperLastPath="_ENTITY_._PARAMETERS_.array.upperLast.";APP.setContainer(arrayUpperLastPath+"number",function(c,e,d){if(e>0){var a=c.length;if(e>a){e=a}for(var b=a-e;b<a;b++){if(APP.toolbox.is(c[b],"string")){c[b]=c[b]["to"+d+"Case"]()}}}return c});APP.setContainer(arrayUpperLastPath+"string",function(c,e,d){var b,a=c.length;for(b=a-1;b>-1;b--){if(c[b]==e){if(APP.toolbox.is(c[b],"string")){c[b]=c[b]["to"+d+"Case"]();return c}}}return c});APP.setContainer(arrayUpperLastPath+"regexp",function(c,e,d){var b,a=c.length;for(b=a-1;b>-1;b--){if(e.test(c[b])){if(APP.toolbox.is(c[b],"string")){c[b]=c[b]["to"+d+"Case"]();return c}}}return c});Array.prototype.upperLast=function(a){return APP.toolbox.upperLast(this,a)};function upperLowerTab(a,c){var b=APP.toolbox;return b.each(a,function(){var d=this.v;if(b.is(d,"string")){d=d["to"+c+"Case"]()}return d})}Array.prototype.upperMiddle=function(){return APP.toolbox.upperMiddle(this)};var arrayUpperBeforePath="_ENTITY_._PARAMETERS_.array.upperBefore.";APP.setContainer(arrayUpperBeforePath+"other",function(d,b,f){var e=APP.toolbox,a=d.length;if(!e.is(b,"number")){b=e.index(d,b)}if(b>-1){if(b>=a){b=a}for(var c=0;c<b;c++){if(e.is(d[c],"string")){d[c]=d[c]["to"+f+"Case"]()}}}return d});Array.prototype.upperBefore=function(a){return APP.toolbox.upperBefore(this,a)};var arrayUpperAfterPath="_ENTITY_._PARAMETERS_.array.upperAfter.";APP.setContainer(arrayUpperAfterPath+"other",function(d,b,f){var e=APP.toolbox,a=d.length;if(!e.is(b,"number")){b=e.index(d,b)}if(b>-1&&b<a){for(var c=b+1;c<a;c++){if(e.is(d[c],"string")){d[c]=d[c]["to"+f+"Case"]()}}}return d});Array.prototype.upperAfter=function(a){return APP.toolbox.upperAfter(this,a)};var arrayUpperBetweenPath="_ENTITY_._PARAMETERS_.array.upperBetween.";APP.setContainer(arrayUpperBetweenPath+"array",function(d,b,h){var e=APP.toolbox,g,c,a,f;if(!e.is(b,"array")){b=[b]}if(b.length%2){b.push(d.length-1)}a=b.length;for(g=0;g<a;g+=2){f=[b[g],b[g+1]];for(c=0;c<2;c++){if(!e.is(f[c],"number")){f[c]=e.index(d,f[c])}if(f[c]<0){f[c]=false}}if(e.is(f[0],"number")&&e.is(f[1],"number")){f=e.nSort(f);d=doSlice(d,f[0]+1,f[1],upperLowerTab(d.slice(f[0]+1,f[1]),h))}}return d});Array.prototype.upperBetween=function(a){return APP.toolbox.upperBetween(this,a)};var arrayUpperAtPath="_ENTITY_._PARAMETERS_.array.upperAt.";APP.setContainer(arrayUpperAtPath+"number",function(b,a,c){return APP.getContainer(arrayUpperAtPath+"array")(b,[a],c)});APP.setContainer(arrayUpperAtPath+"array",function(b,a,d){var c=APP.toolbox;a=c.removeDuplicate(a,true);c.each(a,function(){var e=this.v;if(c.is(e,"number")&&e>-1){if(c.is(b[e],"string")){b[e]=b[e]["to"+d+"Case"]()}}});return b});Array.prototype.upperAt=function(a){return APP.toolbox.upperAt(this,a)};var arrayUpperPath="_ENTITY_._PARAMETERS_.array.upper.";APP.setContainer(arrayUpperPath+"string",function(a,c,b){return APP.toolbox.each(a,function(){if(this.v===c){return this.v["to"+b+"Case"]()}})});APP.setContainer(arrayUpperPath+"regexp",function(a,d,c){var b=APP.toolbox;return b.each(a,function(){if(d.test(this.v)&&b.is(this.v,"string")){return this.v["to"+c+"Case"]()}})});APP.setContainer(arrayUpperPath+"number",function(a,c,b){var d=(c<0)?arrayUpperLastPath:arrayUpperFirstPath;return APP.getContainer(d+"number")(a,Math.abs(c),b)});APP.setContainer(arrayUpperPath+"array",function(b,e,d){var a=[],c=APP.toolbox;c.each(e,function(){a=a.concat(c.indexes(b,this.v))});return APP.getContainer(arrayUpperAtPath+"array")(b,a,d)});Array.prototype.upper=function(a){return APP.toolbox.upper(this,a)};Array.prototype.lowerFirst=function(a){return APP.toolbox.lowerFirst(this,a)};Array.prototype.lowerLast=function(a){return APP.toolbox.lowerLast(this,a)};Array.prototype.lowerMiddle=function(){return APP.toolbox.lowerMiddle(this)};Array.prototype.lowerBefore=function(a){return APP.toolbox.lowerBefore(this,a)};Array.prototype.lowerAfter=function(a){return APP.toolbox.lowerAfter(this,a)};Array.prototype.lowerBetween=function(a){return APP.toolbox.lowerBetween(this,a)};Array.prototype.lowerAt=function(a){return APP.toolbox.lowerAt(this,a)};Array.prototype.lower=function(a){return APP.toolbox.lower(this,a)};
    // string.min.js
    String.prototype.each=function(b,a){return APP.toolbox.each(this,b,a)};var stringIndexPath="_ENTITY_._PARAMETERS_.string.index.";APP.setContainer(stringIndexPath+"other",function(){return -1});APP.setContainer(stringIndexPath+"string",function(a,b){return a.indexOf(b)});APP.setContainer(stringIndexPath+"number",function(a,b){return a.indexOf(b+"")});APP.setContainer(stringIndexPath+"regexp",function(b,c){var a=c.exec(b);return a?a.index:-1});String.prototype.index=function(a){return APP.toolbox.index(this,a)};var stringIndexesPath="_ENTITY_._PARAMETERS_.string.indexes.";APP.setContainer(stringIndexesPath+"other",function(){return[]});APP.setContainer(stringIndexesPath+"string",function(c,d){var a=[],b=-1;while((b=c.indexOf(d,b+1))!=-1){a.push(b)}return a});APP.setContainer(stringIndexesPath+"number",function(a,b){return APP.getContainer(stringIndexesPath+"string")(a,b+"")});APP.setContainer(stringIndexesPath+"regexp",function(c,e){var a,b=[],d=(e.ignoreCase?"i":"")+"g";e=new RegExp(e,d);while((a=e.exec(c))){b.push(a.index)}return b});String.prototype.indexes=function(a){return APP.toolbox.indexes(this,a)};String.prototype.lastIndex=function(a){return APP.toolbox.lastIndex(this,a)};String.prototype.count=function(a){return APP.toolbox.count(this,a)};String.prototype.has=function(a){return APP.toolbox.has(this,a)};String.prototype.reverse=function(){return APP.toolbox.reverse(this)};String.prototype.trim=function(a,b){return APP.toolbox.trim(this,a,b)};String.prototype.camelCase=function(a){return APP.toolbox.camelCase(this,a)};String.prototype.snakeCase=function(a){return APP.toolbox.snakeCase(this,a)};String.prototype.linkCase=function(a){return APP.toolbox.linkCase(this,a)};var stringGetFirstPath="_ENTITY_._PARAMETERS_.string.getFirst.";APP.setContainer(stringGetFirstPath+"other",function(){return""});APP.setContainer(stringGetFirstPath+"number",function(a,b){return a.slice(0,Math.abs(b))});APP.setContainer(stringGetFirstPath+"string",function(a,b){return APP.getContainer(stringGetFirstPath+"regexp")(a,new RegExp(b))});APP.setContainer(stringGetFirstPath+"regexp",function(a,c){var b=a.match(c);return b?b[0]:""});String.prototype.getFirst=function(a){return APP.toolbox.getFirst(this,a)};String.prototype.getMiddle=function(){return APP.toolbox.getMiddle(this)};var stringGetLastPath="_ENTITY_._PARAMETERS_.string.getLast.";APP.setContainer(stringGetLastPath+"other",function(){return""});APP.setContainer(stringGetLastPath+"number",function(a,b){return a.slice(-Math.abs(b))});APP.setContainer(stringGetLastPath+"string",function(a,b){return APP.getContainer(stringGetLastPath+"regexp")(a,b)});APP.setContainer(stringGetLastPath+"regexp",function(a,d){var c=(d.ignoreCase?"i":"")+"g",b=a.match(new RegExp(d,c));return b?b[b.length-1]:""});String.prototype.getLast=function(a){return APP.toolbox.getLast(this,a)};var stringGetBeforePath="_ENTITY_._PARAMETERS_.string.getBefore.";APP.setContainer(stringGetBeforePath+"other",function(b,a){var c=APP.toolbox;if(!c.is(a,"string|regexp|number")){return""}if(!c.is(a,"number")){a=c.index(b,a)}if(a>-1){return b.slice(0,a)}return""});String.prototype.getBefore=function(a){return APP.toolbox.getBefore(this,a)};var stringGetAfterPath="_ENTITY_._PARAMETERS_.string.getAfter.";APP.setContainer(stringGetAfterPath+"other",function(e,c){var f=APP.toolbox,a=f.is(c);if(!/string|number|regexp/.test(a)){return""}if(a==="string"){var d=c.length-1;c=e.indexOf(c);if(c>-1){c+=d}}if(a==="regexp"){var b=c.exec(e);c=b?b.index+b[0].length-1:-1}if(c>-1){return e.slice(c+1)}return""});String.prototype.getAfter=function(a){return APP.toolbox.getAfter(this,a)};function stringBetweenIndexes(e,d){var f=APP.toolbox;for(var c=0;c<2;c++){var a=f.is(d[c]);if(/string|number|regexp/.test(a)){if(a==="string"){d[c]=new RegExp(d[c]);a="regexp"}if(a==="regexp"){var b=d[c].exec(e);if(b){d[c]=b.index;if(c===0&&d[c]>-1){d[c]+=b[c].length-1}}else{d[c]=-1}}}else{d[c]=-1}}if(d[0]>=d[1]){d=[-1,-1]}return d}var stringGetBetweenPath="_ENTITY_._PARAMETERS_.string.getBetween.";APP.setContainer(stringGetBetweenPath+"array",function(f,b){var g=APP.toolbox,d,a,c="";if(!g.is(b,"array")){b=[b]}if(b.length%2){b.push(f.length-1)}a=b.length;for(d=0;d<a;d+=2){var e=[b[d],b[d+1]];e=stringBetweenIndexes(f,e);if(e[0]>-1&&e[1]>-1){c=c+f.slice(e[0]+1,e[1])}}return c});String.prototype.getBetween=function(a){return APP.toolbox.getBetween(this,a)};var stringGetAtPath="_ENTITY_._PARAMETERS_.string.getAt.";APP.setContainer(stringGetAtPath+"array",function(b,a){return APP.getContainer(arrayGetAtPath+"array")(b,a)});String.prototype.getAt=function(a){return APP.toolbox.getAt(this,a)};var stringGetPath="_ENTITY_._PARAMETERS_.string.get.";APP.setContainer(stringGetPath+"other",function(){return""});APP.setContainer(stringGetPath+"string",function(a,b){return APP.getContainer(stringGetPath+"regexp")(a,b)});APP.setContainer(stringGetPath+"regexp",function(b,d){var c=(d.ignoreCase?"i":"")+"g",a=b.match(new RegExp(d,c));return a?a.join(""):""});APP.setContainer(stringGetPath+"number",function(a,b){return(b<0)?a.slice(b):a.slice(0,b)});APP.setContainer(stringGetPath+"array",function(b,d){var c=APP.toolbox,a="";c.each(d,function(){var e=APP.getContainer(stringGetPath+c.is(this.v));if(e){a+=e(b,this.v)}});return a});String.prototype.get=function(a){return APP.toolbox.get(this,a)};var stringRemoveFirstPath="_ENTITY_._PARAMETERS_.string.removeFirst.";APP.setContainer(stringRemoveFirstPath+"other",function(a){return a});APP.setContainer(stringRemoveFirstPath+"number",function(a,b){return(b<1)?a:a.slice(b)});APP.setContainer(stringRemoveFirstPath+"string",function(a,b){return a.replace(new RegExp(b),"")});APP.setContainer(stringRemoveFirstPath+"regexp",function(b,c){var a=-1;return b.replace(c,function(d){a++;return a?d:""})});String.prototype.removeFirst=function(a){return APP.toolbox.removeFirst(this,a)};String.prototype.removeMiddle=function(){return APP.toolbox.removeMiddle(this)};var stringRemoveLastPath="_ENTITY_._PARAMETERS_.string.removeLast.";APP.setContainer(stringRemoveLastPath+"other",function(a){return a});APP.setContainer(stringRemoveLastPath+"number",function(a,b){return(b<1)?this:a.slice(0,-b)});APP.setContainer(stringRemoveLastPath+"string",function(a,b){return APP.getContainer(stringRemoveLastPath+"regexp")(a,new RegExp(b))});APP.setContainer(stringRemoveLastPath+"regexp",function(b,d){var c=b.match(d);if(!c){return b}d=c[c.length-1];var a=b.lastIndexOf(d);return doSlice(b,a,a+d.length)});String.prototype.removeLast=function(a){return APP.toolbox.removeLast(this,a)};var stringRemoveBeforePath="_ENTITY_._PARAMETERS_.string.removeBefore.";APP.setContainer(stringRemoveBeforePath+"other",function(b,a){var c=APP.toolbox.getBefore(b,a);return b.slice(b.indexOf(c)+c.length)});String.prototype.removeBefore=function(a){return APP.toolbox.removeBefore(this,a)};var stringRemoveAfterPath="_ENTITY_._PARAMETERS_.string.removeAfter.";APP.setContainer(stringRemoveAfterPath+"other",function(b,a){return b.slice(0,b.lastIndexOf(APP.toolbox.getAfter(b,a)))});String.prototype.removeAfter=function(a){return APP.toolbox.removeAfter(this,a)};var stringRemoveBetweenPath="_ENTITY_._PARAMETERS_.string.removeBetween.";APP.setContainer(stringRemoveBetweenPath+"array",function(b,a){var c=APP.toolbox;if(!c.is(a,"array")){a=[a]}if(a.length%2){a.push(b.length-1)}a=a.slice(0,2);a=stringBetweenIndexes(b,a);if(a[0]>-1&&a[1]>-1){b=b.slice(0,a[0]+1)+b.slice(a[1])}return b});String.prototype.removeBetween=function(a){return APP.toolbox.removeBetween(this,a)};var stringRemoveAtPath="_ENTITY_._PARAMETERS_.string.removeAt.";APP.setContainer(stringRemoveAtPath+"number",function(b,a){return APP.getContainer(stringRemoveAtPath+"array")(b,[a])});APP.setContainer(stringRemoveAtPath+"array",function(b,a){return APP.getContainer(arrayRemoveAtPath+"array")(b,a)});String.prototype.removeAt=function(a){return APP.toolbox.removeAt(this,a)};var stringRemovePath="_ENTITY_._PARAMETERS_.string.remove.";APP.setContainer(stringRemovePath+"other",function(a){return a});APP.setContainer(stringRemovePath+"string",function(a,b){return APP.getContainer(stringRemovePath+"regexp")(a,b)});APP.setContainer(stringRemovePath+"regexp",function(a,c){var b=(c.ignoreCase?"i":"")+"g";c=new RegExp(c,b);return a.replace(c,"")});APP.setContainer(stringRemovePath+"number",function(a,b){return(b<0)?a.slice(0,b):a.slice(b)});APP.setContainer(stringRemovePath+"array",function(a,c){var b=APP.toolbox;b.each(c,function(){var d=b.is(this.v);if(/string|regexp|number/.test(d)){a=APP.getContainer(stringRemovePath+d)(a,this.v)}});return a});String.prototype.remove=function(a){return APP.toolbox.remove(this,a)};var stringAddFirstPath="_ENTITY_._PARAMETERS_.string.addFirst.";APP.setContainer(stringAddFirstPath+"other",function(a,b){if(APP.toolbox.is(b,"string")){a=b+a}return a});String.prototype.addFirst=function(a){return APP.toolbox.addFirst(this,a)};String.prototype.addMiddle=function(a){return APP.toolbox.addMiddle(this,a)};var stringAddLastPath="_ENTITY_._PARAMETERS_.string.addLast.";APP.setContainer(stringAddLastPath+"other",function(a,b){if(APP.toolbox.is(b,"string|number")){a+=b+""}return a});String.prototype.addLast=function(a){return APP.toolbox.addLast(this,a)};var stringAddBeforePath="_ENTITY_._PARAMETERS_.string.addBefore.";APP.setContainer(stringAddBeforePath+"other",function(b,a,d){var c=APP.toolbox;if(!c.is(a,"number")){a=c.index(b,a)}if(a>-1){if(c.is(d,"array")){d=d.join("")}return doSlice(b,a,a,d)}return b});String.prototype.addBefore=function(a,b){return APP.toolbox.addBefore(this,a,b)};var stringAddAfterPath="_ENTITY_._PARAMETERS_.string.addAfter.";APP.setContainer(stringAddAfterPath+"other",function(b,a,d){var c=APP.toolbox;a=c.getAfter(b,a);return a?c.addBefore(b,a,d):b});String.prototype.addAfter=function(a,b){return APP.toolbox.addAfter(this,a,b)};var stringAddAtPath="_ENTITY_._PARAMETERS_.string.addAt.";APP.setContainer(stringAddAtPath+"array",function(b,a,d){var c=APP.toolbox;if(c.is(d,"string|number")){d=(d+"").slice(0,1)}else{d=undefined}if(d!==undefined){if(!c.is(a,"array")){a=[a]}a=c.removeDuplicate(a,true);c.each(a,function(){if(c.is(this.v,"number")){b=APP.getContainer(arrayAddBeforePath+"other")(b,this.v,d)}})}return b});String.prototype.addAt=function(a,b){return APP.toolbox.addAt(this,a,b)};String.prototype.add=function(a){return APP.toolbox.add(this,a)};var stringChangeFirstPath="_ENTITY_._PARAMETERS_.string.changeFirst.";APP.setContainer(stringChangeFirstPath+"number",function(b,a,c){if(a>0){if(APP.toolbox.is(c,"string|number")){b=c+b.slice(a)}}return b});APP.setContainer(stringChangeFirstPath+"other",function(c,a,e){var d=APP.toolbox;if(d.is(a,"string|regexp")){if(d.is(e,"string|number")){a=new RegExp(a);var b=-1;c=c.replace(a,function(f){b++;return b?f:e})}}return c});String.prototype.changeFirst=function(a,b){return APP.toolbox.changeFirst(this,a,b)};String.prototype.changeMiddle=function(a){return APP.toolbox.changeMiddle(this,a)};var stringChangeLastPath="_ENTITY_._PARAMETERS_.string.changeLast.";APP.setContainer(stringChangeLastPath+"number",function(b,a,c){if(a>0){b=APP.getContainer(stringAddLastPath+"other")(b.slice(0,-a),c)}return b});APP.setContainer(stringChangeLastPath+"other",function(c,a,g){var e=APP.toolbox;if(e.is(a,"string|regexp")){var f=(a.ignoreCase?"i":"")+"g";a=new RegExp(a,f);var d=c.match(a);if(d&&e.is(g,"string|number")){a=d[d.length-1];var b=c.lastIndexOf(a);c=doSlice(c,b,b+a.length,g)}}return c});String.prototype.changeLast=function(a,b){return APP.toolbox.changeLast(this,a,b)};var stringChangeBeforePath="_ENTITY_._PARAMETERS_.string.changeBefore.";APP.setContainer(stringChangeBeforePath+"other",function(c,b,e){var d=APP.toolbox,a=d.removeBefore(c,b,e);if(a!=c){c=d.addFirst(a,e)}return c});String.prototype.changeBefore=function(a,b){return APP.toolbox.changeBefore(this,a,b)};var stringChangeAfterPath="_ENTITY_._PARAMETERS_.string.changeAfter.";APP.setContainer(stringChangeAfterPath+"other",function(c,b,e){var d=APP.toolbox;var a=d.removeAfter(c,b);if(a!=c){c=d.addLast(a,e)}return c});String.prototype.changeAfter=function(a,b){return APP.toolbox.changeAfter(this,a,b)};var stringChangeBetweenPath="_ENTITY_._PARAMETERS_.string.changeBetween.";APP.setContainer(stringChangeBetweenPath+"array",function(b,a,d){var c=APP.toolbox;if(!c.is(a,"array")){a=[a]}if(a.length%2){a.push(b.length-1)}a=a.slice(0,2);a=stringBetweenIndexes(b,a);if(a[0]>-1&&a[1]>-1){if(c.is(d,"string|number")){b=b.slice(0,a[0]+1)+d+b.slice(a[1])}}return b});String.prototype.changeBetween=function(a,b){return APP.toolbox.changeBetween(this,a,b)};var stringChangeAtPath="_ENTITY_._PARAMETERS_.string.changeAt.";APP.setContainer(stringChangeAtPath+"array",function(b,a,d){var c=APP.toolbox;if(c.is(d,"string|number")){d=(d+"").slice(0,1);if(!c.is(a,"array")){a=[a]}a=c.removeDuplicate(a,true);c.each(a,function(){var e=this.v;if(c.is(e,"number")&&e>-1){b=b.slice(0,e)+d+b.slice(e+1)}})}return b});String.prototype.changeAt=function(a,b){return APP.toolbox.changeAt(this,a,b)};var stringChangePath="_ENTITY_._PARAMETERS_.string.change.";APP.setContainer(stringChangePath+"other",function(a){return a});APP.setContainer(stringChangePath+"string",function(b,a,c){return b.replace(new RegExp(a,"g"),c)});APP.setContainer(stringChangePath+"regexp",function(b,a,d){var c=(a.ignoreCase?"i":"")+"g";return b.replace(new RegExp(a,c),d)});APP.setContainer(stringChangePath+"number",function(b,a,c){return APP.toolbox["change"+(a<0?"Last":"First")](b,Math.abs(a),c)});String.prototype.change=function(a,b){return APP.toolbox.change(this,a,b)};var stringUpperFirstPath="_ENTITY_._PARAMETERS_.string.upperFirst.";APP.setContainer(stringUpperFirstPath+"number",function(a,c,b){if(c>0){a=(a.slice(0,c)["to"+b+"Case"]())+a.slice(c)}return a});APP.setContainer(stringUpperFirstPath+"string",function(a,c,b){return APP.getContainer(stringUpperFirstPath+"regexp")(a,c,b)});APP.setContainer(stringUpperFirstPath+"regexp",function(b,d,c){var a=-1;return b.replace(d,function(e){a++;return a?e:e["to"+c+"Case"]()})});String.prototype.upperFirst=function(a){return APP.toolbox.upperFirst(this,a)};var stringUpperLastPath="_ENTITY_._PARAMETERS_.string.upperLast.";APP.setContainer(stringUpperLastPath+"number",function(a,c,b){if(c>0){a=a.slice(0,-c)+(a.slice(-c)["to"+b+"Case"]())}return a});APP.setContainer(stringUpperLastPath+"string",function(a,c,b){return APP.getContainer(stringUpperLastPath+"regexp")(a,c,b)});APP.setContainer(stringUpperLastPath+"regexp",function(b,f,d){var e=(f.ignoreCase?"i":"")+"g";f=new RegExp(f,e);var c=b.match(f);if(c){f=c[c.length-1];var a=b.lastIndexOf(f);b=doSlice(b,a,a+f.length,f["to"+d+"Case"]())}return b});String.prototype.upperLast=function(a){return APP.toolbox.upperLast(this,a)};function upperLowerTab(a,c){var b=APP.toolbox;return b.each(a,function(){var d=this.v;if(b.is(d,"string")){d=d["to"+c+"Case"]()}return d})}String.prototype.upperMiddle=function(){return APP.toolbox.upperMiddle(this)};var stringUpperBeforePath="_ENTITY_._PARAMETERS_.string.upperBefore.";APP.setContainer(stringUpperBeforePath+"other",function(c,a,e){var d=APP.toolbox,b=-1,f=d.getBefore(c,a);return c.replace(f,function(g){b++;return b?g:g["to"+e+"Case"]()})});String.prototype.upperBefore=function(a){return APP.toolbox.upperBefore(this,a)};var stringUpperAfterPath="_ENTITY_._PARAMETERS_.string.upperAfter.";APP.setContainer(stringUpperAfterPath+"other",function(b,a,d){var c=APP.toolbox,e=c.getAfter(b,a);if(e){b=b.slice(b,b.indexOf(e))+e["to"+d+"Case"]()}return b});String.prototype.upperAfter=function(a){return APP.toolbox.upperAfter(this,a)};var stringUpperBetweenPath="_ENTITY_._PARAMETERS_.string.upperBetween.";APP.setContainer(stringUpperBetweenPath+"array",function(e,b,g){var f=APP.toolbox,c,a;if(!f.is(b,"array")){b=[b]}if(b.length%2){b.push(e.length-1)}a=b.length;for(c=0;c<a;c+=2){var d=[b[c],b[c+1]];d=stringBetweenIndexes(e,d);if(d[0]>-1&&d[1]>-1){e=e.slice(0,d[0]+1)+e.slice(d[0]+1,d[1])["to"+g+"Case"]()+e.slice(d[1])}}return e});String.prototype.upperBetween=function(a){return APP.toolbox.upperBetween(this,a)};var stringUpperAtPath="_ENTITY_._PARAMETERS_.string.upperAt.";APP.setContainer(stringUpperAtPath+"number",function(b,a,c){return APP.getContainer(stringUpperAtPath+"array")(b,[a],c)});APP.setContainer(stringUpperAtPath+"array",function(b,a,d){var c=APP.toolbox;a=c.removeDuplicate(a,true);c.each(a,function(){var e=this.v;if(c.is(e,"number")&&e>-1){if(c.is(b[e],"string")){b=b.slice(0,e)+(b.slice(e,e+1)["to"+d+"Case"]())+b.slice(e+1)}}});return b});String.prototype.upperAt=function(a){return APP.toolbox.upperAt(this,a)};var stringUpperPath="_ENTITY_._PARAMETERS_.string.upper.";APP.setContainer(stringUpperPath+"string",function(a,c,b){return APP.getContainer(stringUpperPath+"regexp")(a,c,b)});APP.setContainer(stringUpperPath+"regexp",function(a,d,b){var c=(d.ignoreCase?"i":"")+"g";d=new RegExp(d,c);return a.replace(d,function(e){return e["to"+b+"Case"]()})});APP.setContainer(stringUpperPath+"number",function(a,c,b){var d=(c<0)?stringUpperLastPath:stringUpperFirstPath;return APP.getContainer(d+"number")(a,Math.abs(c),b)});APP.setContainer(stringUpperPath+"array",function(a,d,c){var b=APP.toolbox;b.each(d,function(){var e=APP.getContainer(stringUpperPath+b.is(this.v));if(e){a=e(a,this.v,c)}});return a});String.prototype.upper=function(a){return APP.toolbox.upper(this,a)};String.prototype.lowerFirst=function(a){return APP.toolbox.lowerFirst(this,a)};String.prototype.lowerLast=function(a){return APP.toolbox.lowerLast(this,a)};String.prototype.lowerMiddle=function(){return APP.toolbox.lowerMiddle(this)};String.prototype.lowerBefore=function(a){return APP.toolbox.lowerBefore(this,a)};String.prototype.lowerAfter=function(a){return APP.toolbox.lowerAfter(this,a)};String.prototype.lowerBetween=function(a){return APP.toolbox.lowerBetween(this,a)};String.prototype.lowerAt=function(a){return APP.toolbox.lowerAt(this,a)};String.prototype.lower=function(a){return APP.toolbox.lower(this,a)};


    function nodeLauncher(selector) {
        var $this = {
            "parameters": APP.getContainer("_ENTITY_._PARAMETERS_.node"),
            "toolbox": APP.toolbox,
            "entity": APP.entity,
            "container": APP.container,
            "event": APP.event,
            "config": APP.config,
        };
        var path = "node";
        if(selector === document){ path = "document" }
        if(selector === window){ path = "window" }
        if(path !== "node"){ delete $this.parameters }
        var nodeEntity = APP.getContainer("_ENTITY_." + path);
        nodeEntity = Object.freeze(new nodeEntity($this));
        if(path === "node"){ nodeEntity.set(selector) }
        return nodeEntity
    }

    /**
     * Permet de sélectionner les éléments du DOM
     *
     * @method $
     * @param {string} selector Sélecteur css
     * @return {*} Elle retourne l'objet Node
     * @since 1.0
     */
    if($W.$){
        $W.$$ = function (selector) { return nodeLauncher(selector) };
    }else{
        $W.$ = function (selector) { return nodeLauncher(selector) };
    }

    /**
     * Permet de sélectionner les entités
     *
     * @method zk
     * @param {string} entity Le nom de l'entité sans tenir compte de la casse
     * @return {*}
     * @since 1.0
     */
    $W.zk = function (entity) {
        if (entity === undefined) { return APP }
        return APP.get(entity);
    };



})(window);