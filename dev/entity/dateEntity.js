zk().register(function DATE($this){
    var $self = this, $box = $this.toolbox, $date = new Date();
    $box.each($this, function () { $self[this.k] = this.v });

    var settings = {
        "lang" : $self.config.get("date.lang"),
    };
    function getSetDate(nb, what){
        if(nb === undefined){ return ($date['get'+what]()+((what==='Month')?1:0))+'' }
        if ($box.is(nb, 'number')) {
            nb = Math.abs(nb);
            if (nb > 0) {
                try {
                    $date['set' + what](nb-((what==='Month')?1:0))
                } catch (e) {
                    $date.setDate(nb)
                }
            }
            return $self
        }
        if(/[\+\-]\d+/.test(nb)){
            nb = (new Function("","return " + $date['get'+what]() + nb))() ;
            try { $date['set'+what](nb) } catch (e) { $date.setDate(nb) }
        }
        return $self
    }

    this.set = function (date) {
        if(date === undefined){ return $self }
        $date = new Date(date);
        return $self
    };

    /**
     * Permet d'obtenir ou de définir la langue de la date.
     *
     * @method lang
     * @param {String} [lang] La langue à définir.
     * @return {String|DATE}
     * @since 1.0
     */
    this.lang = function (lang) {
        if(lang === undefined){ return settings.lang }
        settings.lang = lang;
        return $self;
    };

    /**
     * Permet d'obtenir ou de définir l'année. L'obtention se fait sur les deux derniers chiffres.
     *
     * @method y
     * @param {*} [year] L'année à définir. Par exemple : 2015, "+3", "-1"
     * @return {String|DATE}
     * @since 1.0
     */
    this.y = function (year) {
        var res = getSetDate(year, 'FullYear') ;
        if(year === undefined){ res = res.slice(-2)}
        return res
    };

    /**
     * Permet d'obtenir ou de définir l'année.
     *
     * @method y
     * @param {*} [year] L'année à définir. Par exemple : 2015, "+3", "-1"
     * @return {String|DATE}
     * @since 1.0
     */
    this.yy = function (year) {
        return getSetDate(year, 'FullYear') ;
    };

    /**
     * Permet d'obtenir un chiffre correspondant un jour de la semaine. 0 pour Lundi, 1 pour Mardi, ...
     *
     * @method w
     * @return {Number}
     * @since 1.0
     */
    this.w = function () { return ($date.getDay()||7)-1 };

    /**
     * Permet d'obtenir le nom du mois.
     *
     * @method M
     * @param {int} [length] Longueur de la chaîne
     * @return {String}
     * @since 1.0
     */
    this.M = function (length) {
        var m = $self.config.get("date.months." + settings.lang)[$date.getMonth()];
        if(length === undefined){ length = 3 }
        return m.slice(0,Math.abs(length))
    };

    /**
     * Permet d'obtenir le nom complet du mois.
     *
     * @method MM
     * @return {String}
     * @since 1.0
     */
    this.MM = function () {
        return $self.config.get("date.months." + settings.lang)[$date.getMonth()];
    };

    /**
     * Permet d'obtenir le nom du jour.
     *
     * @method D
     * @param {int} [length] Longueur de la chaîne
     * @return {String}
     * @since 1.0
     */
    this.D = function (length) {
        var m = $self.config.get("date.days." + settings.lang)[$self.w()];
        if(length === undefined){ length = 3 }
        return m.slice(0,Math.abs(length))
    };
    
    /**
     * Permet d'obtenir le nom complet du jour.
     *
     * @method DD
     * @return {String}
     * @since 1.0
     */
    this.DD = function () {
        return $self.config.get("date.days." + settings.lang)[$self.w()];
    };




}, {}, {});