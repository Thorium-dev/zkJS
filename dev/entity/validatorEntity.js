
zk().register(function ASSERT($this){
    var $self = this, $box = $this.toolbox;
    $box.each($this, function () { $self[this.k] = this.v });



}, {}, {});