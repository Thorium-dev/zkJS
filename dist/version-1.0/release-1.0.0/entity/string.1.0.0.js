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