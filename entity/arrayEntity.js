Array.prototype.each = function(func, args){ return zk().toolbox().each(this, func, args) };

var arrayIndexPath = "_ENTITY_._PARAMETERS_.array.index.";
zk().setContainer(arrayIndexPath+"other", function(el, value){
    var k = el.length;
    for(var i=0; i < k; i++){
        if(el[i] === value){
            return i;
        }
    }
    return -1;
});
zk().setContainer(arrayIndexPath+"regexp", function(el, value){
    var k = el.length;
    for(var i = 0; i < k ; i++){
        if(zk().toolbox().is(el[i], 'string|number') && value.test(el[i])){
            return i;
        }
    }
    return -1;
});
Array.prototype.index = function(value){ return zk().toolbox().index(this, value) };

var arrayIndexesPath = "_ENTITY_._PARAMETERS_.array.indexes.";
zk().setContainer(arrayIndexesPath+"other", function(el, value){
    var k = el.length, indexes = [];
    for(var i=0; i < k; i++){
        if(el[i] === value){
            indexes.push(i);
        }
    }
    return indexes;
});
zk().setContainer(arrayIndexesPath+"regexp", function(el, value){
    var k = el.length, indexes = [];
    for(var i = 0; i < k ; i++){
        if(zk().toolbox().is(el[i], 'string|number') && value.test(el[i])){
            indexes.push(i);
        }
    }
    return indexes;
});
Array.prototype.indexes = function(value){ return zk().toolbox().indexes(this, value) };

Array.prototype.count = function(value){ return zk().toolbox().count(this, value) };

Array.prototype.has = function(value){ return zk().toolbox().has(this, value) };

Array.prototype.reverse = function(){ return zk().toolbox().reverse(this) };


// ========================================= LES METHODES AVEC GET =============================================

var arrayGetFirstPath = "_ENTITY_._PARAMETERS_.array.getFirst.";
zk().setContainer(arrayGetFirstPath+"other", function(){ return [] });
zk().setContainer(arrayGetFirstPath+"number", function(el, value){ return el.slice(0, Math.abs(value)) });
zk().setContainer(arrayGetFirstPath+"string", function(el, value){
    return zk().getContainer(arrayGetFirstPath+"regexp")(el, new RegExp(value));
});
zk().setContainer(arrayGetFirstPath+"regexp", function(el, value){
    var k = el.length;
    for(var i = 0; i < k; i++){
        if(value.test(el[i])){ return [el[i]] }
    }
    return [];
});
Array.prototype.getFirst = function(value){ return zk().toolbox().getFirst(this, value) };

Array.prototype.getMiddle = function(){ return zk().toolbox().getMiddle(this) };

var arrayGetLastPath = "_ENTITY_._PARAMETERS_.array.getLast.";
zk().setContainer(arrayGetLastPath+"other", function(){ return [] });
zk().setContainer(arrayGetLastPath+"number", function(el, value){ return el.slice(-Math.abs(value)) });
zk().setContainer(arrayGetLastPath+"string", function(el, value){
    return zk().getContainer(arrayGetLastPath+"regexp")(el, new RegExp(value));
});
zk().setContainer(arrayGetLastPath+"regexp", function(el, value){
    var k = el.length;
    for(var i = (k-1); i+1 ; i--){
        if(value.test(el[i])){ return [el[i]] }
    }
    return [];
});
Array.prototype.getLast = function(value){ return zk().toolbox().getLast(this, value) };

var arrayGetBeforePath = "_ENTITY_._PARAMETERS_.array.getBefore.";
zk().setContainer(arrayGetBeforePath+"other", function(el, index, isAfter){
    var box = zk().toolbox();
    if(!box.is(index, "number")){ index = box.index(el, index) }
    if(index > -1 ){ return isAfter ? el.slice(index+1) : el.slice(0,index) }
    return [];
});
Array.prototype.getBefore = function(index){ return zk().toolbox().getBefore(this, index) };

var arrayGetAfterPath = "_ENTITY_._PARAMETERS_.array.getAfter.";
zk().setContainer(arrayGetAfterPath+"other", function(el, index){
    return zk().getContainer(arrayGetBeforePath+"other")(el, index, true);
});
Array.prototype.getAfter = function(index){ return zk().toolbox().getAfter(this, index) };






var arrayGetBetweenPath = "_ENTITY_._PARAMETERS_.array.getBetween.";
zk().setContainer(arrayGetBetweenPath+"array", function(el, indexes){
    var i, k, res = [];
    var box = zk().toolbox();
    if (!box.is(indexes, 'array')) { indexes = [indexes] }
    if (indexes.length % 2) { indexes.push(el.length - 1) }
    k = indexes.length;
    for (i = 0; i < k; i += 2) {
        var tab = [indexes[i], indexes[i+1]];
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
Array.prototype.getBetween = function(indexes){ return zk().toolbox().getBetween(this, indexes) };

var arrayGetAtPath = "_ENTITY_._PARAMETERS_.array.getAt.";
zk().setContainer(arrayGetAtPath + "number", function (el, indexes) { return zk().getContainer(arrayGetAtPath + "array")(el, [indexes]) });
zk().setContainer(arrayGetAtPath + "array", function (el, indexes) {
    var n, k = el.length, res = [];
    zk().toolbox().each(indexes, function () {
        n = this.v;
        if (zk().toolbox().is(n, 'number') && n > -1) {
            if (n < k) {
                res = res.concat(el[n])
            }
        }
    });
    return res
});
Array.prototype.getAt = function(indexes){ return zk().toolbox().getAt(this, indexes) };

var arrayGetPath = "_ENTITY_._PARAMETERS_.array.get.";
zk().setContainer(arrayGetPath + "string", function(el, param){
    return zk().getContainer(arrayGetPath+"regexp")(el, new RegExp(param));
});
zk().setContainer(arrayGetPath + "regexp", function(el, param){
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
Array.prototype.get = function(param){ return zk().toolbox().get(this, param) };

// ========================================= LES METHODES AVEC REMOVE =============================================

Array.prototype.removeDuplicate = function(reverse) { return zk().toolbox().removeDuplicate(this, reverse) };

var arrayRemoveFirstPath = "_ENTITY_._PARAMETERS_.array.removeFirst.";
zk().setContainer(arrayRemoveFirstPath+"number", function (el, param) {
    return (param < 1) ? el : el.slice(param)
});
zk().setContainer(arrayRemoveFirstPath+"other", function(el, param){
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
 * @param param (number|other|regexp)
 *      - number : Nombre de premiers éléments à supprimer.
 *      - other : Le premier élément à supprimer. La fonction fait une égalité stricte.
 *      - regexp : Expression régulière de l'élément à supprimer.
 * @returns {Array}
 */
Array.prototype.removeFirst = function(param){ return zk().toolbox().removeFirst(this, param) };

/**
 * Permet de supprimer le ou les éléments qui se trouvent au milieu du tableau.
 * @returns {Array.<*>}
 */
Array.prototype.removeMiddle = function(){ return zk().toolbox().removeMiddle(this) };

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

// ========================================= LES METHODES AVEC ADD =============================================

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
Array.prototype.addFirst = function(value){ return zk().toolbox().addFirst(this, value) };

Array.prototype.addMiddle = function(value){ return zk().toolbox().addMiddle(this, value) };

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
Array.prototype.addLast = function(value){ return zk().toolbox().addLast(this, value) };

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
Array.prototype.addBefore = function(index, value){ return zk().toolbox().addBefore(this, index, value) };

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
Array.prototype.addAfter = function(index, value){ return zk().toolbox().addAfter(this, index, value) };

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
Array.prototype.addAt = function(indexes, value){ return zk().toolbox().addAt(this, indexes, value) };

Array.prototype.add = function(value){ return zk().toolbox().add(this, value) };


// ========================================= LES METHODES AVEC CHANGE ===========================================

var arrayChangeFirstPath = "_ENTITY_._PARAMETERS_.array.changeFirst.";
zk().setContainer(arrayChangeFirstPath+"number", function (el, oldValue, newValue) {
    if(oldValue > 0){
        el = zk().getContainer(arrayAddFirstPath+"other")(el.slice(oldValue), newValue);
    }
    return el;
});
zk().setContainer(arrayChangeFirstPath+"other", function(el, oldValue, newValue){
    var box = zk().toolbox(), index = box.index(el, oldValue);
    if(index > -1){ el[index] = newValue }
    return el;
});
/**
 * Permet de changer les premiers éléments.
 * @param oldValue (number|other)
 *      - number : Les premiers du tableau.
 *      - other : N'importe quel objet qui se trouve dans le tableau.
 * @param newValue
 * @returns {Array}
 */
Array.prototype.changeFirst = function(oldValue, newValue){ return zk().toolbox().changeFirst(this, oldValue, newValue) };

Array.prototype.changeMiddle = function(value){ return zk().toolbox().changeMiddle(this, value) };

var arrayChangeLastPath = "_ENTITY_._PARAMETERS_.array.changeLast.";
zk().setContainer(arrayChangeLastPath+"number", function (el, oldValue, newValue) {
    if(oldValue > 0){
        el = zk().getContainer(arrayAddLastPath+"other")(el.slice(0, -oldValue), newValue);
    }
    return el;
});
zk().setContainer(arrayChangeLastPath+"other", function(el, oldValue, newValue){
    var box = zk().toolbox(), indexes = box.indexes(el, oldValue), index = indexes[indexes.length-1];
    if(index){ el[index] = newValue }
    return el;
});
/**
 * Permet de changer les derniers éléments.
 * @param oldValue (number|other)
 *      - number : Les derniers du tableau.
 *      - other : N'importe quel objet qui se trouve dans le tableau.
 * @param newValue
 * @returns {Array}
 */
Array.prototype.changeLast = function(oldValue, newValue){ return zk().toolbox().changeLast(this, oldValue, newValue) };

var arrayChangeBeforePath = "_ENTITY_._PARAMETERS_.array.changeBefore.";
zk().setContainer(arrayChangeBeforePath+"other", function(el, index, value){
    var box = zk().toolbox();
    var el2 = box.removeBefore(el, index);
    if(el2.length < el.length){ el = box.addFirst(el2, value) }
    return el;
});
/**
 * Permet de changer les éléments qui se situent avant index dans le tableau.
 * @param index (number|other)
 *      - number : Index du tableau.
 *      - other : Objet quelconque qui se trouve dans le tableau.
 * @param value
 * @returns {Array}
 */
Array.prototype.changeBefore = function(index, value){ return zk().toolbox().changeBefore(this, index, value) };

var arrayChangeAfterPath = "_ENTITY_._PARAMETERS_.array.changeAfter.";
zk().setContainer(arrayChangeAfterPath+"other", function(el, index, value){
    var box = zk().toolbox();
    var el2 = box.removeAfter(el, index);
    if(el2.length < el.length){ el = box.addLast(el2, value) }
    return el;
});
/**
 * Permet de changer les éléments qui se situent après index dans le tableau.
 * @param index (number|other)
 *      - number : Index du tableau.
 *      - other : Objet quelconque qui se trouve dans le tableau.
 * @param value
 * @returns {Array}
 */
Array.prototype.changeAfter = function(index, value){ return zk().toolbox().changeAfter(this, index, value) };

var arrayChangeBetweenPath = "_ENTITY_._PARAMETERS_.array.changeBetween.";
zk().setContainer(arrayChangeBetweenPath+"array", function(el, indexes, value){
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
        el = el.slice(0, indexes[0]+1).concat(value).concat(el.slice(indexes[1]));
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
Array.prototype.changeBetween = function(indexes, value){ return zk().toolbox().changeBetween(this, indexes, value) };

var arrayChangeAtPath = "_ENTITY_._PARAMETERS_.array.changeAt.";
zk().setContainer(arrayChangeAtPath + "array", function (el, indexes, value) {
    var box = zk().toolbox();
    if(box.is(indexes, 'number')){ indexes = [indexes] }
    indexes = box.removeDuplicate(indexes, true);
    box.each(indexes, function () {
        var n = this.v;
        if (box.is(n, 'number') && n > -1) { el[n] = value }
    });
    return el
});
/**
 * Permet de changer des éléments qui se trouvent à des index spécifiés.
 * @param indexes (int|array)
 *      - int : Index de l'élément qu'on veut changer. Pas de nombres négatifs.
 *      - array : Tableau d'entiers correpondants aux index des élélments qu'on souhaite changer.
 * @param value
 * @returns {Array}
 */
Array.prototype.changeAt = function(indexes, value){ return zk().toolbox().changeAt(this, indexes, value) };

var arrayChangePath = "_ENTITY_._PARAMETERS_.array.change.";
zk().setContainer(arrayChangePath+"other", function(el, param, value){
    return zk().toolbox().each(el,function(){ if (param === this.v){ return value } });
});
zk().setContainer(arrayChangePath+"regexp", function(el, param, value){
    return zk().toolbox().each(el,function(){ if (param.test(this.v)){ return value } });
});
zk().setContainer(arrayChangePath + "number", function (el, param, value) {
    return  zk().toolbox()['change'+(param<0?'Last':'First')](el, Math.abs(param), value) ;
});
zk().setContainer(arrayChangePath + "array", function (el, param, value) {
    var indexes = [], box = zk().toolbox();
    box.each(param, function () {
        indexes = indexes.concat(box.indexes(el, this.v));
    });
    return zk().getContainer(arrayChangeAtPath + "array")(el, indexes, value);
});
/**
 * Permet de changer des valeurs dans le tableau.
 * @param param (other|regexp|number|array)
 *      - other : Elément(s) à changer dans tableau. On fait une égalité stricte.
 *      - regexp : Expression régulières des éléments qu'on souhaite changer dans tableau.
 *      - number : Les premiers ou derniers éléments. Positif = premier   Négatif = dernier.
 *      - array : Paramètres multiples (string|regexp|number). Le résulat est obtenu en fonction du type des éléments qui se trouve dans le tableau.
 * @param value
 * @returns {Array}
 */
Array.prototype.change = function(param, value){ return zk().toolbox().change(this, param, value) };

// ========================================= LES METHODES AVEC UPPER ===========================================

var arrayUpperFirstPath = "_ENTITY_._PARAMETERS_.array.upperFirst.";
zk().setContainer(arrayUpperFirstPath+"number", function (el, param, upperLower) {
    if(param < 1 ){ return el }
    var l = el.length;
    if( param > l ){ param = l }
    for(var i = 0; i < param; i++){
        if(zk().toolbox().is(el[i], "string")){
            el[i] = el[i]["to"+upperLower+"Case"]();
        }
    }
    return el
});
zk().setContainer(arrayUpperFirstPath+"string", function(el, param, upperLower){
    var i, k = el.length;
    for (i = 0; i < k; i++) {
        if (el[i] == param) {
            if(zk().toolbox().is(el[i], "string")){
                el[i] = el[i]["to"+upperLower+"Case"]();
                return el
            }
        }
    }
    return el;
});
zk().setContainer(arrayUpperFirstPath+"regexp", function(el, param, upperLower){
    var i, k = el.length;
    for (i = 0; i < k; i++) {
        if (param.test(el[i])) {
            if(zk().toolbox().is(el[i], "string")){
                el[i] = el[i]["to"+upperLower+"Case"]();
                return el
            }
        }
    }
    return el;
});
/**
 * Permet de mettre en majuscule des chaînes de caractères correspondant à param.
 * @param param (number|string|regexp)
 *      - number : Les premiers éléments du tableau.
 *      - string : La première chaîne de caractères du tableau qui est égale à cette valeur.
 *      - regexp : La première chaîne de caractères du tableau correspondant à l'expression régulière.
 * @returns {Array}
 */
Array.prototype.upperFirst = function(param){ return zk().toolbox().upperFirst(this, param) };

var arrayUpperLastPath = "_ENTITY_._PARAMETERS_.array.upperLast.";
zk().setContainer(arrayUpperLastPath+"number", function (el, param, upperLower) {
    if(param < 1 ){ return el }
    var l = el.length;
    if( param > l ){ param = l }
    for(var i = l-param; i < l; i++){
        if(zk().toolbox().is(el[i], "string")){
            el[i] = el[i]["to"+upperLower+"Case"]();
        }
    }
    return el
});
zk().setContainer(arrayUpperLastPath+"string", function(el, param, upperLower){
    var i, k = el.length;
    for (i = k - 1; i > -1; i--) {
        if (el[i] == param) {
            if(zk().toolbox().is(el[i], "string")){
                el[i] = el[i]["to"+upperLower+"Case"]();
                return el
            }
        }
    }
    return el;
});
zk().setContainer(arrayUpperLastPath+"regexp", function(el, param, upperLower){
    var i, k = el.length;
    for (i = k - 1; i > -1; i--) {
        if (param.test(el[i])) {
            if(zk().toolbox().is(el[i], "string")){
                el[i] = el[i]["to"+upperLower+"Case"]();
                return el
            }
        }
    }
    return el;
});
/**
 * Permet de mettre en majuscule des chaînes de caractères correspondant à param.
 * @param param (number|string|regexp)
 *      - number : Les derniers éléments du tableau.
 *      - string : La dernière chaîne de caractères du tableau qui est égale à cette valeur.
 *      - regexp : La dernière chaîne de caractères du tableau correspondant à l'expression régulière.
 * @returns {Array}
 */
Array.prototype.upperLast = function(param){ return zk().toolbox().upperLast(this, param) };

function upperLowerTab(tab, upperLower) {
    var box = zk().toolbox();
    return box.each(tab, function(){
        var v = this.v;
        if(box.is(v, 'string')){ v = v['to' + upperLower + 'Case']() }
        return v;
    }) ;
}
Array.prototype.upperMiddle = function(){ return zk().toolbox().upperMiddle(this) };

var arrayUpperBeforePath = "_ENTITY_._PARAMETERS_.array.upperBefore.";
zk().setContainer(arrayUpperBeforePath+"other", function(el, index, upperLower){
    var box = zk().toolbox(), k = el.length;
    if(!box.is(index, "number")){ index = box.index(el, index) }
    if (index > -1) {
        if(index >= k){ index = k }
        for (var i = 0; i < index; i++){
            if(box.is(el[i], "string")){
                el[i] = el[i]["to"+upperLower+"Case"]();
            }
        }
    }
    return el;
});
/**
 * Permet de mettre en majuscule les éléments qui se situent avant index dans le tableau.
 * @param index (number|other)
 *      - number : Index du tableau.
 *      - other : Objet quelconque qui se trouve dans le tableau.
 * @returns {Array}
 */
Array.prototype.upperBefore = function(index){ return zk().toolbox().upperBefore(this, index) };

var arrayUpperAfterPath = "_ENTITY_._PARAMETERS_.array.upperAfter.";
zk().setContainer(arrayUpperAfterPath+"other", function(el, index, upperLower){
    var box = zk().toolbox(), k = el.length;
    if(!box.is(index, "number")){ index = box.index(el, index) }
    if (index > -1 && index < k) {
        for (var i = index + 1; i < k; i++){
            if(box.is(el[i], "string")){
                el[i] = el[i]["to"+upperLower+"Case"]();
            }
        }
    }
    return el;
});
/**
 * Permet de mettre en majuscule les éléments qui se situent après index dans le tableau.
 * @param index (number|other)
 *      - number : Index du tableau.
 *      - other : Objet quelconque qui se trouve dans le tableau.
 * @returns {Array}
 */
Array.prototype.upperAfter = function(index){ return zk().toolbox().upperAfter(this, index) };

var arrayUpperBetweenPath = "_ENTITY_._PARAMETERS_.array.upperBetween.";
zk().setContainer(arrayUpperBetweenPath+"array", function(el, indexes, lowerUpper){
    var box = zk().toolbox(), z, i, k, param;
    if (!box.is(indexes, 'array')) { indexes = [indexes] }
    if (indexes.length % 2) { indexes.push(el.length - 1) }
    k = indexes.length;
    for (z = 0; z < k; z += 2) {
        param = [indexes[z], indexes[z+1]];
        for (i = 0; i < 2; i++){
            if(!box.is(param[i], "number")){ param[i] = box.index(el, param[i]) }
            if(param[i] < 0){ param[i] = NaN }
        }
        if(box.is(param[0], "number") && box.is(param[1], "number")){
            param = box.nSort(param);
            el = doSlice(el, param[0] + 1, param[1], upperLowerTab(el.slice(param[0] + 1, param[1]), lowerUpper));
        }
    }
    return el;
});
/**
 * Met en majuscule une ou plusieurs plages du tableau
 * @param param (array|int)
 *      - int : Valeur de début. La taille du tableau est utilisée comme valeur complémentaire.
 *      - array : Tableau contenant des valeurs quelconques.
 * @returns {*}
 */
Array.prototype.upperBetween = function(indexes){ return zk().toolbox().upperBetween(this, indexes) };

var arrayUpperAtPath = "_ENTITY_._PARAMETERS_.array.upperAt.";
zk().setContainer(arrayUpperAtPath + "number", function (el, index, upperLower) { return zk().getContainer(arrayUpperAtPath + "array")(el, [index], upperLower) });
zk().setContainer(arrayUpperAtPath + "array", function (el, indexes, upperLower) {
    var box = zk().toolbox();
    indexes = box.removeDuplicate(indexes, true);
    box.each(indexes, function () {
        var n = this.v;
        if (box.is(n, 'number') && n > -1) {
            if (box.is(el[n], 'string')) {
                el[n] = el[n]["to"+upperLower+"Case"]()
            }
        }
    });
    return el;
});
/**
 * Permet de mettre en majuscule des éléments qui se trouvent à des index spécifiés.
 * @param indexes (int|array)
 *      - int : Index de l'élément qu'on veut obtenir. Pas de nombres négatifs.
 *      - array : Tableau d'entiers correpondants aux index des élélments qu'on souhaite obtenir.
 * @returns {Array}
 */
Array.prototype.upperAt = function(indexes){ return zk().toolbox().upperAt(this, indexes) };

var arrayUpperPath = "_ENTITY_._PARAMETERS_.array.upper.";
zk().setContainer(arrayUpperPath+"string", function(el, param, upperLower){
    return zk().toolbox().each(el,function(){
        if(this.v === param){
            return this.v["to"+upperLower+"Case"]()
        }
    });
});
zk().setContainer(arrayUpperPath+"regexp", function(el, param, upperLower){
    var box = zk().toolbox();
    return box.each(el,function(){
        if(param.test(this.v) && box.is(this.v, 'string')){
            return this.v["to"+upperLower+"Case"]()
        }
    });
});
zk().setContainer(arrayUpperPath + "number", function (el, param, upperLower) {
    var path = (param < 0 ) ? arrayUpperLastPath : arrayUpperFirstPath;
    return zk().getContainer(path+'number')(el, Math.abs(param), upperLower);
});
zk().setContainer(arrayUpperPath + "array", function (el, param, upperLower) {
    var indexes = [], box = zk().toolbox();
    box.each(param, function () {
        indexes = indexes.concat(box.indexes(el, this.v));
    });
    return zk().getContainer(arrayUpperAtPath + "array")(el, indexes, upperLower);
});
/**
 * Permet de mettre en majuscule des valeurs dans le tableau.
 * @param param (string|regexp|number|array)
 *      - string : Elément(s) à mettre en majuscule dans le tableau. On fait une égalité stricte.
 *      - regexp : Expression régulières des éléments qu'on souhaite mettre en majuscule dans le tableau.
 *      - number : Les premiers ou derniers éléments. Positif = premier   Négatif = dernier.
 *      - array : Paramètres multiples (string|regexp|number). Le résulat est obtenu en fonction du type des éléments qui se trouve dans le tableau.
 * @returns {Array}
 */
Array.prototype.upper = function(param){ return zk().toolbox().upper(this, param) };

// ========================================= LES METHODES AVEC LOWER ============================================

Array.prototype.lowerFirst = function(param){ return zk().toolbox().lowerFirst(this, param) };

Array.prototype.lowerLast = function(param){ return zk().toolbox().lowerLast(this, param) };

Array.prototype.lowerMiddle = function(){ return zk().toolbox().lowerMiddle(this) };

Array.prototype.lowerBefore = function(index){ return zk().toolbox().lowerBefore(this, index) };

Array.prototype.lowerAfter = function(index){ return zk().toolbox().lowerAfter(this, index) };

Array.prototype.lowerBetween = function(indexes){ return zk().toolbox().lowerBetween(this, indexes) };

Array.prototype.lowerAt = function(indexes){ return zk().toolbox().lowerAt(this, indexes) };

Array.prototype.lower = function(param){ return zk().toolbox().lower(this, param) };
