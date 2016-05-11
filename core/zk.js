(function ($W) {
    'use strict';


    var THIS = this, ZKID = parseInt(Math.random() * 100000000000);

    var APP = {
        // Raccourcis vers _ENTITY_
        "register": function (entityFunc, methods, parameters) {
            return this._ENTITY_.register(entityFunc, methods, parameters);
        },
        "get": function (selector) {
            return this._ENTITY_.get(selector);
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

        // Raccourcis vers _TOOLBOX_
        "toolbox": function () {
            return this._TOOLBOX_;
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

    function _TOOLBOX_() {
        var self = this;

        /**
         * Permet de connaître ou de tester le type d'un élément.
         * @method is
         * @param {*} el Elément qu'on souhaite connaître ou tester son type.
         * @param {string} type Si ce paramètre est indiqué, on teste le type de l'élément, sinon on obtient son type.
         * @returns {boolean|string}
         * @example
         *      zk().toolbox().is("Hello world !"); // Renvoie "string"
         *      zk().toolbox().is([26, 11], "array"); // Renvoie true
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
         * @param {string} el Elément à traiter.
         * @param {string} strReg Expression régulière sous forme de chaîne de caractères
         * @param {string} direction La direction. Deux valeurs possibles "l" pour la gauche et "r" pour la droite.
         * @returns {string}
         * @example
         *      zk().toolbox().trim("000Hello world !!!!!"); // Renvoie "Hello world"
         *      zk().toolbox().trim("000Hello world !!!!!", "l"); // Renvoie "Hello world !!!!!"
         * @since 1.0
         */
        this.trim = function (el, strReg, direction) {
            if (!self.is(el, "string")) { return el }
            if (strReg === undefined) { strReg = ' ' }
            if(direction === "l"){ strReg = "^(?:" + strReg + ")"  }
            else if(direction === "r") { strReg = "(?:" + strReg + ")$" }
            else { strReg = "^(?:" + strReg + ")|(?:" + strReg + ")$" }
            return str.replace(new RegExp(strReg, "g"), "")
        };
        var doEachByObj = {
            string: function (el, f, args) {
                var i, k, res = (self.is(el, 'string')) ? '' : [], r, ob;
                k = el.length;
                for (i = 0; i < k; i++) {
                    ob = {i: i, z: k-1-i, k: i, v: el[i], l: k, all: el};
                    r = f.apply(ob, args);
                    if (r === undefined) {
                        r = el[i]
                    }
                    res = res.concat(r)
                }
                return res;
            },
            number: function (el, f, args) {
                el = Math.abs(el);
                for (var i = 0; i < el; i++) {
                    f.apply({i: i, z: el-1-i, all: el}, args);
                }
                return el
            },
            array: function (el, f, args) { return doEachByObj.string(el, f, args) },

            object: function (el, f, args, strIndex) {
                var i, isOk, r, ob;
                for (i in el) {
                    if (el.hasOwnProperty(i)) {
                        ob = {i: i, k: i, v: el[i], all: el};
                        if (strIndex) {
                            isOk = RegExp(' 0*' + i + ' ').test(' ' + strIndex + ' ');
                            if (isOk) {
                                r = el[i];
                            } else {
                                r = f.apply(ob, args);
                                if (r === undefined) {
                                    r = el[i]
                                }
                            }
                            el[i] = r;
                        } else {
                            r = f.apply(ob, args);
                            if (r === undefined) {
                                r = el[i]
                            }
                            el[i] = r;
                        }
                    }
                }
                return el
            },
            // this.node = le noeud     this.name = Nom du noeud (p,body...)
            node: function (el, f, args, strIndex) {
                el = doEachByObj.array(el.get(), f, args, strIndex, ZKID);
                return $GET("NODE").$(el)
            },
            // this.node = le noeud     this.name = Nom du noeud (p,body...)
            nodeelement: function (el, f, args, strIndex) {
                el = doEachByObj.array(toArray(el.childNodes), f, args, strIndex, ZKID);
                return $GET("NODE").$(el)
            },
            // this.node = le noeud     this.name = Nom du noeud (p,body...)
            nodelist: function (el, f, args, strIndex) {
                el = doEachByObj.array(toArray(el), f, args, strIndex);
                return $GET("NODE").$(el)
            },
            // this.node = le noeud     this.name = Nom du noeud (p,body...)
            htmlcollection: function (el, f, args, strIndex) {
                return doEachByObj.nodelist(el, f, args, strIndex)
            }
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
         * @param {string|array|int} el Objet à parcourir.
         * @param {function} callback Fonction à executer à chaque tour.
         * @param {array} args Les arguments de la fonction callback.
         * @returns {*} Elle retourne le même objet.
         * @example
         *      zk().toolbox().trim("000Hello world !!!!!"); // Renvoie "Hello world"
         *      zk().toolbox().trim("000Hello world !!!!!", "l"); // Renvoie "Hello world !!!!!"
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
         * @returns {array}
         * @since 1.0
         */
        this.toArray = function (el) { return [].slice.call(el) };
        /**
         * Permet de trier les tableaux dans l'ordre croissant.
         *
         * @method nSort
         * @param {array} el Tableau à trier.
         * @returns {array}
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
         * @returns {array}
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
         * @returns {array}
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
        function indexAndIndexes(el, value, what){
            var box = zk().toolbox(), pType = box.is(value);
            var basePath = "_ENTITY_._PARAMETERS_." + box.is(el) + "." + what + ".";
            var f = zk().getContainer( basePath + pType);
            return f ? f(el, value) : zk().getContainer( basePath + "other")(el, value);
        }
        /**
         * Permet d'obtenir l'index d'une valeur dans un objet.
         *
         * @method index
         * @param {string|array} el Objet dans lequel se fera la recherche.
         * @param {*} value Elément recherché.
         * @returns {int} Elle renvoie -1 si la valeur n'a pas été trouvé.
         * @since 1.0
         */
        this.index = function (el, value) { return indexAndIndexes(el, value, "index") };
        /**
         * Permet d'obtenir les index d'une valeur dans un objet.
         *
         * @method indexes
         * @param {string|array} el Objet dans lequel se fera la recherche.
         * @param {*} value Elément recherché.
         * @returns {array} Si la valeur n'existe pas, elle renvoie un tableau vide.
         * @since 1.0
         */
        this.indexes = function (el, value) { return indexAndIndexes(el, value, "indexes") };
        /**
         * Permet de compter le nombre de fois q'une valeur existe dans un élément.
         *
         * @method count
         * @param {string|array} el Objet dans lequel se fera la recherche.
         * @param {*} value Elément recherché.
         * @returns {int} Si la valeur n'existe pas, elle renvoie 0.
         * @since 1.0
         */
        this.count = function (el, value) { return self.indexes(el, value).length };
        /**
         * Permet de vérifier si une valeur existe dans un objet.
         *
         * @method has
         * @param {string|array} el Objet dans lequel se fera la recherche.
         * @param {*} value Elément recherché.
         * @returns {boolean} Renvoie true en cas de succès et false dans le cas contraire.
         * @since 1.0
         */
        this.has = function (el, value) { return (self.index(el, value) + 1) ? true : false };
        /**
         * Permet de renverser une chaîne de caractères ou un tableau.
         *
         * @method reverse
         * @param {string|array} el Chaîne de caratères ou tableau à traiter.
         * @returns {string|array}
         * @since 1.0
         */
        this.reverse = function (el) {
            var res = self.is(el, "string") ? "" : [];
            self.each(el, function () { res = res.concat(el[this.z]) });
            return res;
        };

        // @TODO : Faire la fonction run
        /*this.run = function (script) {
            // var ajoute = new Function('a', 'b', 'return a + b');
//             ajoute(2, 6);
        };*/

        // GET

        function getFirstLast(el, value, firstLast){
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) + ".get"+firstLast+".";
            if (value === undefined) { value = 1 }
            var f = zk().getContainer(path + self.is(value));
            return f ? f(el, value) : zk().getContainer(path + "other")();
        }
        /**
         * Permet d'obtenir les premiers éléments d'un objet.
         *
         * @method getFirst
         * @param {*} el Objet de référence.
         * @param {int|string|RegExp} value
         *      - Si param n'est pas indiqué, elle retourne le premier élément de l'objet.
         *      - int : Elle retourne les param premiers éléments de l'objet. Les nombres négatifs sont convertis en valeurs absolus.
         *      - string : L'argument param est converti en expression régulière.
         *      - RegExp : Elle retourne le premier élément de l'objet qui correspond à l'expression régulière.
         * @returns {*}
         * @since 1.0
         */
        this.getFirst = function (el, value) { return getFirstLast(el, value, "First") };
        /**
         * Permet d'obtenir le ou les éléments qui se trouvent au milieu d'un objet.
         *
         * @method getMiddle
         * @param {*} el Objet de référence.
         * @returns {*}
         * @since 1.0
         */
        this.getMiddle = function (el) {
            var l = el.length, n = parseInt(l / 2);
            return (l % 2) ? el.slice(n, n + 1) : el.slice(n - 1, n + 1)
        };
        /**
         * Permet d'obtenir les derniers éléments d'un objet.
         *
         * @method getLast
         * @param {*} el Objet de référence.
         * @param {int|string|RegExp} value
         *      - Si param n'est pas indiqué, elle retourne le dernier élément de l'objet.
         *      - int : Elle retourne les param derniers éléments de l'objet. Les nombres négatifs sont convertis en valeurs absolus.
         *      - string : L'argument param est converti en regexp.
         *      - RegExp : Elle retourne le dernier élément de l'objet qui correspond à l'expression régulière.
         * @returns {*}
         * @since 1.0
         */
        this.getLast = function (el, value) { return getFirstLast(el, value, "Last") };
        /**
         * Permet d'obtenir les éléments qui se situent avant l'argument index dans un objet.
         *
         * @method getBefore
         * @param {*} el Objet de référence.
         * @param {*} index
         *      - int : Index du tableau.
         *      - other : Objet quelconque qui se trouve dans l'objet.
         * @returns {*}
         * @since 1.0
         */
        this.getBefore = function (el, index) {
            return zk().getContainer("_ENTITY_._PARAMETERS_." + self.is(el) + ".getBefore.other")(el, index);
        };
        /**
         * Permet d'obtenir les éléments qui se situent après l'argument index dans un objet.
         *
         * @method getAfter
         * @param {*} el Objet de référence.
         * @param {*} index
         *      - int : Index du tableau.
         *      - other : Objet quelconque qui se trouve dans l'objet.
         * @returns {*}
         * @since 1.0
         */
        this.getAfter = function (el, index) {
            return zk().getContainer("_ENTITY_._PARAMETERS_." + self.is(el) + ".getAfter.other")(el, index);
        };
        /**
         * Permet d'obtenir une ou plusieurs plages d'un objet.
         *
         * @method getBetween
         * @param {*} el Objet de référence.
         * @param {*} indexes
         *      - Si param n'est pas indiqué, alors il vaut 1.
         *      - Si ce n'est pas un tableau, il est converti en tableau.
         *      - Si la taille est impaire, on ajoute la taille du tableau pour le rendre paire.
         *      - Les valeurs numériques dans param sont les index des plages.
         *      - Les nombres négatifs ne sont pas pris en compte.
         * @returns {*}
         * @example
         *      zk().toolbox().getBetween(["zero", "un", "deux", 3]); // Renvoie ["un", "deux"];
         *      zk().toolbox().getBetween(["zero", "un", "deux", 3], 1); // Renvoie ["un", "deux"];
         *      zk().toolbox().getBetween(["zero", "un", "deux", 3], ["dexu", "zero"]); // Renvoie ["un"];
         *
         * @since 1.0
         */
        this.getBetween = function (el, indexes) {
            if (indexes === undefined) { indexes = 0 }
            return zk().getContainer("_ENTITY_._PARAMETERS_." + self.is(el) + ".getBetween.array")(el, indexes);
        };
        /**
         * Permet d'obtenir des éléments qui se trouvent à des index spécifiés.
         *
         * @method getAt
         * @param {*} el Objet de référence.
         * @param {int|array} indexes
         *      - int : Index de l'élément qu'on veut obtenir. Pas de nombres négatifs.
         *      - array : Tableau d'entiers correpondants aux index des élélments qu'on souhaite obtenir.
         * @returns {*}
         * @since 1.0
         */
        this.getAt = function (el, indexes) {
            return zk().getContainer("_ENTITY_._PARAMETERS_." + self.is(el) + ".getAt.array")(el, indexes);
        };
        /**
         * Permet d'obtenir des valeurs dans un objet.
         *
         * @method get
         * @param {*} el Objet de référence.
         * @param {string|RegExp|int|array} value
         *      - string : Conversion en RegExp.
         *      - RegExp : Expression régulières des éléments qu'on souhaite obtenir dans l'objet.
         *      - int : Les premiers ou derniers éléments. Positif = premier   Négatif = dernier.
         *      - array : Paramètres multiples (string|regexp|int). Le résulat est obtenu en fonction du type des éléments qui se trouve dans l'objet.
         * @returns {*}
         * @since 1.0
         */
        this.get = function (el, value) {
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) + ".get.";
            if (value === undefined) { el }
            var f = zk().getContainer(path + self.is(value));
            return f ? f(el, value) : zk().getContainer(path + "other")();
        };

        // REMOVE

        function rmFirstLast(el, param, firstLast) {
            var basePath = "_ENTITY_._PARAMETERS_." + self.is(el) + ".";
            var path = basePath + "remove" + firstLast + ".";
            if (param === undefined) {
                param = 1
            }
            var f = zk().getContainer(path + self.is(param));
            return f ? f(el, param) : zk().getContainer(path + "other")(el, param);
        }
        /**
         * Permet de supprimer les premiers éléments dans un objet.
         *
         * @method removeFirst
         * @param {*} el Objet de référence.
         * @param {*} value
         *      - string : Conversion en RegExp.
         *      - RegExp : Expression régulières.
         *      - int : Les premiers éléments.
         * @returns {*}
         * @since 1.0
         */
        this.removeFirst = function (el, value) { return rmFirstLast(el, value, "First") };
        /**
         * Permet de supprimer le ou les éléments qui se trouvent au milieu d'un objet.
         *
         * @method removeMiddle
         * @param {*} el Objet de référence.
         * @returns {*}
         * @since 1.0
         */
        this.removeMiddle = function (el) {
            var l = el.length, x = (l % 2) ? 1 : 2, n = parseInt(l / 2);
            return el.slice(0, (x == 2) ? n - 1 : n).concat(el.slice(n + x - (x - 1)));
        };
        /**
         * Permet de supprimer les derniers éléments dans un objet.
         *
         * @method removeFirst
         * @param {*} el Objet de référence.
         * @param {*} value
         *      - string : Conversion en RegExp.
         *      - RegExp : Expression régulières.
         *      - int : Les derniers éléments.
         * @returns {*}
         * @since 1.0
         */
        this.removeLast = function (el, value) { return rmFirstLast(el, value, "Last") };
        function rmBeforeAfter(el, param, what, argType) {
            return zk().getContainer("_ENTITY_._PARAMETERS_." +
                self.is(el) + ".remove" + what + "." + argType)(el, param);
        }
        /**
         * Permet de supprimer les éléments qui se situent avant index dans un objet.
         *
         * @method removeBefore
         * @param {*} el Objet de référence.
         * @param {*} index
         *      - string : Conversion en RegExp.
         *      - RegExp : Expression régulières.
         *      - int : Index numérique.
         * @returns {*}
         * @since 1.0
         */
        this.removeBefore = function (el, index) { return rmBeforeAfter(el, index, 'Before', 'other') };
        /**
         * Permet de supprimer les éléments qui se situent après index dans un objet.
         *
         * @method removeAfter
         * @param {*} el Objet de référence.
         * @param {*} index
         *      - string : Conversion en RegExp.
         *      - RegExp : Expression régulières.
         *      - int : Index numérique.
         * @returns {*}
         * @since 1.0
         */
        this.removeAfter = function (el, index) { return rmBeforeAfter(el, index, 'After', 'other') };
        /**
         * Permet de supprimer une plage dans un objet.
         *
         * @method removeBetween
         * @param {*} el Objet de référence.
         * @param {*} indexes
         *      - string : Conversion en RegExp.
         *      - RegExp : Expression régulières.
         *      - int : Index numérique.
         * @returns {*}
         * @since 1.0
         */
        this.removeBetween = function (el, indexes) { return rmBeforeAfter(el, indexes, 'Between', 'array') };
        /**
         * Permet de supprimer des éléments qui se trouvent à des index spécifiés.
         *
         * @method removeAt
         * @param {*} el Objet de référence.
         * @param {int|array} indexes
         *      - int : Index numérique.
         *      - array : Tableau contenant des valeurs entières.
         * @returns {*}
         * @since 1.0
         */
        this.removeAt = function (el, indexes) {
            var basePath = "_ENTITY_._PARAMETERS_." + self.is(el) + ".";
            var path = basePath + "removeAt.";
            var f = zk().getContainer(path + self.is(indexes));
            return f ? f(el, indexes) : el;
        };
        /**
         * Permet de supprimer des valeurs.
         *
         * @method remove
         * @param {*} el Objet de référence.
         * @param {*} value
         * @returns {*}
         * @since 1.0
         */
        this.remove = function (el, value) {
            if (value === undefined) { return el }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) + ".remove.";
            var f = zk().getContainer(path + self.is(value));
            return f ? f(el, value) : zk().getContainer(path + "other")(el, value);
        };

        // ADD

        function addFirstLast(el, value, firstLast) {
            if (value === undefined) {
                return el
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) + ".add" + firstLast + ".other";
            return zk().getContainer(path)(el, value);
        }
        /**
         * Permet d'ajouter des valeurs au début.
         *
         * @method addFirst
         * @param {*} el Objet de référence.
         * @param {*} value
         * @returns {*}
         * @since 1.0
         */
        this.addFirst = function (el, value) { return addFirstLast(el, value, "First") };
        /**
         * Permet d'ajouter des valeurs au milieu.
         *
         * @method addMiddle
         * @param {*} el Objet de référence.
         * @param {*} value
         * @returns {*}
         * @since 1.0
         */
        this.addMiddle = function (el, value) {
            var l = el.length, n = parseInt(l / 2);
            return doSlice(el, n, n, value);
        };
        /**
         * Permet d'ajouter des valeurs à la fin.
         *
         * @method addLast
         * @param {*} el Objet de référence.
         * @param {*} value
         * @returns {*}
         * @since 1.0
         */
        this.addLast = function (el, value) { return addFirstLast(el, value, "Last") };
        function addBeforeAfter(el, index, value, beforeAfter) {
            if (value === undefined) {
                return el
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) + ".add" + beforeAfter + ".other";
            return zk().getContainer(path)(el, index, value);
        }
        /**
         * Permet d'ajouter des éléments avant des index.
         *
         * @method addBefore
         * @param {*} el Objet de référence.
         * @param {*} index
         * @param {*} value
         * @returns {*}
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
         * @returns {*}
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
         * @returns {*}
         * @since 1.0
         */
        this.addAt = function (el, index, value) {
            if (value === undefined) { return el }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) + ".addAt.array";
            return zk().getContainer(path)(el, index, value);
        };




        this.add = function (el, value) {
            if (value === undefined) {
                return el
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) + ".addLast.other";
            return zk().getContainer(path)(el, value);
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
            return zk().getContainer(path)(el, oldValue, newValue);
        }

        this.changeFirst = function (el, oldValue, newValue) {
            return changeFirstLast(el, oldValue, newValue, "First")
        };
        this.changeMiddle = function (el, value) {
            return self.addMiddle(self.removeMiddle(el), value);
        };
        this.changeLast = function (el, oldValue, newValue) {
            return changeFirstLast(el, oldValue, newValue, "Last")
        };
        function changeBeforeAfter(el, index, value, beforeAfter) {
            if (index === undefined || value === undefined) {
                return el
            }
            var basePath = "_ENTITY_._PARAMETERS_." + self.is(el) + ".";
            var path = basePath + "change" + beforeAfter + ".other";
            return zk().getContainer(path)(el, index, value);
        }

        this.changeBefore = function (el, index, value) {
            return changeBeforeAfter(el, index, value, "Before")
        };
        this.changeAfter = function (el, index, value) {
            return changeBeforeAfter(el, index, value, "After")
        };
        this.changeBetween = function (el, indexes, value) {
            if (indexes === undefined || value === undefined) {
                return el
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) + ".changeBetween.array";
            return zk().getContainer(path)(el, indexes, value);
        };
        this.changeAt = function (el, indexes, value) {
            if (indexes === undefined || value === undefined) {
                return el
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) + ".changeAt.array";
            return zk().getContainer(path)(el, indexes, value);
        };
        this.change = function (el, param, value) {
            if (param === undefined || value === undefined) {
                return el
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) + ".change.";
            var f = zk().getContainer(path + self.is(param));
            return f ? f(el, param, value) : zk().getContainer(path + "other")(el, param, value);
        };

        // UPPER

        function upperLowerFirstLast(el, param, firstLast, upperLower) {
            if (param === undefined) {
                param = 1
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) +
                ".upper" + firstLast + "." + self.is(param);
            var f = zk().getContainer(path);
            return f ? f(el, param, upperLower) : el;
        }

        this.upperFirst = function (el, param) {
            return upperLowerFirstLast(el, param, "First", "Upper")
        };
        this.upperLast = function (el, param) {
            return upperLowerFirstLast(el, param, "Last", "Upper")
        };
        this.upperMiddle = function (el) {
            var l = el.length, x = (l % 2) ? 1 : 2, n = parseInt(l / 2);
            return doSlice(el, (x == 2) ? n - 1 : n, n + x - (x - 1), upperLowerTab((x == 1) ? el.slice(n, n + 1) : el.slice(n - 1, n + 1), "Upper"));
        };
        function upperLowerBeforeAfter(el, index, beforeAfter, upperLower) {
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) +
                ".upper" + beforeAfter + ".other";
            return zk().getContainer(path)(el, index, upperLower);
        }

        this.upperBefore = function (el, index) {
            return upperLowerBeforeAfter(el, index, "Before", "Upper")
        };
        this.upperAfter = function (el, index) {
            return upperLowerBeforeAfter(el, index, "After", "Upper")
        };
        function upperLowerBetween(el, indexes, upperLower) {
            if (indexes === undefined) {
                return el
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) +
                ".upperBetween.array";
            return zk().getContainer(path)(el, indexes, upperLower);
        }

        this.upperBetween = function (el, indexes) {
            return upperLowerBetween(el, indexes, "Upper")
        };
        function upperLowerAt(el, indexes, upperLower) {
            if (indexes === undefined) {
                return el
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) +
                ".upperAt." + self.is(indexes);
            var f = zk().getContainer(path);
            return f ? f(el, indexes, upperLower) : el;
        }

        this.upperAt = function (el, indexes) {
            return upperLowerAt(el, indexes, "Upper")
        };
        function upperLower(el, indexes, upperLower) {
            if (indexes === undefined) {
                indexes = el
            }
            var path = "_ENTITY_._PARAMETERS_." + self.is(el) +
                ".upper." + self.is(indexes);
            var f = zk().getContainer(path);
            return f ? f(el, indexes, upperLower) : el;
        }

        this.upper = function (el, param) {
            return upperLower(el, param, "Upper")
        };

        // LOWER

        this.lowerFirst = function (el, param) {
            return upperLowerFirstLast(el, param, "First", "Lower")
        };
        this.lowerLast = function (el, param) {
            return upperLowerFirstLast(el, param, "Last", "Lower")
        };
        this.lowerMiddle = function (el) {
            var l = el.length, x = (l % 2) ? 1 : 2, n = parseInt(l / 2);
            return doSlice(el, (x == 2) ? n - 1 : n, n + x - (x - 1), upperLowerTab((x == 1) ? el.slice(n, n + 1) : el.slice(n - 1, n + 1), "Lower"));
        };
        this.lowerBefore = function (el, index) {
            return upperLowerBeforeAfter(el, index, "Before", "Lower")
        };
        this.lowerAfter = function (el, index) {
            return upperLowerBeforeAfter(el, index, "After", "Lower")
        };
        this.lowerBetween = function (el, indexes) {
            return upperLowerBetween(el, indexes, "Lower")
        };
        this.lowerAt = function (el, indexes) {
            return upperLowerAt(el, indexes, "Lower")
        };
        this.lower = function (el, param) {
            return upperLower(el, param, "Lower")
        };

    }

    APP._TOOLBOX_ = new _TOOLBOX_();

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
         * @returns {APP/false}
         */
        this.register = function (entityFunc, methods, parameters) {
            if ((typeof(entityFunc)).toLowerCase() !== 'function') {
                return false
            }
            var name = entityFunc.name;
            if (!name || APP._CONTAINER_.get("_ENTITY_." + (name.toLowerCase()))) {
                return false
            }
            if (!APP._TOOLBOX_.is(methods, "object")) {
                methods = {}
            }
            APP._TOOLBOX_.each(methods, function () {
                entityFunc.prototype[this.k] = this.v;
            });
            APP.setContainer("_ENTITY_." + (name.toLowerCase()), entityFunc);
            if (!APP._TOOLBOX_.is(parameters, "object")) {
                parameters = {}
            }
            APP._TOOLBOX_.each(parameters, function () {
                APP.setContainer("_ENTITY_._PARAMETERS_." + (name.toLowerCase()) + "." + this.k, this.v);
            });
            return APP;
        };
        this.get = function (selector) {
            var name = APP._TOOLBOX_.is(selector), func = APP.getContainer("_ENTITY_._CONVERTOR_." + name), res;
            if (func) {
                res = func(selector);
                name = res[0];
                selector = res[1];
            }
            var entity = APP.getContainer("_ENTITY_." + name);
            if ((typeof(entityFunc)).toLowerCase() !== 'function') {
                entity = new entity(selector, function (pathParam) {
                    return APP.getContainer("_ENTITY_._PARAMETERS_." + name + "." + pathParam);
                });
            } else {
                entity = null
            }
            return Object.freeze(entity);
        };
    }

    APP._ENTITY_ = new _ENTITY_();

    /**
     * ENREGISTREMENT DES ENTITES QUI ONT BESOIN D'UNE CONVERSION
     * Renvoie un tableau contenant le nom de l'entité et l'objet converti
     *
     */
    APP.setContainer("_ENTITY_._CONVERTOR_.nodeelement", function (el) {
        return ["node", [el]]
    });
    APP.setContainer("_ENTITY_._CONVERTOR_.htmlcollection", function (el) {
        return ["node", APP._TOOLBOX_.toArray(el)]
    });
    APP.setContainer("_ENTITY_._CONVERTOR_.nodelist", function (el) {
        return ["node", APP._TOOLBOX_.toArray(el)]
    });

    function launcher(selector) {
        var type = APP.toolbox().is(selector);
        if (type == "array") {
            selector = selector.join(",");
            type = "string";
        }
        if (type == "string") {
            selector = document.querySelectorAll(selector);
        }

        return APP.get(selector);
    }

    $W.$ = function (selector) {
        return launcher(selector)
    };
    $W.zk = function (selector) {
        if (selector === undefined) {
            return APP
        }
    };


    /**
     * *********
     */


})(window);