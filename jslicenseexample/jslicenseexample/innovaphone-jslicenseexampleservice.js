var pbxConnections = [];
var requests = new Object();
var srccount = 1;
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

    conn_pbx.onmessage(function (msg) { // handle responses from the PBX
        var obj = JSON.parse(msg);

        if (obj.src in requests) {
            requests[obj.src](obj);
            delete requests[obj.src];
        }
    });

    conn_pbx.onclose(function () { // cleanup if PBX connection is closed
        pbxConnections.splice(pbxConnections.indexOf(conn_pbx), 1);
        conn_pbx = null;
        requests = new Object();
        srccount = 1;
        servicelics = 0;
    });
});


new JsonApi("user").onconnected(function (conn) {
    if (conn.app !== "innovaphone-jslicenseexample") return;
    conn.onmessage(function (msg) {
        var src;
        var obj = JSON.parse(msg);

        // The JsonApiConnection object represents a WebSocket connection from
        // the myApps cleint to the App Service. The property "unlicensed" is
        // set to true, in case the logged in PBX User has no App license assigned.
        //
        // https://sdk.innovaphone.com/13r3/doc/javascript/JsonApi.htm#JsonApiConnection
        // 
        if (obj.mt === "CheckLicenseOnClientConnection") {
            if (conn.unlicensed) {
                conn.send(JSON.stringify({ api: "user", mt: "CheckLicenseOnClientConnectionResult", licensed: false, message: "No App License at connection from User " + conn.sip, src: obj.src }));
            } else {
                conn.send(JSON.stringify({ api: "user", mt: "CheckLicenseOnClientConnectionResult", licensed: true, src: obj.src }));
            }
        }

        if (pbxConnections.length < 1) { // check if PBX connection is not available before handle requests
            conn.send(JSON.stringify({ api: "user", mt: obj.mt + "Result", error: true, message: "No WebSocket connection from PBX", src: obj.src }));
            return;
        }

        // To check if some specific App license as assigned to some specific
        // PBX user the message CheckAppLic of the PbxAdminApi can be used.
        //
        // https://sdk.innovaphone.com/13r3/doc/appwebsocket/PbxAdminApi.htm#CheckAppLic
        //
        if (obj.mt === "CheckLicenseOnPBX") {
            var licstring = "App(" + conn.app + ")"; // define the license string

            // define callback function for response handling first
            src = "src" + srccount++;
            requests[src] = function (obj) {
                if (obj.mt === "CheckAppLicResult") {
                    var licensed = obj.ok ? true : false; // the property "ok" is set to true if license is assigned to the user
                    conn.send(JSON.stringify({ api: "user", mt: "CheckLicenseOnPBXResult", licensed: licensed, servicelics: servicelics, src: obj.src }));
                }
            };
            // send request to the PBX
            pbxConnections[0].send(JSON.stringify({ api: "PbxAdminApi", mt: "CheckAppLic", h323: conn.sip, lic: licstring, src: src }));
        }

        // The number of installed Port Licenses is a good point to determinate
        // overall system size, in case it should affect required number of licenses.
        // 
        // The GetPbxLicenses message of the PbxAdminApi is used to list all installed licenses
        //
        // https://sdk.innovaphone.com/13r3/doc/appwebsocket/PbxAdminApi.htm#GetPbxLicenses
        //
        if (obj.mt === "CheckSystemSize") {
            // define callback function for response handling first
            src = "src" + srccount++;
            requests[src] = function (obj) {
                if (obj.mt === "GetPbxLicensesResult") {
                    if ("lic" in obj) {
                        var ports = obj.lic.filter(function (e) { return e.name === "Port" })[0].count;
                        conn.send(JSON.stringify({ api: "user", mt: "CheckSystemSizeResult", ports: ports, src: obj.src }));
                    } else {
                        // in case "lic" property is missing in the GetPbxLicensesResult
                        // the PBX is in the Test Mode or has no licenses installed
                        conn.send(JSON.stringify({ api: "user", mt: "CheckSystemSizeResult", testmode: true, src: obj.src }));
                    }
                }
            };
            // send request to the PBX
            pbxConnections[0].send(JSON.stringify({ api: "PbxAdminApi", mt: "GetPbxLicenses", src: src }));
        }
    });
});