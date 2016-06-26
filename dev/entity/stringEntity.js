function stringEntity() {
    String.prototype.each = function(func, args){ return zk().toolbox.each(this, func, args) };

    var stringIndexPath = "_ENTITY_._PARAMETERS_.string.index.";
    zk().setContainer(stringIndexPath+"other", function(){ return -1 });
    zk().setContainer(stringIndexPath+"string", function(el, value){ return el.indexOf(value) });
    zk().setContainer(stringIndexPath+"number", function(el, value){ return el.indexOf(value+"") });
    zk().setContainer(stringIndexPath+"regexp", function(el, value){
        var index = value.exec(el);
        return index ? index['index'] : -1;
    });
    String.prototype.index = function(value){ return zk().toolbox.index(this, value) };

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
        var result, indexes = [], ig = (value.ignoreCase ? "i" : "") + "g";
        value = new RegExp(value, ig);
        while ( (result = value.exec(el)) ) { indexes.push(result.index) }
        return indexes;
    });
    String.prototype.indexes = function(value){ return zk().toolbox.indexes(this, value) };

    String.prototype.lastIndex = function(value){ return zk().toolbox.lastIndex(this, value) };

    String.prototype.count = function(value){ return zk().toolbox.count(this, value) };

    String.prototype.has = function(value){ return zk().toolbox.has(this, value) };

    String.prototype.reverse = function(){ return zk().toolbox.reverse(this) };

    String.prototype.trim = function(strReg, direction){ return zk().toolbox.trim(this, strReg, direction) };

    String.prototype.camelCase = function(separators){ return zk().toolbox.camelCase(this, separators) };

    String.prototype.snakeCase = function(separators){ return zk().toolbox.snakeCase(this, separators) };

    String.prototype.linkCase = function(separators){ return zk().toolbox.linkCase(this, separators) };

// ========================================= LES METHODES AVEC GET =============================================

    var stringGetFirstPath = "_ENTITY_._PARAMETERS_.string.getFirst.";
    zk().setContainer(stringGetFirstPath+"other", function(){ return "" });
    zk().setContainer(stringGetFirstPath+"number", function(el, value){ return el.slice(0, Math.abs(value)) });
    zk().setContainer(stringGetFirstPath+"string", function(el, value){
        return zk().getContainer(stringGetFirstPath+"regexp")(el, new RegExp(value));
    });
    zk().setContainer(stringGetFirstPath+"regexp", function(el, value){ var r = el.match(value); return r ? r[0] : ''; });
    String.prototype.getFirst = function(value){ return zk().toolbox.getFirst(this, value) };

    String.prototype.getMiddle = function(){ return zk().toolbox.getMiddle(this) };

    var stringGetLastPath = "_ENTITY_._PARAMETERS_.string.getLast.";
    zk().setContainer(stringGetLastPath+"other", function(){ return "" });
    zk().setContainer(stringGetLastPath+"number", function(el, value){ return el.slice(-Math.abs(value)) });
    zk().setContainer(stringGetLastPath+"string", function(el, value){
        return zk().getContainer(stringGetLastPath+"regexp")(el, value)
    });
    zk().setContainer(stringGetLastPath+"regexp", function(el, value){
        var ig = (value.ignoreCase ? "i" : "") + "g", r = el.match(new RegExp(value, ig)); return r ? r[r.length - 1] : '';
    });
    String.prototype.getLast = function(value){ return zk().toolbox.getLast(this, value) };

    var stringGetBeforePath = "_ENTITY_._PARAMETERS_.string.getBefore.";
    zk().setContainer(stringGetBeforePath+"other", function(el, index){
        var box = zk().toolbox;
        if(!box.is(index, "string|regexp|number")){ return "" }
        if(!box.is(index, "number")){ index = box.index(el, index) }
        if(index > -1 ){ return el.slice(0,index) }
        return "";
    });
    String.prototype.getBefore = function(index){ return zk().toolbox.getBefore(this, index) };

    var stringGetAfterPath = "_ENTITY_._PARAMETERS_.string.getAfter.";
    zk().setContainer(stringGetAfterPath+"other", function(el, index){
        var box = zk().toolbox, indexType = box.is(index);
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
    String.prototype.getAfter = function(index){ return zk().toolbox.getAfter(this, index) };

    function stringBetweenIndexes(el, indexes){
        var box = zk().toolbox;
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
    zk().setContainer(stringGetBetweenPath+"array", function(el, indexes){
        var box = zk().toolbox, i, k, res = "";
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
    String.prototype.getBetween = function(indexes){ return zk().toolbox.getBetween(this, indexes) };

    var stringGetAtPath = "_ENTITY_._PARAMETERS_.string.getAt.";
    zk().setContainer(stringGetAtPath + "array", function (el, indexes){
        return zk().getContainer(arrayGetAtPath+"array")(el, indexes);
    });
    String.prototype.getAt = function(indexes){ return zk().toolbox.getAt(this, indexes) };

    var stringGetPath = "_ENTITY_._PARAMETERS_.string.get.";
    zk().setContainer(stringGetPath+"other", function(){ return "" });
    zk().setContainer(stringGetPath + "string", function(el, value){
        return zk().getContainer(stringGetPath+"regexp")(el, value);
    });
    zk().setContainer(stringGetPath + "regexp", function(el, value){
        var ig = (value.ignoreCase ? "i" : "") + "g", res = el.match(new RegExp(value, ig));
        return res ? res.join("") : "";
    });
    zk().setContainer(stringGetPath + "number", function (el, value){
        return ( value < 0 ) ? el.slice(value) : el.slice(0, value)
    });
    zk().setContainer(stringGetPath + "array", function (el, value){
        var box = zk().toolbox, res = "";
        box.each(value, function () {
            var f = zk().getContainer(stringGetPath + box.is(this.v));
            if(f){
                res += f(el, this.v);
            }
        });
        return res;

    });
    String.prototype.get = function(value){ return zk().toolbox.get(this, value) };

// ========================================= LES METHODES AVEC REMOVE =============================================

    var stringRemoveFirstPath = "_ENTITY_._PARAMETERS_.string.removeFirst.";
    zk().setContainer(stringRemoveFirstPath+"other", function (el) { return el });
    zk().setContainer(stringRemoveFirstPath+"number", function (el, value) { return (value < 1) ? el : el.slice(value) });
    zk().setContainer(stringRemoveFirstPath+"string", function(el, value){ return el.replace(new RegExp(value), "") });
    zk().setContainer(stringRemoveFirstPath+"regexp", function(el, value){
        var i = -1; return el.replace(value, function (str) { i++; return i ? str : "" })
    });
    String.prototype.removeFirst = function(value){ return zk().toolbox.removeFirst(this, value) };

    String.prototype.removeMiddle = function(){ return zk().toolbox.removeMiddle(this) };

    var stringRemoveLastPath = "_ENTITY_._PARAMETERS_.string.removeLast.";
    zk().setContainer(stringRemoveLastPath+"other", function(el){ return el });
    zk().setContainer(stringRemoveLastPath + "number", function (el, value) {
        return (value < 1) ? this : el.slice(0, -value);
    });
    zk().setContainer(stringRemoveLastPath + "string", function (el, value) {
        return zk().getContainer(stringRemoveLastPath + "regexp")(el, new RegExp(value))
    });
    zk().setContainer(stringRemoveLastPath+"regexp", function(el, value){
        var r = el.match(value);
        if (!r) { return el }
        value = r[r.length - 1];
        var i = el.lastIndexOf(value);
        return doSlice(el, i, i + value.length);
    });
    String.prototype.removeLast = function(value){ return zk().toolbox.removeLast(this, value) };

    var stringRemoveBeforePath = "_ENTITY_._PARAMETERS_.string.removeBefore.";
    zk().setContainer(stringRemoveBeforePath+"other", function(el, index){
        var before = zk().toolbox.getBefore(el, index);
        return el.slice(el.indexOf(before) + before.length);
    });
    String.prototype.removeBefore = function(index){ return zk().toolbox.removeBefore(this, index) };

    var stringRemoveAfterPath = "_ENTITY_._PARAMETERS_.string.removeAfter.";
    zk().setContainer(stringRemoveAfterPath+"other", function(el, index){
        return el.slice(0, el.lastIndexOf(zk().toolbox.getAfter(el, index)));
    });
    String.prototype.removeAfter = function(index){ return zk().toolbox.removeAfter(this, index) };

    var stringRemoveBetweenPath = "_ENTITY_._PARAMETERS_.string.removeBetween.";
    zk().setContainer(stringRemoveBetweenPath+"array", function(el, indexes){
        var box = zk().toolbox;
        if (!box.is(indexes, 'array')) { indexes = [indexes] }
        if (indexes.length % 2) { indexes.push(el.length - 1) }
        indexes = indexes.slice(0, 2);
        indexes = stringBetweenIndexes(el, indexes);
        if(indexes[0] > -1 && indexes[1] > -1){
            el = el.slice(0, indexes[0]+1) + el.slice(indexes[1]);
        }
        return el;
    });
    String.prototype.removeBetween = function(indexes){ return zk().toolbox.removeBetween(this, indexes) };

    var stringRemoveAtPath = "_ENTITY_._PARAMETERS_.string.removeAt.";
    zk().setContainer(stringRemoveAtPath + "number", function (el, indexes){
        return zk().getContainer(stringRemoveAtPath + "array")(el, [indexes])
    });
    zk().setContainer(stringRemoveAtPath + "array", function (el, indexes){
        return zk().getContainer(arrayRemoveAtPath + "array")(el, indexes)
    });
    String.prototype.removeAt = function(indexes){ return zk().toolbox.removeAt(this, indexes) };

    var stringRemovePath = "_ENTITY_._PARAMETERS_.string.remove.";
    zk().setContainer(stringRemovePath+"other", function(el){ return el });
    zk().setContainer(stringRemovePath+"string", function (el, value) {
        return zk().getContainer(stringRemovePath + "regexp")(el, value)
    });
    zk().setContainer(stringRemovePath+"regexp", function(el, value){
        var ig = (value.ignoreCase ? "i" : "") + "g";
        value = new RegExp(value, ig); return el.replace(value, "");
    });
    zk().setContainer(stringRemovePath+"number", function (el, value){
        return ( value < 0 ) ? el.slice(0, value) : el.slice(value);
    });
    zk().setContainer(stringRemovePath+"array", function (el, value){
        var box = zk().toolbox;
        box.each(value, function () {
            var type = box.is(this.v);
            if(/string|regexp|number/.test(type)){
                el = zk().getContainer(stringRemovePath + type)(el, this.v);
            }
        });
        return el
    });
    String.prototype.remove = function(value){ return zk().toolbox.remove(this, value) };

// ========================================= LES METHODES AVEC ADD =============================================

    var stringAddFirstPath = "_ENTITY_._PARAMETERS_.string.addFirst.";
    zk().setContainer(stringAddFirstPath+"other", function(el, value){
        if(zk().toolbox.is(value, "string")){ el = value + el }
        return el;
    });
    String.prototype.addFirst = function(value){ return zk().toolbox.addFirst(this, value) };

    String.prototype.addMiddle = function(value){ return zk().toolbox.addMiddle(this, value) };

    var stringAddLastPath = "_ENTITY_._PARAMETERS_.string.addLast.";
    zk().setContainer(stringAddLastPath+"other", function(el, value){
        if(zk().toolbox.is(value, "string|number")){ el += value + "" }
        return el;
    });
    String.prototype.addLast = function(value){ return zk().toolbox.addLast(this, value) };

    var stringAddBeforePath = "_ENTITY_._PARAMETERS_.string.addBefore.";
    zk().setContainer(stringAddBeforePath+"other", function(el, index, value){
        var box = zk().toolbox;
        if(!box.is(index, "number")){ index = box.index(el, index) }
        if(index > -1 ){
            if(box.is(value, "array")){ value = value.join("") }
            return doSlice(el, index, index, value)
        }
        return el;
    });
    String.prototype.addBefore = function(index, value){ return zk().toolbox.addBefore(this, index, value) };

    var stringAddAfterPath = "_ENTITY_._PARAMETERS_.string.addAfter.";
    zk().setContainer(stringAddAfterPath+"other", function(el, index, value){
        var box = zk().toolbox; index = box.getAfter(el, index);
        return index ? box.addBefore(el, index, value) : el;
    });
    String.prototype.addAfter = function(index, value){ return zk().toolbox.addAfter(this, index, value) };

// addBetween n'existe pas

    var stringAddAtPath = "_ENTITY_._PARAMETERS_.string.addAt.";
    zk().setContainer(stringAddAtPath + "array", function (el, indexes, value) {
        var box = zk().toolbox;
        if(box.is(value, "string|number")){ value = (value+"").slice(0, 1) } else { value = undefined }
        if(value !== undefined){
            if(!box.is(indexes, "array")){ indexes = [indexes] }
            indexes = box.removeDuplicate(indexes, true);
            box.each(indexes, function () {
                if(box.is(this.v, "number")){
                    el = zk().getContainer(arrayAddBeforePath+"other")(el, this.v, value);
                }
            });
        }
        return el;
    });
    String.prototype.addAt = function(indexes, value){ return zk().toolbox.addAt(this, indexes, value) };

    String.prototype.add = function(value){ return zk().toolbox.add(this, value) };


// ========================================= LES METHODES AVEC CHANGE ===========================================

    var stringChangeFirstPath = "_ENTITY_._PARAMETERS_.string.changeFirst.";
    zk().setContainer(stringChangeFirstPath+"number", function (el, oldValue, newValue) {
        if(oldValue > 0){
            if(zk().toolbox.is(newValue, "string|number")){
                el = newValue + el.slice(oldValue);
            }
        }
        return el;
    });
    zk().setContainer(stringChangeFirstPath+"other", function(el, oldValue, newValue){
        var box = zk().toolbox;
        if(box.is(oldValue, "string|regexp")){
            if(box.is(newValue, "string|number")){
                oldValue = new RegExp(oldValue);
                var i = -1;
                el = el.replace(oldValue, function (str) { i++; return i ? str : newValue });
            }
        }
        return el;
    });
    String.prototype.changeFirst = function(oldValue, newValue){ return zk().toolbox.changeFirst(this, oldValue, newValue) };

    String.prototype.changeMiddle = function(value){ return zk().toolbox.changeMiddle(this, value) };

    var stringChangeLastPath = "_ENTITY_._PARAMETERS_.string.changeLast.";
    zk().setContainer(stringChangeLastPath+"number", function (el, oldValue, newValue) {
        if(oldValue > 0){
            el = zk().getContainer(stringAddLastPath+"other")(el.slice(0, -oldValue), newValue);
        }
        return el;
    });
    zk().setContainer(stringChangeLastPath+"other", function(el, oldValue, newValue){
        var box = zk().toolbox;
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
    String.prototype.changeLast = function(oldValue, newValue){ return zk().toolbox.changeLast(this, oldValue, newValue) };

    var stringChangeBeforePath = "_ENTITY_._PARAMETERS_.string.changeBefore.";
    zk().setContainer(stringChangeBeforePath+"other", function(el, index, value){
        var box = zk().toolbox, el2 = box.removeBefore(el, index, value);
        if(el2 != el){ el = box.addFirst(el2, value) }
        return el;
    });
    String.prototype.changeBefore = function(index, value){ return zk().toolbox.changeBefore(this, index, value) };

    var stringChangeAfterPath = "_ENTITY_._PARAMETERS_.string.changeAfter.";
    zk().setContainer(stringChangeAfterPath+"other", function(el, index, value){
        var box = zk().toolbox;
        var el2 = box.removeAfter(el, index);
        if(el2 != el){ el = box.addLast(el2, value) }
        return el;
    });
    String.prototype.changeAfter = function(index, value){ return zk().toolbox.changeAfter(this, index, value) };

    var stringChangeBetweenPath = "_ENTITY_._PARAMETERS_.string.changeBetween.";
    zk().setContainer(stringChangeBetweenPath+"array", function(el, indexes, value){
        var box = zk().toolbox;
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
    String.prototype.changeBetween = function(indexes, value){ return zk().toolbox.changeBetween(this, indexes, value) };

    var stringChangeAtPath = "_ENTITY_._PARAMETERS_.string.changeAt.";
    zk().setContainer(stringChangeAtPath + "array", function (el, indexes, value) {
        var box = zk().toolbox;
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
    String.prototype.changeAt = function(indexes, value){ return zk().toolbox.changeAt(this, indexes, value) };

    var stringChangePath = "_ENTITY_._PARAMETERS_.string.change.";
    zk().setContainer(stringChangePath+"other", function(el){ return el });
    zk().setContainer(stringChangePath+"string", function(el, oldValue, newValue){
        return el.replace(new RegExp(oldValue, "g"), newValue);
    });
    zk().setContainer(stringChangePath+"regexp", function(el, oldValue, newValue){
        var ig = (oldValue.ignoreCase ? "i" : "") + "g";
        return el.replace(new RegExp(oldValue, ig), newValue);
    });
    zk().setContainer(stringChangePath + "number", function (el, oldValue, newValue) {
        return  zk().toolbox['change'+(oldValue<0?'Last':'First')](el, Math.abs(oldValue), newValue) ;
    });
    String.prototype.change = function(oldValue, newValue){ return zk().toolbox.change(this, oldValue, newValue) };

// ========================================= LES METHODES AVEC UPPER ===========================================

    var stringUpperFirstPath = "_ENTITY_._PARAMETERS_.string.upperFirst.";
    zk().setContainer(stringUpperFirstPath+"number", function (el, value, upperLower) {
        if(value > 0){
            el = (el.slice(0, value)["to"+upperLower+"Case"]()) + el.slice(value);
        }
        return el
    });
    zk().setContainer(stringUpperFirstPath+"string", function(el, value, upperLower){
        return zk().getContainer(stringUpperFirstPath+"regexp")(el, value, upperLower);
    });
    zk().setContainer(stringUpperFirstPath+"regexp", function(el, value, upperLower){
        var i = -1; return el.replace(value, function (str) { i++; return i ? str : str["to"+upperLower+"Case"]() })
    });
    String.prototype.upperFirst = function(value){ return zk().toolbox.upperFirst(this, value) };

    var stringUpperLastPath = "_ENTITY_._PARAMETERS_.string.upperLast.";
    zk().setContainer(stringUpperLastPath+"number", function (el, value, upperLower) {
        if(value > 0){ el = el.slice(0, -value) + (el.slice(-value)["to"+upperLower+"Case"]()); }
        return el
    });
    zk().setContainer(stringUpperLastPath+"string", function(el, value, upperLower){
        return zk().getContainer(stringUpperLastPath+"regexp")(el, value, upperLower);
    });
    zk().setContainer(stringUpperLastPath+"regexp", function(el, value, upperLower){
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
    String.prototype.upperLast = function(value){ return zk().toolbox.upperLast(this, value) };

    function upperLowerTab(tab, upperLower) {
        var box = zk().toolbox;
        return box.each(tab, function(){
            var v = this.v;
            if(box.is(v, 'string')){ v = v['to' + upperLower + 'Case']() }
            return v;
        }) ;
    }
    String.prototype.upperMiddle = function(){ return zk().toolbox.upperMiddle(this) };

    var stringUpperBeforePath = "_ENTITY_._PARAMETERS_.string.upperBefore.";
    zk().setContainer(stringUpperBeforePath+"other", function(el, index, upperLower){
        var box = zk().toolbox, i = -1, before = box.getBefore(el, index);
        return el.replace(before, function (str) { i++; return i ? str : str["to"+upperLower+"Case"]() })
    });
    String.prototype.upperBefore = function(index){ return zk().toolbox.upperBefore(this, index) };

    var stringUpperAfterPath = "_ENTITY_._PARAMETERS_.string.upperAfter.";
    zk().setContainer(stringUpperAfterPath+"other", function(el, index, upperLower){
        var box = zk().toolbox, after = box.getAfter(el, index);
        if(after){
            el = el.slice(el, el.indexOf(after)) + after["to"+upperLower+"Case"]()
        }
        return el;
    });
    String.prototype.upperAfter = function(index){ return zk().toolbox.upperAfter(this, index) };

    var stringUpperBetweenPath = "_ENTITY_._PARAMETERS_.string.upperBetween.";
    zk().setContainer(stringUpperBetweenPath+"array", function(el, indexes, upperLower){
        var box = zk().toolbox, i, k;
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
    String.prototype.upperBetween = function(indexes){ return zk().toolbox.upperBetween(this, indexes) };

    var stringUpperAtPath = "_ENTITY_._PARAMETERS_.string.upperAt.";
    zk().setContainer(stringUpperAtPath + "number", function (el, index, upperLower) {
        return zk().getContainer(stringUpperAtPath + "array")(el, [index], upperLower)
    });
    zk().setContainer(stringUpperAtPath + "array", function (el, indexes, upperLower) {
        var box = zk().toolbox;
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
    String.prototype.upperAt = function(indexes){ return zk().toolbox.upperAt(this, indexes) };

    var stringUpperPath = "_ENTITY_._PARAMETERS_.string.upper.";
    zk().setContainer(stringUpperPath+"string", function(el, value, upperLower){
        return zk().getContainer(stringUpperPath+"regexp")(el, value, upperLower);
    });
    zk().setContainer(stringUpperPath+"regexp", function(el, value, upperLower){
        var ig = (value.ignoreCase ? "i" : "") + "g"; value = new RegExp(value, ig);
        return el.replace(value, function (str) { return str["to"+upperLower+"Case"]() })
    });
    zk().setContainer(stringUpperPath + "number", function (el, value, upperLower) {
        var path = (value < 0 ) ? stringUpperLastPath : stringUpperFirstPath;
        return zk().getContainer(path+'number')(el, Math.abs(value), upperLower);
    });
    zk().setContainer(stringUpperPath + "array", function (el, value, upperLower) {
        var box = zk().toolbox;
        box.each(value, function () {
            var f = zk().getContainer(stringUpperPath + box.is(this.v));
            if(f){
                el = f(el, this.v, upperLower);
            }
        });
        return el;
    });
    String.prototype.upper = function(value){ return zk().toolbox.upper(this, value) };

// ========================================= LES METHODES AVEC LOWER ============================================

    String.prototype.lowerFirst = function(value){ return zk().toolbox.lowerFirst(this, value) };

    String.prototype.lowerLast = function(value){ return zk().toolbox.lowerLast(this, value) };

    String.prototype.lowerMiddle = function(){ return zk().toolbox.lowerMiddle(this) };

    String.prototype.lowerBefore = function(index){ return zk().toolbox.lowerBefore(this, index) };

    String.prototype.lowerAfter = function(index){ return zk().toolbox.lowerAfter(this, index) };

    String.prototype.lowerBetween = function(indexes){ return zk().toolbox.lowerBetween(this, indexes) };

    String.prototype.lowerAt = function(indexes){ return zk().toolbox.lowerAt(this, indexes) };

    String.prototype.lower = function(value){ return zk().toolbox.lower(this, value) };

}
stringEntity();