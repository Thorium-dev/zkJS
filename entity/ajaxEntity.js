
zk().register(function Ajax($this){
    var self = this, xhr = null, box = $this.toolbox;
    box.each($this, function () { self[this.k] = this.v });

    var settings = {
        "method": "GET",
        "datas": {},
        "headers": {'X-Requested-With': 'XMLHttpRequest'},
        "url": null,
        "type": "text",
        "state": {},
        "status": {},
        "success": null,
        "error": null,
    },
        xhrMethodType = {
        "GET": function () {
            var datas = "";
            box.each(settings.datas, function () {
                datas += "&" + this.k + "=" + encodeURIComponent(this.v);
            });
            datas = datas.slice(1);
            xhr.open("GET", settings.url + "?" + datas, true);
            box.each(settings.headers, function () { xhr.setRequestHeader(this.k, this.v) });
            xhr.send(null);
        },
        "POST": function () {
            xhr.open("POST", settings.url, true);
            box.each(settings.headers, function () { xhr.setRequestHeader(this.k, this.v) });
            xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            var datas = "";
            box.each(settings.datas, function () {
                datas += "&" + this.k + "=" + this.v;
            });
            datas = datas.slice(1);
            xhr.send(datas);
        }
    },
        getResponseByType = {
        "text": function () {
            return xhr.responseText
        },
        "xml": function () {
            return xhr.responseXML || xhr.responseText;
        },
        "html": function () {
            return this.xml()
        },
        "array": function () {
            var rep = xhr.responseText;
            try { rep = eval(rep) } catch (e) { console.log(e) }
            return rep
        },
        "json": function () {
            var rep = xhr.responseText;
            try { rep = JSON.parse(rep) } catch (e) { console.log(e) }
            return rep
        },
        "node": function () {
            var rep = this.json();
            if(box.is(rep, "object")){
                rep = createElementByObject($this, rep);
            }
            return rep || xhr.responseText
        },
    },
        convertXhrState = {
        "0": "init",
        "1": "create",
        "2": "send",
        "3": "beforeDone",
        "4": "done"
    },
        allXhrState = {
        "init": 0,
        "create": 1,
        "beforeSend": 1,
        "send": 2,
        "afterSend": 3,
        "beforeDone": 3,
        "done": 4,
    };

    if (window.XMLHttpRequest || window.ActiveXObject) {
        if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch(e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        } else {
            xhr = new XMLHttpRequest();
        }
    }

    this.send = function () {
        if(xhr){
            settings.headers["Content-Type"] = "text/" + settings.type;
            settings.headers["X-Requested-With"] = "XMLHttpRequest";
            xhrMethodType[settings.method]();
            xhr.onreadystatechange = function() {
                var request = {};
                request.method = settings.method;
                request.datas = settings.datas;
                request.datas = settings.datas;
                request.url = settings.url;
                request.type = settings.type;
                request.state = null;
                request.status = null;
                request.headers = xhr.getAllResponseHeaders();
                request.textResponse = xhr.responseText;
                request.xmlResponse = xhr.responseXML;
                request.state = xhr.readyState;
                request.status = xhr.status;
                var state = settings.state[convertXhrState[xhr.readyState]];
                if(state){ state.apply(request) }
                var status = settings.status[xhr.status];
                if(status){ status.apply(request) }
                if (xhr.readyState == 4) {
                    if(xhr.status == 200 || xhr.status == 0){
                        request.response = getResponseByType[request.type]();
                        var success = settings.success;
                        if(success){ success.apply(request) }
                    }else {
                        var error = settings.error;
                        if(error){ error.apply(request) }
                    }
                }
            };
        }
        return self
    };

    this.method = function (value) {
        value = (value + "").toUpperCase();
        if(xhrMethodType.hasOwnProperty(value)){
            settings.method = value;
        }
        return self;
    };

    this.datas = function (name, value) {
        var nameType = box.is(name);
        if (nameType === "string") { settings.datas[name] = value }
        if(nameType === "object"){ settings.datas = name; }
        return self;
    };

    this.headers = function (name, value) {
        var nameType = box.is(name);
        if (nameType === "string") { settings.headers[name] = value }
        if(nameType === "object"){ settings.headers = name; }
        return self;
    };

    this.url = function (url) {
        settings.url = url;
        return self
    };

    this.type = function (value) {
        if(getResponseByType.hasOwnProperty(value)){
            settings.type = value;
        }
        return self
    };

    this.state = function (name, callback) {
        var nameType = box.is(name);
        if (nameType !== "string") {
            nameType = {};
            nameType[name] = callback;
            name = nameType;
            nameType = "object";
        }else { settings.state = {}; }
        if (nameType === "object") {
            box.each(name, function () {
                if(allXhrState.hasOwnProperty(this.k)){
                    var state = allXhrState[this.k];
                    state = convertXhrState[state];
                    if(box.is(this.v, "function")){
                        settings.state[state] = this.v;
                    }
                }
            });
        }
        return self;
    };

    this.status = function (code, callback) {
        var codeType = box.is(code);
        if (codeType !== "object") {
            codeType = {};
            codeType[code] = callback;
            code = codeType;
            codeType = "object";
        }else { settings.status = {}; }
        if (codeType === "object") {
            box.each(code, function () {
                if(box.is(this.v, "function")){
                    settings.status[this.k + ""] = this.v;
                }
            });
        }
        return self;
    };

    this.success = function (callback) {
        if(box.is(callback, "function")){
            settings.success = callback;
        }
        return self
    };

    this.error = function (callback) {
        if(box.is(callback, "function")){
            settings.error = callback;
        }
        return self
    };

    this.done = function (callback) {
        if(box.is(callback, "function")){
            settings.state.done = callback;
        }
        return self
    };



    // 0 : L'objet XHR a été créé, mais pas encore initialisé (la méthode open n'a pas encore été appelée)
    // 1 : L'objet XHR a été créé, mais pas encore envoyé (avec la méthode send )
    // 2 : La méthode send vient d'être appelée
    // 3 : Le serveur traite les informations et a commencé à renvoyer des données
    // 4 : Le serveur a fini son travail, et toutes les données sont réceptionnées


}, {}, {});