// @TODO : getTextFirst, getTextMiddle, getTextLast, ...
// @TODO : $({attr-id: "nom", attr-class: "rouge", text: /^a.b$/, content: /^a.b$/, name: "div", at: 3 })

var methods = {

    "getFirst": function(value){
        if(value === undefined){ value = 1 }
        var f = this.parameters.getFirst[this.toolbox.is(value)];
        return f ? f(this, value) : this;
    },


};

var parameters = {

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