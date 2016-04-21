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




/**
 * ========================================= LES METHODES AVEC ADD =============================================
 */



/**
 * ========================================= LES METHODES AVEC UPPER ===========================================
 */




/**
 * ========================================= LES METHODES AVEC LOWER ============================================
 */

