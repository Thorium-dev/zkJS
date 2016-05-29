(function ($W) {
    'use strict';

    //@TODO : Faire l'objet Edge (Gère les cotés margin, padding, border ...)


    var THIS = this, ZKID = parseInt(Math.random() * 100000000000);

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
                if (!APP._TOOLBOX_.is(v, "object") && v !== undefined) {
                    if (!APP._TOOLBOX_.is(v, "array")) {
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
            return (type === undefined || !t) ? t : (type2.test(t))
        };
        /**
         * Permet de supprimer des caractères au début et à la fin d'une chaîne
         *
         * @method trim
         * @param {string} el Objet de référence.
         * @param {string} strReg Expression régulière sous forme de chaîne de caractères
         * @param {string} direction La direction. Deux valeurs possibles "l" pour la gauche et "r" pour la droite.
         * @return {string}
         * @since 1.0
         */
        this.trim = function (el, strReg, direction) {
            if (!self.is(el, "string")) {
                return el
            }
            if (strReg === undefined) {
                strReg = ' '
            }
            if (direction === "l") {
                strReg = "^(?:" + strReg + ")"
            }
            else if (direction === "r") {
                strReg = "(?:" + strReg + ")$"
            }
            else {
                strReg = "^(?:" + strReg + ")|(?:" + strReg + ")$"
            }
            return str.replace(new RegExp(strReg, "g"), "")
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
                    if (args === undefined) {
                        args = []
                    }
                    if (!self.is(args, 'array')) {
                        args = [args]
                    }
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
            var pType = self.is(value);
            if(!self.is(el, "string|array")){ return el }
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
            if(!self.is(el, "string|array")){ return el }
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
            if (oldValue === undefined) {
                return el
            }
            if (newValue === undefined) {
                newValue = oldValue;
                oldValue = 1
            }
            var basePath = "_ENTITY_._PARAMETERS_." + self.is(el) + ".";
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
            if (index === undefined || value === undefined) {
                return el
            }
            var basePath = "_ENTITY_._PARAMETERS_." + self.is(el) + ".";
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
            if (indexes === undefined || value === undefined) {
                return el
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) + ".changeBetween.array";
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
            if (indexes === undefined || value === undefined) {
                return el
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) + ".changeAt.array";
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
            if (oldValue === undefined || newValue === undefined) {
                return el
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) + ".change.";
            var f = APP.getContainer(path + self.is(oldValue));
            return f ? f(el, oldValue, newValue) : APP.getContainer(path + "other")(el, oldValue, newValue);
        };

        // UPPER

        function upperLowerFirstLast(el, value, firstLast, upperLower) {
            if (value === undefined) {
                value = 1
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) +
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
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) +
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
            if (indexes === undefined) {
                return el
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) +
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
            if (indexes === undefined) {
                return el
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) +
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
            if (indexes === undefined) {
                indexes = el
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) +
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
                    "toolbox": APP._TOOLBOX_,
                    "entity": APP._ENTITY_,
                    "container": APP._CONTAINER_,
                };
                entity = new entity($this);
            }
            return Object.freeze(entity);
        };
    }
    APP._ENTITY_ = new _ENTITY_();
    APP.entity = APP._ENTITY_;

    function nodeLauncher(selector) {
        var $this = {
            "parameters": APP.getContainer("_ENTITY_._PARAMETERS_.node"),
            "toolbox": APP._TOOLBOX_,
            "entity": APP._ENTITY_,
            "container": APP._CONTAINER_,
        };
        var nodeEnity = APP.getContainer("_ENTITY_.node");
        return Object.freeze(new nodeEnity($this)).set(selector);
    }

    /**
     * Permet de sélectionner les éléments du DOM
     *
     * @method $
     * @param {string} selector Sélecteur css
     * @return {*} Elle retourne l'objet Node
     * @since 1.0
     */
    $W.$ = function (selector) {
        return nodeLauncher(selector)
    };
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