var pbxConnections = [];
var requests = new Object();
var srccount = 1;
var jsonapi = null;
var servicelics = 0;


new PbxApi("PbxAdminApi").onconnected(function (conn_pbx) {
    pbxConnections.push(conn_pbx);
    
    // The PbxApiConnection object from the PBX App Object to the App Service
    // contains property "info"(stringifyed JSON, must be parsed) with 
    // property "lics" providing number of assigned service licenses.
    // 
    // https://sdk.innovaphone.com/13r3/doc/javascript/PbxApi.htm#PbxApiConnection
    //
    var info = JSON.parse(conn_pbx.info);
    if ("lics" in info) servicelics = info.lics;

    conn_pbx.onmessage(function (msg) {
        var obj = JSON.parse(msg);

        if (obj.src in requests) {
            requests[obj.src](obj);
            delete requests[obj.src];
        }
    });

    conn_pbx.onclose(function () {
        pbxConnections.splice(pbxConnections.indexOf(conn_pbx), 1);
        conn_pbx = null;
        requests = new Object();
        srccount = 1;
        pbx = null;
        servicelics = 0;
    });
});


new JsonApi("user").onconnected(function (conn) {

    if (conn.app !== "innovaphone-jslicenseexample") return;
    conn.onmessage(function (msg) {
        var src;
        var obj = JSON.parse(msg);

        if (pbxConnections.length < 1) {
            conn.send(JSON.stringify({ api: "user", mt: obj.mt + "Result", error: true, message: "No WebSocket connection from PBX", src: obj.src }));
            return;
        }

        if (obj.mt === "CheckLicenseOnClientConnection") {
            if (conn.unlicensed) {
                conn.send(JSON.stringify({ api: "user", mt: "CheckLicenseOnClientConnectionResult", licensed: false, message: "No App License at User Object " + conn.sip, src: obj.src }));
            } else {
                conn.send(JSON.stringify({ api: "user", mt: "CheckLicenseOnClientConnectionResult", licensed: true, src: obj.src }));
            }
        }

        if (obj.mt === "CheckLicenseOnPBX") {
            var licstring = "App(" + conn.app + ")";

            src = "src" + srccount++;
            requests[src] = function (obj) {
                if (obj.mt === "CheckAppLicResult") {
                    var licensed = obj.ok ? true : false;
                    conn.send(JSON.stringify({ api: "user", mt: "CheckLicenseOnPBXResult", licensed: licensed, servicelics: servicelics, src: obj.src }));
                }
            };
            pbxConnections[0].send(JSON.stringify({ api: "PbxAdminApi", mt: "CheckAppLic", h323: conn.sip, lic: licstring, src: src }));
        }

        if (obj.mt === "CheckSystemSize") {
            src = "src" + srccount++;
            requests[src] = function (obj) {
                if (obj.mt === "GetPbxLicensesResult") {
                    if ("lic" in obj) {
                        var ports = obj.lic.filter(function (e) { return e.name === "Port" })[0].count;
                        conn.send(JSON.stringify({ api: "user", mt: "CheckSystemSizeResult", ports: ports, src: obj.src }));
                    } else {
                        conn.send(JSON.stringify({ api: "user", mt: "CheckSystemSizeResult", testmode: true, src: obj.src }));
                    }
                }
            };
            pbxConnections[0].send(JSON.stringify({ api: "PbxAdminApi", mt: "GetPbxLicenses", src: src }));
        }
    });
});