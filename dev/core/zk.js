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
            htmlformcontrolscollection: function (el, f, args) {
                return doEachByObj.string(self.toArray(el), f, args);
            },
            htmloptionscollection: function (el, f, args) {
                return doEachByObj.string(self.toArray(el), f, args);
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

        // @TODO : Faire la fonction sortBy (Ajouter en prototype pour Array)

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
         * @return {int}
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
        /**
         * Permet de cloner un objet
         * @method clone
         * @param {object} object Objet à cloner
         * @return {*}
         * @since 1.0
         */
        this.clone = function(object) {
            try {
                var copy = new object.constructor(), id;
                for (id in object) {
                    if (object.hasOwnProperty(id)) {
                        copy[id] = object[id];
                    }
                }
                return copy;
            }catch (e){
                console.log(e);
                return object
            }
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
                    "config": APP.config,
                };
                entity = new entity($this);
            }
            return Object.freeze(entity);
        };
    }
    APP._ENTITY_ = new _ENTITY_();
    APP.entity = APP._ENTITY_;

    function _EVENT_(){
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
        this.get = function (key) {
            return APP.container.get("_CONFIG_." + key);
        };
        this.set = function (key, value) {
            return APP.container.set("_CONFIG_." + key, value);
        };
        this.remove = function (key) {
            return APP.container.remove("_CONFIG_." + key);
        }
    }
    APP._CONFIG_ = new _CONFIG_();
    APP.config = APP._CONFIG_;

    // stringEntity
    function stringEntity() {
        String.prototype.each = function(func, args){ return APP.toolbox.each(this, func, args) };

        var stringIndexPath = "_ENTITY_._PARAMETERS_.string.index.";
        APP.setContainer(stringIndexPath+"other", function(){ return -1 });
        APP.setContainer(stringIndexPath+"string", function(el, value){ return el.indexOf(value) });
        APP.setContainer(stringIndexPath+"number", function(el, value){ return el.indexOf(value+"") });
        APP.setContainer(stringIndexPath+"regexp", function(el, value){
            var index = value.exec(el);
            return index ? index['index'] : -1;
        });
        String.prototype.index = function(value){ return APP.toolbox.index(this, value) };

        var stringIndexesPath = "_ENTITY_._PARAMETERS_.string.indexes.";
        APP.setContainer(stringIndexesPath+"other", function(){ return [] });
        APP.setContainer(stringIndexesPath + "string", function (el, value) {
            var indexes = [], i = -1;
            while ((i = el.indexOf(value, i+1)) != -1){ indexes.push(i) }
            return indexes;
        });
        APP.setContainer(stringIndexesPath + "number", function (el, value) {
            return APP.getContainer(stringIndexesPath + "string")(el, value + "");
        });
        APP.setContainer(stringIndexesPath+"regexp", function(el, value){
            var result, indexes = [], ig = (value.ignoreCase ? "i" : "") + "g";
            value = new RegExp(value, ig);
            while ( (result = value.exec(el)) ) { indexes.push(result.index) }
            return indexes;
        });
        String.prototype.indexes = function(value){ return APP.toolbox.indexes(this, value) };

        String.prototype.lastIndex = function(value){ return APP.toolbox.lastIndex(this, value) };

        String.prototype.count = function(value){ return APP.toolbox.count(this, value) };

        String.prototype.has = function(value){ return APP.toolbox.has(this, value) };

        String.prototype.reverse = function(){ return APP.toolbox.reverse(this) };

        String.prototype.trim = function(strReg, direction){ return APP.toolbox.trim(this, strReg, direction) };

        String.prototype.camelCase = function(separators){ return APP.toolbox.camelCase(this, separators) };

        String.prototype.snakeCase = function(separators){ return APP.toolbox.snakeCase(this, separators) };

        String.prototype.linkCase = function(separators){ return APP.toolbox.linkCase(this, separators) };

// ========================================= LES METHODES AVEC GET =============================================

        var stringGetFirstPath = "_ENTITY_._PARAMETERS_.string.getFirst.";
        APP.setContainer(stringGetFirstPath+"other", function(){ return "" });
        APP.setContainer(stringGetFirstPath+"number", function(el, value){ return el.slice(0, Math.abs(value)) });
        APP.setContainer(stringGetFirstPath+"string", function(el, value){
            return APP.getContainer(stringGetFirstPath+"regexp")(el, new RegExp(value));
        });
        APP.setContainer(stringGetFirstPath+"regexp", function(el, value){ var r = el.match(value); return r ? r[0] : ''; });
        String.prototype.getFirst = function(value){ return APP.toolbox.getFirst(this, value) };

        String.prototype.getMiddle = function(){ return APP.toolbox.getMiddle(this) };

        var stringGetLastPath = "_ENTITY_._PARAMETERS_.string.getLast.";
        APP.setContainer(stringGetLastPath+"other", function(){ return "" });
        APP.setContainer(stringGetLastPath+"number", function(el, value){ return el.slice(-Math.abs(value)) });
        APP.setContainer(stringGetLastPath+"string", function(el, value){
            return APP.getContainer(stringGetLastPath+"regexp")(el, value)
        });
        APP.setContainer(stringGetLastPath+"regexp", function(el, value){
            var ig = (value.ignoreCase ? "i" : "") + "g", r = el.match(new RegExp(value, ig)); return r ? r[r.length - 1] : '';
        });
        String.prototype.getLast = function(value){ return APP.toolbox.getLast(this, value) };

        var stringGetBeforePath = "_ENTITY_._PARAMETERS_.string.getBefore.";
        APP.setContainer(stringGetBeforePath+"other", function(el, index){
            var box = APP.toolbox;
            if(!box.is(index, "string|regexp|number")){ return "" }
            if(!box.is(index, "number")){ index = box.index(el, index) }
            if(index > -1 ){ return el.slice(0,index) }
            return "";
        });
        String.prototype.getBefore = function(index){ return APP.toolbox.getBefore(this, index) };

        var stringGetAfterPath = "_ENTITY_._PARAMETERS_.string.getAfter.";
        APP.setContainer(stringGetAfterPath+"other", function(el, index){
            var box = APP.toolbox, indexType = box.is(index);
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
        String.prototype.getAfter = function(index){ return APP.toolbox.getAfter(this, index) };

        function stringBetweenIndexes(el, indexes){
            var box = APP.toolbox;
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
        APP.setContainer(stringGetBetweenPath+"array", function(el, indexes){
            var box = APP.toolbox, i, k, res = "";
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
        String.prototype.getBetween = function(indexes){ return APP.toolbox.getBetween(this, indexes) };

        var stringGetAtPath = "_ENTITY_._PARAMETERS_.string.getAt.";
        APP.setContainer(stringGetAtPath + "array", function (el, indexes){
            return APP.getContainer(arrayGetAtPath+"array")(el, indexes);
        });
        String.prototype.getAt = function(indexes){ return APP.toolbox.getAt(this, indexes) };

        var stringGetPath = "_ENTITY_._PARAMETERS_.string.get.";
        APP.setContainer(stringGetPath+"other", function(){ return "" });
        APP.setContainer(stringGetPath + "string", function(el, value){
            return APP.getContainer(stringGetPath+"regexp")(el, value);
        });
        APP.setContainer(stringGetPath + "regexp", function(el, value){
            var ig = (value.ignoreCase ? "i" : "") + "g", res = el.match(new RegExp(value, ig));
            return res ? res.join("") : "";
        });
        APP.setContainer(stringGetPath + "number", function (el, value){
            return ( value < 0 ) ? el.slice(value) : el.slice(0, value)
        });
        APP.setContainer(stringGetPath + "array", function (el, value){
            var box = APP.toolbox, res = "";
            box.each(value, function () {
                var f = APP.getContainer(stringGetPath + box.is(this.v));
                if(f){
                    res += f(el, this.v);
                }
            });
            return res;

        });
        String.prototype.get = function(value){ return APP.toolbox.get(this, value) };

// ========================================= LES METHODES AVEC REMOVE =============================================

        var stringRemoveFirstPath = "_ENTITY_._PARAMETERS_.string.removeFirst.";
        APP.setContainer(stringRemoveFirstPath+"other", function (el) { return el });
        APP.setContainer(stringRemoveFirstPath+"number", function (el, value) { return (value < 1) ? el : el.slice(value) });
        APP.setContainer(stringRemoveFirstPath+"string", function(el, value){ return el.replace(new RegExp(value), "") });
        APP.setContainer(stringRemoveFirstPath+"regexp", function(el, value){
            var i = -1; return el.replace(value, function (str) { i++; return i ? str : "" })
        });
        String.prototype.removeFirst = function(value){ return APP.toolbox.removeFirst(this, value) };

        String.prototype.removeMiddle = function(){ return APP.toolbox.removeMiddle(this) };

        var stringRemoveLastPath = "_ENTITY_._PARAMETERS_.string.removeLast.";
        APP.setContainer(stringRemoveLastPath+"other", function(el){ return el });
        APP.setContainer(stringRemoveLastPath + "number", function (el, value) {
            return (value < 1) ? this : el.slice(0, -value);
        });
        APP.setContainer(stringRemoveLastPath + "string", function (el, value) {
            return APP.getContainer(stringRemoveLastPath + "regexp")(el, new RegExp(value))
        });
        APP.setContainer(stringRemoveLastPath+"regexp", function(el, value){
            var r = el.match(value);
            if (!r) { return el }
            value = r[r.length - 1];
            var i = el.lastIndexOf(value);
            return doSlice(el, i, i + value.length);
        });
        String.prototype.removeLast = function(value){ return APP.toolbox.removeLast(this, value) };

        var stringRemoveBeforePath = "_ENTITY_._PARAMETERS_.string.removeBefore.";
        APP.setContainer(stringRemoveBeforePath+"other", function(el, index){
            var before = APP.toolbox.getBefore(el, index);
            return el.slice(el.indexOf(before) + before.length);
        });
        String.prototype.removeBefore = function(index){ return APP.toolbox.removeBefore(this, index) };

        var stringRemoveAfterPath = "_ENTITY_._PARAMETERS_.string.removeAfter.";
        APP.setContainer(stringRemoveAfterPath+"other", function(el, index){
            return el.slice(0, el.lastIndexOf(APP.toolbox.getAfter(el, index)));
        });
        String.prototype.removeAfter = function(index){ return APP.toolbox.removeAfter(this, index) };

        var stringRemoveBetweenPath = "_ENTITY_._PARAMETERS_.string.removeBetween.";
        APP.setContainer(stringRemoveBetweenPath+"array", function(el, indexes){
            var box = APP.toolbox;
            if (!box.is(indexes, 'array')) { indexes = [indexes] }
            if (indexes.length % 2) { indexes.push(el.length - 1) }
            indexes = indexes.slice(0, 2);
            indexes = stringBetweenIndexes(el, indexes);
            if(indexes[0] > -1 && indexes[1] > -1){
                el = el.slice(0, indexes[0]+1) + el.slice(indexes[1]);
            }
            return el;
        });
        String.prototype.removeBetween = function(indexes){ return APP.toolbox.removeBetween(this, indexes) };

        var stringRemoveAtPath = "_ENTITY_._PARAMETERS_.string.removeAt.";
        APP.setContainer(stringRemoveAtPath + "number", function (el, indexes){
            return APP.getContainer(stringRemoveAtPath + "array")(el, [indexes])
        });
        APP.setContainer(stringRemoveAtPath + "array", function (el, indexes){
            return APP.getContainer(arrayRemoveAtPath + "array")(el, indexes)
        });
        String.prototype.removeAt = function(indexes){ return APP.toolbox.removeAt(this, indexes) };

        var stringRemovePath = "_ENTITY_._PARAMETERS_.string.remove.";
        APP.setContainer(stringRemovePath+"other", function(el){ return el });
        APP.setContainer(stringRemovePath+"string", function (el, value) {
            return APP.getContainer(stringRemovePath + "regexp")(el, value)
        });
        APP.setContainer(stringRemovePath+"regexp", function(el, value){
            var ig = (value.ignoreCase ? "i" : "") + "g";
            value = new RegExp(value, ig); return el.replace(value, "");
        });
        APP.setContainer(stringRemovePath+"number", function (el, value){
            return ( value < 0 ) ? el.slice(0, value) : el.slice(value);
        });
        APP.setContainer(stringRemovePath+"array", function (el, value){
            var box = APP.toolbox;
            box.each(value, function () {
                var type = box.is(this.v);
                if(/string|regexp|number/.test(type)){
                    el = APP.getContainer(stringRemovePath + type)(el, this.v);
                }
            });
            return el
        });
        String.prototype.remove = function(value){ return APP.toolbox.remove(this, value) };

// ========================================= LES METHODES AVEC ADD =============================================

        var stringAddFirstPath = "_ENTITY_._PARAMETERS_.string.addFirst.";
        APP.setContainer(stringAddFirstPath+"other", function(el, value){
            if(APP.toolbox.is(value, "string")){ el = value + el }
            return el;
        });
        String.prototype.addFirst = function(value){ return APP.toolbox.addFirst(this, value) };

        String.prototype.addMiddle = function(value){ return APP.toolbox.addMiddle(this, value) };

        var stringAddLastPath = "_ENTITY_._PARAMETERS_.string.addLast.";
        APP.setContainer(stringAddLastPath+"other", function(el, value){
            if(APP.toolbox.is(value, "string|number")){ el += value + "" }
            return el;
        });
        String.prototype.addLast = function(value){ return APP.toolbox.addLast(this, value) };

        var stringAddBeforePath = "_ENTITY_._PARAMETERS_.string.addBefore.";
        APP.setContainer(stringAddBeforePath+"other", function(el, index, value){
            var box = APP.toolbox;
            if(!box.is(index, "number")){ index = box.index(el, index) }
            if(index > -1 ){
                if(box.is(value, "array")){ value = value.join("") }
                return doSlice(el, index, index, value)
            }
            return el;
        });
        String.prototype.addBefore = function(index, value){ return APP.toolbox.addBefore(this, index, value) };

        var stringAddAfterPath = "_ENTITY_._PARAMETERS_.string.addAfter.";
        APP.setContainer(stringAddAfterPath+"other", function(el, index, value){
            var box = APP.toolbox; index = box.getAfter(el, index);
            return index ? box.addBefore(el, index, value) : el;
        });
        String.prototype.addAfter = function(index, value){ return APP.toolbox.addAfter(this, index, value) };

// addBetween n'existe pas

        var stringAddAtPath = "_ENTITY_._PARAMETERS_.string.addAt.";
        APP.setContainer(stringAddAtPath + "array", function (el, indexes, value) {
            var box = APP.toolbox;
            if(box.is(value, "string|number")){ value = (value+"").slice(0, 1) } else { value = undefined }
            if(value !== undefined){
                if(!box.is(indexes, "array")){ indexes = [indexes] }
                indexes = box.removeDuplicate(indexes, true);
                box.each(indexes, function () {
                    if(box.is(this.v, "number")){
                        el = APP.getContainer(arrayAddBeforePath+"other")(el, this.v, value);
                    }
                });
            }
            return el;
        });
        String.prototype.addAt = function(indexes, value){ return APP.toolbox.addAt(this, indexes, value) };

        String.prototype.add = function(value){ return APP.toolbox.add(this, value) };


// ========================================= LES METHODES AVEC CHANGE ===========================================

        var stringChangeFirstPath = "_ENTITY_._PARAMETERS_.string.changeFirst.";
        APP.setContainer(stringChangeFirstPath+"number", function (el, oldValue, newValue) {
            if(oldValue > 0){
                if(APP.toolbox.is(newValue, "string|number")){
                    el = newValue + el.slice(oldValue);
                }
            }
            return el;
        });
        APP.setContainer(stringChangeFirstPath+"other", function(el, oldValue, newValue){
            var box = APP.toolbox;
            if(box.is(oldValue, "string|regexp")){
                if(box.is(newValue, "string|number")){
                    oldValue = new RegExp(oldValue);
                    var i = -1;
                    el = el.replace(oldValue, function (str) { i++; return i ? str : newValue });
                }
            }
            return el;
        });
        String.prototype.changeFirst = function(oldValue, newValue){ return APP.toolbox.changeFirst(this, oldValue, newValue) };

        String.prototype.changeMiddle = function(value){ return APP.toolbox.changeMiddle(this, value) };

        var stringChangeLastPath = "_ENTITY_._PARAMETERS_.string.changeLast.";
        APP.setContainer(stringChangeLastPath+"number", function (el, oldValue, newValue) {
            if(oldValue > 0){
                el = APP.getContainer(stringAddLastPath+"other")(el.slice(0, -oldValue), newValue);
            }
            return el;
        });
        APP.setContainer(stringChangeLastPath+"other", function(el, oldValue, newValue){
            var box = APP.toolbox;
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
        String.prototype.changeLast = function(oldValue, newValue){ return APP.toolbox.changeLast(this, oldValue, newValue) };

        var stringChangeBeforePath = "_ENTITY_._PARAMETERS_.string.changeBefore.";
        APP.setContainer(stringChangeBeforePath+"other", function(el, index, value){
            var box = APP.toolbox, el2 = box.removeBefore(el, index, value);
            if(el2 != el){ el = box.addFirst(el2, value) }
            return el;
        });
        String.prototype.changeBefore = function(index, value){ return APP.toolbox.changeBefore(this, index, value) };

        var stringChangeAfterPath = "_ENTITY_._PARAMETERS_.string.changeAfter.";
        APP.setContainer(stringChangeAfterPath+"other", function(el, index, value){
            var box = APP.toolbox;
            var el2 = box.removeAfter(el, index);
            if(el2 != el){ el = box.addLast(el2, value) }
            return el;
        });
        String.prototype.changeAfter = function(index, value){ return APP.toolbox.changeAfter(this, index, value) };

        var stringChangeBetweenPath = "_ENTITY_._PARAMETERS_.string.changeBetween.";
        APP.setContainer(stringChangeBetweenPath+"array", function(el, indexes, value){
            var box = APP.toolbox;
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
        String.prototype.changeBetween = function(indexes, value){ return APP.toolbox.changeBetween(this, indexes, value) };

        var stringChangeAtPath = "_ENTITY_._PARAMETERS_.string.changeAt.";
        APP.setContainer(stringChangeAtPath + "array", function (el, indexes, value) {
            var box = APP.toolbox;
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
        String.prototype.changeAt = function(indexes, value){ return APP.toolbox.changeAt(this, indexes, value) };

        var stringChangePath = "_ENTITY_._PARAMETERS_.string.change.";
        APP.setContainer(stringChangePath+"other", function(el){ return el });
        APP.setContainer(stringChangePath+"string", function(el, oldValue, newValue){
            return el.replace(new RegExp(oldValue, "g"), newValue);
        });
        APP.setContainer(stringChangePath+"regexp", function(el, oldValue, newValue){
            var ig = (oldValue.ignoreCase ? "i" : "") + "g";
            return el.replace(new RegExp(oldValue, ig), newValue);
        });
        APP.setContainer(stringChangePath + "number", function (el, oldValue, newValue) {
            return  APP.toolbox['change'+(oldValue<0?'Last':'First')](el, Math.abs(oldValue), newValue) ;
        });
        String.prototype.change = function(oldValue, newValue){ return APP.toolbox.change(this, oldValue, newValue) };

// ========================================= LES METHODES AVEC UPPER ===========================================

        var stringUpperFirstPath = "_ENTITY_._PARAMETERS_.string.upperFirst.";
        APP.setContainer(stringUpperFirstPath+"number", function (el, value, upperLower) {
            if(value > 0){
                el = (el.slice(0, value)["to"+upperLower+"Case"]()) + el.slice(value);
            }
            return el
        });
        APP.setContainer(stringUpperFirstPath+"string", function(el, value, upperLower){
            return APP.getContainer(stringUpperFirstPath+"regexp")(el, value, upperLower);
        });
        APP.setContainer(stringUpperFirstPath+"regexp", function(el, value, upperLower){
            var i = -1; return el.replace(value, function (str) { i++; return i ? str : str["to"+upperLower+"Case"]() })
        });
        String.prototype.upperFirst = function(value){ return APP.toolbox.upperFirst(this, value) };

        var stringUpperLastPath = "_ENTITY_._PARAMETERS_.string.upperLast.";
        APP.setContainer(stringUpperLastPath+"number", function (el, value, upperLower) {
            if(value > 0){ el = el.slice(0, -value) + (el.slice(-value)["to"+upperLower+"Case"]()); }
            return el
        });
        APP.setContainer(stringUpperLastPath+"string", function(el, value, upperLower){
            return APP.getContainer(stringUpperLastPath+"regexp")(el, value, upperLower);
        });
        APP.setContainer(stringUpperLastPath+"regexp", function(el, value, upperLower){
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
        String.prototype.upperLast = function(value){ return APP.toolbox.upperLast(this, value) };

        function upperLowerTab(tab, upperLower) {
            var box = APP.toolbox;
            return box.each(tab, function(){
                var v = this.v;
                if(box.is(v, 'string')){ v = v['to' + upperLower + 'Case']() }
                return v;
            }) ;
        }
        String.prototype.upperMiddle = function(){ return APP.toolbox.upperMiddle(this) };

        var stringUpperBeforePath = "_ENTITY_._PARAMETERS_.string.upperBefore.";
        APP.setContainer(stringUpperBeforePath+"other", function(el, index, upperLower){
            var box = APP.toolbox, i = -1, before = box.getBefore(el, index);
            return el.replace(before, function (str) { i++; return i ? str : str["to"+upperLower+"Case"]() })
        });
        String.prototype.upperBefore = function(index){ return APP.toolbox.upperBefore(this, index) };

        var stringUpperAfterPath = "_ENTITY_._PARAMETERS_.string.upperAfter.";
        APP.setContainer(stringUpperAfterPath+"other", function(el, index, upperLower){
            var box = APP.toolbox, after = box.getAfter(el, index);
            if(after){
                el = el.slice(el, el.indexOf(after)) + after["to"+upperLower+"Case"]()
            }
            return el;
        });
        String.prototype.upperAfter = function(index){ return APP.toolbox.upperAfter(this, index) };

        var stringUpperBetweenPath = "_ENTITY_._PARAMETERS_.string.upperBetween.";
        APP.setContainer(stringUpperBetweenPath+"array", function(el, indexes, upperLower){
            var box = APP.toolbox, i, k;
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
        String.prototype.upperBetween = function(indexes){ return APP.toolbox.upperBetween(this, indexes) };

        var stringUpperAtPath = "_ENTITY_._PARAMETERS_.string.upperAt.";
        APP.setContainer(stringUpperAtPath + "number", function (el, index, upperLower) {
            return APP.getContainer(stringUpperAtPath + "array")(el, [index], upperLower)
        });
        APP.setContainer(stringUpperAtPath + "array", function (el, indexes, upperLower) {
            var box = APP.toolbox;
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
        String.prototype.upperAt = function(indexes){ return APP.toolbox.upperAt(this, indexes) };

        var stringUpperPath = "_ENTITY_._PARAMETERS_.string.upper.";
        APP.setContainer(stringUpperPath+"string", function(el, value, upperLower){
            return APP.getContainer(stringUpperPath+"regexp")(el, value, upperLower);
        });
        APP.setContainer(stringUpperPath+"regexp", function(el, value, upperLower){
            var ig = (value.ignoreCase ? "i" : "") + "g"; value = new RegExp(value, ig);
            return el.replace(value, function (str) { return str["to"+upperLower+"Case"]() })
        });
        APP.setContainer(stringUpperPath + "number", function (el, value, upperLower) {
            var path = (value < 0 ) ? stringUpperLastPath : stringUpperFirstPath;
            return APP.getContainer(path+'number')(el, Math.abs(value), upperLower);
        });
        APP.setContainer(stringUpperPath + "array", function (el, value, upperLower) {
            var box = APP.toolbox;
            box.each(value, function () {
                var f = APP.getContainer(stringUpperPath + box.is(this.v));
                if(f){
                    el = f(el, this.v, upperLower);
                }
            });
            return el;
        });
        String.prototype.upper = function(value){ return APP.toolbox.upper(this, value) };

// ========================================= LES METHODES AVEC LOWER ============================================

        String.prototype.lowerFirst = function(value){ return APP.toolbox.lowerFirst(this, value) };

        String.prototype.lowerLast = function(value){ return APP.toolbox.lowerLast(this, value) };

        String.prototype.lowerMiddle = function(){ return APP.toolbox.lowerMiddle(this) };

        String.prototype.lowerBefore = function(index){ return APP.toolbox.lowerBefore(this, index) };

        String.prototype.lowerAfter = function(index){ return APP.toolbox.lowerAfter(this, index) };

        String.prototype.lowerBetween = function(indexes){ return APP.toolbox.lowerBetween(this, indexes) };

        String.prototype.lowerAt = function(indexes){ return APP.toolbox.lowerAt(this, indexes) };

        String.prototype.lower = function(value){ return APP.toolbox.lower(this, value) };

    }
    stringEntity();

    // arrayEntity
    function arrayEntity() {
        Array.prototype.each = function (func, args) {
            return APP.toolbox.each(this, func, args)
        };

        var arrayIndexPath = "_ENTITY_._PARAMETERS_.array.index.";
        APP.setContainer(arrayIndexPath + "other", function (el, value) {
            var k = el.length;
            for (var i = 0; i < k; i++) {
                if (el[i] === value) {
                    return i;
                }
            }
            return -1;
        });
        APP.setContainer(arrayIndexPath + "regexp", function (el, value) {
            var k = el.length;
            for (var i = 0; i < k; i++) {
                if (APP.toolbox.is(el[i], 'string|number') && value.test(el[i])) {
                    return i;
                }
            }
            return -1;
        });
        Array.prototype.index = function (value) {
            return APP.toolbox.index(this, value)
        };

        var arrayIndexesPath = "_ENTITY_._PARAMETERS_.array.indexes.";
        APP.setContainer(arrayIndexesPath + "other", function (el, value) {
            var k = el.length, indexes = [];
            for (var i = 0; i < k; i++) {
                if (el[i] === value) {
                    indexes.push(i);
                }
            }
            return indexes;
        });
        APP.setContainer(arrayIndexesPath + "regexp", function (el, value) {
            var k = el.length, indexes = [];
            for (var i = 0; i < k; i++) {
                if (APP.toolbox.is(el[i], 'string|number') && value.test(el[i])) {
                    indexes.push(i);
                }
            }
            return indexes;
        });
        Array.prototype.indexes = function (value) {
            return APP.toolbox.indexes(this, value)
        };

        Array.prototype.lastIndex = function (value) {
            return APP.toolbox.lastIndex(this, value)
        };

        Array.prototype.count = function (value) {
            return APP.toolbox.count(this, value)
        };

        Array.prototype.has = function (value) {
            return APP.toolbox.has(this, value)
        };

        Array.prototype.reverse = function () {
            return APP.toolbox.reverse(this)
        };

// ========================================= LES METHODES AVEC GET =============================================

        var arrayGetFirstPath = "_ENTITY_._PARAMETERS_.array.getFirst.";
        APP.setContainer(arrayGetFirstPath + "other", function () {
            return []
        });
        APP.setContainer(arrayGetFirstPath + "number", function (el, value) {
            return (value < 1) ? [] : el.slice(0, value);
        });
        APP.setContainer(arrayGetFirstPath + "string", function (el, value) {
            return APP.getContainer(arrayGetFirstPath + "regexp")(el, new RegExp(value));
        });
        APP.setContainer(arrayGetFirstPath + "regexp", function (el, value) {
            var k = el.length;
            for (var i = 0; i < k; i++) {
                if (value.test(el[i])) {
                    return [el[i]]
                }
            }
            return [];
        });
        Array.prototype.getFirst = function (value) {
            return APP.toolbox.getFirst(this, value)
        };

        Array.prototype.getMiddle = function () {
            return APP.toolbox.getMiddle(this)
        };

        var arrayGetLastPath = "_ENTITY_._PARAMETERS_.array.getLast.";
        APP.setContainer(arrayGetLastPath + "other", function () {
            return []
        });
        APP.setContainer(arrayGetLastPath + "number", function (el, value) {
            return (value < 1) ? [] : el.slice(-value)
        });
        APP.setContainer(arrayGetLastPath + "string", function (el, value) {
            return APP.getContainer(arrayGetLastPath + "regexp")(el, new RegExp(value));
        });
        APP.setContainer(arrayGetLastPath + "regexp", function (el, value) {
            var k = el.length;
            for (var i = (k - 1); i + 1; i--) {
                if (value.test(el[i])) {
                    return [el[i]]
                }
            }
            return [];
        });
        Array.prototype.getLast = function (value) {
            return APP.toolbox.getLast(this, value)
        };

        var arrayGetBeforePath = "_ENTITY_._PARAMETERS_.array.getBefore.";
        APP.setContainer(arrayGetBeforePath + "other", function (el, index, isAfter) {
            var box = APP.toolbox;
            if (!box.is(index, "number")) {
                index = box.index(el, index)
            }
            if (index > -1) {
                return isAfter ? el.slice(index + 1) : el.slice(0, index)
            }
            return [];
        });
        Array.prototype.getBefore = function (index) {
            return APP.toolbox.getBefore(this, index)
        };

        var arrayGetAfterPath = "_ENTITY_._PARAMETERS_.array.getAfter.";
        APP.setContainer(arrayGetAfterPath + "other", function (el, index) {
            return APP.getContainer(arrayGetBeforePath + "other")(el, index, true);
        });
        Array.prototype.getAfter = function (index) {
            return APP.toolbox.getAfter(this, index)
        };

        var arrayGetBetweenPath = "_ENTITY_._PARAMETERS_.array.getBetween.";
        APP.setContainer(arrayGetBetweenPath + "array", function (el, indexes) {
            var box = APP.toolbox, i, k, res = [];
            if (!box.is(indexes, 'array')) {
                indexes = [indexes]
            }
            if (indexes.length % 2) {
                indexes.push(el.length - 1)
            }
            k = indexes.length;
            for (i = 0; i < k; i += 2) {
                var tab = [indexes[i], indexes[i + 1]];
                for (var j = 0; j < 2; j++) {
                    if (!box.is(tab[j], "number")) {
                        tab[j] = box.index(el, tab[j])
                    }
                    if (tab[j] < 0) {
                        tab[j] = false
                    }
                }
                if (box.is(tab[0], "number") && box.is(tab[1], "number")) {
                    tab = box.nSort(tab);
                    res = res.concat(el.slice(tab[0] + 1, tab[1]));
                }
            }
            return res;
        });
        Array.prototype.getBetween = function (indexes) {
            return APP.toolbox.getBetween(this, indexes)
        };

        var arrayGetAtPath = "_ENTITY_._PARAMETERS_.array.getAt.";
        APP.setContainer(arrayGetAtPath + "array", function (el, indexes) {
            var box = APP.toolbox, n, k = el.length, res = box.is(el, "string") ? "" : [];
            if (!box.is(indexes, "array")) {
                indexes = [indexes]
            }
            box.each(indexes, function () {
                n = this.v;
                if (box.is(n, 'number') && n > -1) {
                    if (n < k) {
                        res = res.concat(el[n])
                    }
                }
            });
            return res
        });
        Array.prototype.getAt = function (indexes) {
            return APP.toolbox.getAt(this, indexes)
        };

        var arrayGetPath = "_ENTITY_._PARAMETERS_.array.get.";
        APP.setContainer(arrayGetPath + "string", function (el, value) {
            return APP.getContainer(arrayGetPath + "regexp")(el, new RegExp(value));
        });
        APP.setContainer(arrayGetPath + "regexp", function (el, value) {
            var res = [];
            APP.toolbox.each(el, function () {
                if (value.test(this.v)) {
                    res.push(this.v)
                }
            });
            return res;
        });
        APP.setContainer(arrayGetPath + "number", function (el, value) {
            return ( value < 0 ) ? el.slice(value) : el.slice(0, value);
        });
        APP.setContainer(arrayGetPath + "array", function (el, value) {
            var res = [];
            APP.toolbox.each(value, function () {
                var f = APP.getContainer(arrayGetPath + APP.toolbox.is(this.v));
                if (f) {
                    res = res.concat(f(el, this.v))
                }
            });
            return res
        });
        Array.prototype.get = function (value) {
            return APP.toolbox.get(this, value)
        };

// ========================================= LES METHODES AVEC REMOVE =============================================

        Array.prototype.removeDuplicate = function (isDesc) {
            return APP.toolbox.removeDuplicate(this, isDesc)
        };

        var arrayRemoveFirstPath = "_ENTITY_._PARAMETERS_.array.removeFirst.";
        APP.setContainer(arrayRemoveFirstPath + "number", function (el, value) {
            return (value < 1) ? el : el.slice(value)
        });
        APP.setContainer(arrayRemoveFirstPath + "other", function (el, value) {
            var i, k = el.length;
            for (i = 0; i < k; i++) {
                if (el[i] == value) {
                    el.splice(i, 1);
                    return el
                }
            }
            return el;
        });
        APP.setContainer(arrayRemoveFirstPath + "regexp", function (el, value) {
            var i, k = el.length;
            for (i = 0; i < k; i++) {
                if (value.test(el[i])) {
                    el.splice(i, 1);
                    return el
                }
            }
            return el;
        });
        Array.prototype.removeFirst = function (value) {
            return APP.toolbox.removeFirst(this, value)
        };

        Array.prototype.removeMiddle = function () {
            return APP.toolbox.removeMiddle(this)
        };

        var arrayRemoveLastPath = "_ENTITY_._PARAMETERS_.array.removeLast.";
        APP.setContainer(arrayRemoveLastPath + "number", function (el, value) {
            return (value < 1) ? this : el.slice(0, -value);
        });
        APP.setContainer(arrayRemoveLastPath + "other", function (el, value) {
            var i, k = el.length;
            for (i = k - 1; i > -1; i--) {
                if (el[i] == value) {
                    el.splice(i, 1);
                    return el
                }
            }
            return el;
        });
        APP.setContainer(arrayRemoveLastPath + "regexp", function (el, value) {
            var i, k = el.length;
            for (i = k - 1; i > -1; i--) {
                if (value.test(el[i])) {
                    el.splice(i, 1);
                    return el
                }
            }
            return el;
        });
        Array.prototype.removeLast = function (value) {
            return APP.toolbox.removeLast(this, value)
        };

        var arrayRemoveBeforePath = "_ENTITY_._PARAMETERS_.array.removeBefore.";
        APP.setContainer(arrayRemoveBeforePath + "other", function (el, index) {
            var box = APP.toolbox;
            if (!box.is(index, "number")) {
                index = box.index(el, index)
            }
            if (index > -1) {
                return el.slice(index)
            }
            return el;
        });
        Array.prototype.removeBefore = function (index) {
            return APP.toolbox.removeBefore(this, index)
        };

        var arrayRemoveAfterPath = "_ENTITY_._PARAMETERS_.array.removeAfter.";
        APP.setContainer(arrayRemoveAfterPath + "other", function (el, index) {
            var box = APP.toolbox;
            if (!box.is(index, "number")) {
                index = box.index(el, index)
            }
            if (index > -1) {
                return el.slice(0, index + 1)
            }
            return el;
        });
        Array.prototype.removeAfter = function (index) {
            return APP.toolbox.removeAfter(this, index)
        };

        var arrayRemoveBetweenPath = "_ENTITY_._PARAMETERS_.array.removeBetween.";
        APP.setContainer(arrayRemoveBetweenPath + "array", function (el, indexes) {
            var box = APP.toolbox;
            if (!box.is(indexes, 'array')) {
                indexes = [indexes]
            }
            if (indexes.length % 2) {
                indexes.push(el.length - 1)
            }
            indexes = indexes.slice(0, 2);
            for (var i = 0; i < 2; i++) {
                if (!box.is(indexes[i], "number")) {
                    indexes[i] = box.index(el, indexes[i])
                }
                if (indexes[i] < 0) {
                    indexes[i] = false
                }
            }
            if (box.is(indexes[0], "number") && box.is(indexes[1], "number")) {
                indexes = box.nSort(indexes);
                el = el.slice(0, indexes[0] + 1).concat(el.slice(indexes[1]));
            }
            return el;
        });
        Array.prototype.removeBetween = function (indexes) {
            return APP.toolbox.removeBetween(this, indexes)
        };

        var arrayRemoveAtPath = "_ENTITY_._PARAMETERS_.array.removeAt.";
        APP.setContainer(arrayRemoveAtPath + "number", function (el, indexes) {
            return APP.getContainer(arrayRemoveAtPath + "array")(el, [indexes])
        });
        APP.setContainer(arrayRemoveAtPath + "array", function (el, indexes) {
            var box = APP.toolbox;
            indexes = box.removeDuplicate(indexes, true);
            box.each(indexes, function () {
                var n = this.v;
                if (box.is(n, 'number') && n > -1) {
                    el = el.slice(0, n).concat(el.slice(n + 1))
                }
            });
            return el
        });
        Array.prototype.removeAt = function (indexes) {
            return APP.toolbox.removeAt(this, indexes)
        };

        var arrayRemovePath = "_ENTITY_._PARAMETERS_.array.remove.";
        APP.setContainer(arrayRemovePath + "other", function (el, value) {
            var res = [];
            APP.toolbox.each(el, function () {
                if (value !== this.v) {
                    res.push(this.v)
                }
            });
            return res;
        });
        APP.setContainer(arrayRemovePath + "regexp", function (el, value) {
            var res = [];
            APP.toolbox.each(el, function () {
                if (!value.test(this.v)) {
                    res.push(this.v)
                }
            });
            return res;
        });
        APP.setContainer(arrayRemovePath + "number", function (el, value) {
            return ( value < 0 ) ? el.slice(0, value) : el.slice(value);
        });
        APP.setContainer(arrayRemovePath + "array", function (el, value) {
            var indexes = [], box = APP.toolbox;
            box.each(value, function () {
                indexes = indexes.concat(box.indexes(el, this.v));
            });
            return APP.getContainer(arrayRemoveAtPath + "array")(el, indexes);
        });
        Array.prototype.remove = function (value) {
            return APP.toolbox.remove(this, value)
        };

// ========================================= LES METHODES AVEC ADD =============================================

        var arrayAddFirstPath = "_ENTITY_._PARAMETERS_.array.addFirst.";
        APP.setContainer(arrayAddFirstPath + "other", function (el, value) {
            if (!APP.toolbox.is(value, "array")) {
                value = [value]
            }
            return value.concat(el);
        });
        Array.prototype.addFirst = function (value) {
            return APP.toolbox.addFirst(this, value)
        };

        Array.prototype.addMiddle = function (value) {
            return APP.toolbox.addMiddle(this, value)
        };

        var arrayAddLastPath = "_ENTITY_._PARAMETERS_.array.addLast.";
        APP.setContainer(arrayAddLastPath + "other", function (el, value) {
            if (!APP.toolbox.is(value, "array")) {
                value = [value]
            }
            return el.concat(value);
        });
        Array.prototype.addLast = function (value) {
            return APP.toolbox.addLast(this, value)
        };

        /**
         * Cette fonction permet de slicé un élément
         * @param  {string/array} el Elément a slicer
         * @param  {int} i1 Slice de 0 à i1 exclus
         * @param  {int} i2 Slice de i2 à la fin
         * @param  {string/array} v  Valeur à ajouter à la plage slicé. Facultatif
         * @return {string/array} Elément slicé
         */
        function doSlice(el, i1, i2, v) {
            i1 = i1 || 0;
            i2 = i2 || i1;
            i1 = el.slice(0, i1);
            i2 = el.slice(i2);
            return (v !== undefined) ? i1.concat(v).concat(i2) : i1.concat(i2);
        }
        var arrayAddBeforePath = "_ENTITY_._PARAMETERS_.array.addBefore.";
        APP.setContainer(arrayAddBeforePath + "other", function (el, index, value) {
            var box = APP.toolbox;
            if (!box.is(index, "number")) {
                index = box.index(el, index)
            }
            if (index > -1) {
                if (!box.is(value, "array")) {
                    value = [value]
                }
                return doSlice(el, index, index, value)
            }
            return el;
        });
        Array.prototype.addBefore = function (index, value) {
            return APP.toolbox.addBefore(this, index, value)
        };

        var arrayAddAfterPath = "_ENTITY_._PARAMETERS_.array.addAfter.";
        APP.setContainer(arrayAddAfterPath + "other", function (el, index, value) {
            var box = APP.toolbox;
            if (!box.is(index, "number")) {
                index = box.index(el, index)
            }
            if (index > -1) {
                if (!box.is(value, "array")) {
                    value = [value]
                }
                return doSlice(el, index + 1, index + 1, value)
            }
            return el;
        });
        Array.prototype.addAfter = function (index, value) {
            return APP.toolbox.addAfter(this, index, value)
        };

// addBetween n'existe pas

        var arrayAddAtPath = "_ENTITY_._PARAMETERS_.array.addAt.";
        APP.setContainer(arrayAddAtPath + "array", function (el, indexes, value) {
            var box = APP.toolbox;
            if (box.is(value, "array")) {
                value = value[0]
            }
            if (value !== undefined) {
                if (!box.is(indexes, "array")) {
                    indexes = [indexes]
                }
                indexes = box.removeDuplicate(indexes, true);
                box.each(indexes, function () {
                    if (box.is(this.v, "number")) {
                        el = APP.getContainer(arrayAddBeforePath + "other")(el, this.v, value);
                    }
                });
            }
            return el;
        });
        Array.prototype.addAt = function (indexes, value) {
            return APP.toolbox.addAt(this, indexes, value)
        };

        Array.prototype.add = function (value) {
            return APP.toolbox.add(this, value)
        };

// ========================================= LES METHODES AVEC CHANGE ===========================================

        var arrayChangeFirstPath = "_ENTITY_._PARAMETERS_.array.changeFirst.";
        APP.setContainer(arrayChangeFirstPath + "number", function (el, oldValue, newValue) {
            if (oldValue > 0) {
                el = APP.getContainer(arrayAddFirstPath + "other")(el.slice(oldValue), newValue);
            }
            return el;
        });
        APP.setContainer(arrayChangeFirstPath + "other", function (el, oldValue, newValue) {
            var box = APP.toolbox, index = box.index(el, oldValue);
            if (index > -1) {
                el[index] = newValue
            }
            return el;
        });
        Array.prototype.changeFirst = function (oldValue, newValue) {
            return APP.toolbox.changeFirst(this, oldValue, newValue)
        };

        Array.prototype.changeMiddle = function (value) {
            return APP.toolbox.changeMiddle(this, value)
        };

        var arrayChangeLastPath = "_ENTITY_._PARAMETERS_.array.changeLast.";
        APP.setContainer(arrayChangeLastPath + "number", function (el, oldValue, newValue) {
            if (oldValue > 0) {
                el = APP.getContainer(arrayAddLastPath + "other")(el.slice(0, -oldValue), newValue);
            }
            return el;
        });
        APP.setContainer(arrayChangeLastPath + "other", function (el, oldValue, newValue) {
            var box = APP.toolbox, indexes = box.indexes(el, oldValue), index = indexes[indexes.length - 1];
            if (index) {
                el[index] = newValue
            }
            return el;
        });
        Array.prototype.changeLast = function (oldValue, newValue) {
            return APP.toolbox.changeLast(this, oldValue, newValue)
        };

        var arrayChangeBeforePath = "_ENTITY_._PARAMETERS_.array.changeBefore.";
        APP.setContainer(arrayChangeBeforePath + "other", function (el, index, value) {
            var box = APP.toolbox;
            var el2 = box.removeBefore(el, index);
            if (el2.length < el.length) {
                el = box.addFirst(el2, value)
            }
            return el;
        });
        Array.prototype.changeBefore = function (index, value) {
            return APP.toolbox.changeBefore(this, index, value)
        };

        var arrayChangeAfterPath = "_ENTITY_._PARAMETERS_.array.changeAfter.";
        APP.setContainer(arrayChangeAfterPath + "other", function (el, index, value) {
            var box = APP.toolbox;
            var el2 = box.removeAfter(el, index);
            if (el2.length < el.length) {
                el = box.addLast(el2, value)
            }
            return el;
        });
        Array.prototype.changeAfter = function (index, value) {
            return APP.toolbox.changeAfter(this, index, value)
        };

        var arrayChangeBetweenPath = "_ENTITY_._PARAMETERS_.array.changeBetween.";
        APP.setContainer(arrayChangeBetweenPath + "array", function (el, indexes, value) {
            var box = APP.toolbox;
            if (!box.is(indexes, 'array')) {
                indexes = [indexes]
            }
            if (indexes.length % 2) {
                indexes.push(el.length - 1)
            }
            indexes = indexes.slice(0, 2);
            for (var i = 0; i < 2; i++) {
                if (!box.is(indexes[i], "number")) {
                    indexes[i] = box.index(el, indexes[i])
                }
                if (indexes[i] < 0) {
                    indexes[i] = false
                }
            }
            if (box.is(indexes[0], "number") && box.is(indexes[1], "number")) {
                indexes = box.nSort(indexes);
                el = el.slice(0, indexes[0] + 1).concat(value).concat(el.slice(indexes[1]));
            }
            return el;
        });
        /**
         * Change une plage du tableau
         * @param indexes (array|int)
         *      - int : Valeur de début. La taille du tableau est utilisée comme valeur complémentaire.
         *      - array : Tableau contenant des valeurs quelconques.
         * @param value
         * @returns {*}
         */
        Array.prototype.changeBetween = function (indexes, value) {
            return APP.toolbox.changeBetween(this, indexes, value)
        };

        var arrayChangeAtPath = "_ENTITY_._PARAMETERS_.array.changeAt.";
        APP.setContainer(arrayChangeAtPath + "array", function (el, indexes, value) {
            var box = APP.toolbox;
            if (box.is(indexes, 'number')) {
                indexes = [indexes]
            }
            indexes = box.removeDuplicate(indexes, true);
            box.each(indexes, function () {
                var n = this.v;
                if (box.is(n, 'number') && n > -1) {
                    el[n] = value
                }
            });
            return el
        });
        Array.prototype.changeAt = function (indexes, value) {
            return APP.toolbox.changeAt(this, indexes, value)
        };

        var arrayChangePath = "_ENTITY_._PARAMETERS_.array.change.";
        APP.setContainer(arrayChangePath + "other", function (el, oldValue, newValue) {
            return APP.toolbox.each(el, function () {
                if (oldValue === this.v) {
                    return newValue
                }
            });
        });
        APP.setContainer(arrayChangePath + "regexp", function (el, oldValue, newValue) {
            return APP.toolbox.each(el, function () {
                if (oldValue.test(this.v)) {
                    return newValue
                }
            });
        });
        APP.setContainer(arrayChangePath + "number", function (el, oldValue, newValue) {
            return APP.toolbox['change' + (oldValue < 0 ? 'Last' : 'First')](el, Math.abs(oldValue), newValue);
        });
        APP.setContainer(arrayChangePath + "array", function (el, oldValue, newValue) {
            var indexes = [], box = APP.toolbox;
            box.each(oldValue, function () {
                indexes = indexes.concat(box.indexes(el, this.v));
            });
            return APP.getContainer(arrayChangeAtPath + "array")(el, indexes, newValue);
        });
        Array.prototype.change = function (oldValue, newValue) {
            return APP.toolbox.change(this, oldValue, newValue)
        };

// ========================================= LES METHODES AVEC UPPER ===========================================

        var arrayUpperFirstPath = "_ENTITY_._PARAMETERS_.array.upperFirst.";
        APP.setContainer(arrayUpperFirstPath + "number", function (el, value, upperLower) {
            if (value > 0) {
                var l = el.length;
                if (value > l) {
                    value = l
                }
                for (var i = 0; i < value; i++) {
                    if (APP.toolbox.is(el[i], "string")) {
                        el[i] = el[i]["to" + upperLower + "Case"]();
                    }
                }
            }

            return el
        });
        APP.setContainer(arrayUpperFirstPath + "string", function (el, value, upperLower) {
            var i, k = el.length;
            for (i = 0; i < k; i++) {
                if (el[i] == value) {
                    if (APP.toolbox.is(el[i], "string")) {
                        el[i] = el[i]["to" + upperLower + "Case"]();
                        return el
                    }
                }
            }
            return el;
        });
        APP.setContainer(arrayUpperFirstPath + "regexp", function (el, value, upperLower) {
            var i, k = el.length;
            for (i = 0; i < k; i++) {
                if (value.test(el[i])) {
                    if (APP.toolbox.is(el[i], "string")) {
                        el[i] = el[i]["to" + upperLower + "Case"]();
                        return el
                    }
                }
            }
            return el;
        });
        Array.prototype.upperFirst = function (value) {
            return APP.toolbox.upperFirst(this, value)
        };

        var arrayUpperLastPath = "_ENTITY_._PARAMETERS_.array.upperLast.";
        APP.setContainer(arrayUpperLastPath + "number", function (el, value, upperLower) {
            if (value > 0) {
                var l = el.length;
                if (value > l) {
                    value = l
                }
                for (var i = l - value; i < l; i++) {
                    if (APP.toolbox.is(el[i], "string")) {
                        el[i] = el[i]["to" + upperLower + "Case"]();
                    }
                }
            }

            return el
        });
        APP.setContainer(arrayUpperLastPath + "string", function (el, value, upperLower) {
            var i, k = el.length;
            for (i = k - 1; i > -1; i--) {
                if (el[i] == value) {
                    if (APP.toolbox.is(el[i], "string")) {
                        el[i] = el[i]["to" + upperLower + "Case"]();
                        return el
                    }
                }
            }
            return el;
        });
        APP.setContainer(arrayUpperLastPath + "regexp", function (el, value, upperLower) {
            var i, k = el.length;
            for (i = k - 1; i > -1; i--) {
                if (value.test(el[i])) {
                    if (APP.toolbox.is(el[i], "string")) {
                        el[i] = el[i]["to" + upperLower + "Case"]();
                        return el
                    }
                }
            }
            return el;
        });
        Array.prototype.upperLast = function (value) {
            return APP.toolbox.upperLast(this, value)
        };

        function upperLowerTab(tab, upperLower) {
            var box = APP.toolbox;
            return box.each(tab, function () {
                var v = this.v;
                if (box.is(v, 'string')) {
                    v = v['to' + upperLower + 'Case']()
                }
                return v;
            });
        }
        Array.prototype.upperMiddle = function () {
            return APP.toolbox.upperMiddle(this)
        };

        var arrayUpperBeforePath = "_ENTITY_._PARAMETERS_.array.upperBefore.";
        APP.setContainer(arrayUpperBeforePath + "other", function (el, index, upperLower) {
            var box = APP.toolbox, k = el.length;
            if (!box.is(index, "number")) {
                index = box.index(el, index)
            }
            if (index > -1) {
                if (index >= k) {
                    index = k
                }
                for (var i = 0; i < index; i++) {
                    if (box.is(el[i], "string")) {
                        el[i] = el[i]["to" + upperLower + "Case"]();
                    }
                }
            }
            return el;
        });
        Array.prototype.upperBefore = function (index) {
            return APP.toolbox.upperBefore(this, index)
        };

        var arrayUpperAfterPath = "_ENTITY_._PARAMETERS_.array.upperAfter.";
        APP.setContainer(arrayUpperAfterPath + "other", function (el, index, upperLower) {
            var box = APP.toolbox, k = el.length;
            if (!box.is(index, "number")) {
                index = box.index(el, index)
            }
            if (index > -1 && index < k) {
                for (var i = index + 1; i < k; i++) {
                    if (box.is(el[i], "string")) {
                        el[i] = el[i]["to" + upperLower + "Case"]();
                    }
                }
            }
            return el;
        });
        Array.prototype.upperAfter = function (index) {
            return APP.toolbox.upperAfter(this, index)
        };

        var arrayUpperBetweenPath = "_ENTITY_._PARAMETERS_.array.upperBetween.";
        APP.setContainer(arrayUpperBetweenPath + "array", function (el, indexes, lowerUpper) {
            var box = APP.toolbox, z, i, k, param;
            if (!box.is(indexes, 'array')) {
                indexes = [indexes]
            }
            if (indexes.length % 2) {
                indexes.push(el.length - 1)
            }
            k = indexes.length;
            for (z = 0; z < k; z += 2) {
                param = [indexes[z], indexes[z + 1]];
                for (i = 0; i < 2; i++) {
                    if (!box.is(param[i], "number")) {
                        param[i] = box.index(el, param[i])
                    }
                    if (param[i] < 0) {
                        param[i] = false
                    }
                }
                if (box.is(param[0], "number") && box.is(param[1], "number")) {
                    param = box.nSort(param);
                    el = doSlice(el, param[0] + 1, param[1], upperLowerTab(el.slice(param[0] + 1, param[1]), lowerUpper));
                }
            }
            return el;
        });
        Array.prototype.upperBetween = function (indexes) {
            return APP.toolbox.upperBetween(this, indexes)
        };

        var arrayUpperAtPath = "_ENTITY_._PARAMETERS_.array.upperAt.";
        APP.setContainer(arrayUpperAtPath + "number", function (el, index, upperLower) {
            return APP.getContainer(arrayUpperAtPath + "array")(el, [index], upperLower)
        });
        APP.setContainer(arrayUpperAtPath + "array", function (el, indexes, upperLower) {
            var box = APP.toolbox;
            indexes = box.removeDuplicate(indexes, true);
            box.each(indexes, function () {
                var n = this.v;
                if (box.is(n, 'number') && n > -1) {
                    if (box.is(el[n], 'string')) {
                        el[n] = el[n]["to" + upperLower + "Case"]()
                    }
                }
            });
            return el;
        });
        Array.prototype.upperAt = function (indexes) {
            return APP.toolbox.upperAt(this, indexes)
        };

        var arrayUpperPath = "_ENTITY_._PARAMETERS_.array.upper.";
        APP.setContainer(arrayUpperPath + "string", function (el, value, upperLower) {
            return APP.toolbox.each(el, function () {
                if (this.v === value) {
                    return this.v["to" + upperLower + "Case"]()
                }
            });
        });
        APP.setContainer(arrayUpperPath + "regexp", function (el, value, upperLower) {
            var box = APP.toolbox;
            return box.each(el, function () {
                if (value.test(this.v) && box.is(this.v, 'string')) {
                    return this.v["to" + upperLower + "Case"]()
                }
            });
        });
        APP.setContainer(arrayUpperPath + "number", function (el, value, upperLower) {
            var path = (value < 0 ) ? arrayUpperLastPath : arrayUpperFirstPath;
            return APP.getContainer(path + 'number')(el, Math.abs(value), upperLower);
        });
        APP.setContainer(arrayUpperPath + "array", function (el, value, upperLower) {
            var indexes = [], box = APP.toolbox;
            box.each(value, function () {
                indexes = indexes.concat(box.indexes(el, this.v));
            });
            return APP.getContainer(arrayUpperAtPath + "array")(el, indexes, upperLower);
        });
        Array.prototype.upper = function (value) {
            return APP.toolbox.upper(this, value)
        };

// ========================================= LES METHODES AVEC LOWER ============================================

        Array.prototype.lowerFirst = function (value) {
            return APP.toolbox.lowerFirst(this, value)
        };

        Array.prototype.lowerLast = function (value) {
            return APP.toolbox.lowerLast(this, value)
        };

        Array.prototype.lowerMiddle = function () {
            return APP.toolbox.lowerMiddle(this)
        };

        Array.prototype.lowerBefore = function (index) {
            return APP.toolbox.lowerBefore(this, index)
        };

        Array.prototype.lowerAfter = function (index) {
            return APP.toolbox.lowerAfter(this, index)
        };

        Array.prototype.lowerBetween = function (indexes) {
            return APP.toolbox.lowerBetween(this, indexes)
        };

        Array.prototype.lowerAt = function (indexes) {
            return APP.toolbox.lowerAt(this, indexes)
        };

        Array.prototype.lower = function (value) {
            return APP.toolbox.lower(this, value)
        };

    }
    arrayEntity();

    // edgeEntity
    APP.register(function EDGE($this) {
        var $self = this,
            $box = $this.toolbox,
            $edges = ["top", "right", "bottom", "left"],
            $edgesValues = [null, null, null, null];
        $box.each($this, function () { $self[this.k] = this.v });

        /**
         * Permet d'obtenir un tableau contenant les valeurs pour chaque côté.
         *
         * @method get
         * @return {Array}
         * @since 1.0
         */
        this.get = function () {
            return $edgesValues
        };
        /**
         * Permet de définir dans un même temps les valeurs pour les quatre côtés.
         *
         * @method set
         * @param {*} value
         * @return {EDGE}
         * @since 1.0
         */
        this.set = function (value) {
            if(!$box.is(value, "array")){ value = [value] }
            value = value.slice(0, 4);
            value = value.concat($edgesValues.slice(value.length));
            $box.each(value, function () {
                $self[$edges[this.i]](this.v)
            });
            return $self
        };
        /**
         * Permet de définir ou d'obtenir la valeur du bord supérieur.
         *
         * @method top
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.top = function (value) {
            if(value === undefined){ return $edgesValues[0] }
            $edgesValues[0] = value;
            return $self
        };
        /**
         * Permet de définir ou d'obtenir la valeur du bord droit.
         *
         * @method right
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.right = function (value) {
            if(value === undefined){ return $edgesValues[1] }
            $edgesValues[1] = value;
            return $self
        };
        /**
         * Permet de définir ou d'obtenir la valeur du bord inférieur.
         *
         * @method bottom
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.bottom = function (value) {
            if(value === undefined){ return $edgesValues[2] }
            $edgesValues[2] = value;
            return $self
        };
        /**
         * Permet de définir ou d'obtenir la valeur du bord gauche.
         *
         * @method left
         * @param {*} value
         * @return {*}
         * @since 1.0
         */
        this.left = function (value) {
            if(value === undefined){ return $edgesValues[3] }
            $edgesValues[3] = value;
            return $self
        };

    }, {}, {});
    
    // ajaxEntity
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

    // dateEntity
    APP.config.set("date.months", {
            "fr" : ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
            "en" : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        });
    APP.config.set("date.days", {
            "fr" : ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
            "en" : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        });
    APP.config.set("date.lang", "fr");
    APP.register(function DATE($this){
        var $self = this, $box = $this.toolbox, $date = new Date();
        $box.each($this, function () { $self[this.k] = this.v });

        var settings = {
            "lang" : $self.config.get("date.lang"),
        };
        function getSetDate(nb, what){
            if(nb === undefined){ return ($date['get'+what]()+((what==='Month')?1:0))+'' }
            if ($box.is(nb, 'number')) {
                nb = Math.abs(nb);
                if (nb > 0) {
                    try {
                        $date['set' + what](nb-((what==='Month')?1:0))
                    } catch (e) {
                        $date.setDate(nb)
                    }
                }
                return $self
            }
            if(/[\+\-]\d+/.test(nb)){
                nb = (new Function("","return " + $date['get'+what]() + nb))() ;
                try { $date['set'+what](nb) } catch (e) { $date.setDate(nb) }
            }
            return $self
        }
        function daysInMonth(date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() }

        /**
         * Permet d'obtenir une nouvelle date.
         *
         * @method set
         * @param {*} date Date à définir
         * @return {DATE}
         * @since 1.0
         */
        this.set = function (date) {
            if(date === undefined){ return $self }
            $date = new Date(date);
            return $self
        };

        /**
         * Permet d'obtenir la date JavaScript
         *
         * @method get
         * @return {Date}
         * @since 1.0
         */
        this.get = function () {
            return $date
        };

        /**
         * Permet d'obtenir ou de définir la langue de la date.
         *
         * @method lang
         * @param {String} [lang] La langue à définir.
         * @return {String|DATE}
         * @since 1.0
         */
        this.lang = function (lang) {
            if(lang === undefined){ return settings.lang }
            settings.lang = lang;
            return $self;
        };

        /**
         * Permet d'obtenir ou de définir l'année. L'obtention se fait sur les deux derniers chiffres.
         *
         * @method y
         * @param {*} [year] L'année à définir. Par exemple : 2015, "+3", "-1"
         * @return {String|DATE}
         * @since 1.0
         */
        this.y = function (year) {
            var res = getSetDate(year, 'FullYear') ;
            if(year === undefined){ res = res.slice(-2)}
            return res
        };

        /**
         * Permet d'obtenir ou de définir l'année.
         *
         * @method y
         * @param {*} [year] L'année à définir. Par exemple : 2015, "+3", "-1"
         * @return {String|DATE}
         * @since 1.0
         */
        this.yy = function (year) {
            return getSetDate(year, 'FullYear') ;
        };

        /**
         * Permet d'obtenir un chiffre correspondant un jour de la semaine. 0 pour Lundi, 1 pour Mardi, ...
         *
         * @method w
         * @return {Number}
         * @since 1.0
         */
        this.w = function () { return ($date.getDay()||7)-1 };

        /**
         * Permet d'obtenir le nom du mois.
         *
         * @method M
         * @param {int} [length] Longueur de la chaîne
         * @return {String}
         * @since 1.0
         */
        this.M = function (length) {
            var m = $self.config.get("date.months." + settings.lang)[$date.getMonth()];
            if(length === undefined){ length = 3 }
            return m.slice(0,Math.abs(length))
        };

        /**
         * Permet d'obtenir le nom complet du mois.
         *
         * @method MM
         * @return {String}
         * @since 1.0
         */
        this.MM = function () {
            return $self.config.get("date.months." + settings.lang)[$date.getMonth()];
        };

        /**
         * Permet d'obtenir le nom du jour.
         *
         * @method D
         * @param {int} [length] Longueur de la chaîne
         * @return {String}
         * @since 1.0
         */
        this.D = function (length) {
            var m = $self.config.get("date.days." + settings.lang)[$self.w()];
            if(length === undefined){ length = 3 }
            return m.slice(0,Math.abs(length))
        };

        /**
         * Permet d'obtenir le nom complet du jour.
         *
         * @method DD
         * @return {String}
         * @since 1.0
         */
        this.DD = function () {
            return $self.config.get("date.days." + settings.lang)[$self.w()];
        };

        var symbols = {
            "m": 'Month',
            "d": 'Date',
            "h": 'Hours',
            "i": 'Minutes',
            "s": 'Seconds',
            "l": 'Milliseconds'
        };
        $box.each(symbols, function(){
            var i = this.i, v = this.v ;
            $self[i] = function (nb) { return getSetDate(nb, v) };
            $self[i+i] = function (nb) {
                var res = getSetDate(nb, v) ;
                if (nb === undefined) {
                    res = parseInt(res);
                    if(res < 10){ res = "0" + res }
                    res += "";
                }
                return res
            };
        });

        /**
         * Permet d'obtenir ou de définir le jour.
         *
         * @method day|d|dd
         * @param {*} [day] Le jour à définir. Par exemple : 25, "+3", "-1"
         * @return {String|DATE}
         * @since 1.0
         */
        this.day = function(day){ return $self.dd(day) };

        /**
         * Permet d'obtenir ou de définir le mois.
         *
         * @method month|m|mm
         * @param {*} [month] Le mois à définir. Par exemple : 6, "+2", "-1"
         * @return {String|DATE}
         * @since 1.0
         */
        this.month = function(month){ return $self.mm(month) };

        /**
         * Permet d'obtenir ou de définir l'année.
         *
         * @method year|y|yy
         * @param {*} [year] L'année à définir. Par exemple : 2015, "+3", "-1"
         * @return {String|DATE}
         * @since 1.0
         */
        this.year = function(year){ return $self.yy(year) };

        /**
         * Permet d'obtenir ou de définir l'heure.
         *
         * @method hour|h|hh
         * @param {*} [hour] L'heure à définir. Par exemple : 8, "+3", "-1"
         * @return {String|DATE}
         * @since 1.0
         */
        this.hour = function(hour){ return $self.hh(hour) };

        /**
         * Permet d'obtenir ou de définir les minutes.
         *
         * @method minute|i|ii
         * @param {*} [minute] La minute à définir. Par exemple : 30, "+3", "-1"
         * @return {String|DATE}
         * @since 1.0
         */
        this.minute = function(minute){ return $self.ii(minute) };

        /**
         * Permet d'obtenir ou de définir les secondes.
         *
         * @method second|s|ss
         * @param {*} [second] Les secondes à définir. Par exemple : 45, "+3", "-1"
         * @return {String|DATE}
         * @since 1.0
         */
        this.second = function(second){ return $self.ss(second) };

        /**
         * Permet d'obtenir ou de définir les millisecondes.
         *
         * @method millisecond|l|ll
         * @param {*} [millisecond] Les millisecondes à définir. Par exemple : 467, "+3", "-1"
         * @return {String|DATE}
         * @since 1.0
         */
        this.millisecond = function(millisecond){ return $self.ll(millisecond) };

        /**
         * Permet de formater une date
         *
         * @method format
         * @param {String} format Chaîne de formattage. Par exemple : "%DD %dd+1 %MM %yy"
         * @return {String}
         * @since 1.0
         */
        this.format = function(format){
            if(format === undefined){ return ''}
            format += '' ;
            format = format.replace(/(\%\w{1,2})([+-]\d+)?/g, function (format, s1, s2) {
                s1 = s1.slice(1);
                if ($self.hasOwnProperty(s1)) { $self[s1](s2); return '%' + s1 }
                return format;
            });
            format = format.replace(/\%\w{1,2}/g, function (format) {
                format = format.slice(1);
                if ($self.hasOwnProperty(format)) { return $self[format]() }
                return format;
            });
            return format
        } ;

        /**
         * Permet de compter le nombre de jours dans un mois ou le nombre de lundi par exemple
         *
         * @method count
         * @param {String} [day] Chaîne de formattage. Par exemple : "%DD %dd+1 %MM %yy"
         * @return {int}
         * @since 1.0
         */
        this.count = function(day){
            var totalDays = daysInMonth($date);
            if(day === undefined){ return totalDays }
            var total = 0, reg = new RegExp('^'+day+'$','i');
            var copyDate = $box.clone($date);
            $box.each(totalDays, function(){
                $date.setDate(this.i+1);
                if(reg.test($self.DD())){ total++ }
            }) ;
            $date = copyDate;
            return total
        };

        /**
         * Permet d'obtenir des dates à avenir
         *
         * @method next
         * @param {String} [next] Par exemple : "Lundi" pour la date correspondant au Lundi suivant, "Janvier" pour la date correspondant au Janvier suivant
         * @return {DATE}
         * @since 1.0
         */
        this.next = function(next){
            if(next===undefined){ return $self.d('+1') }
            var reg = new RegExp('^'+next+'$','i');

            // @TODO :  Faire la recherche pour les nombres (vérifier si 0<next<32)

            // Recherche pour les jours
            var days = $self.config.get("date.days." + settings.lang);
            days = days.concat(days).slice($self.w()+1);
            var i, k = days.length ;
            for(i=0 ; i<k ; i++){
                //var v = i+1+parseInt($self.d(),10);
                if(reg.test(days[i])){ $self.d(i+1+parseInt($self.d(),10)); return $self }
            }
            // Recherche pour les mois
            var months = $self.config.get("date.months." + settings.lang);
            months = months.concat(months).slice($date.getMonth()+1) ;
            var i, k = months.length ;
            for(i=0 ; i<k ; i++){
                if(reg.test(months[i])){ $date.setMonth($date.getMonth()+i+1); return $self }
            }
            return $self
        };

        /**
         * Permet d'obtenir des dates précédentes
         *
         * @method previous
         * @param {String} [previous] Par exemple : "Lundi" pour la date correspondant au Lundi précédent, "Janvier" pour la date correspondant au mois de Janvier précédent
         * @return {DATE}
         * @since 1.0
         */
        this.previous = function(previous){
            if(previous===undefined){ return $self.d('-1') }
            var reg = new RegExp('^'+previous+'$','i');

            // @TODO :  Faire la recherche pour les nombres (vérifier si 0<next<32)

            // Recherche pour les jours
            var days = $self.config.get("date.days." + settings.lang);
            days = days.concat(days.slice(0,$self.w())) ;
            var i, k = days.length-1 ;
            for(i=k ; i>-1 ; i--){
                if(reg.test(days[i])){ $date.setDate($date.getDate()-k+i-1); return $self }
            }
            // Recherche pour les mois
            var months = $self.config.get("date.months." + settings.lang);
            months = months.concat(months.slice(0,$date.getMonth())) ;
            var i, k = months.length-1 ;
            for(i=k ; i>-1 ; i--){
                if(reg.test(months[i])){ $date.setMonth($date.getMonth()-k+i-1); return $self }
            }

            return $self
        };

        /**
         * Permet d'obtenir la date courante
         *
         * @method now
         * @return {DATE}
         * @since 1.0
         */
        this.now = function(){ $date = new Date(); return $self };

    }, {}, {});

    // validatorEntity
    APP.config.set("validator.url", /^(?:https?:\/\/|ftp:\/\/|gopher:\/\/|wais:\/\/|telnet:\/\/|mailto:|news:)[\d\w]+(?:[^ <>\d\w]?[\d\w]+)+$|^file:\/{2,3}[\w]+[:\|](?:[^ <>\d\w]?[\d\w]+)+$/i);
    APP.config.set("validator.email", /^[\da-z]+(?:[\.\!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~]?[\da-z]+)+@[\da-z]+(?:[\.\!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~]?[\da-z]+)+\.[a-z]{2,4}$/i);
    APP.config.set("validator.number", /^-?[\d]+$/);
    APP.config.set("validator.tel.fr", /^0[1-7](?:[ \/-][0-9]{2}){4}$/);
    APP.config.set("validator.day", /^(?:0?[1-9]|1[0-9]|2[0-9]|3[01])$/);
    APP.config.set("validator.month", /^(?:0?[1-9]|1[0-2])$/);
    APP.config.set("validator.year", /^[1-9][0-9]{3,}$/);
    APP.config.set("validator.date", {
        "fr": /^(:?0?[1-9]|[12][0-9]|3[01])[\/ -](:?0?[1-9]|1[0-2])[\/ -][1-9][0-9]{3}$/,
        "en": /^[1-9][0-9]{3}[\/ -](:?0?[1-9]|1[0-2])[\/ -](:?0?[1-9]|[12][0-9]|3[01])$/,
    });
    


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