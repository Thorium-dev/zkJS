// @TODO : getTextFirst, getTextMiddle, getTextLast, ...
// @TODO : $({attr-id: "nom", attr-class: "rouge", text: /^a.b$/, content: /^a.b$/, name: "div", at: 3 })

var methods = {

    "getFirst": function(value){
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
    

};


zk().register(function Node($this){

    var nodes = $this.nodes;
    this.parameters = $this.parameters;
    this.toolbox = $this.toolbox;

    this.get = function (opt) {
        if (opt === undefined) { return nodes }
    };

    this.set = function (value) {
        if (value !== undefined) { return nodes = value }
        return this;
    };


}, methods, parameters);