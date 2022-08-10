
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />

var plugin = plugin || {};
plugin.innovaphone = plugin.innovaphone || {};
plugin.innovaphone.jslicenseexamplemanager = innovaphone.jslicenseexamplemanager || function (start, item, app) {
    this.createNode("div", null, null, "item-node");
    innovaphone.lib1.loadCss(item.uri + ".css");

    var colorSchemes = {
        dark: {
            "--innovaphone-jslicenseexample-item": "#333333",
            "--innovaphone-jslicenseexample-item-text": "#f2f5f6",
            "--innovaphone-jslicenseexample-c1": "#efefef",
            "--innovaphone-jslicenseexample-c2": "#939393",
            "--innovaphone-jslicenseexample-highlight-bg": "#595959",
            "--innovaphone-jslicenseexample-input": "#191919",
            "--innovaphone-jslicenseexample-input-text": "#f2f5f6",
            "--innovaphone-jslicenseexample-button": "#191919",
            "--innovaphone-jslicenseexample-button-text": "#f2f5f6",
            "--innovaphone-jslicenseexample-button-bg": "#3D3D3D",
            "--innovaphone-jslicenseexample-green": "#7cb270",
        },
        light: {
            "--innovaphone-jslicenseexample-item": "#e9eef1",
            "--innovaphone-jslicenseexample-item-text": "#4a4a4a",
            "--innovaphone-jslicenseexample-c1": "#444444",
            "--innovaphone-jslicenseexample-c2": "#777777",
            "--innovaphone-jslicenseexample-highlight-bg": "#eaeaea",
            "--innovaphone-jslicenseexample-input": "white",
            "--innovaphone-jslicenseexample-input-text": "#4a4a49",
            "--innovaphone-jslicenseexample-button": "white",
            "--innovaphone-jslicenseexample-button-text": "#4a4a49",
            "--innovaphone-jslicenseexample-button-bg": "#CCCCCC",
            "--innovaphone-jslicenseexample-green": "#7cb270",
        }
    };

    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts, add, jslicenseexampleList, templatesList, templatesListCn, instance;

    var panel = this.add(new innovaphone.ui1.Div(null, null, "innovaphone-jslicenseexample-panel"));
    var src = new app.Src(pbx);
    var typeText = ["jslicenseexample", "jslicenseexampleadmin"];
    var typeUrl = ["/innovaphone-jslicenseexample", "/innovaphone-jslicenseexampleadmin"];
    var typeCheckmarks = [
        { web: false, websocket: false, hidden: false, pbx: false, pbxsignal: false, epsignal: false, messages: false, tableusers: false, admin: false, services: false, rcc: false },
        { web: false, websocket: false, hidden: false, pbx: false, pbxsignal: false, epsignal: false, messages: false, tableusers: false, admin: false, services: false, rcc: false }
    ];

    var copyPwd = null;
    var managerApi = start.consumeApi("com.innovaphone.manager");

    innovaphone.lib1.loadObjectScript(item.uri + "texts", function () {
        texts = new innovaphone.lib1.Languages(innovaphone.jslicenseexamplemanagertexts, start.lang);
        instance = new innovaphone.appwebsocket.Connection("ws" + item.uri.slice(4), "-", null, app.domain, instanceConnected, instanceMessage, null, null, instanceLogin);
    });


    function instanceLogin(app, challenge) {
        var src = new managerApi.Src(getlogin);
        src.send({ mt: "GetInstanceLogin", path: item.apUri.slice(0, item.apUri.lastIndexOf("/")), app: app, challenge: challenge }, item.ap);

        function getlogin(obj) {
            instance.login(obj.msg);
        }
    }

    function instanceConnected() {
        console.log("Instance Connected");
        read();
    }

    function instanceMessage(msg) {
    }

    function read() {
        panel.clear();
        var header = panel.add(new innovaphone.ui1.Div("display:flex; flex-direction:row;", null, "innovaphone-jslicenseexample-obj")).addEvent("click", onadd).testId("innovaphone-jslicenseexample-add");
        add = header.add(new innovaphone.ui1.SvgInline("position:relative; left:10px; width:20px; top:10px; height:20px; fill:var(--innovaphone-jslicenseexample-item-text); cursor:pointer", "0 0 20 20", "<path d=\'M8.24,8.24V0h3.52V8.24H20v3.52H11.76V20H8.24V11.76H0V8.24Z'/>"));
        header.add(new innovaphone.ui1.Div("padding: 5px 10px;", null, "innovaphone-jslicenseexample-label2")).addTranslation(texts, "addapp");
        jslicenseexampleList = panel.add(new innovaphone.ui1.Scrolling("position:absolute; left:0px; right:0px; top:60px; bottom:0px", -1, -1));
        copyPwd = null;
        src.send({ mt: "GetAppObjects", api: "PbxAdminApi", uri: item.httpsUri.slice(0, item.httpsUri.lastIndexOf("/")) });
    }

    function onadd() {
        panel.clear();
        var header = panel.add(new innovaphone.ui1.Div("position:absolute; box-sizing:border-box; padding:10px; width:100%; color: var(--innovaphone-jslicenseexample-c2); font-size: 18px;")).addTranslation(texts, "addapp");
        var content = panel.add(new innovaphone.ui1.Scrolling("position:absolute; width:100%; top:50px; bottom:40px; margin-top: 5px;", -1, -1, 9, "red"));
        var selection = content.add(new innovaphone.ui1.Div("position:relative; width:100%; display:flex; flex-wrap:wrap; align-content:flex-start"));
        var select = content.add(new innovaphone.ui1.Div("position:relative; width:100%; display:flex; flex-wrap:wrap; align-content:flex-start"));
        addSelect(select, 0, "jslicenseexample", "/innovaphone-jslicenseexample.png");
        addSelect(select, 1, "jslicenseexampleadmin", "/innovaphone-jslicenseexampleadmin.png");

        function addSelect(select, typeIndex, appid, iconpath) {
            if (!appid) appid = typeText[typeIndex];
            if (!iconpath) iconpath = typeUrl[typeIndex] + ".png";
            var appselect = select.add(new innovaphone.ui1.Div("width:170px;height:50px;", null, "innovaphone-jslicenseexample-choice")).addEvent("click", function () {
                select.clear();
                selection.add(new innovaphone.ui1.Div("text-align: left; background-color: transparent; font-size: 16px;", null, "innovaphone-jslicenseexample-selection")).addTranslation(texts, appid);
                new Editjslicenseexample({ type: typeIndex }, content);
            }).testId("innovaphone-jslicenseexample-" + appid);
            var appicon = appselect.add(new innovaphone.ui1.Div(null, null, "innovaphone-jslicenseexample-appicon"));
            appicon.container.style.backgroundImage = "url(" + item.uri.slice(0, item.uri.lastIndexOf("/")) + iconpath + ")";
            appicon.container.style.backgroundSize = "cover";
            appselect.add(new innovaphone.ui1.Div("position:absolute; left:50px; top:5px; height:30px;", null, "innovaphone-jslicenseexample-label2")).addTranslation(texts, appid);
        }
    }

    function pbx(msg) {
        if (msg.mt == "GetAppObjectsResult") {
            for (var i = 0; i < msg.objects.length; i++) {
                jslicenseexampleList.add(new jslicenseexample(msg.objects[i]));
            }
            templatesList = [];
            templatesListCn = [];
            src.send({ mt: "GetConfigObjects", api: "PbxAdminApi" });
        }
        else if (msg.mt == "GetConfigObjectsResult") {
            for (var i = 0; i < msg.objects.length; i++) {
                templatesListCn[templatesListCn.length] = msg.objects[i].cn;
            }
            if (templatesListCn.length > 0) src.send({ mt: "GetObject", api: "PbxAdminApi", cn: templatesListCn[0] });
        }
        else if (msg.mt == "GetObjectResult") {
            var tmpl = new Object();
            tmpl.apps = msg.apps ? msg.apps.split(",") : [];
            tmpl.cn = msg.cn;
            tmpl.guid = msg.guid;
            templatesList[templatesList.length] = tmpl;
            templatesListCn.splice(templatesListCn.indexOf(msg.cn), 1);
            if (templatesListCn.length > 0) src.send({ mt: "GetObject", api: "PbxAdminApi", cn: templatesListCn[0] });
        }
    }

    function jslicenseexample(obj) {

        if (obj.type == undefined) {
            obj.type = 0;
            if (obj.url.slice(obj.url.lastIndexOf("/")) == typeUrl[0]) obj.type = 0;
            else if (obj.url.slice(obj.url.lastIndexOf("/")) == typeUrl[1]) obj.type = 1;
        }

        this.createNode("div", null, null, "innovaphone-jslicenseexample-obj").testId("innovaphone-jslicenseexample-obj-" + obj.sip);
        this.addEvent("click", onedit);
        var appName = this.add(new innovaphone.ui1.Div("width:100px; font-size:15px; color:var(--innovaphone-jslicenseexample-item-text);", null, "innovaphone-jslicenseexample-label2")).addTranslation(texts, typeText[obj.type]);
        var header = this.add(new innovaphone.ui1.Div(null, null, "innovaphone-jslicenseexample-header"));
        var title = header.add(new Text("title", obj.title, 120, 100));
        var sip = header.add(new Text("sip", obj.sip, 120));
        var url = header.add(new Text("url", obj.url.slice(obj.url.lastIndexOf("/")), 220));

        var src = new app.Src(result);
        src.send({ mt: "GetAppLogin", api: "PbxAdminApi", challenge: "1234", app: obj.sip });
        function result(msg) {
            var isrc = new instance.Src(check);
            isrc.send({ mt: "AppCheckLogin", app: msg.app, domain: msg.domain, challenge: "1234", digest: msg.digest });
            function check(msg) {
                if (msg.ok) {
                    if (!copyPwd) copyPwd = obj.sip;
                    header.add(new innovaphone.ui1.SvgInline("position:relative; width:20px; height:20px; margin:5px; fill:var(--innovaphone-jslicenseexample-green)", "0 0 20 20", "<path d=\'M6.67,17.5,0,10.81,1.62,9.18l5.05,5.06L18.38,2.5,20,4.13Z'/>"));
                }
            }
        }
        function onedit() {
            panel.clear();
            var header = panel.add(new innovaphone.ui1.Div("position:absolute; box-sizing:border-box; padding:10px; width:100%; color: var(--innovaphone-jslicenseexample-c2); font-size: 18px;")).addTranslation(texts, "editapp");
            var content = panel.add(new innovaphone.ui1.Scrolling("position:absolute; width:100%; top:50px; bottom:40px; margin-top: 5px;", -1, -1, 9, "red"));
            new Editjslicenseexample(obj, content);
        }
    }
    jslicenseexample.prototype = innovaphone.ui1.nodePrototype;

    function Editjslicenseexample(obj, content) {
        var footer = panel.add(new innovaphone.ui1.Div("position:absolute; width:100%; bottom:0px; height:40px"));
        if (obj.guid) footer.add(new innovaphone.ui1.Div("left:10px; bottom:10px", null, "innovaphone-jslicenseexample-button")).addTranslation(texts, "del").addEvent("click", ondel).testId("innovaphone-jslicenseexample-del");
        footer.add(new innovaphone.ui1.Div("right:140px; bottom:10px", null, "innovaphone-jslicenseexample-button")).addTranslation(texts, "ok").addEvent("click", onok).testId("innovaphone-jslicenseexample-ok");
        footer.add(new innovaphone.ui1.Div("right:10px; bottom:10px", null, "innovaphone-jslicenseexample-button")).addTranslation(texts, "cancel").addEvent("click", oncancel).testId("innovaphone-jslicenseexample-cancel");

        var general = content.add(new innovaphone.ui1.Div("position:relative; display:flex; flex-wrap: wrap;"));
        var title = general.add(new ConfigText("title", obj.title, 150)).testId("innovaphone-jslicenseexample-cn");
        var sip = general.add(new ConfigText("sip", obj.sip, 150)).testId("innovaphone-jslicenseexample-sip");
        var tmp = [];
        var tmpSelected = [];
        for (var i = 0; i < templatesList.length; i++) {
            tmp[i] = general.add(new ConfigTemplate(obj.sip, templatesList[i])).testId("innovaphone-jslicenseexample-temp-" + templatesList[i].cn);
        }

        function ondel() {
            var src = new app.Src(result);
            src.send({ mt: "DeleteObject", api: "PbxAdminApi", guid: obj.guid });

            function result() {
                src.close();
                read();
            }
        }

        function onok() {
            var src = new app.Src(result);
            var pwd = innovaphone.Manager.randomPwd(16);
            tmpSelected = [];
            for (var i = 0; i < tmp.length; i++) {
                if (tmp[i].getValue()) tmpSelected[tmpSelected.length] = tmp[i].getLabel();
            }
            var appObj = { url: item.httpsUri.slice(0, item.httpsUri.lastIndexOf("/")) + typeUrl[obj.type] };
            for (var key in typeCheckmarks[obj.type]) appObj[key] = typeCheckmarks[obj.type][key];
            src.send({ mt: "UpdateObject", api: "PbxAdminApi", hide: true, critical: true, copyPwd: copyPwd, cn: title.getValue(), guid: obj.guid, h323: sip.getValue(), pwd: pwd, pseudo: { type: "app", app: appObj } });

            function result(msg) {
                if (!msg.error) {
                    if (msg.mt == "UpdateObjectResult") {
                        var sent = false;
                        if (tmp.length > 0) {
                            for (var i = 0; i < templatesList.length; i++) {
                                if (templatesList[i].cn == tmp[0].getLabel()) {
                                    var selected = tmp[0].getValue();
                                    tmp.splice(0, 1);
                                    if (selected && templatesList[i].apps.indexOf(sip.getValue()) < 0) {
                                        templatesList[i].apps[templatesList[i].apps.length] = sip.getValue();
                                        src.send({ mt: "UpdateObject", api: "PbxAdminApi", cn: templatesList[i].cn, guid: templatesList[i].guid, apps: templatesList[i].apps.join(",") });
                                        sent = true;
                                        break;
                                    }
                                    else if (!selected && templatesList[i].apps.indexOf(sip.getValue()) >= 0) {
                                        templatesList[i].apps.splice(templatesList[i].apps.indexOf(sip.getValue()), 1);
                                        src.send({ mt: "UpdateObject", api: "PbxAdminApi", cn: templatesList[i].cn, guid: templatesList[i].guid, apps: templatesList[i].apps.join(",") });
                                        sent = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if (!sent) setPwd();
                    }

                    function setPwd() {
                        src.close();
                        if (copyPwd) {
                            read();
                        }
                        else {
                            src = new managerApi.Src(result);
                            src.send({ mt: "SetInstancePassword", path: item.apUri.slice(0, item.apUri.lastIndexOf("/")), pwd: pwd }, item.ap);
                            function result() {
                                src.close();
                                read();
                            }
                        }
                    }
                }
                else {
                    title.setError(true);
                }
            }
        }

        function oncancel() {
            read();
        }
    }
    Editjslicenseexample.prototype = innovaphone.ui1.nodePrototype;

    function Text(label, text, width, lwidth) {
        this.createNode("div", "position:relative; display:flex");
        this.add(new innovaphone.ui1.Div(lwidth ? "width:" + lwidth + "px" : null, null, "innovaphone-jslicenseexample-label")).addTranslation(texts, label);
        var text = this.add(new innovaphone.ui1.Div("width:" + width + "px", text, "innovaphone-jslicenseexample-value"));
        this.set = function (t) { text.container.innerText = t; };
    }
    Text.prototype = innovaphone.ui1.nodePrototype;

    function ConfigText(label, text, width) {
        this.createNode("div", "position:relative; display:flex");
        var label = this.add(new innovaphone.ui1.Div(null, null, "innovaphone-jslicenseexample-label")).addTranslation(texts, label);
        var inputDiv = this.add(new innovaphone.ui1.Div("position:relative; width:" + width + "px"));
        var input = inputDiv.add(new innovaphone.ui1.Input(null, text, null, 100, null, "innovaphone-jslicenseexample-input"));

        this.getValue = function () { return input.getValue(); };
        this.setValue = function (value) { input.setValue(value); };
        this.testId = function (id) { input.testId(id); return this; };
        this.setError = function (on) { input.container.style.border = (on ? "1px solid red" : null); };
    }
    ConfigText.prototype = innovaphone.ui1.nodePrototype;

    function ConfigTemplate(sip, template) {
        this.createNode("div", "position:relative; display:flex; margin-right: 5px;");
        var checkbox = this.add(new innovaphone.ui1.Checkbox("position:relative; margin: 7px 0px 7px 15px; width: 20px; height:20px; background-color:var(--innovaphone-jslicenseexample-green);", false, null, "var(--innovaphone-jslicenseexample-green)", "white", "var(--innovaphone-jslicenseexample-c1)"));
        var label = this.add(new innovaphone.ui1.Div("padding: 3px 5px 3px 0px;", template.cn, "innovaphone-jslicenseexample-label"));
        if (template.apps.indexOf(sip) >= 0) checkbox.setValue(true);

        this.getValue = function () { return checkbox.getValue(); };
        this.setValue = function (value) { checkbox.setValue(value); };
        this.getLabel = function () { return label.container.innerText; };
        this.testId = function (id) { checkbox.testId(id); return this; };
        this.setError = function (on) { label.container.style.border = (on ? "1px solid red" : null); };
    }
    ConfigTemplate.prototype = innovaphone.ui1.nodePrototype;
}
plugin.innovaphone.jslicenseexamplemanager.prototype = innovaphone.ui1.nodePrototype;
