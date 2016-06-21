
function forDocumentWindowOnEvent($this, events, callback){
    var e = $this.event, box = $this.toolbox;
    if(!box.is(events, "string") || !box.is(callback, "function")){ return this }
    events = box.trim(events, /[ ,]/).split(/[ ,]/);
    box.each(events, function () {
        var event = this.v;
        event = event.split(".");
        var eType = event[0],
            space = (event.slice(1));
        if(eType){
            if(allEventsAlias.hasOwnProperty(eType)){
                eType = allEventsAlias[eType]
            }
            var node = document, zkID = box.generateID(document);

            if(!space[0]){ space = [eType + "-" + zkID] }
            var path = "document." + zkID + "." + eType + ".",
                functions = e.get(path + "functions") || {};
            box.each(space, function () {
                var fs = functions[this.v];
                fs = (fs || []).concat(callback);
                functions[this.v] = fs;
            });
            /**
             * functions est objet littéral qui stocke les fonctions et les noms d'espaces. Il est sous la forme :
             * {
                         *      "click506433621047": [fonction1, fonction2, ...],
                         *      "space": [fonction1, fonction2, ...],
                         *      "space2": [fonction1, fonction2, ...],
                         * }
             */
            e.set(path + "functions", functions);
            // @TODO : Traiter le cas de clickout
            var launcher = function(e) {
                e = e || window.event;
                e.stopPropagation();
                var box = zk().toolbox, zkID = box.generateID(document), eType = e.type,
                    functions = zk().event.get("document." + zkID + "." + eType + ".functions" ),
                    $this = {
                        e: e,
                        source: this,
                        target: e.srcElement || e.toElement || e.relatedTarget || e.target,
                        type: e.type,
                        related: e.relatedTarget || e[(e.type === 'mouseout') ? 'toElement' : 'fromElement']
                    };
                $this.code = undefined; $this["char"] = undefined;
                if (e.type === 'keypress' || e.type === 'keyup' || e.type === 'keydown') {
                    $this.code = e.keyCode || e.charCode;
                    $this["char"] = String.fromCharCode($this.code);
                }
                box.each(functions , function () {
                    $this.nameSpace = this.k;
                    box.each(this.v, function () {
                        if (isOverOrOutEvent.hasOwnProperty(e.type)) {
                            if (isOverOrOutEvent[e.type]($this.node, e)) {
                                this.v.apply($this);
                            }
                        }else {
                            this.v.apply($this);
                        }
                    })
                });
            };
            if (!e.get(path + "launcher")) {
                e.set(path + "launcher", launcher);
                if(node.addEventListener){
                    node.addEventListener(eType, launcher, false)
                }else {
                    node.attachEvent("on" + eType, launcher);
                }
            }
        }
    });
    return $this;
}
zk().register(function Document($this){
    var self = this; zk().toolbox.each($this, function () { self[this.k] = this.v });



}, {
    /**
     * Permet d'ajouter des évènements.
     *
     * @method on
     * @param {string} events Le nom de l'évènement. On peut indiquer un espace de nom. On peut indiquer plusieurs évènements en les séparant par des espaces ou virgules.
     * @param {function} callback Fonction qui sera exécutée par l'évènement.
     * @return {Document}
     * @since 1.0
     */
    "on": function (events, callback) {
        return forDocumentWindowOnEvent(this, events, callback);
    },







}, {});