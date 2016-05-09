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




