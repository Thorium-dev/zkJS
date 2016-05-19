// @TODO : getTextFirst, getTextMiddle, getTextLast, ...
// @TODO : $({attr-id: "nom", attr-class: "rouge", text: /^a.b$/, content: /^a.b$/, name: "div", at: 3 })

var doIsThisNodeByObject = {
    "name": function (node, value) {
        var name = (node.nodeName.toLowerCase()).split(" ");
        return zk().toolbox().has(name, value);
    },
    "class": function (node, value, attr) {
        attr = node.getAttribute(attr || "class");
        return zk().toolbox().has(attr.split(" "), value) || false;
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
function isThisNode(node, selector){
    var isOk = false, box = zk().toolbox();
    for(var k in selector){
        var v = selector[k];
        if (selector.hasOwnProperty(k)) {
            if(/^attr\-/.test(k)){
                var attr = node.getAttribute(k.slice(5));
                if(attr){
                    attr = attr.split(" ");
                    if(box.has(attr, v)){ isOk = true } else { return false }
                }else{
                    return false
                }
            }else{
                if(doIsThisNodeByObject.hasOwnProperty(k)){
                    if(doIsThisNodeByObject[k](node, v)){ isOk = true } else { return false }
                }else{
                    return false
                }
            }
        }else{
            return false
        }
    }
    return isOk;
}


function getFirstLast(el, value, firstLast) {
    if(value === undefined){ value = 1 }
    var f = el.parameters["get"+firstLast][el.toolbox.is(value)];
    return f ? f(el, value) : el;
}
var methods = {

    "getFirst": function(value){
        return getFirstLast(this, value, "First")
    },
    "getMiddle": function(){
        var nodes = this.toolbox.getMiddle(this.get());
        this.set(nodes);
        return this
    },
    "getLast": function(value){
        return getFirstLast(this, value, "Last")
    },


};

var parameters = {
    // getFirst
    "getFirst.number": function($this, size){
        var nodes = $this.toolbox.getFirst($this.get(), size);
        $this.set(nodes);
        return $this
    },
    "getFirst.string": function($this, selector){
        var nodes = $this.get(), res = [];
        $this.toolbox.each(nodes, function () {
            var parent = this.v.parentNode;
            if(parent && selector){
                var children = parent.querySelectorAll(selector);
                if(children){
                    children = $this.toolbox.toArray(children);
                    if($this.toolbox.has(children, this.v)){
                        res = [this.v];
                        return $this.entity.get("Error");
                    }
                }
            }
        });
        $this.set(res);
        return $this;
    },
    "getFirst.object": function($this, selector){
        var nodes = $this.get(), res = [];
        $this.toolbox.each(nodes, function () {
            if(isThisNode(this.v, selector)){
                res = [this.v];
                return $this.entity.get("Error");
            }
        });
        $this.set(res);
        return $this;
    },
    // getLast
    "getLast.number": function($this, size){
        var nodes = $this.toolbox.getLast($this.get(), size);
        $this.set(nodes);
        return $this
    },
    "getLast.string": function($this, selector){
        var nodes = $this.get(), res = [];
        $this.toolbox.each(nodes, function () {
            var node = nodes[this.z], parent = node.parentNode;
            if(parent && selector){
                var children = parent.querySelectorAll(selector);
                if(children){
                    children = $this.toolbox.toArray(children);
                    if($this.toolbox.has(children, node)){
                        res = [node];
                        return $this.entity.get("Error");
                    }
                }
            }
        });
        $this.set(res);
        return $this;
    },
    "getLast.object": function($this, selector){
        var nodes = $this.get(), res = [];
        $this.toolbox.each(nodes, function () {
            if(isThisNode(nodes[this.z], selector)){
                res = [nodes[this.z]];
                return $this.entity.get("Error");
            }
        });
        $this.set(res);
        return $this;
    },
    

};


zk().register(function Node($this){
    var nodes = $this.nodes || [];
    this.parameters = $this.parameters;
    this.toolbox = $this.toolbox;
    this.entity = $this.entity;

    this.get = function (opt) {
        if (opt === undefined) { return nodes }
    };

    this.set = function (value) {
        if (value !== undefined) { return nodes = value }
        return this;
    };


}, methods, parameters);