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