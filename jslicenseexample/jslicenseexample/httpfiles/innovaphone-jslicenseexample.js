
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var innovaphone = innovaphone || {};
innovaphone.jslicenseexample = innovaphone.jslicenseexample || function (start, args) {
    this.createNode("body");
    var that = this;

    var colorSchemes = {
        dark: {
            "--bg": "#191919",
            "--button": "#303030",
            "--text-standard": "#f2f5f6",
        },
        light: {
            "--bg": "white",
            "--button": "#e0e0e0",
            "--text-standard": "#4a4a49",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(innovaphone.jslicenseexampleTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    function addLine(text) {
        that.add(new innovaphone.ui1.Div("", "", "")).addText(text);
    }

    function app_connected(domain, user, dn, appdomain) {
        if (app.logindata.info.unlicensed) {
            addLine("No App License on the App Client.");
        }
        else {
            addLine("App License on the App Client OK.");
        }

        app.send({ api: "user", mt: "CheckLicenseOnClientConnection" });
    }

    function app_message(obj) {

        if (obj.api !== "user") return;

        if (obj.error) {
            addLine(obj.message);
            return;
        }

        if (obj.mt === "CheckLicenseOnClientConnectionResult") {
            if (obj.licensed === true) {
                addLine("App License on the AppWebsocket connection to the App Service OK.");
            } else {
                addLine("No App License on the AppWebsocket connection to the App Service.");
            }

            app.send({ api: "user", mt: "CheckLicenseOnPBX" });
        }


        if (obj.mt === "CheckLicenseOnPBXResult") {
            if (obj.licensed === true) {
                addLine("App License on the PBX OK.");
            } else {
                addLine("No App License on the PBX.");
            }

            if (obj.servicelics !== 0 && obj.servicelics !== null) {
                addLine("Service Licenses on the PBX: " + obj.servicelics);
            } else {
                addLine("No Service Licenses on the PBX.");
            }

            app.send({ api: "user", mt: "CheckSystemSize" });
        }

        if (obj.mt === "CheckSystemSizeResult") {
            if ("ports" in obj) {
                addLine("System size (Port Lics): " + obj.ports);
            } else if (obj.testmode === true) {
                addLine("Test Mode active.");
            }
        }
    }
};

innovaphone.jslicenseexample.prototype = innovaphone.ui1.nodePrototype;
