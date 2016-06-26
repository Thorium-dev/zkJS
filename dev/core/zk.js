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

    // stringEntity
    function stringEntity() {
        String.prototype.each = function(func, args){ return zk().toolbox.each(this, func, args) };

        var stringIndexPath = "_ENTITY_._PARAMETERS_.string.index.";
        zk().setContainer(stringIndexPath+"other", function(){ return -1 });
        zk().setContainer(stringIndexPath+"string", function(el, value){ return el.indexOf(value) });
        zk().setContainer(stringIndexPath+"number", function(el, value){ return el.indexOf(value+"") });
        zk().setContainer(stringIndexPath+"regexp", function(el, value){
            var index = value.exec(el);
            return index ? index['index'] : -1;
        });
        String.prototype.index = function(value){ return zk().toolbox.index(this, value) };

        var stringIndexesPath = "_ENTITY_._PARAMETERS_.string.indexes.";
        zk().setContainer(stringIndexesPath+"other", function(){ return [] });
        zk().setContainer(stringIndexesPath + "string", function (el, value) {
            var indexes = [], i = -1;
            while ((i = el.indexOf(value, i+1)) != -1){ indexes.push(i) }
            return indexes;
        });
        zk().setContainer(stringIndexesPath + "number", function (el, value) {
            return zk().getContainer(stringIndexesPath + "string")(el, value + "");
        });
        zk().setContainer(stringIndexesPath+"regexp", function(el, value){
            var result, indexes = [], ig = (value.ignoreCase ? "i" : "") + "g";
            value = new RegExp(value, ig);
            while ( (result = value.exec(el)) ) { indexes.push(result.index) }
            return indexes;
        });
        String.prototype.indexes = function(value){ return zk().toolbox.indexes(this, value) };

        String.prototype.lastIndex = function(value){ return zk().toolbox.lastIndex(this, value) };

        String.prototype.count = function(value){ return zk().toolbox.count(this, value) };

        String.prototype.has = function(value){ return zk().toolbox.has(this, value) };

        String.prototype.reverse = function(){ return zk().toolbox.reverse(this) };

        String.prototype.trim = function(strReg, direction){ return zk().toolbox.trim(this, strReg, direction) };

        String.prototype.camelCase = function(separators){ return zk().toolbox.camelCase(this, separators) };

        String.prototype.snakeCase = function(separators){ return zk().toolbox.snakeCase(this, separators) };

        String.prototype.linkCase = function(separators){ return zk().toolbox.linkCase(this, separators) };

// ========================================= LES METHODES AVEC GET =============================================

        var stringGetFirstPath = "_ENTITY_._PARAMETERS_.string.getFirst.";
        zk().setContainer(stringGetFirstPath+"other", function(){ return "" });
        zk().setContainer(stringGetFirstPath+"number", function(el, value){ return el.slice(0, Math.abs(value)) });
        zk().setContainer(stringGetFirstPath+"string", function(el, value){
            return zk().getContainer(stringGetFirstPath+"regexp")(el, new RegExp(value));
        });
        zk().setContainer(stringGetFirstPath+"regexp", function(el, value){ var r = el.match(value); return r ? r[0] : ''; });
        String.prototype.getFirst = function(value){ return zk().toolbox.getFirst(this, value) };

        String.prototype.getMiddle = function(){ return zk().toolbox.getMiddle(this) };

        var stringGetLastPath = "_ENTITY_._PARAMETERS_.string.getLast.";
        zk().setContainer(stringGetLastPath+"other", function(){ return "" });
        zk().setContainer(stringGetLastPath+"number", function(el, value){ return el.slice(-Math.abs(value)) });
        zk().setContainer(stringGetLastPath+"string", function(el, value){
            return zk().getContainer(stringGetLastPath+"regexp")(el, value)
        });
        zk().setContainer(stringGetLastPath+"regexp", function(el, value){
            var ig = (value.ignoreCase ? "i" : "") + "g", r = el.match(new RegExp(value, ig)); return r ? r[r.length - 1] : '';
        });
        String.prototype.getLast = function(value){ return zk().toolbox.getLast(this, value) };

        var stringGetBeforePath = "_ENTITY_._PARAMETERS_.string.getBefore.";
        zk().setContainer(stringGetBeforePath+"other", function(el, index){
            var box = zk().toolbox;
            if(!box.is(index, "string|regexp|number")){ return "" }
            if(!box.is(index, "number")){ index = box.index(el, index) }
            if(index > -1 ){ return el.slice(0,index) }
            return "";
        });
        String.prototype.getBefore = function(index){ return zk().toolbox.getBefore(this, index) };

        var stringGetAfterPath = "_ENTITY_._PARAMETERS_.string.getAfter.";
        zk().setContainer(stringGetAfterPath+"other", function(el, index){
            var box = zk().toolbox, indexType = box.is(index);
            if(!/string|number|regexp/.test(indexType)){ return "" }
            if (indexType === "string") {
                var indexLength = index.length - 1;
                index = el.indexOf(index);
                if(index > -1){ index += indexLength}
            }
            if (indexType === "regexp") {
                var indexReg = index.exec(el);
                index = indexReg ? indexReg.index + indexReg[0].length - 1 : -1;
            }
            if(index > -1 ){ return el.slice(index+1) }
            return "";
        });
        String.prototype.getAfter = function(index){ return zk().toolbox.getAfter(this, index) };

        function stringBetweenIndexes(el, indexes){
            var box = zk().toolbox;
            for (var j = 0; j < 2; j++){
                var indexType = box.is(indexes[j]);
                if (/string|number|regexp/.test(indexType)) {
                    if (indexType === "string") {
                        indexes[j] = new RegExp(indexes[j]); indexType = "regexp";
                    }
                    if (indexType === "regexp") {
                        var indexReg = indexes[j].exec(el);
                        if(indexReg){
                            indexes[j] = indexReg.index;
                            if (j === 0 && indexes[j] > -1) { indexes[j] += indexReg[j].length - 1 }
                        }else {
                            indexes[j] = -1
                        }
                    }
                } else {
                    indexes[j] = -1
                }
            }
            if(indexes[0] >= indexes[1]){ indexes = [-1, -1] }
            return indexes;

        }
        var stringGetBetweenPath = "_ENTITY_._PARAMETERS_.string.getBetween.";
        zk().setContainer(stringGetBetweenPath+"array", function(el, indexes){
            var box = zk().toolbox, i, k, res = "";
            if (!box.is(indexes, 'array')) { indexes = [indexes] }
            if (indexes.length % 2) { indexes.push(el.length - 1) }
            k = indexes.length;
            for (i = 0; i < k; i += 2) {
                var tab = [indexes[i], indexes[i+1]];
                tab = stringBetweenIndexes(el, tab);
                if(tab[0] > -1 && tab[1] > -1){
                    res = res + el.slice(tab[0]+1,tab[1]);
                }
            }
            return res;
        });
        String.prototype.getBetween = function(indexes){ return zk().toolbox.getBetween(this, indexes) };

        var stringGetAtPath = "_ENTITY_._PARAMETERS_.string.getAt.";
        zk().setContainer(stringGetAtPath + "array", function (el, indexes){
            return zk().getContainer(arrayGetAtPath+"array")(el, indexes);
        });
        String.prototype.getAt = function(indexes){ return zk().toolbox.getAt(this, indexes) };

        var stringGetPath = "_ENTITY_._PARAMETERS_.string.get.";
        zk().setContainer(stringGetPath+"other", function(){ return "" });
        zk().setContainer(stringGetPath + "string", function(el, value){
            return zk().getContainer(stringGetPath+"regexp")(el, value);
        });
        zk().setContainer(stringGetPath + "regexp", function(el, value){
            var ig = (value.ignoreCase ? "i" : "") + "g", res = el.match(new RegExp(value, ig));
            return res ? res.join("") : "";
        });
        zk().setContainer(stringGetPath + "number", function (el, value){
            return ( value < 0 ) ? el.slice(value) : el.slice(0, value)
        });
        zk().setContainer(stringGetPath + "array", function (el, value){
            var box = zk().toolbox, res = "";
            box.each(value, function () {
                var f = zk().getContainer(stringGetPath + box.is(this.v));
                if(f){
                    res += f(el, this.v);
                }
            });
            return res;

        });
        String.prototype.get = function(value){ return zk().toolbox.get(this, value) };

// ========================================= LES METHODES AVEC REMOVE =============================================

        var stringRemoveFirstPath = "_ENTITY_._PARAMETERS_.string.removeFirst.";
        zk().setContainer(stringRemoveFirstPath+"other", function (el) { return el });
        zk().setContainer(stringRemoveFirstPath+"number", function (el, value) { return (value < 1) ? el : el.slice(value) });
        zk().setContainer(stringRemoveFirstPath+"string", function(el, value){ return el.replace(new RegExp(value), "") });
        zk().setContainer(stringRemoveFirstPath+"regexp", function(el, value){
            var i = -1; return el.replace(value, function (str) { i++; return i ? str : "" })
        });
        String.prototype.removeFirst = function(value){ return zk().toolbox.removeFirst(this, value) };

        String.prototype.removeMiddle = function(){ return zk().toolbox.removeMiddle(this) };

        var stringRemoveLastPath = "_ENTITY_._PARAMETERS_.string.removeLast.";
        zk().setContainer(stringRemoveLastPath+"other", function(el){ return el });
        zk().setContainer(stringRemoveLastPath + "number", function (el, value) {
            return (value < 1) ? this : el.slice(0, -value);
        });
        zk().setContainer(stringRemoveLastPath + "string", function (el, value) {
            return zk().getContainer(stringRemoveLastPath + "regexp")(el, new RegExp(value))
        });
        zk().setContainer(stringRemoveLastPath+"regexp", function(el, value){
            var r = el.match(value);
            if (!r) { return el }
            value = r[r.length - 1];
            var i = el.lastIndexOf(value);
            return doSlice(el, i, i + value.length);
        });
        String.prototype.removeLast = function(value){ return zk().toolbox.removeLast(this, value) };

        var stringRemoveBeforePath = "_ENTITY_._PARAMETERS_.string.removeBefore.";
        zk().setContainer(stringRemoveBeforePath+"other", function(el, index){
            var before = zk().toolbox.getBefore(el, index);
            return el.slice(el.indexOf(before) + before.length);
        });
        String.prototype.removeBefore = function(index){ return zk().toolbox.removeBefore(this, index) };

        var stringRemoveAfterPath = "_ENTITY_._PARAMETERS_.string.removeAfter.";
        zk().setContainer(stringRemoveAfterPath+"other", function(el, index){
            return el.slice(0, el.lastIndexOf(zk().toolbox.getAfter(el, index)));
        });
        String.prototype.removeAfter = function(index){ return zk().toolbox.removeAfter(this, index) };

        var stringRemoveBetweenPath = "_ENTITY_._PARAMETERS_.string.removeBetween.";
        zk().setContainer(stringRemoveBetweenPath+"array", function(el, indexes){
            var box = zk().toolbox;
            if (!box.is(indexes, 'array')) { indexes = [indexes] }
            if (indexes.length % 2) { indexes.push(el.length - 1) }
            indexes = indexes.slice(0, 2);
            indexes = stringBetweenIndexes(el, indexes);
            if(indexes[0] > -1 && indexes[1] > -1){
                el = el.slice(0, indexes[0]+1) + el.slice(indexes[1]);
            }
            return el;
        });
        String.prototype.removeBetween = function(indexes){ return zk().toolbox.removeBetween(this, indexes) };

        var stringRemoveAtPath = "_ENTITY_._PARAMETERS_.string.removeAt.";
        zk().setContainer(stringRemoveAtPath + "number", function (el, indexes){
            return zk().getContainer(stringRemoveAtPath + "array")(el, [indexes])
        });
        zk().setContainer(stringRemoveAtPath + "array", function (el, indexes){
            return zk().getContainer(arrayRemoveAtPath + "array")(el, indexes)
        });
        String.prototype.removeAt = function(indexes){ return zk().toolbox.removeAt(this, indexes) };

        var stringRemovePath = "_ENTITY_._PARAMETERS_.string.remove.";
        zk().setContainer(stringRemovePath+"other", function(el){ return el });
        zk().setContainer(stringRemovePath+"string", function (el, value) {
            return zk().getContainer(stringRemovePath + "regexp")(el, value)
        });
        zk().setContainer(stringRemovePath+"regexp", function(el, value){
            var ig = (value.ignoreCase ? "i" : "") + "g";
            value = new RegExp(value, ig); return el.replace(value, "");
        });
        zk().setContainer(stringRemovePath+"number", function (el, value){
            return ( value < 0 ) ? el.slice(0, value) : el.slice(value);
        });
        zk().setContainer(stringRemovePath+"array", function (el, value){
            var box = zk().toolbox;
            box.each(value, function () {
                var type = box.is(this.v);
                if(/string|regexp|number/.test(type)){
                    el = zk().getContainer(stringRemovePath + type)(el, this.v);
                }
            });
            return el
        });
        String.prototype.remove = function(value){ return zk().toolbox.remove(this, value) };

// ========================================= LES METHODES AVEC ADD =============================================

        var stringAddFirstPath = "_ENTITY_._PARAMETERS_.string.addFirst.";
        zk().setContainer(stringAddFirstPath+"other", function(el, value){
            if(zk().toolbox.is(value, "string")){ el = value + el }
            return el;
        });
        String.prototype.addFirst = function(value){ return zk().toolbox.addFirst(this, value) };

        String.prototype.addMiddle = function(value){ return zk().toolbox.addMiddle(this, value) };

        var stringAddLastPath = "_ENTITY_._PARAMETERS_.string.addLast.";
        zk().setContainer(stringAddLastPath+"other", function(el, value){
            if(zk().toolbox.is(value, "string|number")){ el += value + "" }
            return el;
        });
        String.prototype.addLast = function(value){ return zk().toolbox.addLast(this, value) };

        var stringAddBeforePath = "_ENTITY_._PARAMETERS_.string.addBefore.";
        zk().setContainer(stringAddBeforePath+"other", function(el, index, value){
            var box = zk().toolbox;
            if(!box.is(index, "number")){ index = box.index(el, index) }
            if(index > -1 ){
                if(box.is(value, "array")){ value = value.join("") }
                return doSlice(el, index, index, value)
            }
            return el;
        });
        String.prototype.addBefore = function(index, value){ return zk().toolbox.addBefore(this, index, value) };

        var stringAddAfterPath = "_ENTITY_._PARAMETERS_.string.addAfter.";
        zk().setContainer(stringAddAfterPath+"other", function(el, index, value){
            var box = zk().toolbox; index = box.getAfter(el, index);
            return index ? box.addBefore(el, index, value) : el;
        });
        String.prototype.addAfter = function(index, value){ return zk().toolbox.addAfter(this, index, value) };

// addBetween n'existe pas

        var stringAddAtPath = "_ENTITY_._PARAMETERS_.string.addAt.";
        zk().setContainer(stringAddAtPath + "array", function (el, indexes, value) {
            var box = zk().toolbox;
            if(box.is(value, "string|number")){ value = (value+"").slice(0, 1) } else { value = undefined }
            if(value !== undefined){
                if(!box.is(indexes, "array")){ indexes = [indexes] }
                indexes = box.removeDuplicate(indexes, true);
                box.each(indexes, function () {
                    if(box.is(this.v, "number")){
                        el = zk().getContainer(arrayAddBeforePath+"other")(el, this.v, value);
                    }
                });
            }
            return el;
        });
        String.prototype.addAt = function(indexes, value){ return zk().toolbox.addAt(this, indexes, value) };

        String.prototype.add = function(value){ return zk().toolbox.add(this, value) };


// ========================================= LES METHODES AVEC CHANGE ===========================================

        var stringChangeFirstPath = "_ENTITY_._PARAMETERS_.string.changeFirst.";
        zk().setContainer(stringChangeFirstPath+"number", function (el, oldValue, newValue) {
            if(oldValue > 0){
                if(zk().toolbox.is(newValue, "string|number")){
                    el = newValue + el.slice(oldValue);
                }
            }
            return el;
        });
        zk().setContainer(stringChangeFirstPath+"other", function(el, oldValue, newValue){
            var box = zk().toolbox;
            if(box.is(oldValue, "string|regexp")){
                if(box.is(newValue, "string|number")){
                    oldValue = new RegExp(oldValue);
                    var i = -1;
                    el = el.replace(oldValue, function (str) { i++; return i ? str : newValue });
                }
            }
            return el;
        });
        String.prototype.changeFirst = function(oldValue, newValue){ return zk().toolbox.changeFirst(this, oldValue, newValue) };

        String.prototype.changeMiddle = function(value){ return zk().toolbox.changeMiddle(this, value) };

        var stringChangeLastPath = "_ENTITY_._PARAMETERS_.string.changeLast.";
        zk().setContainer(stringChangeLastPath+"number", function (el, oldValue, newValue) {
            if(oldValue > 0){
                el = zk().getContainer(stringAddLastPath+"other")(el.slice(0, -oldValue), newValue);
            }
            return el;
        });
        zk().setContainer(stringChangeLastPath+"other", function(el, oldValue, newValue){
            var box = zk().toolbox;
            if(box.is(oldValue, "string|regexp")){
                var ig = (oldValue.ignoreCase ? "i" : "") + "g";
                oldValue = new RegExp(oldValue, ig);
                var r = el.match(oldValue);
                if (r && box.is(newValue, "string|number")) {
                    oldValue = r[r.length - 1];
                    var i = el.lastIndexOf(oldValue);
                    el = doSlice(el, i, i + oldValue.length, newValue);
                }
            }
            return el;
        });
        String.prototype.changeLast = function(oldValue, newValue){ return zk().toolbox.changeLast(this, oldValue, newValue) };

        var stringChangeBeforePath = "_ENTITY_._PARAMETERS_.string.changeBefore.";
        zk().setContainer(stringChangeBeforePath+"other", function(el, index, value){
            var box = zk().toolbox, el2 = box.removeBefore(el, index, value);
            if(el2 != el){ el = box.addFirst(el2, value) }
            return el;
        });
        String.prototype.changeBefore = function(index, value){ return zk().toolbox.changeBefore(this, index, value) };

        var stringChangeAfterPath = "_ENTITY_._PARAMETERS_.string.changeAfter.";
        zk().setContainer(stringChangeAfterPath+"other", function(el, index, value){
            var box = zk().toolbox;
            var el2 = box.removeAfter(el, index);
            if(el2 != el){ el = box.addLast(el2, value) }
            return el;
        });
        String.prototype.changeAfter = function(index, value){ return zk().toolbox.changeAfter(this, index, value) };

        var stringChangeBetweenPath = "_ENTITY_._PARAMETERS_.string.changeBetween.";
        zk().setContainer(stringChangeBetweenPath+"array", function(el, indexes, value){
            var box = zk().toolbox;
            if (!box.is(indexes, 'array')) { indexes = [indexes] }
            if (indexes.length % 2) { indexes.push(el.length - 1) }
            indexes = indexes.slice(0, 2);
            indexes = stringBetweenIndexes(el, indexes);
            if(indexes[0] > -1 && indexes[1] > -1){
                if(box.is(value, "string|number")){
                    el = el.slice(0, indexes[0]+1) + value + el.slice(indexes[1]);
                }

            }
            return el;
        });
        String.prototype.changeBetween = function(indexes, value){ return zk().toolbox.changeBetween(this, indexes, value) };

        var stringChangeAtPath = "_ENTITY_._PARAMETERS_.string.changeAt.";
        zk().setContainer(stringChangeAtPath + "array", function (el, indexes, value) {
            var box = zk().toolbox;
            if(box.is(value, "string|number")){
                value = (value+"").slice(0, 1);
                if(!box.is(indexes, 'array')){ indexes = [indexes] }
                indexes = box.removeDuplicate(indexes, true);
                box.each(indexes, function () {
                    var n = this.v;
                    if (box.is(n, 'number') && n > -1) {
                        el = el.slice(0, n) + value + el.slice(n+1);
                    }
                });
            }
            return el
        });
        String.prototype.changeAt = function(indexes, value){ return zk().toolbox.changeAt(this, indexes, value) };

        var stringChangePath = "_ENTITY_._PARAMETERS_.string.change.";
        zk().setContainer(stringChangePath+"other", function(el){ return el });
        zk().setContainer(stringChangePath+"string", function(el, oldValue, newValue){
            return el.replace(new RegExp(oldValue, "g"), newValue);
        });
        zk().setContainer(stringChangePath+"regexp", function(el, oldValue, newValue){
            var ig = (oldValue.ignoreCase ? "i" : "") + "g";
            return el.replace(new RegExp(oldValue, ig), newValue);
        });
        zk().setContainer(stringChangePath + "number", function (el, oldValue, newValue) {
            return  zk().toolbox['change'+(oldValue<0?'Last':'First')](el, Math.abs(oldValue), newValue) ;
        });
        String.prototype.change = function(oldValue, newValue){ return zk().toolbox.change(this, oldValue, newValue) };

// ========================================= LES METHODES AVEC UPPER ===========================================

        var stringUpperFirstPath = "_ENTITY_._PARAMETERS_.string.upperFirst.";
        zk().setContainer(stringUpperFirstPath+"number", function (el, value, upperLower) {
            if(value > 0){
                el = (el.slice(0, value)["to"+upperLower+"Case"]()) + el.slice(value);
            }
            return el
        });
        zk().setContainer(stringUpperFirstPath+"string", function(el, value, upperLower){
            return zk().getContainer(stringUpperFirstPath+"regexp")(el, value, upperLower);
        });
        zk().setContainer(stringUpperFirstPath+"regexp", function(el, value, upperLower){
            var i = -1; return el.replace(value, function (str) { i++; return i ? str : str["to"+upperLower+"Case"]() })
        });
        String.prototype.upperFirst = function(value){ return zk().toolbox.upperFirst(this, value) };

        var stringUpperLastPath = "_ENTITY_._PARAMETERS_.string.upperLast.";
        zk().setContainer(stringUpperLastPath+"number", function (el, value, upperLower) {
            if(value > 0){ el = el.slice(0, -value) + (el.slice(-value)["to"+upperLower+"Case"]()); }
            return el
        });
        zk().setContainer(stringUpperLastPath+"string", function(el, value, upperLower){
            return zk().getContainer(stringUpperLastPath+"regexp")(el, value, upperLower);
        });
        zk().setContainer(stringUpperLastPath+"regexp", function(el, value, upperLower){
            var ig = (value.ignoreCase ? "i" : "") + "g";
            value = new RegExp(value, ig);
            var r = el.match(value);
            if (r) {
                value = r[r.length - 1];
                var i = el.lastIndexOf(value);
                el = doSlice(el, i, i + value.length, value["to"+upperLower+"Case"]());
            }
            return el;
        });
        String.prototype.upperLast = function(value){ return zk().toolbox.upperLast(this, value) };

        function upperLowerTab(tab, upperLower) {
            var box = zk().toolbox;
            return box.each(tab, function(){
                var v = this.v;
                if(box.is(v, 'string')){ v = v['to' + upperLower + 'Case']() }
                return v;
            }) ;
        }
        String.prototype.upperMiddle = function(){ return zk().toolbox.upperMiddle(this) };

        var stringUpperBeforePath = "_ENTITY_._PARAMETERS_.string.upperBefore.";
        zk().setContainer(stringUpperBeforePath+"other", function(el, index, upperLower){
            var box = zk().toolbox, i = -1, before = box.getBefore(el, index);
            return el.replace(before, function (str) { i++; return i ? str : str["to"+upperLower+"Case"]() })
        });
        String.prototype.upperBefore = function(index){ return zk().toolbox.upperBefore(this, index) };

        var stringUpperAfterPath = "_ENTITY_._PARAMETERS_.string.upperAfter.";
        zk().setContainer(stringUpperAfterPath+"other", function(el, index, upperLower){
            var box = zk().toolbox, after = box.getAfter(el, index);
            if(after){
                el = el.slice(el, el.indexOf(after)) + after["to"+upperLower+"Case"]()
            }
            return el;
        });
        String.prototype.upperAfter = function(index){ return zk().toolbox.upperAfter(this, index) };

        var stringUpperBetweenPath = "_ENTITY_._PARAMETERS_.string.upperBetween.";
        zk().setContainer(stringUpperBetweenPath+"array", function(el, indexes, upperLower){
            var box = zk().toolbox, i, k;
            if (!box.is(indexes, 'array')) { indexes = [indexes] }
            if (indexes.length % 2) { indexes.push(el.length - 1) }
            k = indexes.length;
            for (i = 0; i < k; i += 2) {
                var tab = [indexes[i], indexes[i+1]];
                tab = stringBetweenIndexes(el, tab);
                if(tab[0] > -1 && tab[1] > -1){
                    el = el.slice(0, tab[0]+1) + el.slice(tab[0]+1,tab[1])["to"+upperLower+"Case"]() + el.slice(tab[1]);
                }
            }
            return el;
        });
        String.prototype.upperBetween = function(indexes){ return zk().toolbox.upperBetween(this, indexes) };

        var stringUpperAtPath = "_ENTITY_._PARAMETERS_.string.upperAt.";
        zk().setContainer(stringUpperAtPath + "number", function (el, index, upperLower) {
            return zk().getContainer(stringUpperAtPath + "array")(el, [index], upperLower)
        });
        zk().setContainer(stringUpperAtPath + "array", function (el, indexes, upperLower) {
            var box = zk().toolbox;
            indexes = box.removeDuplicate(indexes, true);
            box.each(indexes, function () {
                var n = this.v;
                if (box.is(n, 'number') && n > -1) {
                    if (box.is(el[n], 'string')) {
                        el = el.slice(0, n) + (el.slice(n, n+1)["to"+upperLower+"Case"]()) + el.slice(n+1);
                    }
                }
            });
            return el;
        });
        String.prototype.upperAt = function(indexes){ return zk().toolbox.upperAt(this, indexes) };

        var stringUpperPath = "_ENTITY_._PARAMETERS_.string.upper.";
        zk().setContainer(stringUpperPath+"string", function(el, value, upperLower){
            return zk().getContainer(stringUpperPath+"regexp")(el, value, upperLower);
        });
        zk().setContainer(stringUpperPath+"regexp", function(el, value, upperLower){
            var ig = (value.ignoreCase ? "i" : "") + "g"; value = new RegExp(value, ig);
            return el.replace(value, function (str) { return str["to"+upperLower+"Case"]() })
        });
        zk().setContainer(stringUpperPath + "number", function (el, value, upperLower) {
            var path = (value < 0 ) ? stringUpperLastPath : stringUpperFirstPath;
            return zk().getContainer(path+'number')(el, Math.abs(value), upperLower);
        });
        zk().setContainer(stringUpperPath + "array", function (el, value, upperLower) {
            var box = zk().toolbox;
            box.each(value, function () {
                var f = zk().getContainer(stringUpperPath + box.is(this.v));
                if(f){
                    el = f(el, this.v, upperLower);
                }
            });
            return el;
        });
        String.prototype.upper = function(value){ return zk().toolbox.upper(this, value) };

// ========================================= LES METHODES AVEC LOWER ============================================

        String.prototype.lowerFirst = function(value){ return zk().toolbox.lowerFirst(this, value) };

        String.prototype.lowerLast = function(value){ return zk().toolbox.lowerLast(this, value) };

        String.prototype.lowerMiddle = function(){ return zk().toolbox.lowerMiddle(this) };

        String.prototype.lowerBefore = function(index){ return zk().toolbox.lowerBefore(this, index) };

        String.prototype.lowerAfter = function(index){ return zk().toolbox.lowerAfter(this, index) };

        String.prototype.lowerBetween = function(indexes){ return zk().toolbox.lowerBetween(this, indexes) };

        String.prototype.lowerAt = function(indexes){ return zk().toolbox.lowerAt(this, indexes) };

        String.prototype.lower = function(value){ return zk().toolbox.lower(this, value) };

    }
    stringEntity();


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