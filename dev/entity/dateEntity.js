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

    var symbols = {
        "m": 'Month',
        "d": 'Date',
        "h": 'Hours',
        "i": 'Minutes',
        "s": 'Seconds',
        "l": 'Milliseconds'
    };
    $box.each(symbols, function(){
        var i = this.i, v = this.v ;
        $self[i] = function (nb) { return getSetDate(nb, v) };
        $self[i+i] = function (nb) {
            var res = getSetDate(nb, v) ;
            if (nb === undefined) {
                res = parseInt(res);
                if(res < 10){ res = "0" + res }
                res += "";
            }
            return res
        };
    });

    /**
     * Permet d'obtenir ou de définir le jour.
     *
     * @method day|d|dd
     * @param {*} [day] Le jour à définir. Par exemple : 25, "+3", "-1"
     * @return {String|DATE}
     * @since 1.0
     */
    $self.day = function(day){ return $self.dd(day) };

    /**
     * Permet d'obtenir ou de définir le mois.
     *
     * @method month|m|mm
     * @param {*} [month] Le mois à définir. Par exemple : 6, "+2", "-1"
     * @return {String|DATE}
     * @since 1.0
     */
    $self.month = function(month){ return $self.mm(month) };

    /**
     * Permet d'obtenir ou de définir l'année.
     *
     * @method year|y|yy
     * @param {*} [year] L'année à définir. Par exemple : 2015, "+3", "-1"
     * @return {String|DATE}
     * @since 1.0
     */
    $self.year = function(year){ return $self.yy(year) };

    /**
     * Permet d'obtenir ou de définir l'heure.
     *
     * @method hour|h|hh
     * @param {*} [hour] L'heure à définir. Par exemple : 8, "+3", "-1"
     * @return {String|DATE}
     * @since 1.0
     */
    $self.hour = function(hour){ return $self.hh(hour) };

    /**
     * Permet d'obtenir ou de définir les minutes.
     *
     * @method minute|i|ii
     * @param {*} [minute] La minute à définir. Par exemple : 30, "+3", "-1"
     * @return {String|DATE}
     * @since 1.0
     */
    $self.minute = function(minute){ return $self.ii(minute) };

    /**
     * Permet d'obtenir ou de définir les secondes.
     *
     * @method second|s|ss
     * @param {*} [second] Les secondes à définir. Par exemple : 45, "+3", "-1"
     * @return {String|DATE}
     * @since 1.0
     */
    $self.second = function(second){ return $self.ss(second) };

    /**
     * Permet d'obtenir ou de définir les millisecondes.
     *
     * @method millisecond|l|ll
     * @param {*} [millisecond] Les millisecondes à définir. Par exemple : 467, "+3", "-1"
     * @return {String|DATE}
     * @since 1.0
     */
    $self.millisecond = function(millisecond){ return $self.ll(millisecond) };




}, {}, {});