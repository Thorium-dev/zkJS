zk().register(function Convertor($this) {
    this.parameters = $this.parameters;
    this.toolbox = $this.toolbox;
    this.entity = $this.entity;
    this.container = $this.container;
    this.number = function (value) {
        try{
            return eval(((value+"").replace(/[^\d\+\-\*\/%]+/g, "")).replace(/^(?:[^\d]+)|(?:[^\d]+)$/g, ""));
        } catch (e){
            return null;
        }
    };
    this.array = function (value) {
        return [].slice.call(value)
    };

}, {}, {});