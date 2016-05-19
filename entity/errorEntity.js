
zk().register(function Error($this){

    var nodes = $this.nodes || [];
    this.parameters = $this.parameters;
    this.toolbox = $this.toolbox;

    this.get = function (opt) {
        if (opt === undefined) { return nodes }
    };

    this.set = function (value) {
        if (value !== undefined) { return nodes = value }
        return this;
    };


}, {}, {});