// @TODO : getTextFirst, getTextMiddle, getTextLast, ...
// @TODO : $({attr-id: "nom", attr-class: "rouge", text: /^a.b$/, content: /^a.b$/, name: "div", at: 3 })
// @TODO : Faire la fonction repeat
// @TODO : Stocker l'objet methods dans le conrainer
// @TODO : Faire la fonction sortBy
// @TODO : Faire la fonction reverse (plus complexe que celui des tableaux)
// @TODO : Faire la fonction caret (en relation avec la position du curseur dans les input et les textarea)
// @TODO : Ajout des events lors de la création d'un objet

var doIsThisNodeByKey = {
    "name": function ($this, node, value) {
        var name = (node.nodeName.toLowerCase()).split(" ");
        return $this.toolbox.has(name, value);
    },
    "class": function ($this, node, value, attr) {
        attr = node.getAttribute(attr || "class");
        return attr ? $this.toolbox.has(attr.split(" "), value) : false;
    },
    "id": function ($this, node, value) {
        return this.class($this, node, value, "id")
    },
    "text": function ($this, node, value) {
        var text = node.textContent;
        return $this.toolbox.has(text, value) || false;
    },
};
/**
 * Permet de savoir si l'élément node correspond aux caractéristiques selector
 *
 * @param {node} $this
 * @param {nodeelement} node
 * @param {string|object} selector
 * @return {boolean}
 * @since 1.0
 */
function isThisNode($this, node, selector) {
    var isOk = false, box = $this.toolbox;
    if (box.is(selector, "string")) {
        var parent = node.parentNode;
        if (!parent) {
            return false
        }
        var children = parent.querySelectorAll(selector);
        if (!children) { return false }
        children = box.toArray(children);
        return box.has(children, node)
    } else {
        for (var k in selector) {
            var v = selector[k];
            if (selector.hasOwnProperty(k)) {
                if (/^attr\-/.test(k)) {
                    var attr = node.getAttribute(k.slice(5));
                    if (attr) {
                        attr = attr.split(" ");
                        if (box.has(attr, v)) {
                            isOk = true
                        } else {
                            return false
                        }
                    } else {
                        return false
                    }
                } else {
                    if (doIsThisNodeByKey.hasOwnProperty(k)) {
                        if (doIsThisNodeByKey[k]($this, node, v)) {
                            isOk = true
                        } else {
                            return false
                        }
                    } else {
                        return false
                    }
                }
            } else {
                return false
            }
        }
    }
    return isOk;
}

var doCreateElementByKey= {
    "class": function ($this, node, selector) {
        return node.setAttribute("class", selector["class"]);
    },
    "id": function ($this, node, selector) {
        return node.setAttribute("id", selector.id);
    },
    "text": function ($this, node, selector) {
        node.textContent = selector.text;
        return node;
    },
    "html": function ($this, node, selector) {
        node.innerHTML = selector.html;
        return node;
    },
};
function createElementByObject($this, selector) {
    var node = null, box = $this.toolbox, name = selector.name;
    if(box.is(name, "string")){ name = document.createElement(name) }
    if(box.is(name, "nodeelement")){
        node = name;
        delete selector.name;
        box.each(selector, function () {
            var k = this.k;
            if (/^attr\-/.test(k)) {
                node.setAttribute(k.slice(5), this.v);
            } else {
                if (doCreateElementByKey.hasOwnProperty(k)) {
                    node = doCreateElementByKey[k]($this, node, selector);
                }
            }
        })
    }
    return node
}
function getElementsByObject($this, element, selector) {
    var nodes = element.querySelectorAll("*"), res = [];
    if(nodes){
        $this.toolbox.each(nodes, function () {
            if (isThisNode($this, this.v, selector)) {
                res.push(this.v);
            }
        });
    }
    return res;
}


/**
 * Cette fonction permet d'insérer un élément après un autre
 * @param  {[node]} nouvEl  [Elément à ajouter]
 * @param  {[node]} afterEl [Elément après lequel l'insertion doit se faire]
 * @return {[node]}         [Elément mis à jour]
 */
function insertNodeAfter(nouvEl, afterEl) {
    var parent = afterEl.parentNode, next = afterEl.nextElementSibling;
    if (next) {
        parent.insertBefore(nouvEl, next)
    } else {
        parent.appendChild(nouvEl)
    }
    return parent;
}
function insertNodeBefore(nouvEl, beforeEl) {
    var parent = beforeEl.parentNode;
    parent.insertBefore(nouvEl, beforeEl);
    return parent
}

function nodeGetFirstLast(el, value, firstLast) {
    if (value === undefined) { value = 1 }
    var f = el.parameters["get" + firstLast][el.toolbox.is(value)];
    el.set(f ? f(el, value) : []);
    return el;
}
function nodeGetBeforeAfter(el, index, beforeAfter) {
    if (index !== undefined) {
        var f = el.parameters["get" + beforeAfter][el.toolbox.is(index)];
        el.set(f ? f(el, index) : []);
    }
    return el;
}

function nodeRemoveFirstLast(el, value, firstLast) {
    if (value === undefined) { value = 1 }
    var f = el.parameters["remove" + firstLast][el.toolbox.is(value)];
    el.set(f ? f(el, value) : el.get());
    return el;
}
function nodeRemoveBeforeAfter(el, index, beforeAfter) {
    var f = el.parameters["remove" + beforeAfter][el.toolbox.is(index)];
    el.set(f ? f(el, index) : el.get());
    return el;
}

function launchNodeFunction($this, value, func){
    var f = $this.parameters[func][$this.toolbox.is(value)];
    $this.set(f ? f($this, value) : $this.get());
    return $this;
}

var doNodeGetAttrByName = {
    "style": function ($this, attr, filter) {
        return $this.toolbox.get(attr.split(";"), filter).join(";");
    },
};
var doNodeRemoveAttrByName = {
    "style": function ($this, attr, filter) {
        var box = $this.toolbox;
        return box.trim(box.remove(attr.split(";"), filter).join(";"), " ");
    },
};
var doNodeAddAttrByName = {
    "style": function ($this, attr, value) {
        return value
    },
    "id": function ($this, attr, value) {
        return value
    },
};
var doNodeGetCssByProperty = {
    "border": function ($this, node, property) {
        var box = $this.toolbox, edge = $this.entity.get("Edge");
        box.each(["top", "right", "bottom", "left"], function () {
            edge[this.v](window.getComputedStyle(node, null).getPropertyValue(property + "-" + this.v));
        });
        return edge
    },
    "border-style": function ($this, node, property) {
        var box = $this.toolbox, edge = $this.entity.get("Edge");
        box.each(["top", "right", "bottom", "left"], function () {
            edge[this.v](window.getComputedStyle(node, null).getPropertyValue("border-" + this.v + "-" + property.split("-")[1]));
        });
        return edge
    },
    "border-width": function ($this, node, property) {
        return doNodeGetCssByProperty["border-style"]($this, node, property)
    },
    "border-color": function ($this, node, property) {
        return doNodeGetCssByProperty["border-style"]($this, node, property)
    },
    "margin": function ($this, node, property) {
        return doNodeGetCssByProperty.border($this, node, property)
    },
    "padding": function ($this, node, property) {
        return doNodeGetCssByProperty.border($this, node, property)
    },
};

/**
 * Cette permet d'obtenir les coordonnées d'un élément dans tout le document
 * @param node
 * @param what = Left ou Top
 * @returns {number}
 */
function nodeXYintoDocument(node, what) {
    var val = 0;
    do {
        val += node["offset"+what];
    } while (node = node.offsetParent);
    return val
}

var methods = {

        "each": function (callback, args) {
            return this.toolbox.each(this, callback, args)
        },
        "index": function (value) {
            var f = this.parameters.index[this.toolbox.is(value)];
            return f ? f(this, value) : -1;
        },
        "indexes": function (value) {
            var f = this.parameters.indexes[this.toolbox.is(value)];
            return f ? f(this, value) : [];
        },
        "lastIndex": function (value) {
            var indexes = this.indexes(value), l = indexes.length;
            return l ? indexes[l - 1] : -1;
        },
        "count": function (value) {
            return this.indexes(value).length
        },
        "has": function (value) {
            return (this.index(value) + 1) ? true : false
        },
        /**
         * Permet d'obtenir ou de définir la position d'un élément par rapport au bord gauche du document.
         *
         * @method x
         * @param {string} [value] Valeur à définir.
         * @return {number|Node|null}
         * @since 1.0
         */
        "x": function (value) {
            if(value === undefined){
                var node = this.get()[0], x = null;
                if(node){ x = nodeXYintoDocument(node, "Left") }
                return x
            }else {
                this.style("left", value);
                return this
            }
        },
        /**
         * Permet d'obtenir la  position à gauche de l'élément par rapport à son parent.
         *
         * @method innerX
         * @param {string} [value] Valeur à définir.
         * @return {number|Node|null}
         * @since 1.0
         */
        "innerX": function (value) {
            if(value === undefined){
                var node = this.get()[0], x = null;
                if(node){ x = node.offsetLeft }
                return x
            }else{
                this.style("left", value);
                return this
            }
        },

        // ===================================== LES METHODES AVEC GET =========================================

        "getFirst": function (value) {
            return nodeGetFirstLast(this, value, "First")
        },
        "getMiddle": function () {
            var nodes = this.toolbox.getMiddle(this.get());
            this.set(nodes);
            return this
        },
        "getLast": function (value) {
            return nodeGetFirstLast(this, value, "Last")
        },
        "getBefore": function (index) {
            return nodeGetBeforeAfter(this, index, "Before")
        },
        "getAfter": function (index) {
            return nodeGetBeforeAfter(this, index, "After")
        },
        "getBetween": function (indexes) {
            var box = this.toolbox, $this = this, res = [];
            if (!box.is(indexes, 'array')) { indexes = [indexes] }
            if (indexes.length % 2) { indexes.push(el.length - 1) }
            box.each(indexes, function () {
                if (!box.is(this.v, "number")) {
                    res.push($this.index(this.v));
                }
            });
            $this.set($this.toolbox.getBetween($this.get(), res));
            return $this;
        },
        "getAt": function (indexes) {
            this.set(this.toolbox.getAt(this.get(), indexes));
            return this;
        },

        // ===================================== LES METHODES AVEC REMOVE =========================================

        "removeFirst": function (value) {
            return nodeRemoveFirstLast(this, value, "First")
        },
        "removeMiddle": function () {
            var box = this.toolbox, nodes = box.getMiddle(this.get());
            box.each(nodes, function () {
                this.v.parentNode.removeChild(this.v)
            });
            return box.removeMiddle(this.get())
        },
        "removeLast": function (value) {
            return nodeRemoveFirstLast(this, value, "Last")
        },
        "removeBefore": function (index) {
            return nodeRemoveBeforeAfter(this, index, "Before")
        },
        "removeAfter": function (index) {
            return nodeRemoveBeforeAfter(this, index, "After")
        },
        "removeBetween": function (indexes) {
            var $this = this, box = this.toolbox, nodes = $this.get();
            if (!box.is(indexes, 'array')) { indexes = [indexes] }
            if (indexes.length % 2) { indexes.push(el.length - 1) }
            indexes = box.each(indexes, function () {
                if (!box.is(this.v, "number")) {
                    return $this.index(this.v)
                }
            });
            nodes = box.getBetween(nodes, indexes);
            box.each(nodes, function () { this.v.parentNode.removeChild(this.v) });
            $this.set(box.removeBetween($this.get(), indexes));
            return $this;
        },
        "removeAt": function (indexes) {
            var box = this.toolbox, nodes = box.getAt(this.get(), indexes);
            box.each(nodes, function () {
                this.v.parentNode.removeChild(this.v)
            });
            this.set(box.removeAt(this.get(), indexes));
            return this;
        },
        "remove": function (value) {
            return launchNodeFunction(this, value, "remove");
        },

        // ===================================== LES METHODES AVEC ADD =========================================

        "addFirst": function (value) {
            return launchNodeFunction(this, value, "addFirst");
        },
        "addMiddle": function (value) {
            return launchNodeFunction(this, value, "addMiddle");
        },
        "addLast": function (value) {
            return launchNodeFunction(this, value, "addLast");
        },
        "addBefore": function (index, value) {
            var f = this.parameters.addBefore[this.toolbox.is(value)];
            this.set(f ? f(this, index, value) : this.get());
            return this;
        },
        "addAfter": function (index, value) {
            var f = this.parameters.addAfter[this.toolbox.is(value)];
            this.set(f ? f(this, index, value) : this.get());
            return this;
        },
        "addAt": function (indexes, value) {
            var f = this.parameters.addAt[this.toolbox.is(value)];
            this.set(f ? f(this, indexes, value) : this.get());
            return this;
        },
        "add": function (value) { return this.addLast(value) },

        // ===================================== LES METHODES AVEC MOVE =========================================

        /**
         * Permet de déplacer des éléments au début.
         *
         * @method moveFirst
         * @return {Node}
         * @since 1.0
         */
        "moveFirst": function () {
            this.each(function () {
                var v = this.all[this.z];
                var parent = v.parentNode;
                if (parent) {
                    var first = parent.children[0];
                    if(first){
                        if(first !== v){
                            insertNodeBefore(v, first)
                        }
                    }else{
                        parent.appendChild(v)
                    }
                }
            });
            return this.get();
        },
        /**
         * Permet de déplacer des éléments au milieu.
         *
         * @method moveMiddle
         * @return {Node}
         * @since 1.0
         */
        "moveMiddle": function () {
            var box = this.toolbox;
            this.each(function () {
                var v = this.v, parent = v.parentNode;
                if (parent) {
                    var middle = box.getMiddle(box.toArray(parent.children));
                    middle = middle[middle.length -1];
                    if(middle){
                        if(middle !== v){
                            insertNodeBefore(v, middle)
                        }
                    }else{
                        parent.appendChild(v)
                    }
                }
            });
            return this.get();
        },
        /**
         * Permet de déplacer des éléments à la fin.
         *
         * @method moveLast
         * @return {Node}
         * @since 1.0
         */
        "moveLast": function () {
            this.each(function () {
                var v = this.v, parent = v.parentNode;
                if(parent){ parent.appendChild(v) }
            });
            return this.get();
        },
        /**
         * Permet de déplacer des éléments à une position.
         *
         * @method moveAt
         * @param {int} index
         * @return {Node}
         * @since 1.0
         */
        "moveAt": function (index) {
            var box = this.toolbox;
            if(box.is(index, "number")){
                this.each(function () {
                    var v = this.all[this.z];
                    var parent = v.parentNode;
                    if(parent){
                        var at = box.getAt(box.toArray(parent.children), index)[0];
                        if(at){
                            if(at !== v){
                                insertNodeBefore(v, at)
                            }
                        }else{
                            parent.appendChild(v)
                        }
                    }
                });
            }
            return this.get();
        },
        /**
         * Permet de déplacer des éléments avant un autre élément.
         *
         * @method moveBefore
         * @param {*} index
         * @return {Node}
         * @since 1.0
         */
        "moveBefore": function (index) {
            var $this = this, nodes = this.get(), box = this.toolbox, isNumber = false;
            if(box.is(index, "number")){
                isNumber = true;
                nodes = box.reverse(nodes);
            }
            box.each(nodes, function () {
                var parent = this.v.parentNode;
                if(parent){
                    var i = isNumber ? index : ($this.set(parent.children).index(index));
                    $this.set(this.v).moveAt(i);
                }
            });
            return nodes;
        },
        /**
         * Permet de déplacer des éléments après un autre élément.
         *
         * @method moveAfter
         * @param {*} index
         * @return {Node}
         * @since 1.0
         */
        "moveAfter": function (index) {
            var $this = this, box = this.toolbox, nodes = box.reverse(this.get()), isNumber = false;
            if(box.is(index, "number")){ isNumber = true; }
            box.each(nodes, function () {
                var parent = this.v.parentNode;
                if(parent){
                    var i = isNumber ? index : ($this.set(parent.children).index(index));
                    $this.set(this.v).moveAt(i+1);
                }
            });
            return nodes;
        },
        /**
         * Permet de déplacer des éléments à une position.
         *
         * @method move
         * @param {int} index
         * @return {Node}
         * @since 1.0
         */
        "move": function (index) { return this.moveAt(index) },

        // ===================================== LES METHODES AVEC ATTR =========================================

        /**
         * Permet de tester si un élément possède un attribut.
         *
         * @method hasAttr
         * @param {string} name Nom de l'attribut qu'on souhaite tester.
         * @return {boolean}
         * @since 1.0
         */
        "hasAttr": function (name) {
            var has = false, node = this.get()[0];
            if(node){ has = node.hasAttribute(name) }
            return has;
        },
        /**
         * Permet d'obtenir des attributs.
         *
         * @method getAttr
         * @param {string} name Nom de l'attribut qu'on souhaite obtenir.
         * @param {*} filter Filtre sur le résultat.
         * @return {string|null}
         * @since 1.0
         */
        "getAttr": function (name, filter) {
            var node = this.get()[0], attr = node.getAttribute(name);
            if(attr){
                if(filter !== undefined){
                    if(doNodeGetAttrByName.hasOwnProperty(name)){
                        attr = doNodeGetAttrByName[name](this, attr, filter);
                    }else{
                        attr = this.toolbox.get(attr.split(" "), filter).join(" ");
                    }
                }
            }
            return attr;
        },
        /**
         * Permet de supprimer des attributs.
         *
         * @method removeAttr
         * @param {string|array} names Noms des attributs qu'on souhaite supprimer. Pour les chaînes de caractères, les valeurs doivent être séparées par des espaces ou des virgules.
         * @param {*} filter Permet de cibler des valeurs paritculières.
         * @return {Node}
         * @since 1.0
         */
        "removeAttr": function (names, filter) {
            var $this = this, box = $this.toolbox;
            if(box.is(names, "string")){ names = names.split(/[ ,]/) }
            if(!box.is(names, "array")){ names = [names] }
            box.each(names, function () {
                var name = this.v;
                $this.each(function () {
                    var v = this.v;
                    if(v.hasAttribute(name)){
                        if(filter !== undefined){
                            var attr = v.getAttribute(name);
                            if(doNodeRemoveAttrByName.hasOwnProperty(name)){
                                attr = doNodeRemoveAttrByName[name]($this, attr, filter);
                            }else{
                                attr = box.remove(attr.split(" "), filter).join(" ");
                            }
                            if(attr){ v.setAttribute(name, attr) } else { v.removeAttribute(name) }
                        }else{
                            v.removeAttribute(name)
                        }
                    }
                });
            });
            return this;
        },
        /**
         * Permet d'ajouter des attributs.
         *
         * @method addAttr
         * @param {string|array} names Noms des attributs qu'on souhaite ajouter. Pour les chaînes de caractères, les valeurs doivent être séparées par des espaces ou des virgules.
         * @param {string|number|boolean} value Valeur de l'attribut qu'on souhaite ajouter.
         * @return {Node}
         * @since 1.0
         */
        "addAttr": function (names, value) {
            var $this = this, box = $this.toolbox;
            if(box.is(value, "string|number|boolean")){
                if(box.is(names, "string")){ names = names.split(/[ ,]/) }
                if(!box.is(names, "array")){ names = [names] }
                box.each(names, function () {
                    var name = this.v;
                    $this.each(function () {
                        var v = this.v, attr = value;
                        if(v.hasAttribute(name)){
                            attr = v.getAttribute(name);
                            if(doNodeAddAttrByName.hasOwnProperty(name)){
                                attr = doNodeAddAttrByName[name]($this, attr, value);
                            }else{
                                attr = box.add(box.remove(attr.split(" "), value), value).join(" ");
                            }
                        }
                        v.setAttribute(name, attr);
                    });
                });
            }
            return this;
        },
        /**
         * Permet d'obtenir ou d'ajouter des attributs.
         *
         * @method attr
         * @param {string|array} names
         * @param {string|number|boolean} value
         * @return {string|null|Node}
         * @since 1.0
         */
        "attr": function (names, value) {
            if(value === undefined){ return this.getAttr(names) }
            return this.addAttr(names, value)
        },
    
        // ===================================== LES METHODES AVEC CLASS =========================================

        /**
         * Permet de tester si un élément possède une classe.
         *
         * @method hasClass
         * @param {*} value
         * @return {boolean}
         * @since 1.0
         */
        "hasClass": function (value) {
            var has = this.getAttr("class");
            return has ? this.toolbox.has(has.split(" "), value) : false;
        },
        /**
         * Permet d'obtenir des class.
         *
         * @method getClass
         * @param {*} filter Filtre sur le résultat.
         * @return {string|null}
         * @since 1.0
         */
        "getClass": function (filter) {
            return this.getAttr("class", filter);
        },
        /**
         * Permet de supprimer des class.
         *
         * @method removeClass
         * @param {*} filter Permet de cibler des valeurs paritculières.
         * @return {Node}
         * @since 1.0
         */
        "removeClass": function (filter) {
            return this.removeAttr("class", filter);
        },
        /**
         * Permet d'ajouter des attributs.
         *
         * @method addClass
         * @param {string|number|boolean} value Valeur qu'on souhaite ajouter.
         * @return {Node}
         * @since 1.0
         */
        "addClass": function (value) {
            return this.addAttr("class", value);
        },
        /**
         * Permet d'obtenir ou d'ajouter des class.
         *
         * @method class
         * @param {string|number|boolean} value
         * @return {string|null|Node}
         * @since 1.0
         */
        "class": function (value) {
            return this.attr("class", value);
        },

        // ===================================== LES METHODES AVEC CSS =========================================

        /**
         * Permet d'obtenir des styles calculés par les navigateurs.
         *
         * @method getCss
         * @param {string} property Propriété du style.
         * @return {string|Edge|null}
         * @since 1.0
         */
        "getCss": function (property) {
            var prop = null, node = this.get()[0];
            if(node){
                if(doNodeGetCssByProperty.hasOwnProperty(property)){
                    prop = doNodeGetCssByProperty[property](this, node, property);
                }else {
                    prop = window.getComputedStyle(node, null).getPropertyValue(property);
                }
            }
            return prop
        },
        /**
         * Permet de supprimer des propriétés définies dans l'attribut style.
         *
         * @method removeCss
         * @param {string|array} properties Propriétés qu'on souhaite supprimer.
         * @return {Node}
         * @since 1.0
         */
        "removeCss": function (properties) {
            var box = this.toolbox;
            if(box.is(properties, "string")){ properties = properties.split(/[ ,]/) }
            if(!box.is(properties, "array")){ properties = [properties] }
            this.each(function () {
                var v = this.v;
                box.each(properties, function () {
                    var property = box.camelCase(""+this.v, "-");
                    v.style[property] = "";
                });
            });
            return this
        },
        /**
         * Permet d'ajouter des styles en passant par l'attribut style.
         *
         * @method addCss
         * @param {string} property Propriété du style.
         * @param {string} value Valeur qu'on souhaite ajouter.
         * @return {Node}
         * @since 1.0
         */
        "addCss": function (property, value) {
            var box = this.toolbox;
            this.each(function () {
                property = box.camelCase(""+property, "-");
                this.v.style[property] = value;
            });
            return this
        },
        /**
         * Permet d'obtenir ou d'ajouter des styles en passant par l'attribut style.
         *
         * @method css
         * @param {string} [property]
         * @param {string} [value]
         * @return {string|Edge|Node|null}
         * @since 1.0
         */
        "css": function (property, value) {
            if(property === undefined){ return this.getAttr("style") }
            if(value === undefined){ return this.getCss(property) }
            return this.addCss(property, value)
        },

        // ===================================== LES METHODES AVEC STYLE =========================================

        /**
         * Permet de tester si un élément possède une propriété dans l'attribut style.
         *
         * @method hasStyle
         * @param {string} property Propriété du style à tester.
         * @return {boolean}
         * @since 1.0
         */
        "hasStyle": function (property) {
            return this.getStyle(property) ? true : false;
        },
        /**
         * Permet d'obtenir des styles définies dans l'attribut style.
         *
         * @method getStyle
         * @param {string} property Propriété du style.
         * @return {string|null}
         * @since 1.0
         */
        "getStyle": function (property) {
            var $this = this, attr = this.getAttr("style") || null, box = this.toolbox;
            if(attr){
                var attrs = attr.split(";");
                box.each(attrs, function () {
                    var tab = this.v.split(":");
                    if(box.trim(tab[0]) === box.trim(property)){ attr = box.trim(tab[1]); return $this.entity.get("Error") }
                    else { attr = null }
                });
            }
            return attr
        },
        /**
         * Permet de supprimer des propriétés définies dans l'attribut style.
         *
         * @method removeStyle
         * @param {string|array} properties Propriétés qu'on souhaite supprimer.
         * @return {Node}
         * @since 1.0
         */
        "removeStyle": function (properties) {
            return this.removeCss(properties)
        },
        /**
         * Permet d'ajouter des styles en passant par l'attribut style.
         *
         * @method addStyle
         * @param {string} property Propriété du style.
         * @param {string} value Valeur qu'on souhaite ajouter.
         * @return {Node}
         * @since 1.0
         */
        "addStyle": function (property, value) {
            return this.addCss(property, value)
        },
        /**
         * Permet d'obtenir ou d'ajouter des styles en passant par l'attribut style.
         *
         * @method style
         * @param {string} [property]
         * @param {string} [value]
         * @return {string|Node|null}
         * @since 1.0
         */
        "style": function (property, value) {
            if(property === undefined){ return this.getAttr("style") }
            if(value === undefined){ return this.getStyle(property) }
            return this.addCss(property, value)
        },

    
};

var parameters = {

    // index
    "index.string": function ($this, selector) {
        var index = -1;
        $this.each(function () {
            if (isThisNode($this, this.v, selector)) {
                index = this.i;
                return $this.entity.get("Error")
            }
        });
        return index
    },
    "index.object": function ($this, selector) {
        return $this.parameters.index.string($this, selector);
    },
    "index.node": function ($this, node) {
        return $this.parameters.index.nodeelement($this, node.get()[0]);
    },
    "index.nodeelement": function ($this, nodeelement) {
        var index = -1;
        $this.each(function () {
            if (this.v === nodeelement) {
                index = this.i;
                return $this.entity.get("Error")
            }
        });
        return index
    },
    // indexes
    "indexes.string": function ($this, selector) {
        var indexes = [];
        $this.each(function () {
            if (isThisNode($this, this.v, selector)) {
                indexes.push(this.i)
            }
        });
        return indexes
    },
    "indexes.object": function ($this, selector) {
        return $this.parameters.indexes.string($this, selector);
    },
    "indexes.node": function ($this, node) {
        return $this.parameters.indexes.nodeelement($this, node.get()[0]);
    },
    "indexes.nodeelement": function ($this, nodeelement) {
        var indexes = [];
        $this.each(function () {
            if (this.v === nodeelement) {
                indexes.push(this.i);
            }
        });
        return indexes
    },

    // ===================================== LES METHODES AVEC GET =========================================

    // getFirst
    "getFirst.number": function ($this, size) {
        return $this.toolbox.getFirst($this.get(), size);
    },
    "getFirst.string": function ($this, selector) {
        var res = [];
        $this.each(function () {
            var parent = this.v.parentNode;
            if (parent && selector) {
                var children = parent.querySelectorAll(selector);
                if (children) {
                    children = $this.toolbox.toArray(children);
                    if ($this.toolbox.has(children, this.v)) {
                        res = [this.v];
                        return $this.entity.get("Error");
                    }
                }
            }
        });
        return res;
    },
    "getFirst.object": function ($this, selector) {
        var res = [];
        $this.each(function () {
            if (isThisNode($this, this.v, selector)) {
                res = [this.v];
                return $this.entity.get("Error");
            }
        });
        return res;
    },
    // getLast
    "getLast.number": function ($this, size) {
        return $this.toolbox.getLast($this.get(), size);
    },
    "getLast.string": function ($this, selector) {
        var res = [];
        $this.each(function () {
            var nodes = this.all, node = nodes[this.z], parent = node.parentNode;
            if (parent && selector) {
                var children = parent.querySelectorAll(selector);
                if (children) {
                    children = $this.toolbox.toArray(children);
                    if ($this.toolbox.has(children, node)) {
                        res = [node];
                        return $this.entity.get("Error");
                    }
                }
            }
        });
        return res;
    },
    "getLast.object": function ($this, selector) {
        var res = [];
        $this.each(function () {
            var nodes = this.all;
            if (isThisNode($this, nodes[this.z], selector)) {
                res = [nodes[this.z]];
                return $this.entity.get("Error");
            }
        });
        return res;
    },
    // getBefore
    "getBefore.number": function ($this, index) {
        return $this.toolbox.getBefore($this.get(), index);
    },
    "getBefore.string": function ($this, selector) {
        var index = $this.index(selector);
        return $this.toolbox.getBefore($this.get(), index);
    },
    "getBefore.object": function ($this, selector) {
        return $this.parameters.getBefore.string($this, selector)
    },
    // getAfter
    "getAfter.number": function ($this, index) {
        return $this.toolbox.getAfter($this.get(), index);
    },
    "getAfter.string": function ($this, selector) {
        var index = $this.index(selector);
        return $this.toolbox.getAfter($this.get(), index);
    },
    "getAfter.object": function ($this, selector) {
        return $this.parameters.getAfter.string($this, selector)
    },

    // ===================================== LES METHODES AVEC REMOVE =========================================

    // removeFirst
    "removeFirst.number": function ($this, size, isLast) {
        var nodes = $this.toolbox["get" + (isLast||"First")]($this.get(), size);
        $this.toolbox.each(nodes, function () {
            this.v.parentNode.removeChild(this.v)
        });
        return $this.toolbox["remove" + (isLast||"First")]($this.get(), size)
    },
    "removeFirst.string": function ($this, selector, isObject, isLast) {
        var nodes = $this["get" + (isLast||"First")][isObject || "string"](selector),
            box = $this.toolbox, index = $this[isLast ? "lastIndex" : "index"](selector);
        box.each(nodes, function () {
            this.v.parentNode.removeChild(this.v)
        });
        return box.removeAt($this.get(), index)
    },
    "removeFirst.object": function ($this, selector) {
        return $this.parameters.removeFirst.string($this, selector, "object");
    },
    "removeFirst.nodeelement": function ($this, nodeelement, isLast) {
        var nodes = $this.get(), index = $this[isLast ? "lastIndex" : "index"](nodeelement);
        if(index+1){
            nodeelement.parentNode.removeChild(nodeelement);
            nodes = $this.toolbox.removeAt(nodes, index);
        }
        return nodes;
    },
    "removeFirst.node": function ($this, node, isLast) {
        var nodes = $this.get(), node = node.get();
        node = isLast ? node[node.length -1] : node[0];
        if(node){
            nodes = $this.parameters.removeFirst.nodeelement($this, node, isLast)
        }
        return nodes
    },
    // removeLast
    "removeLast.number": function ($this, size) {
        return $this.parameters.removeFirst.number($this, size, "Last")
    },
    "removeLast.string": function ($this, selector) {
        return $this.parameters.removeFirst.string($this, selector, "string", "Last")
    },
    "removeLast.object": function ($this, selector) {
        return $this.parameters.removeFirst.string($this, selector, "object", "Last")
    },
    "removeLast.nodeelement": function ($this, nodeelement) {
        return $this.parameters.removeFirst.nodeelement($this, nodeelement, "Last")
    },
    "removeLast.node": function ($this, node) {
        return $this.parameters.removeFirst.node($this, node, "Last")
    },
    // removeBefore
    "removeBefore.number": function ($this, index) {
        return $this.parameters.removeFirst.number($this, index)
    },
    "removeBefore.string": function ($this, selector) {
        return $this.parameters.removeFirst.number($this, $this.index(selector))
    },
    "removeBefore.object": function ($this, selector) {
        return $this.parameters.removeBefore.string($this, selector)
    },
    "removeBefore.nodeelement": function ($this, nodeelement) {
        return $this.parameters.removeBefore.string($this, nodeelement)
    },
    "removeBefore.node": function ($this, node) {
        return $this.parameters.removeBefore.string($this, node.get()[0])
    },
    // removeAfter
    "removeAfter.number": function ($this, index) {
        return (index < 0 ) ? $this.get() :  $this.parameters.removeLast.number($this, ($this.get().length) - index - 1)
    },
    "removeAfter.string": function ($this, selector) {
        return $this.parameters.removeAfter.number($this, $this.index(selector))
    },
    "removeAfter.object": function ($this, selector) {
        return $this.parameters.removeAfter.string($this, selector)
    },
    "removeAfter.nodeelement": function ($this, nodeelement) {
        return $this.parameters.removeAfter.string($this, nodeelement)
    },
    "removeAfter.node": function ($this, node) {
        return $this.parameters.removeAfter.string($this, node.get()[0])
    },
    // remove
    "remove.undefined": function ($this) {
        $this.toolbox.each($this.get(), function () {
           this.v.parentNode.removeChild(this.v)
        });
        return [];
    },
    "remove.number": function ($this, index) {
        return $this.parameters["remove" + ((index < 0) ? "Last" : "First")].number($this, Math.abs(index));
    },
    "remove.string": function ($this, selector) {
        var box = $this.toolbox, nodes = $this.get(), indexes = $this.indexes(selector);
        box.each(indexes, function () {
            nodes[this.v].parentNode.removeChild(nodes[this.v])
        });
        return box.removeAt(nodes, indexes)
    },
    "remove.object": function ($this, selector) {
        return $this.parameters.remove.string($this, selector)
    },
    "remove.nodeelement": function ($this, nodeelement) {
        return $this.parameters.remove.string($this, nodeelement)
    },
    "remove.node": function ($this, node) {
        var indexes = [], nodes = node.get();
        $this.toolbox.each(nodes, function () {
            indexes = indexes.concat($this.indexes(this.v));
        });
        nodes = $this.get();
        $this.toolbox.each(indexes, function () {
            nodes[this.v].parentNode.removeChild(nodes[this.v])
        });
        return $this.toolbox.removeAt(nodes, indexes)
    },

    // ===================================== LES METHODES AVEC ADD =========================================

    // addFirst
    "addFirst.string": function ($this, value, isMove) {
        var box = $this.toolbox, values = document.querySelectorAll(value);
        if(values){
            values = box.reverse(box.toArray(values));
            box.each(values, function () {
                $this.parameters[(isMove||"add")+"First"].nodeelement($this, this.v);
            })
        }
        return $this.get();
    },
    "addFirst.object": function ($this, value) {
        value = createElementByObject($this, value);
        return value ? $this.parameters.addFirst.nodeelement($this, value) : $this.get();
    },
    "addFirst.nodeelement": function ($this, value) {
        var nodes = $this.get();
        $this.toolbox.each(nodes, function () {
            var cloneNode = value.cloneNode(true);
            if(this.v.children.length){
                insertNodeBefore(cloneNode, this.v.children[0])
            }else{
                this.v.appendChild(cloneNode)
            }
        });
        return nodes;
    },
    "addFirst.node": function ($this, value, isMove) {
        value.each(function () {
            $this.parameters[(isMove||"add")+"First"].nodeelement($this, this.all[this.z]);
        });
        return $this.get();
    },

    // addMiddle
    "addMiddle.string": function ($this, value, isMove) {
        var box = $this.toolbox, values = document.querySelectorAll(value);
        if(values){
            values = box.reverse(box.toArray(values));
            box.each(values, function () {
                $this.parameters[(isMove||"add")+"Middle"].nodeelement($this, this.v);
            })
        }
        return $this.get();
    },
    "addMiddle.object": function ($this, value) {
        value = createElementByObject($this, value);
        return value ? $this.parameters.addMiddle.nodeelement($this, value) : $this.get();
    },
    "addMiddle.nodeelement": function ($this, value) {
        var nodes = $this.get(), box = $this.toolbox;
        box.each(nodes, function () {
            var cloneNode = value.cloneNode(true);
            if(this.v.children.length){
                var middleNode = box.getMiddle(box.toArray(this.v.children));
                middleNode = middleNode[middleNode.length - 1];
                insertNodeBefore(cloneNode, middleNode)
            }
        });
        return nodes;
    },
    "addMiddle.node": function ($this, value, isMove) {
        value.each(function () {
            $this.parameters[(isMove||"add")+"Middle"].nodeelement($this, this.all[this.z]);
        });
        return $this.get();
    },

    // addLast
    "addLast.string": function ($this, value, isMove) {
        var box = $this.toolbox, values = document.querySelectorAll(value);
        if(values){
            values = box.toArray(values);
            box.each(values, function () {
                $this.parameters[(isMove||"add")+"Last"].nodeelement($this, this.v);
            })
        }
        return $this.get();
    },
    "addLast.object": function ($this, value) {
        value = createElementByObject($this, value);
        return value ? $this.parameters.addLast.nodeelement($this, value) : $this.get();
    },
    "addLast.nodeelement": function ($this, value) {
        var nodes = $this.get();
        $this.toolbox.each(nodes, function () {
            this.v.appendChild(value.cloneNode(true));
        });
        return nodes;
    },
    "addLast.node": function ($this, value, isMove) {
        value.each(function () {
            $this.parameters[(isMove||"add")+"Last"].nodeelement($this, this.v);
        });
        return $this.get();
    },

    // addAt
    "addAt.string": function ($this, indexes, value) {
        var box = $this.toolbox, values = document.querySelectorAll(value);
        if(values){
            if(!box.is(indexes, "array")){ indexes = [indexes] }
            indexes = box.nSortD(indexes);
            values = box.reverse(box.toArray(values));
            box.each(indexes, function () {
                var v = this.v;
                box.each(values, function () {
                    $this.parameters.addAt.nodeelement($this, v, this.v);
                });
            });
        }
        return $this.get();
    },
    "addAt.object": function ($this, indexes, value) {
        value = createElementByObject($this, value);
        return value ? $this.parameters.addAt.nodeelement($this, indexes, value) : $this.get();
    },
    "addAt.nodeelement": function ($this, indexes, value) {
        var nodes = $this.get(), box = $this.toolbox;
        if(!box.is(indexes, "array")){ indexes = [indexes] }
        box.each(nodes, function () {
            var v = this.v, children = box.toArray(v.children);
            if(children.length){
                var nodesAt = box.getAt(children, indexes);
                box.each(nodesAt, function () {
                    insertNodeBefore(value.cloneNode(true), this.v)
                })
            }else{
                v.appendChild(value.cloneNode(true));
            }
        });
        return nodes;
    },
    "addAt.node": function ($this, indexes, value) {
        var box = $this.toolbox;
        if(!box.is(indexes, "array")){ indexes = [indexes] }
        indexes = box.nSortD(indexes);
        box.each(indexes, function () {
            var v = this.v;
            value.each(function () {
                $this.parameters.addAt.nodeelement($this, v, this.all[this.z]);
            });
        });
        return $this.get();
    },

    // addBefore
    "addBefore.string": function ($this, index, value) {
        value = document.querySelectorAll(value);
        if(value.length){
            $this.toolbox.each(value, function () {
                $this.parameters.addBefore.nodeelement($this, index, this.v);
            });
        }
        return $this.get();
    },
    "addBefore.object": function ($this, index, value) {
        value = createElementByObject($this, value);
        return value ? $this.parameters.addBefore.nodeelement($this, index, value) : $this.get();
    },
    "addBefore.nodeelement": function ($this, index, value) {
        var nodes = $this.get(), box = $this.toolbox, indexType = box.is(index);
        box.each(nodes, function () {
            var node = $this.set(this.v.children);
            var i = (indexType === "number") ? index : box.index(node, index);
            if(i > -1){
                insertNodeBefore(value, node.get()[i])
            }
        });
        return nodes;
    },
    "addBefore.node": function ($this, index, value) {
        value.each(function () {
            $this.parameters.addBefore.nodeelement($this, index, this.v);
        });
        return $this.get();
    },

    // addAfter
    "addAfter.string": function ($this, index, value) {
        var box = $this.toolbox;
        value = document.querySelectorAll(value);
        if(value.length){
            value = box.reverse(box.toArray(value));
            box.each(value, function () {
                $this.parameters.addAfter.nodeelement($this, index, this.v);
            });
        }
        return $this.get();
    },
    "addAfter.object": function ($this, index, value) {
        value = createElementByObject($this, value);
        return value ? $this.parameters.addAfter.nodeelement($this, index, value) : $this.get();
    },
    "addAfter.nodeelement": function ($this, index, value) {
        var nodes = $this.get(), box = $this.toolbox, indexType = box.is(index);
        box.each(nodes, function () {
            var node = $this.entity.get("node").set(this.v.children);
            var i = (indexType === "number") ? index : box.lastIndex(node, index);
            if(i > -1){
                insertNodeAfter(value, node.get()[i])
            }
        });
        return nodes;
    },
    "addAfter.node": function ($this, index, value) {
        value.each(function () {
            $this.parameters.addAfter.nodeelement($this, index, this.all[this.z]);
        });
        return $this.get();
    },

    // ===================================== LES METHODES AVEC MOVE =========================================



};

var nodeDoGetByParameters = {
    "string": function ($this, selector) {
        var indexes = $this.toolbox.indexes($this, selector);
        return $this.toolbox.getAt($this.get(), indexes)
    },
    "object": function ($this, selector) {
        var indexes = $this.toolbox.indexes($this, selector);
        return $this.toolbox.getAt($this.get(), indexes)
    },

};
var nodeDoSetByParameters = {
    "string": function ($this, value) {
        var nodes = document.querySelectorAll(value);
        return nodes ? $this.toolbox.toArray(nodes) : [];
    },
    "object": function ($this, value) {
        // @TODO : Uitliser la fonction getElementsByObject
        var nodes = document.querySelectorAll("*"), res = [];
        if (nodes) {
            nodes = $this.toolbox.toArray(nodes);
            $this.toolbox.each(nodes, function () {
                if (isThisNode($this, this.v, value)) {
                    res.push(this.v)
                }
            });
        }
        return res
    },
    "array": function ($this, nodes) {
        var res = [];
        $this.toolbox.each(nodes, function () {
            if ($this.toolbox.is(this.v, "nodeelement")) {
                res.push(this.v)
            }
        });
        return res
    },
    "nodeelement": function ($this, node) {
        return [node]
    },
    "nodelist": function ($this, nodes) {
        return $this.toolbox.toArray(nodes)
    },
    "htmlcollection": function ($this, nodes) {
        return $this.toolbox.toArray(nodes)
    },
};
zk().register(function Node($this) {
    var nodes = $this.nodes || [], self = this;
    this.parameters = $this.parameters;
    this.toolbox = $this.toolbox;
    this.entity = $this.entity;
    this.container = $this.container;
    this.get = function (selector) {
        if (selector === undefined) { return nodes }
        var selType = self.toolbox.is(selector);
        if (nodeDoGetByParameters.hasOwnProperty(selType)) {
            nodes = nodeDoGetByParameters[selType](self, selector);
        }
        return self
    };
    this.set = function (value) {
        var valueType = self.toolbox.is(value);
        if (nodeDoSetByParameters.hasOwnProperty(valueType)) {
            nodes = nodeDoSetByParameters[valueType](self, value);
        }
        return self;
    };
}, methods, parameters);