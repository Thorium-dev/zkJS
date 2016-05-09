String.prototype.each = function(func, args){ return zk().toolbox().each(this, func, args) };

var stringIndexPath = "_ENTITY_._PARAMETERS_.string.index.";
zk().setContainer(stringIndexPath+"other", function(){ return -1 });
zk().setContainer(stringIndexPath+"string", function(el, value){ return el.indexOf(value) });
zk().setContainer(stringIndexPath+"number", function(el, value){ return el.indexOf(value+"") });
zk().setContainer(stringIndexPath+"regexp", function(el, value){
    var index = value.exec(el);
    return index ? index['index'] : -1;
});
String.prototype.index = function(value){ return zk().toolbox().index(this, value) };

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
    var result, indexes = [], flags = "g";
    if (value.ignoreCase){ flags += "i" }
    value = new RegExp(value, flags);
    while ( (result = value.exec(el)) ) { indexes.push(result.index) }
    return indexes;
});
String.prototype.indexes = function(value){ return zk().toolbox().indexes(this, value) };

String.prototype.count = function(value){ return zk().toolbox().count(this, value) };

String.prototype.has = function(value){ return zk().toolbox().has(this, value) };

String.prototype.reverse = function(){ return zk().toolbox().reverse(this) };

String.prototype.trim = function(strReg, direction){ return zk().toolbox().trim(this, strReg, direction) };



// ========================================= LES METHODES AVEC GET =============================================

var stringGetFirstPath = "_ENTITY_._PARAMETERS_.string.getFirst.";
zk().setContainer(stringGetFirstPath+"other", function(){ return "" });
zk().setContainer(stringGetFirstPath+"number", function(el, value){ return el.slice(0, Math.abs(value)) });
zk().setContainer(stringGetFirstPath+"string", function(el, value){
    return zk().getContainer(stringGetFirstPath+"regexp")(el, new RegExp(value));
});
zk().setContainer(stringGetFirstPath+"regexp", function(el, value){ var r = el.match(value); return r ? r[0] : ''; });
String.prototype.getFirst = function(value){ return zk().toolbox().getFirst(this, value) };

String.prototype.getMiddle = function(){ return zk().toolbox().getMiddle(this) };

var stringGetLastPath = "_ENTITY_._PARAMETERS_.string.getLast.";
zk().setContainer(stringGetLastPath+"other", function(){ return "" });
zk().setContainer(stringGetLastPath+"number", function(el, value){ return el.slice(-Math.abs(value)) });
zk().setContainer(stringGetLastPath+"string", function(el, value){
    return zk().getContainer(stringGetLastPath+"regexp")(el, value)
});
zk().setContainer(stringGetLastPath+"regexp", function(el, value){
    var r = el.match(new RegExp(value, "g")); return r ? r[r.length - 1] : '';
});
String.prototype.getLast = function(value){ return zk().toolbox().getLast(this, value) };

var stringGetBeforePath = "_ENTITY_._PARAMETERS_.string.getBefore.";
zk().setContainer(stringGetBeforePath+"other", function(el, index){
    var box = zk().toolbox();
    if(!box.is(index, "string|regexp|number")){ return "" }
    if(!box.is(index, "number")){ index = box.index(el, index) }
    if(index > -1 ){ return el.slice(0,index) }
    return "";
});
String.prototype.getBefore = function(index){ return zk().toolbox().getBefore(this, index) };

var stringGetAfterPath = "_ENTITY_._PARAMETERS_.string.getAfter.";
zk().setContainer(stringGetAfterPath+"other", function(el, index){
    var box = zk().toolbox(), indexType = box.is(index);
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
String.prototype.getAfter = function(index){ return zk().toolbox().getAfter(this, index) };

var stringGetBetweenPath = "_ENTITY_._PARAMETERS_.string.getBetween.";
zk().setContainer(stringGetBetweenPath+"array", function(el, indexes){
    var box = zk().toolbox(), i, k, res = "";
    if (!box.is(indexes, 'array')) { indexes = [indexes] }
    if (indexes.length % 2) { indexes.push(el.length - 1) }
    k = indexes.length;
    for (i = 0; i < k; i += 2) {
        var tab = box.nSort([indexes[i], indexes[i+1]]);
        for (var j = 0; j < 2; j++){
            var indexType = box.is(tab[j]);
            if (/string|number|regexp/.test(indexType)) {
                if (indexType === "string") {
                    var indexLength = tab[j].length - 1;
                    tab[j] = el.indexOf(tab[j]);
                    if ((j === 0 || (j === 1 && box.is(tab[0], "number"))) && tab[j] > -1) {
                        tab[j] += indexLength
                    }
                }
                if (indexType === "regexp") {
                    var indexReg = tab[j].exec(el);
                    if(indexReg){
                        tab[j] = indexReg.index;
                        if ((j === 0 || (j===1 && box.is(tab[0], "number"))) && tab[j] > -1) {
                            tab[j] += indexReg[0].length - 1
                        }
                    }else {
                        tab[j] = -1
                    }
                }
            } else {
                tab[j] = -1
            }
            if(tab[j] < 0){ tab[j] = NaN }
        }
        if(box.is(tab[0], "number") && box.is(tab[1], "number")){
            tab = box.nSort(tab);
            res = res.concat(el.slice(tab[0]+1,tab[1]));
        }
    }
    return res;
});
String.prototype.getBetween = function(indexes){ return zk().toolbox().getBetween(this, indexes) };

var stringGetAtPath = "_ENTITY_._PARAMETERS_.string.getAt.";
zk().setContainer(stringGetAtPath + "array", function (el, indexes) {
    return zk().getContainer(arrayGetAtPath+"array")(el, indexes);
});
String.prototype.getAt = function(indexes){ return zk().toolbox().getAt(this, indexes) };

var stringGetPath = "_ENTITY_._PARAMETERS_.string.get.";
zk().setContainer(stringGetPath+"other", function(){ return "" });
zk().setContainer(stringGetPath + "string", function(el, value){
    return zk().getContainer(stringGetPath+"regexp")(el, value);
});
zk().setContainer(stringGetPath + "regexp", function(el, value){
    var res = el.match(new RegExp(value, "g"));
    return res ? res.join("") : "";
});
zk().setContainer(stringGetPath + "number", function (el, value) {
    return ( value < 0 ) ? el.slice(value) : el.slice(0, value)
});
zk().setContainer(stringGetPath + "array", function (el, param) {
    var res = [];
    zk().toolbox().each(param, function () {
        var paramFunc = zk().getContainer(stringGetPath+zk().toolbox().is(this.v));
        if (paramFunc) { res = res.concat(paramFunc(el, this.v)) }
    });
    return res.join("")
});
String.prototype.get = function(value){ return zk().toolbox().get(this, value) };


// ========================================= LES METHODES AVEC REMOVE =============================================

var stringRemoveFirstPath = "_ENTITY_._PARAMETERS_.string.removeFirst.";
zk().setContainer(stringRemoveFirstPath+"other", function (el) { return el });
zk().setContainer(stringRemoveFirstPath+"number", function (el, value) { return (value < 1) ? el : el.slice(value) });
zk().setContainer(stringRemoveFirstPath+"string", function(el, value){ return el.replace(new RegExp(value), "") });
zk().setContainer(stringRemoveFirstPath+"regexp", function(el, value){
    var i = -1; return el.replace(value, function (str) { i++; return i ? str : "" })
});
String.prototype.removeFirst = function(value){ return zk().toolbox().removeFirst(this, value) };

String.prototype.removeMiddle = function(){ return zk().toolbox().removeMiddle(this) };








var arrayRemoveLastPath = "_ENTITY_._PARAMETERS_.array.removeLast.";
zk().setContainer(arrayRemoveLastPath + "number", function (el, param) {
    return (param < 1) ? this : el.slice(0, -param);
});
zk().setContainer(arrayRemoveLastPath+"other", function(el, param){
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
 * @param param (number|other|regexp)
 *      - number : Nombre de derniers éléments à supprimer.
 *      - other : Le dernier élément à supprimer. La fonction fait une égalité stricte.
 *      - regexp : Expression régulière de l'élément à supprimer.
 * @returns {Array}
 */
Array.prototype.removeLast = function(param){ return zk().toolbox().removeLast(this, param) };

var arrayRemoveBeforePath = "_ENTITY_._PARAMETERS_.array.removeBefore.";
zk().setContainer(arrayRemoveBeforePath+"other", function(el, param){
    var box = zk().toolbox();
    if(!box.is(param, "number")){ param = box.index(el, param) }
    if(param > -1 ){ return el.slice(param) }
    return el;
});
/**
 * Permet de supprimer les éléments qui se situent avant index dans le tableau.
 * @param index (number|other)
 *      - number : Index du tableau.
 *      - other : Objet quelconque qui se trouve dans le tableau.
 * @returns {Array}
 */
Array.prototype.removeBefore = function(index){ return zk().toolbox().removeBefore(this, index) };

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
Array.prototype.removeAfter = function(param){ return zk().toolbox().removeAfter(this, param) };

var arrayRemoveBetweenPath = "_ENTITY_._PARAMETERS_.array.removeBetween.";
zk().setContainer(arrayRemoveBetweenPath+"array", function(el, indexes){
    var box = zk().toolbox();
    if (!box.is(indexes, 'array')) { indexes = [indexes] }
    if (indexes.length % 2) { indexes.push(el.length - 1) }
    indexes = indexes.slice(0, 2);
    for (var i = 0; i < 2; i++){
        if(!box.is(indexes[i], "number")){ indexes[i] = box.index(el, indexes[i]) }
        if(indexes[i] < 0){ indexes[i] = NaN }
    }
    if(box.is(indexes[0], "number") && box.is(indexes[1], "number")){
        indexes = box.nSort(indexes);
        el = el.slice(0, indexes[0]+1).concat(el.slice(indexes[1]));
    }
    return el;
});
/**
 * Supprime une plage du tableau
 * @param indexes (array|int)
 *      - int : Valeur de début. La taille du tableau est utilisée comme valeur complémentaire.
 *      - array : Tableau contenant des valeurs quelconques.
 * @returns {*}
 */
Array.prototype.removeBetween = function(indexes){ return zk().toolbox().removeBetween(this, indexes) };

var arrayRemoveAtPath = "_ENTITY_._PARAMETERS_.array.removeAt.";
zk().setContainer(arrayRemoveAtPath + "number", function (el, indexes) { return zk().getContainer(arrayRemoveAtPath + "array")(el, [indexes]) });
zk().setContainer(arrayRemoveAtPath + "array", function (el, indexes) {
    var box = zk().toolbox();
    indexes = box.removeDuplicate(indexes, true);
    box.each(indexes, function () {
        var n = this.v;
        if (box.is(n, 'number') && n > -1) { el = el.slice(0, n).concat(el.slice(n + 1)) }
    });
    return el
});
/**
 * Permet de supprimer des éléments qui se trouvent à des index spécifiés.
 * @param indexes (int|array)
 *      - int : Index de l'élément qu'on veut supprimer. Pas de nombres négatifs.
 *      - array : Tableau d'entiers correpondants aux index des élélments qu'on souhaite supprimer.
 * @returns {Array}
 */
Array.prototype.removeAt = function(indexes){ return zk().toolbox().removeAt(this, indexes) };

var arrayRemovePath = "_ENTITY_._PARAMETERS_.array.remove.";
zk().setContainer(arrayRemovePath+"other", function(el, param){
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
 * @param param (void|other|regexp|number|array)
 *      - void : Si aucun paramètre n'est donné, elle renvoie le tableau d'origine.
 *      - other : Elément(s) à retirer du tableau. On fait une égalité stricte.
 *      - regexp : Expression régulières des éléments qu'on souhaite supprimer du tableau.
 *      - number : Les premiers ou derniers éléments. Positif = premier   Négatif = dernier.
 *      - array : Paramètres multiples (string|regexp|number). Le résulat est obtenu en fonction du type des éléments qui se trouve dans le tableau.
 * @returns {Array}
 */
Array.prototype.remove = function(param){ return zk().toolbox().remove(this, param) };
















