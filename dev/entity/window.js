
zk().register(function Window($this){
    var self = this; zk().toolbox.each($this, function () { self[this.k] = this.v });



}, {

    "on": function (events, callback) {
        return forDocumentWindowOnEvent(this, events, callback, window);
    },
    "off": function (events) {
        return forNodeOffEvent(this, events, window);
    },
    "trigger": function (events) {
        return forNodeTriggerEvent(this, events, window);
    },


}, {});