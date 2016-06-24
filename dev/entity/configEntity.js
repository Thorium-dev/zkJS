
zk().register(function Config($this){
    var self = this; zk().toolbox.each($this, function () { self[this.k] = this.v });



}, {}, {});