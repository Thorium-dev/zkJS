zk().register(function SWITCH($this){
    var $self = this, $box = $this.toolbox, $entity = $this.entity.get;
    $box.each($this, function () { $self[this.k] = this.v });

    function insertNodeBefore(nouvEl, beforeEl) {
        var parent = beforeEl.parentNode;
        parent.insertBefore(nouvEl, beforeEl);
        return parent
    }

    this.set = function (selector) {

    };
    
    this.label = function (selector) {

    };


}, {}, {});