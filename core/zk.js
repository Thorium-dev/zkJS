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
        this.isEntity = function () { };
        this.trim = function (str, reg) {
            if (str === undefined){str = ''}; str += '';
            if (reg === undefined){reg = ' '};
            reg = new RegExp('^(?:'+reg+')|(?:'+reg+')$','g');
            return str.replace(reg, '')
        };
        var doEachByObj = {
            string: function (el, f, args) {
                var i, k, res = (self.is(el, 'string')) ? '' : [], r, ob;
                k = el.length;
                for (i = 0; i < k; i++) {
                    ob = {i: i, k: i, v: el[i], l: k, all: el};
                    r = f.apply(ob, args);
                    if (r === undefined) { r = el[i] }
                    res = res.concat(r)
                }
                return res;
            },
            number: function (el, f, args) {
                el = Math.abs(el);
                for (var i = 0; i < el; i++) {
                    f.apply({i: i, all: el}, args);
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
         * Cette méthode permet de parcourir les objets qui sont dans doEachByObj.
         * La fonction en argument recoit l'objet this avec :
         *        - this.i : Index en cours
         *        - this.v : Valeur de l'index en cours
         *        - this.l : La taille totale de l'élément en cours. N'existe pour les objets litéraux
         *        - this.all : L'élément sur lequel la méthode s'applique
         * @param  {function} f        [Fonction à executer à chaque tour]
         * @param  {[Array/Other]} args      [Arguments à transmettre à la fonction]
         * @param  {[String]} strIndex [Les index ou les clés à ignorer séparé par des espaces]
         * @return {[Array/Object]}          Elle retourne l'objet sur lequel elle s'applique
         */
        this.each = function (el, f, args) {
            if (self.is(f, 'function')) {
                var t = self.is(el);
                if (doEachByObj.hasOwnProperty(t)) {
                    if (args === undefined) { args = [] }
                    if (!self.is(args, 'array')) { args = [args] }
                    el = doEachByObj[t](el, f, args);
                }
            }
            return el
        };
        this.toArray = function (el) { return [].slice.call(el) };
        /**
         * Permet de trier les tableaux numériques dans l'ordre croissant
         * @param array
         * @returns {Array.<T>}
         */
        this.nSort = function(array){
            return array.sort(function (a, b) {
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
         * Permet de trier les tableaux numériques dans l'ordre décroissant
         * @param array
         * @returns {Array.<T>}
         */
        this.nSortD = function(array) {
            return array.sort(function (a, b) {
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
         * Elle supprime les éléments dupliqués d'un tableau. Le tableau est trié par ordre croissant ou décroissant selon la valeur de reverse
         * @param tab "Tableau à traiter"
         * @param reverse "Boolean qui indique l'ordre croissant ou décroissant"
         * @returns {Array}
         */
        this.removeDuplicate = function(tab, reverse) {
            var res = [], r;
            tab = (reverse !== true) ? self.nSort(tab) : self.nSortD(tab) ;
            self.each(tab, function(){
                var v = this.v;
                if (r !== v) { res.push(v); r = v }
            });
            return res
        };
        /**
         * Permet d'obtenir l'index d'une valeur dans un élément (Array, String, Node ...). Si la valeur n'existe pas, elle renvoie -1.
         * @param el
         * @param param
         * @returns {number}
         */
        this.index = function(el, param){
            var box = zk().toolbox(), paramType = box.is(param);
            if(paramType !== "regexp"){ paramType = "other" }
            var paramFunc = zk().getContainer("_ENTITY_._PARAMETERS_."+box.is(el)+".index."+paramType);
            return paramFunc ? paramFunc(el, param) : -1;
        };
        /**
         * Permet d'obtenir les index d'une valeur dans un élément (Array, String, Node ...). Si la valeur n'existe pas, elle renvoie -1.
         * @param el
         * @param param
         * @returns {array}
         */
        this.indexes = function(el, param){
            var box = zk().toolbox(), paramType = box.is(param);
            if(paramType !== "regexp"){ paramType = "other" }
            var paramFunc = zk().getContainer("_ENTITY_._PARAMETERS_."+box.is(el)+".indexes."+paramType);
            return paramFunc ? paramFunc(el, param) : [];
        };
        /**
         * Permet de compter le nombre de fois q'une valeur existe dans un élément (Array, String, Node ...). Si la valeur n'existe pas, elle renvoie 0.
         * @param el
         * @param param
         * @returns {number}
         */
        this.count = function(el, param){
            var paramType = zk().toolbox().is(param);
            if(paramType !== "regexp"){ paramType = "other" }
            var paramFunc = zk().getContainer("_ENTITY_._PARAMETERS_."+zk().toolbox().is(el)+".count."+paramType);
            return paramFunc ? paramFunc(el, param) : 0;
        };
        /**
         * Permet de vérifier si une valeur existe dans un élément (Array, String, Node ...)
         * @param el
         * @param param
         * @returns {boolean}
         */
        this.has = function(el, param){
            var paramType = zk().toolbox().is(param);
            if(paramType !== "regexp"){ paramType = "other" }
            var paramFunc = zk().getContainer("_ENTITY_._PARAMETERS_."+zk().toolbox().is(el)+".index."+paramType);
            var ok =  paramFunc ? paramFunc(el, param)+1 : false;
            return ok ? true : false;

        };

        // GET

        this.getFirst = function(el, param){
            var basePath = "_ENTITY_._PARAMETERS_."+self.is(el)+".";
            var path = basePath+"getFirst.";
            if(param===undefined){param=1}
            var f = zk().getContainer(path+self.is(param));
            return f ? f(el, param) : zk().getContainer(basePath+"getNotFound")(el, param);
        };
        this.getMiddle = function(el){
            var l = el.length, n = parseInt(l / 2);
            return (l % 2) ? el.slice(n, n + 1) : el.slice(n - 1, n + 1)
        };
        this.getLast = function(el, param){
            var basePath = "_ENTITY_._PARAMETERS_."+self.is(el)+".";
            var path = basePath+"getLast.";
            if(param===undefined){param=1}
            var f = zk().getContainer(path+self.is(param));
            return f ? f(el, param) : zk().getContainer(basePath+"getNotFound")(el, param);
        };
        this.getBefore = function(el, param){
            return zk().getContainer("_ENTITY_._PARAMETERS_."+self.is(el)+".getBefore.other")(el, param);
        };
        this.getAfter = function(el, param){
            return zk().getContainer("_ENTITY_._PARAMETERS_."+self.is(el)+".getAfter.other")(el, param);
        };
        this.getBetween = function(el, param){
            if(param===undefined){param=1}
            return zk().getContainer("_ENTITY_._PARAMETERS_."+self.is(el)+".getBetween.array")(el, param);
        };
        this.getAt = function(el, param){
            var basePath = "_ENTITY_._PARAMETERS_."+self.is(el)+".";
            var path = basePath+"getAt.";
            var f = zk().getContainer(path+self.is(param));
            return f ? f(el, param) : zk().getContainer(basePath+"getNotFound")(el, param);
        };
        this.get = function(el, param){
            var basePath = "_ENTITY_._PARAMETERS_."+self.is(el)+".";
            var path = basePath+"get.";
            var f = zk().getContainer(path+self.is(param));
            return f ? f(el, param) : zk().getContainer(basePath+"getNotFound")(el, param);
        };

        // REMOVE

        function rmFirstLast(el, param, firstLast){
            var basePath = "_ENTITY_._PARAMETERS_."+self.is(el)+".";
            var path = basePath+"remove"+firstLast+".";
            if(param===undefined){param=1}
            var f = zk().getContainer(path+self.is(param));
            return f ? f(el, param) : zk().getContainer(path+"other")(el, param);
        }
        this.removeFirst = function(el, param){ return rmFirstLast(el, param, "First") };
        this.removeMiddle = function(el){
            var l = el.length, x = (l % 2) ? 1 : 2, n = parseInt(l / 2);
            return el.slice(0, (x == 2) ? n - 1 : n).concat(el.slice(n + x - (x - 1)));
        };
        this.removeLast = function(el, param){ return rmFirstLast(el, param, "Last") };
        function rmBeforeAfter(el, param, what, argType){
            return zk().getContainer("_ENTITY_._PARAMETERS_." +
                self.is(el)+".remove"+what+"."+argType)(el, param);
        }
        this.removeBefore = function(el, param){ return rmBeforeAfter(el, param, 'Before', 'other') };
        this.removeAfter = function(el, param){ return rmBeforeAfter(el, param, 'After', 'other') };
        this.removeBetween = function(el, param){ return rmBeforeAfter(el, param, 'Between', 'array') };
        this.removeAt = function (el, param) {
            var basePath = "_ENTITY_._PARAMETERS_."+self.is(el)+".";
            var path = basePath+"removeAt.";
            var f = zk().getContainer(path+self.is(param));
            return f ? f(el, param) : el;
        };
        this.remove = function (el, param) {
            if(param  === undefined ){ return el }
            var path = "_ENTITY_._PARAMETERS_."+self.is(el)+".remove.";
            var f = zk().getContainer(path+self.is(param));
            return f ? f(el, param) : zk().getContainer(path+"other")(el, param);
        };

        // ADD

        function addFirstLast(el, value, firstLast) {
            if(value===undefined){ return el }
            var path = "_ENTITY_._PARAMETERS_."+self.is(el)+".add"+firstLast+".other";
            return zk().getContainer(path)(el, value);
        }
        this.addFirst = function (el, value) { return addFirstLast(el, value, "First") };
        this.addMiddle = function (el, value) {
            var l = el.length, n = parseInt(l / 2);
            return doSlice(el, n, n, value);
        };
        this.addLast = function (el, value) { return addFirstLast(el, value, "Last") };
        function addBeforeAfter(el, index, value, beforeAfter) {
            if(value===undefined){ return el }
            var path = "_ENTITY_._PARAMETERS_."+self.is(el)+".add"+beforeAfter+".other";
            return zk().getContainer(path)(el, index, value);
        }
        this.addBefore = function (el, index, value) { return addBeforeAfter(el, index, value, "Before") };
        this.addAfter = function (el, index, value) { return addBeforeAfter(el, index, value, "After") };
        this.addAt = function (el, index, value) {
            if(value===undefined){ return el }
            var path = "_ENTITY_._PARAMETERS_."+self.is(el)+".addAt.array";
            return zk().getContainer(path)(el, index, value);
        };
        this.add = function (el, value) {
            if(value===undefined){ return el }
            var path = "_ENTITY_._PARAMETERS_."+self.is(el)+".addLast.other";
            return zk().getContainer(path)(el, value);
        };

        // UPPER

        function upperLowerFirstLast(el, param, firstLast, upperLower) {
            if(param===undefined){param=1}
            var path = "_ENTITY_._PARAMETERS_."+self.is(el) +
                ".upper" + firstLast + "." + self.is(param);
            var f = zk().getContainer(path);
            return f ? f(el, param, upperLower) : el;
        }
        this.upperFirst = function (el, param) { return upperLowerFirstLast(el, param, "First", "Upper") };
        this.upperLast = function (el, param) { return upperLowerFirstLast(el, param, "Last", "Upper") };
        this.upperMiddle = function (el) {
            var l = el.length, x = (l % 2) ? 1 : 2, n = parseInt(l / 2);
            return doSlice(el, (x == 2) ? n - 1 : n, n + x - (x - 1), upperLowerTab((x == 1) ? el.slice(n, n + 1) : el.slice(n - 1, n + 1), "Upper"));
        };
        function upperLowerBeforeAfter(el, index, beforeAfter, upperLower) {
            var path = "_ENTITY_._PARAMETERS_."+self.is(el) +
                ".upper" + beforeAfter + ".other";
            return zk().getContainer(path)(el, index, upperLower);
        }
        this.upperBefore = function (el, index) { return upperLowerBeforeAfter(el, index, "Before", "Upper") };
        this.upperAfter = function (el, index) { return upperLowerBeforeAfter(el, index, "After", "Upper") };
        function upperLowerBetween(el, indexes, upperLower) {
            if(indexes===undefined){ return el }
            var path = "_ENTITY_._PARAMETERS_."+self.is(el) +
                ".upperBetween.array";
            return zk().getContainer(path)(el, indexes, upperLower);
        }
        this.upperBetween = function (el, indexes) { return upperLowerBetween(el, indexes, "Upper") };
        function upperLowerAt(el, indexes, upperLower) {
            if(indexes===undefined){ return el }
            var path = "_ENTITY_._PARAMETERS_."+self.is(el) +
                ".upperAt." + self.is(indexes);
            var f = zk().getContainer(path);
            return f ? f(el, indexes, upperLower) : el;
        }
        this.upperAt = function (el, indexes) { return upperLowerAt(el, indexes, "Upper") };
        function upperLower(el, indexes, upperLower) {
            if(indexes===undefined){ indexes = el }
            var path = "_ENTITY_._PARAMETERS_."+self.is(el) +
                ".upper." + self.is(indexes);
            var f = zk().getContainer(path);
            return f ? f(el, indexes, upperLower) : el;
        }
        this.upper = function (el, param) { return upperLower(el, param, "Upper") };

        // LOWER

        this.lowerFirst = function (el, param) { return upperLowerFirstLast(el, param, "First", "Lower") };
        this.lowerLast = function (el, param) { return upperLowerFirstLast(el, param, "Last", "Lower") };
        this.lowerMiddle = function (el) {
            var l = el.length, x = (l % 2) ? 1 : 2, n = parseInt(l / 2);
            return doSlice(el, (x == 2) ? n - 1 : n, n + x - (x - 1), upperLowerTab((x == 1) ? el.slice(n, n + 1) : el.slice(n - 1, n + 1), "Lower"));
        };
        this.lowerBefore = function (el, index) { return upperLowerBeforeAfter(el, index, "Before", "Lower") };
        this.lowerAfter = function (el, index) { return upperLowerBeforeAfter(el, index, "After", "Lower") };
        this.lowerBetween = function (el, indexes) { return upperLowerBetween(el, indexes, "Lower") };
        this.lowerAt = function (el, indexes) { return upperLowerAt(el, indexes, "Lower") };
        this.lower = function (el, param) { return upperLower(el, param, "Lower") };

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
            if ((typeof(entityFunc)).toLowerCase() !== 'function') { return false }
            var name = entityFunc.name;
            if (!name || APP._CONTAINER_.get("_ENTITY_." + (name.toLowerCase()))) { return false }
            if (!APP._TOOLBOX_.is(methods, "object")) { methods = {} }
            APP._TOOLBOX_.each(methods, function () { entityFunc.prototype[this.k] = this.v; });
            APP.setContainer("_ENTITY_." + (name.toLowerCase()), entityFunc);
            if (!APP._TOOLBOX_.is(parameters, "object")) { parameters = {} }
            APP._TOOLBOX_.each(parameters, function () {
                APP.setContainer("_ENTITY_._PARAMETERS_." + (name.toLowerCase()) + "." + this.k, this.v);
            });
            return APP;
        };
        this.get = function (selector) {
            var name = APP._TOOLBOX_.is(selector), func = APP.getContainer("_ENTITY_._CONVERTOR_." + name), res;
            if (func) { res = func(selector); name = res[0]; selector = res[1]; }
            var entity = APP.getContainer("_ENTITY_." + name);
            if ((typeof(entityFunc)).toLowerCase() !== 'function') {
                entity = new entity(selector, function(pathParam){
                    return APP.getContainer("_ENTITY_._PARAMETERS_."+name+"."+pathParam);
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
    APP.setContainer("_ENTITY_._CONVERTOR_.nodeelement", function (el) { return ["node", [el]] });
    APP.setContainer("_ENTITY_._CONVERTOR_.htmlcollection", function (el) { return ["node", APP._TOOLBOX_.toArray(el)] });
    APP.setContainer("_ENTITY_._CONVERTOR_.nodelist", function (el) { return ["node", APP._TOOLBOX_.toArray(el)] });

    function launcher(selector){
        var type = APP.toolbox().is(selector);
        if(type == "array"){
            selector = selector.join(",");
            type = "string";
        }
        if(type == "string"){
           selector = document.querySelectorAll(selector);
        }

        return APP.get(selector);
    }
    $W.$ = function (selector) { return launcher(selector) };
    $W.zk = function (selector) { if (selector === undefined) { return APP } };


    /**
     * *********
     */




})(window);