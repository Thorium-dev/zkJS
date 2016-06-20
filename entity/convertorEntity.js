zk().register(function Convertor($this) {
    var self = this; zk().toolbox.each($this, function () { self[this.k] = this.v });
    this.number = function (value) {
        try{
            return eval(((value+"").replace(/[^\d\+\-\*\/%\.]+/g, "")).replace(/^(?:[^\d]+)|(?:[^\d]+)$/g, ""));
        } catch (e){
            return null;
        }
    };
    this.array = function (value) {
        return [].slice.call(value)
    };

}, {}, {});