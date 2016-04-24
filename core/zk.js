(function ($W) {
    'use strict';

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
            return paramFunc ? paramFunc(el, param) : -1;
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


    Array.prototype.each = function(func, args){ return zk().toolbox().each(this, func, args) };

    var arrayIndexPath = "_ENTITY_._PARAMETERS_.array.index.";
    zk().setContainer(arrayIndexPath+"other", function(el, param){
        var k = el.length;
        for(var i=0; i < k; i++){
            if(el[i] === param){
                return i;
            }
        }
        return -1;
    });
    zk().setContainer(arrayIndexPath+"regexp", function(el, param){
        var k = el.length;
        for(var i = 0; i < k ; i++){
            if(param.test(el[i])){
                return i;
            }
        }
        return -1;
    });
    Array.prototype.index = function(param){ return zk().toolbox().index(this, param) };

    var arrayIndexesPath = "_ENTITY_._PARAMETERS_.array.indexes.";
    zk().setContainer(arrayIndexesPath+"other", function(el, param){
        var k = el.length, indexes = [];
        for(var i=0; i < k; i++){
            if(el[i] === param){
                indexes.push(i);
            }
        }
        return indexes;
    });
    zk().setContainer(arrayIndexesPath+"regexp", function(el, param){
        var k = el.length, indexes = [];
        for(var i = 0; i < k ; i++){
            if(param.test(el[i])){
                indexes.push(i);
            }
        }
        return indexes;
    });
    Array.prototype.indexes = function(param){ return zk().toolbox().indexes(this, param) };

    var arrayCountPath = "_ENTITY_._PARAMETERS_.array.count.";
    zk().setContainer(arrayCountPath+"other", function(el, param){
        var count = 0;
        zk().toolbox().each(el,function(){
            if(this.v === param){
                count++;
            }
        });
        return count;
    });
    zk().setContainer(arrayCountPath+"regexp", function(el, param){
        var count = 0;
        zk().toolbox().each(el,function(){
            if(param.test(this.v)){
                count++;
            }
        });
        return count;
    });
    Array.prototype.count = function(param){ return zk().toolbox().count(this, param) };

    Array.prototype.has = function(param){ return zk().toolbox().has(this, param) };

    /**
     * ========================================= LES METHODES AVEC GET =============================================
     */

    var arrayGetFirstPath = "_ENTITY_._PARAMETERS_.array.getFirst.";
    zk().setContainer(arrayGetFirstPath+"number", function(el, param){ return el.slice(0, Math.abs(param)) });
    zk().setContainer(arrayGetFirstPath+"string", function(el, param){
        return zk().getContainer(arrayGetFirstPath+"regexp")(el, new RegExp(param));
    });
    zk().setContainer(arrayGetFirstPath+"regexp", function(el, param){
        var k = el.length;
        for(var i = 0; i < k; i++){
            if(param.test(el[i])){ return [el[i]] }
        }
        return [];
    });
    /**
     * Permet d'obtenir les premiers éléments d'un tableau
     * @param param (number|string|regexp)
     *      - Si param n'est pas indiqué, elle retourne le premier élément du tableau.
     *      - number : Elle retourne les param premiers éléments du tableau. Les nombres négatifs sont convertis en valeurs absolus.
     *      - string : L'argument param est converti en regexp.
     *      - regexp : Elle retourne le premier élément du tableau qui correspond à l'expression régulière.
     * @returns {Array}
     */
    Array.prototype.getFirst = function(param){
        if(param===undefined){param=1}
        var paramFunc = zk().getContainer(arrayGetFirstPath+zk().toolbox().is(param));
        return paramFunc ? paramFunc(this, param) : [];
    };

    /**
     * Permet d'obtenir le ou les éléments qui se trouvent au milieu du tableau.
     * @returns {Array.<*>}
     */
    Array.prototype.getMiddle = function(){
        var l = this.length, n = parseInt(l / 2);
        return (l % 2) ? this.slice(n, n + 1) : this.slice(n - 1, n + 1)
    };

    var arrayGetLastPath = "_ENTITY_._PARAMETERS_.array.getLast.";
    zk().setContainer(arrayGetLastPath+"number", function(el, param){ return el.slice(-Math.abs(param)) });
    zk().setContainer(arrayGetLastPath+"string", function(el, param){
        return zk().getContainer(arrayGetLastPath+"regexp")(el, new RegExp(param));
    });
    zk().setContainer(arrayGetLastPath+"regexp", function(el, param){
        var k = el.length;
        for(var i = (k-1); i+1 ; i--){
            if(param.test(el[i])){ return [el[i]] }
        }
        return [];
    });
    /**
     * Permet d'obtenir les derniers éléments d'un tableau
     * @param param (number|string|regexp)
     *      - Si param n'est pas indiqué, elle retourne le dernier élément du tableau.
     *      - number : Elle retourne les param derniers éléments du tableau. Les nombres négatifs sont convertis en valeurs absolus.
     *      - string : L'argument param est converti en regexp.
     *      - regexp : Elle retourne le dernier élément du tableau qui correspond à l'expression régulière.
     * @returns {Array}
     */
    Array.prototype.getLast = function(param){
        if(param===undefined){param=1}
        var paramFunc = zk().getContainer(arrayGetLastPath+zk().toolbox().is(param));
        return paramFunc ? paramFunc(this, param) : [];
    };

    var arrayGetBeforePath = "_ENTITY_._PARAMETERS_.array.getBefore.";
    zk().setContainer(arrayGetBeforePath+"other", function(el, param){
        var box = zk().toolbox();
        if(!box.is(param, "number")){ param = box.index(el, param) }
        if(param > -1 ){ return el.slice(0,param) }
        return [];
    });
    /**
     * Permet d'obtenir les éléments qui se situent avant param dans le tableau.
     * @param param (number|other)
     *      - number : Index du tableau.
     *      - other : Objet quelconque qui se trouve dans le tableau.
     * @returns {Array}
     */
    Array.prototype.getBefore = function(param){
        return zk().getContainer(arrayGetBeforePath+"other")(this, param);
    };

    var arrayGetAfterPath = "_ENTITY_._PARAMETERS_.array.getAfter.";
    zk().setContainer(arrayGetAfterPath+"other", function(el, param){
        var box = zk().toolbox();
        if(!box.is(param, "number")){ param = box.index(el, param) }
        if(param > -1 ){ return el.slice(param+1) }
        return [];
    });
    /**
     * Permet d'obtenir les éléments qui se situent après param dans le tableau.
     * @param param (number|other)
     *      - number : Index du tableau.
     *      - other : Objet quelconque qui se trouve dans le tableau.
     * @returns {Array}
     */
    Array.prototype.getAfter = function(param){
        return zk().getContainer(arrayGetAfterPath+"other")(this, param);
    };

    var arrayGetBetweenPath = "_ENTITY_._PARAMETERS_.array.getBetween.";
    zk().setContainer(arrayGetBetweenPath+"array", function(el, param){
        var i, k, res = [];
        var box = zk().toolbox();
        if (!box.is(param, 'array')) { param = [param] }
        if (param.length % 2) { param.push(el.length - 1) }
        k = param.length;
        for (i = 0; i < k; i += 2) {
            var tab = [param[i], param[i+1]];
            for (var j = 0; j < 2; j++){
                if(!box.is(tab[j], "number")){ tab[j] = box.index(el, tab[j]) }
                if(tab[j] < 0){ tab[j] = NaN }
            }
            if(box.is(tab[0], "number") && box.is(tab[1], "number")){
                tab = box.nSort(tab);
                res = res.concat(el.slice(tab[0]+1,tab[1]));
            }
        }
        return res;
    });
    /**
     * Permet d'obtenir une ou plusieurs plages dans un tableau.
     * @param param
     *      - Si param n'est pas indiqué, alors il vaut 1.
     *      - Si ce n'est pas un tableau, il est converti en tableau.
     *      - Si la taille est impaire, on ajoute la taille du tableau pour le rendre paire.
     *      - Les valeurs numériques dans param sont les index des plages.
     *      - Les nombres négatifs ne sont pas pris en compte.
     * @returns {Array}
     */
    Array.prototype.getBetween = function(param){
        if(param===undefined){param=1}
        var paramFunc = zk().getContainer(arrayGetBetweenPath+zk().toolbox().is(param));
        return paramFunc ? paramFunc(this, param) : [];
    };

    var arrayGetAtPath = "_ENTITY_._PARAMETERS_.array.getAt.";
    zk().setContainer(arrayGetAtPath + "number", function (el, param) { return zk().getContainer(arrayGetAtPath + "array")(el, [param]) });
    zk().setContainer(arrayGetAtPath + "array", function (el, param) {
        var n, k = el.length, res = [];
        zk().toolbox().each(param, function () {
            n = this.v;
            if (zk().toolbox().is(n, 'number') && n > -1) {
                if (n < k) {
                    res = res.concat(el[n])
                }
            }
        });
        return res
    });
    /**
     * Permet d'obtenir des éléments qui se trouvent à des index spécifiés.
     * @param param (int|array)
     *      - int : Index de l'élément qu'on veut obtenir. Pas de nombres négatifs.
     *      - array : Tableau d'entiers correpondants aux index des élélments qu'on souhaite obtenir.
     * @returns {Array}
     */
    Array.prototype.getAt = function(param){
        var paramFunc = zk().getContainer(arrayGetAtPath+zk().toolbox().is(param));
        return paramFunc ? paramFunc(this, param) : [];
    };

    var arrayGetPath = "_ENTITY_._PARAMETERS_.array.get.";
    zk().setContainer(arrayGetPath+"string", function(el, param){
        return zk().getContainer(arrayGetPath+"regexp")(el, new RegExp(param));
    });
    zk().setContainer(arrayGetPath+"regexp", function(el, param){
        var res = [];
        zk().toolbox().each(el,function(){
            if(param.test(this.v)){ res.push(this.v) }
        });
        return res;
    });
    zk().setContainer(arrayGetPath + "number", function (el, param) { return ( param < 0 ) ? el.slice(param) : el.slice(0, param); });
    zk().setContainer(arrayGetPath + "array", function (el, param) {
        var res = [];
        zk().toolbox().each(param, function () {
            var paramFunc = zk().getContainer(arrayGetPath+zk().toolbox().is(this.v));
            if (paramFunc) { res = res.concat(paramFunc(el, this.v)) }
        });
        return res
    });
    /**
     * Permet d'obtenir des valeurs dans le tableau.
     * @param param (string|regexp|number|array)
     *      - string : Conversion en regexp.
     *      - regexp : Expression régulières des éléments qu'on souhaite obtenir dans le tableau.
     *      - number : Les premiers ou derniers éléments. Positif = premier   Négatif = dernier.
     *      - array : Paramètres multiples (string|regexp|number). Le résulat est obtenu en fonction du type des éléments qui se trouve dans le tableau.
     * @returns {Array}
     */
    Array.prototype.get = function(param){
        var paramFunc = zk().getContainer("_ENTITY_._PARAMETERS_.array.get."+zk().toolbox().is(param));
        return paramFunc ? paramFunc(this, param) : [];
    };

    /**
     * ========================================= LES METHODES AVEC REMOVE =============================================
     */

    Array.prototype.removeDuplicate = function(reverse) { return zk().toolbox().removeDuplicate(this, reverse) };

    var arrayRemoveFirstPath = "_ENTITY_._PARAMETERS_.array.removeFirst.";
    zk().setContainer(arrayRemoveFirstPath+"number", function (el, param) {
        return (param < 1) ? el : el.slice(param)
    });
    zk().setContainer(arrayRemoveFirstPath+"string", function(el, param){
        var i, k = el.length;
        for (i = 0; i < k; i++) {
            if (el[i] == param) { el.splice(i, 1); return el }
        }
        return el;
    });
    zk().setContainer(arrayRemoveFirstPath+"regexp", function(el, param){
        var i, k = el.length;
        for (i = 0; i < k; i++) {
            if (param.test(el[i])) { el.splice(i, 1); return el }
        }
        return el;
    });
    /**
     * Permet de supprimer les premiers éléments du tableau.
     * @param param (number|string|regexp)
     *      - number : Nombre de premiers éléments à supprimer.
     *      - string : Le premier élément à supprimer. La fonction fait une égalité stricte.
     *      - regexp : Expression régulière de l'élément à supprimer.
     * @returns {Array}
     */
    Array.prototype.removeFirst = function(param){
        if(param===undefined){param=1}
        var paramFunc = zk().getContainer(arrayRemoveFirstPath+zk().toolbox().is(param));
        return paramFunc ? paramFunc(this, param) : this;
    };

    /**
     * Permet de supprimer le ou les éléments qui se trouvent au milieu du tableau.
     * @returns {Array.<*>}
     */
    Array.prototype.removeMiddle = function(){
        var l = this.length, x = (l % 2) ? 1 : 2, n = parseInt(l / 2);
        return this.slice(0, (x == 2) ? n - 1 : n).concat(this.slice(n + x - (x - 1)));
    };

    var arrayRemoveLastPath = "_ENTITY_._PARAMETERS_.array.removeLast.";
    zk().setContainer(arrayRemoveLastPath + "number", function (el, param) {
        return (param < 1) ? this : el.slice(0, -param);
    });
    zk().setContainer(arrayRemoveLastPath+"string", function(el, param){
        var i, k = el.length;
        for (i = k - 1; i > -1; i--) {
            if (el[i] == param) { el.splice(i, 1); return el }
        }
        return el;
    });
    zk().setContainer(arrayRemoveLastPath+"regexp", function(el, param){
        var i, k = el.length;
        for (i = k - 1; i > -1; i--) {
            if (param.test(el[i])) { el.splice(i, 1); return el }
        }
        return el;
    });
    /**
     * Permet de supprimer les derniers éléments du tableau.
     * @param param (number|string|regexp)
     *      - number : Nombre de derniers éléments à supprimer.
     *      - string : Le dernier élément à supprimer. La fonction fait une égalité stricte.
     *      - regexp : Expression régulière de l'élément à supprimer.
     * @returns {Array}
     */
    Array.prototype.removeLast = function(param){
        if(param===undefined){param=1}
        var paramFunc = zk().getContainer(arrayRemoveLastPath+zk().toolbox().is(param));
        return paramFunc ? paramFunc(this, param) : this;
    };

    var arrayRemoveBeforePath = "_ENTITY_._PARAMETERS_.array.removeBefore.";
    zk().setContainer(arrayRemoveBeforePath+"other", function(el, param){
        var box = zk().toolbox();
        if(!box.is(param, "number")){ param = box.index(el, param) }
        if(param > -1 ){ return el.slice(param) }
        return el;
    });
    /**
     * Permet de supprimer les éléments qui se situent avant param dans le tableau.
     * @param param (number|other)
     *      - number : Index du tableau.
     *      - other : Objet quelconque qui se trouve dans le tableau.
     * @returns {Array}
     */
    Array.prototype.removeBefore = function(param){
        return zk().getContainer(arrayRemoveBeforePath+"other")(this, param);
    };

    var arrayRemoveAfterPath = "_ENTITY_._PARAMETERS_.array.removeAfter.";
    zk().setContainer(arrayRemoveAfterPath+"other", function(el, param){
        var box = zk().toolbox();
        if(!box.is(param, "number")){ param = box.index(el, param) }
        if(param > -1 ){ return el.slice(0, param + 1) }
        return el;
    });
    /**
     * Permet de supprimer les éléments qui se situent après param dans le tableau.
     * @param param (number|other)
     *      - number : Index du tableau.
     *      - other : Objet quelconque qui se trouve dans le tableau.
     * @returns {Array}
     */
    Array.prototype.removeAfter = function(param){
        return zk().getContainer(arrayRemoveAfterPath+"other")(this, param);
    };

    var arrayRemoveBetweenPath = "_ENTITY_._PARAMETERS_.array.removeBetween.";
    zk().setContainer(arrayRemoveBetweenPath+"array", function(el, param){
        var box = zk().toolbox();
        if (!box.is(param, 'array')) { param = [param] }
        if (param.length % 2) { param.push(el.length - 1) }
        param = param.slice(0, 2);
        for (var i = 0; i < 2; i++){
            if(!box.is(param[i], "number")){ param[i] = box.index(el, param[i]) }
            if(param[i] < 0){ param[i] = NaN }
        }
        if(box.is(param[0], "number") && box.is(param[1], "number")){
            param = box.nSort(param);
            el = el.slice(0, param[0]+1).concat(el.slice(param[1]));
        }
        return el;
    });
    /**
     * Supprime une plage du tableau
     * @param param (array|int)
     *      - int : Valeur de début. La taille du tableau est utilisée comme valeur complémentaire.
     *      - array : Tableau contenant des valeurs quelconques.
     * @returns {*}
     */
    Array.prototype.removeBetween = function(param){
        return zk().getContainer(arrayRemoveBetweenPath+"array")(this, param);
    };

    var arrayRemoveAtPath = "_ENTITY_._PARAMETERS_.array.removeAt.";
    zk().setContainer(arrayRemoveAtPath + "number", function (el, param) { return zk().getContainer(arrayRemoveAtPath + "array")(el, [param]) });
    zk().setContainer(arrayRemoveAtPath + "array", function (el, param) {
        var box = zk().toolbox();
        param = box.removeDuplicate(param, true);
        box.each(param, function () {
            var n = this.v;
            if (box.is(n, 'number') && n > -1) { el = el.slice(0, n).concat(el.slice(n + 1)) }
        });
        return el
    });
    /**
     * Permet de supprimer des éléments qui se trouvent à des index spécifiés.
     * @param param (int|array)
     *      - int : Index de l'élément qu'on veut obtenir. Pas de nombres négatifs.
     *      - array : Tableau d'entiers correpondants aux index des élélments qu'on souhaite obtenir.
     * @returns {Array}
     */
    Array.prototype.removeAt = function(param){
        var paramFunc = zk().getContainer(arrayRemoveAtPath+zk().toolbox().is(param));
        return paramFunc ? paramFunc(this, param) : this;
    };

    var arrayRemovePath = "_ENTITY_._PARAMETERS_.array.remove.";
    zk().setContainer(arrayRemovePath+"string", function(el, param){
        var res = [];
        zk().toolbox().each(el,function(){
            if(param !== this.v){ res.push(this.v) }
        });
        return res;
    });
    zk().setContainer(arrayRemovePath+"regexp", function(el, param){
        var res = [];
        zk().toolbox().each(el,function(){
            if(!param.test(this.v)){ res.push(this.v) }
        });
        return res;
    });
    zk().setContainer(arrayRemovePath + "number", function (el, param) { return ( param < 0 ) ? el.slice(0, param) : el.slice(param); });
    zk().setContainer(arrayRemovePath + "array", function (el, param) {
        var indexes = [], box = zk().toolbox();
        box.each(param, function () {
            indexes = indexes.concat(box.indexes(el, this.v));
        });
        return zk().getContainer(arrayRemoveAtPath + "array")(el, indexes);
    });
    /**
     * Permet de supprimer des valeurs dans le tableau.
     * @param param (string|regexp|number|array)
     *      - string : Elément(s) à retirer du tableau.
     *      - regexp : Expression régulières des éléments qu'on souhaite supprimer du tableau.
     *      - number : Les premiers ou derniers éléments. Positif = premier   Négatif = dernier.
     *      - array : Paramètres multiples (string|regexp|number). Le résulat est obtenu en fonction du type des éléments qui se trouve dans le tableau.
     * @returns {Array}
     */
    Array.prototype.remove = function(param){
        var paramFunc = zk().getContainer(arrayRemovePath+zk().toolbox().is(param));
        return paramFunc ? paramFunc(this, param) : this;
    };

    /**
     * ========================================= LES METHODES AVEC ADD =============================================
     */

    var arrayAddFirstPath = "_ENTITY_._PARAMETERS_.array.addFirst.";
    zk().setContainer(arrayAddFirstPath+"other", function(el, value){
        if(!zk().toolbox().is(value, "array")){ value = [value] }
        return value.concat(el);
    });
    /**
     * Permet d'ajouter des valeurs au début du tableau.
     * @param value
     * @returns {*}
     */
    Array.prototype.addFirst = function(value){
        if(value===undefined){ return this }
        return zk().getContainer(arrayAddFirstPath+"other")(this, value);
    };

    /**
     * Cette fonction permet de slicé un élément
     * @param  {[string/array]} el [Elément a slicer]
     * @param  {[int]} i1 [Slice de 0 à i1 exclus]
     * @param  {[int]} i2 [Slice de i2 à la fin]
     * @param  {[string/array]} v  [Valeur à ajouter à la plage slicé. Facultatif]
     * @return {[string/array]}    [Elément slicé]
     */
    function doSlice(el, i1, i2, v) {
        i1 = i1 || 0;
        i2 = i2 || i1;
        i1 = el.slice(0, i1);
        i2 = el.slice(i2);
        return (v !== undefined) ? i1.concat(v).concat(i2) : i1.concat(i2);
    }
    Array.prototype.addMiddle = function(value){
        var l = this.length, n = parseInt(l / 2);
        return doSlice(this, n, n, value);
    };

    var arrayAddLastPath = "_ENTITY_._PARAMETERS_.array.addLast.";
    zk().setContainer(arrayAddLastPath+"other", function(el, value){
        if(!zk().toolbox().is(value, "array")){ value = [value] }
        return el.concat(value);
    });
    /**
     * Permet d'ajouter des valeurs à la fin du tableau.
     * @param value
     * @returns {*}
     */
    Array.prototype.addLast = function(value){
        if(value===undefined){ return this }
        return zk().getContainer(arrayAddLastPath+"other")(this, value);
    };

    var arrayAddBeforePath = "_ENTITY_._PARAMETERS_.array.addBefore.";
    zk().setContainer(arrayAddBeforePath+"other", function(el, index, value){
        var box = zk().toolbox();
        if(!box.is(index, "number")){ index = box.index(el, index) }
        if(index > -1 ){
            if(!box.is(value, "array")){ value = [value] }
            return doSlice(el, index, index, value)
        }
        return el;
    });
    /**
     * Permet d'ajouter des éléments (value) avant index
     * @param index (int|other)
     *      - int : Entier qui indique l'index. Pas de nombre négatifs.
     *      - other : N'importe quel objet qui se trouve dans le tableau.
     * @param value (other)
     *      - other : Une valeur quelconque.
     * @returns {*}
     */
    Array.prototype.addBefore = function(index, value){
        if(value===undefined){ return this }
        return zk().getContainer(arrayAddBeforePath+"other")(this, index, value);
    };

    var arrayAddAfterPath = "_ENTITY_._PARAMETERS_.array.addAfter.";
    zk().setContainer(arrayAddAfterPath+"other", function(el, index, value){
        var box = zk().toolbox();
        if(!box.is(index, "number")){ index = box.index(el, index) }
        if(index > -1 ){
            if(!box.is(value, "array")){ value = [value] }
            return doSlice(el, index + 1, index + 1, value)
        }
        return el;
    });
    /**
     * Permet d'ajouter des éléments (value) après index
     * @param index (int|other)
     *      - int : Entier qui indique l'index. Pas de nombre négatifs.
     *      - other : N'importe quel objet qui se trouve dans le tableau.
     * @param value (other)
     *      - other : Une valeur quelconque.
     * @returns {*}
     */
    Array.prototype.addAfter = function(index, value){
        if(value===undefined){ return this }
        return zk().getContainer(arrayAddAfterPath+"other")(this, index, value);
    };

    // addBetween n'existe pas

    var arrayAddAtPath = "_ENTITY_._PARAMETERS_.array.addAt.";
    zk().setContainer(arrayAddAtPath + "array", function (el, indexes, value) {
        var box = zk().toolbox();
        if(!box.is(indexes, "array")){ indexes = [indexes] }
        indexes = box.removeDuplicate(indexes, true);
        if(box.is(value, "array")){ value = value[0] }
        if(!box.is(value, "array")){ value = [value] }
        box.each(indexes, function () {
            el = zk().getContainer(arrayAddBeforePath+"other")(el, this.v, value);
        });
        return el;
    });

    /**
     * Permet d'ajouter des valeurs à des positions spécifiques.
     * @param indexes (int|array)
     *      - int : Un index.
     *      - array : Tableau des index.
     * @param value (array|other)
     *      - array : Si un tableau est indiqué, seul la première valuer est prise en compte.
     *      - other : Une valeur quelconque.
     * @returns {*}
     */
    Array.prototype.addAt = function(indexes, value){
        if(value===undefined){ return this }
        return zk().getContainer(arrayAddAtPath+"array")(this, indexes, value);
    };

    Array.prototype.add = function(value){
        if(value===undefined){ return this }
        return zk().getContainer(arrayAddLastPath+"other")(this, value);
    };



    /**
     * ========================================= LES METHODES AVEC UPPER ===========================================
     */




    /**
     * ========================================= LES METHODES AVEC LOWER ============================================
     */




})(window);