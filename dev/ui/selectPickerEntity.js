// @TODO : Faire les fonctions add, remove et sort
zk().register(function SELECTPICKER($this){
    var $self = this, $box = $this.toolbox, $entity = $this.entity.get,
        $container, $items, $hasSelect, $select, $options, $label, $header, $allChecked, $search, $multiple = true, $active = null;
    $box.each($this, function () { $self[this.k] = this.v });

    function insertNodeBefore(nouvEl, beforeEl) {
        var parent = beforeEl.parentNode;
        parent.insertBefore(nouvEl, beforeEl);
        return parent
    }
    function init() {
        $container = $entity("Node").create({
            "name": "div",
            "class": "zk-selectpicker-container",
            "html": "<div class='zk-selectpicker-header'><input type='checkbox'><label for=''>All</label><input type='text'></div><ul></ul>",
        });
        $container.display("none").absolute().ID(true);
        var container = $container.get()[0];
        $header = $entity("Node").set(container.querySelector(".zk-selectpicker-header"));
        $allChecked = $entity("Node").set(container.querySelector("[type='checkbox']"));
        $allChecked.on("click.zkSelectPickerAllClickEvent", function () {
            var checked = this.source.checked;
            // @TODO : Modifier la fonction parent dans nodeEntity pour résoudre ce problème.
            var items = $container.get()[0].querySelectorAll(".zk-selectpicker-items");
            $box.each(items, function () {
                var node = $entity("Node").set(this.v);
                if(checked){
                    node.class("zk-selectpicker-item-selected");
                }else {
                    node.removeClass("zk-selectpicker-item-selected");
                }
            });
        });
        $search = $entity("Node").set(container.querySelector("[type='text']"));
        $search.on("input.zkSelectPickerSearchInputEvent", function () {
            var val = new RegExp(this.source.value, "i");
            // @TODO : Modifier la fonction parent dans nodeEntity pour résoudre ce problème.
            var items = $container.get()[0].querySelectorAll(".zk-selectpicker-items");
            $box.each(items, function () {
                var node = $entity("Node").set(this.v);
                if(!val.test(node.attr("data-zk-value"))){
                    node.display("none");
                }else {
                    node.display("block");
                }
            });
        });
        $items = $entity("Node").set(container.querySelector("ul"));
        $hasSelect = false, $select = null, $options = null, $label = null;
    }
    init();

    var $events = {
        "select": null,
        "unSelect": null,
        "show": null,
        "hide": null,
    };

    // $header.get()[0].querySelector("input[type='checkbox']").disabled = true;

    /**
     * Permet de définir l'élément select à utiliser. Fonctionne que si un élément select est défini.
     *
     * @method set
     * @param {*} selector Sélecteur pour un élément select.
     * @return {SELECTPICKER}
     * @since 1.0
     */
    this.set = function (selector) {
        if(!$hasSelect){
            var nodes = $entity("Node").set(selector);
            nodes.each(function () {
                if((this.v.nodeName).toLowerCase() === "select"){
                    $select = $entity("Node").set(this.v); $hasSelect = true;
                    return $entity("Error");
                }
            });
            if($hasSelect){
                $select.hide();
                var select = $select.get()[0];
                insertNodeBefore($container.get()[0], select);
                $options = $entity("Node").set(select.options);
                $options.each(function () {
                    $items.add({
                        "name": "li",
                        "class": "zk-selectpicker-items",
                        "html": this.v.innerHTML,
                        "data-zk-index": this.i,
                        "data-zk-value": this.v.value || this.v.innerHTML
                    });
                });
                $items.children().on("click.zkSelectPickerItemsClickEvent", function () {
                    if(!$multiple){
                        if($active){
                            $active.removeClass("zk-selectpicker-item-selected");
                        }
                    }
                    $active = $entity("Node").set(this.source).toggleClass("zk-selectpicker-item-selected");
                    // var index = parseInt($active.attr("data-zk-index"), 10);
                    $options.get()[parseInt($active.attr("data-zk-index"), 10)].selected = true;
                    this["selectPicker"] = $self;
                    this["selectPickerContainer"] = $container.get();
                    this["selectPickerItems"] = $items.get();
                    this["selectPickerSelect"] = $select.get();
                    this["selectPickerOptions"] = $options.get();
                    this["selectPickerHeader"] = $header.get();
                    this["selectPickerLabel"] = $label.get();
                    if(!$active.hasClass("zk-selectpicker-item-selected")){
                        $allChecked.get()[0].checked = false;
                        if($events.unSelect){
                            this["selectPickerEvent"] = "unSelect";
                            $events.unSelect.apply(this, []);
                        }
                    }else {
                        if($events.select){
                            this["selectPickerEvent"] = "select";
                            $events.select.apply(this, []);
                        }
                    }
                });
                $container.on("clickout.zkSelectPickerClickoutEvent", function () {
                    $entity("Node").set(this.source).hide();
                });
            }
        }
        return $self;
    };

    /**
     * Permet d'obtenir ou de définir le label du selectPicker.
     *
     * @method label
     * @param {*} selector Sélecteur pour le label.
     * @return {SELECTPICKER}
     * @since 1.0
     */
    this.label = function (selector) {
        if(selector === undefined){ return $label }
        if($label){
            $label.removeAttr("data-zk-id data-zk-ref").removeClass("zk-selectpicker-label");
            $label.off("click.zkSelectPickerLabelClickEvent");
        }
        $label = $entity("Node").set(selector).ID(true).class("zk-selectpicker-label");
        $label.attr("data-zk-ref", $container.ID());
        $container.attr("data-zk-ref", $label.ID());
        $label.on("click.zkSelectPickerLabelClickEvent", function () { $container.show() });
        return $self;
    };

    /**
     * Permet d'obtenir les valeurs sélectionnées ou de définir des valeurs à sélectionner.
     *
     * @method val
     * @param {*} [values] Valeurs à sélectionner.
     * @return {array|SELECTPICKER}
     * @since 1.0
     */
    this.val = function (values) {
        if(values === undefined){
            var res = [];
            if($hasSelect){
                $items.each(function () {
                    if($entity("Node").set(this.v).hasClass("zk-selectpicker-item-selected")){
                        res.push(this.v.getAttribute("data-zk-value"))
                    }
                });
            }
            return res;
        }
        if($hasSelect){
            if(!$box.is(values, "array")){ values = [values]; }
            $items.each(function () {
                if($box.has(values, this.v.getAttribute("data-zk-value"))){
                    $entity("Node").set(this.v).addClass("zk-selectpicker-item-selected")
                }
            });
        }
        return $self;
    };

    /**
     * Permet d'afficher le selectPicker.
     *
     * @method show
     * @param {string} [x] Position d'un élément par rapport au bord gauche du document.
     * @param {string} [y] Position d'un élément par rapport au bord supérieur du document.
     * @return {SELECTPICKER}
     * @since 1.0
     */
    this.show = function (x, y) {
        if($hasSelect){
            $container.show(x, y);
            if($events.show){
                $events.show.apply({
                    "selectPicker": $self,
                    "selectPickerContainer": $container.get(),
                    "selectPickerItems": $items.get(),
                    "selectPickerSelect": $select.get(),
                    "selectPickerOptions": $options.get(),
                    "selectPickerLabel": $label.get(),
                    "selectPickerHeader": $header.get(),
                    "selectPickerEvent": "show",
                }, []);
            }
        }
        return $self;
    };

    /**
     * Permet de cacher le selectPicker.
     *
     * @method hide
     * @return {SELECTPICKER}
     * @since 1.0
     */
    this.hide = function () {
        if ($hasSelect) {
            $container.hide();
            if($events.hide){
                $events.hide.apply({
                    "selectPicker": $self,
                    "selectPickerContainer": $container.get(),
                    "selectPickerItems": $items.get(),
                    "selectPickerSelect": $select.get(),
                    "selectPickerOptions": $options.get(),
                    "selectPickerLabel": $label.get(),
                    "selectPickerHeader": $header.get(),
                    "selectPickerEvent": "hide",
                }, []);
            }
        }
        return $self;
    };

    /**
     * Permet d'afficher ou de masquer l'en-tête.
     *
     * @method header
     * @param {boolean} show true pour afficher et false pour masquer.
     * @return {SELECTPICKER}
     * @since 1.0
     */
    this.header = function (show) {
        if(show === true){ $header.show() }
        if(show === false){ $header.hide() }
        return $self;
    };

    /**
     * Permet de détruire le selectPicker.
     *
     * @method destroy
     * @return {SELECTPICKER}
     * @since 1.0
     */
    this.destroy = function () {
        $allChecked.off("click.zkSelectPickerAllClickEvent");
        $search.off("input.zkSelectPickerSearchInputEvent");
        if($hasSelect){
            $items.off("click.zkSelectPickerItemsClickEvent");
            $container.off("clickout.zkSelectPickerClickoutEvent").remove();
        }
        if($label){
            $label.removeAttr("data-zk-id data-zk-ref").removeClass("zk-selectpicker-label");
            $label.off("click.zkSelectPickerLabelClickEvent");
        }
        init();

        return $self;
    };

    /**
     * Permet d'ajouter des évènements.
     *
     * @method on
     * @param {string} event Le nom de l'évènement.
     * @param {function} callback Fonction qui sera exécutée par l'évènement.
     * @return {SELECTPICKER}
     * @since 1.0
     */
    this.on = function (event, callback) {
        if($events.hasOwnProperty(event)){
            if($box.is(callback, "function")){
                $events[event] = callback;
            }
        }
        return $self;
    };

    /**
     * Permet de supprimer des évènements.
     *
     * @method off
     * @param {string} event Le nom de l'évènement.
     * @return {SELECTPICKER}
     * @since 1.0
     */
    this.off = function (event) {
        if($events.hasOwnProperty(event)){
            $events[event] = null;
        }
        return $self;
    };

    this.multiple = function (multiple) {
        $multiple = (multiple === true) ? true : false;
        if($multiple){
            $allChecked.removeAttr("disabled");
        }else {
            $allChecked.get()[0].checked = false;
            var items = $container.get()[0].querySelectorAll(".zk-selectpicker-items");
            var one = 0;
            $box.each(items, function () {
                var node = $entity("Node").set(this.v);
                if(node.hasClass("zk-selectpicker-item-selected")){
                    if(one){
                        node.removeClass("zk-selectpicker-item-selected")
                    }else {
                        one = 1;
                    }
                }
            });
        }
        return $self;
    };

}, {}, {});