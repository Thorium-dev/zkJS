// @TODO : getTextFirst, getTextMiddle, getTextLast, ...
// @TODO : $({attr-id: "nom", attr-class: "rouge", text: /^a.b$/, content: /^a.b$/, name: "div", at: 3 })
// @TODO : Faire la fonction repeat
// @TODO : Stocker l'objet methods dans le conrainer

var doIsThisNodeByObject = {
    "name": function (node, value) {
        var name = (node.nodeName.toLowerCase()).split(" ");
        return zk().toolbox().has(name, value);
    },
    "class": function (node, value, attr) {
        attr = node.getAttribute(attr || "class");
        return attr ? zk().toolbox().has(attr.split(" "), value) : false;
    },
    "id": function (node, value) {
        return this.class(node, value, "id")
    },
    "text": function (node, value) {
        var text = node.textContent;
        return zk().toolbox().has(text, value) || false;
    },
};
/**
 * Permet de savoir si l'élément node correspond aux caractéristiques selector
 *
 * @param {nodeelement} node
 * @param {object} selector
 * @return {boolean}
 * @since 1.0
 */
function isThisNode(node, selector) {
    var isOk = false, box = zk().toolbox();
    if (box.is(selector, "string")) {
        var parent = node.parentNode;
        if (!parent) {
            return false
        }
        var children = parent.querySelectorAll(selector);
        if (!children) {
            return false
        }
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
                    if (doIsThisNodeByObject.hasOwnProperty(k)) {
                        if (doIsThisNodeByObject[k](node, v)) {
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


function nodeGetFirstLast(el, value, firstLast) {
    if (value === undefined) {
        value = 1
    }
    var f = el.parameters["get" + firstLast][el.toolbox.is(value)];
    el.set(f ? f(el, value) : []);
    return el;
}
function nodeGetBeforeAfter(el, value, beforeAfter) {
    if (value !== undefined) {
        var f = el.parameters["remove" + beforeAfter][el.toolbox.is(value)];
        el.set(f ? f(el, value) : []);
    }
    return el;
}
function nodeRemoveFirstLast(el, value, firstLast) {
    if (value === undefined) { value = 1 }
    var f = el.parameters["remove" + firstLast][el.toolbox.is(value)];
    el.set(f ? f(el, value) : []);
    return el;
}
var methods = {

        "each": function (callback, args) {
            return zk().toolbox().each(this, callback, args)
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
            return zk().toolbox().lastIndex(this, value)
        },
        "count": function (value) {
            return zk().toolbox().count(this, value)
        },
        "has": function (value) {
            return zk().toolbox().has(this, value)
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
        "getBefore": function (value) {
            return nodeGetBeforeAfter(this, value, "Before")
        },
        "getAfter": function (value) {
            return nodeGetBeforeAfter(this, value, "After")
        },
        "getBetween": function (indexes) {
            var box = zk().toolbox(), $this = this, res = [];
            if (!box.is(indexes, 'array')) {
                indexes = [indexes]
            }
            if (indexes.length % 2) {
                indexes.push(el.length - 1)
            }

            box.each(indexes, function () {
                if (!box.is(this.v, "number")) {
                    res.push($this.toolbox.index($this, this.v));
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
            var nodes = this.toolbox.getMiddle(this.get());
            this.toolbox.each(nodes, function () {
                this.v.parentNode.removeChild(this.v)
            });
            return this.toolbox.removeMiddle(this.get())
        },
        "removeLast": function (value) {
            return nodeRemoveFirstLast(this, value, "Last")
        },
        "removeBefore": function (value) {
            return nodeRemoveFirstLast(this, value, "Before")
        },
        "removeAfter": function (value) {
            return nodeRemoveFirstLast(this, value, "After")
        },
        "removeBetween": function (indexes) {
            var box = zk().toolbox(), $this = this, res = [];
            if (!box.is(indexes, 'array')) {
                indexes = [indexes]
            }
            if (indexes.length % 2) {
                indexes.push(el.length - 1)
            }

            box.each(indexes, function () {
                if (!box.is(this.v, "number")) {
                    res.push($this.toolbox.index($this, this.v));
                }
            });
            $this.set($this.toolbox.getBetween($this.get(), res));
            return $this;
        },
        "removeAt": function (indexes) {
            this.set(this.toolbox.getAt(this.get(), indexes));
            return this;
        },

 };

var parameters = {

    // index
    "index.string": function ($this, selector) {
        var index = -1;
        $this.toolbox.each($this.get(), function () {
            if (isThisNode(this.v, selector)) {
                index = this.i;
                return $this.entity.get("Error")
            }
        });
        return index
    },
    "index.object": function ($this, selector) {
        return $this.parameters.index.string($this, selector);
    },
    "index.nodeelement": function ($this, nodeelement) {
        var index = -1;
        $this.toolbox.each($this.get(), function () {
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
        $this.toolbox.each($this.get(), function () {
            if (isThisNode(this.v, selector)) {
                indexes.push(this.i)
            }
        });
        return indexes
    },
    "indexes.object": function ($this, selector) {
        return $this.parameters.indexes.string($this, selector);
    },
    "indexes.nodeelement": function ($this, nodeelement) {
        var indexes = [];
        $this.toolbox.each($this.get(), function () {
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
        var nodes = $this.get(), res = [];
        $this.toolbox.each(nodes, function () {
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
        var nodes = $this.get(), res = [];
        $this.toolbox.each(nodes, function () {
            if (isThisNode(this.v, selector)) {
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
        var nodes = $this.get(), res = [];
        $this.toolbox.each(nodes, function () {
            var node = nodes[this.z], parent = node.parentNode;
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
        var nodes = $this.get(), res = [];
        $this.toolbox.each(nodes, function () {
            if (isThisNode(nodes[this.z], selector)) {
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
        var index = $this.toolbox.index($this, selector);
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
        var index = $this.toolbox.index($this, selector);
        return $this.toolbox.getAfter($this.get(), index);
    },
    "getAfter.object": function ($this, selector) {
        return $this.parameters.getAfter.string($this, selector)
    },

    // ===================================== LES METHODES AVEC REMOVE =========================================

    // removeFirst
    "removeFirst.number": function ($this, size) {
        var nodes = $this.toolbox.getFirst($this.get(), size);
        $this.toolbox.each(nodes, function () {
            this.v.parentNode.removeChild(this.v)
        });
        return $this.toolbox.removeFirst($this.get(), size)
    },
    "removeFirst.string": function ($this, selector, stringObject) {
        var nodes = $this.parameters.getFirst[stringObject || "string"]($this, selector),
            box = $this.toolbox,
            index = box.index($this, selector);
        box.each(nodes, function () {
            this.v.parentNode.removeChild(this.v)
        });
        return box.removeAt($this.get(), index)
    },
    "removeFirst.object": function ($this, selector) {
        return $this.parameters.removeFirst.string($this, selector, "object");
    },
    "removeFirst.nodeelement": function ($this, nodeelement) {
        var nodes= $this.get(), index = $this.toolbox.index($this, nodeelement);
        if(index+1){
            nodeelement.parentNode.removeChild(nodeelement);
            nodes = $this.toolbox.removeAt(nodes, index);
        }
        return nodes;
    },
    "removeFirst.node": function ($this, node) {
        var nodes = $this.get(), node = node.get()[0];
        if(node){
            nodes = $this.parameters.removeFirst.nodeelement($this, node)
        }
        return nodes
    },


    // removeLast
    "removeLast.number": function ($this, size) {
        return $this.toolbox.getLast($this.get(), size);
    },
    "removeLast.string": function ($this, selector) {
        var nodes = $this.get(), res = [];
        $this.toolbox.each(nodes, function () {
            var node = nodes[this.z], parent = node.parentNode;
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
    "removeLast.object": function ($this, selector) {
        var nodes = $this.get(), res = [];
        $this.toolbox.each(nodes, function () {
            if (isThisNode(nodes[this.z], selector)) {
                res = [nodes[this.z]];
                return $this.entity.get("Error");
            }
        });
        return res;
    },
    // removeBefore
    "removeBefore.number": function ($this, index) {
        return $this.toolbox.getBefore($this.get(), index);
    },
    "removeBefore.string": function ($this, selector) {
        var index = $this.toolbox.index($this, selector);
        return $this.toolbox.getBefore($this.get(), index);
    },
    "removeBefore.object": function ($this, selector) {
        return $this.parameters.getBefore.string($this, selector)
    },
    // removeAfter
    "removeAfter.number": function ($this, index) {
        return $this.toolbox.getAfter($this.get(), index);
    },
    "removeAfter.string": function ($this, selector) {
        var index = $this.toolbox.index($this, selector);
        return $this.toolbox.getAfter($this.get(), index);
    },
    "removeAfter.object": function ($this, selector) {
        return $this.parameters.getAfter.string($this, selector)
    },


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
        var nodes = document.querySelectorAll("*"), res = [];
        if (nodes) {
            nodes = $this.toolbox.toArray(nodes);
            $this.toolbox.each(nodes, function () {
                if (isThisNode(this.v, value)) {
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
    this.get = function (selector) {
        if (selector === undefined) {
            return nodes
        }
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