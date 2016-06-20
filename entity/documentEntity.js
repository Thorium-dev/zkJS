
zk().register(function Document($this){
    var self = this; zk().toolbox.each($this, function () { self[this.k] = this.v });



}, {}, {});