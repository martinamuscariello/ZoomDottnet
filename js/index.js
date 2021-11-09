window.addEventListener('DOMContentLoaded', function(event) {
    console.log('DOM fully loaded and parsed');
    websdkready();
});

async function websdkready() {
    var testTool = window.testTool;
    if (testTool.isMobileDevice()) {
        vConsole = new VConsole();
    }
    console.log("checkSystemRequirements");
    console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

    // it's option if you want to change the WebSDK dependency link resources. setZoomJSLib must be run at first
    // if (!china) ZoomMtg.setZoomJSLib('https://source.zoom.us/1.9.9/lib', '/av'); // CDN version default
    // else ZoomMtg.setZoomJSLib('https://jssdk.zoomus.cn/1.9.9/lib', '/av'); // china cdn option 
    // ZoomMtg.setZoomJSLib('http://localhost:9999/node_modules/@zoomus/websdk/dist/lib', '/av'); // Local version default, Angular Project change to use cdn version
    ZoomMtg.setZoomJSLib('https://source.zoom.us/1.9.9/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareJssdk();

    var API_KEY = 'p4cVXkY8TKCWMtDD03-hiw';

    /**
     * NEVER PUT YOUR ACTUAL API SECRET IN CLIENT SIDE CODE, THIS IS JUST FOR QUICK PROTOTYPING
     * The below generateSignature should be done server side as not to expose your api secret in public
     * You can find an eaxmple in here: https://marketplace.zoom.us/docs/sdk/native-sdks/web/essential/signature
     */

    // testTool = window.testTool;


    fingerprint = 'f8256d37159e3faf28ae61a6406601c3';
    siteid = 116;
    meetingNr = '89014964113';
    url = 'index.html?siteid=' + siteid + '&fp=' + fingerprint + '&meeting=' + meetingNr;

    meetConfig = {
        apiKey: API_KEY,
        meetingNumber: meetingNr,
        userName: "mmg@dottnet.it",
        passWord: "merqurio",
        //leaveUrl: url,
        role: parseInt(document.getElementById('meeting_role').value, 10)
    };

    document.getElementById("meeting_number").value = meetConfig.meetingNumber;
    document.getElementById("meeting_pwd").value = meetConfig.passWord;

    document.getElementById("display_name").value = "CDN" + ZoomMtg.getJSSDKVersion()[0] + testTool.detectOS() + "#" + testTool.getBrowserInfo();

    //document.getElementById("meeting_pwd").value = testTool.getCookie("meeting_pwd");

    if (testTool.getCookie("meeting_lang")) document.getElementById("meeting_lang").value = testTool.getCookie("meeting_lang");

    document.getElementById("meeting_lang").addEventListener("change", function(e) {
        testTool.setCookie(
            "meeting_lang",
            document.getElementById("meeting_lang").value
        );
        testTool.setCookie(
            "_zm_lang",
            document.getElementById("meeting_lang").value
        );
    });


    // copy zoom invite link to mn, autofill mn and pwd.
    document.getElementById("meeting_number").addEventListener("input", function(e) {
        var tmpMn = e.target.value.replace(/([^0-9])+/i, "");
        if (tmpMn.match(/([0-9]{9,11})/)) {
            tmpMn = tmpMn.match(/([0-9]{9,11})/)[1];
        }
        var tmpPwd = e.target.value.match(/pwd=([\d,\w]+)/);
        if (tmpPwd) {
            document.getElementById("meeting_pwd").value = tmpPwd[1];
            testTool.setCookie("meeting_pwd", tmpPwd[1]);
        }
        document.getElementById("meeting_number").value = tmpMn;
        testTool.setCookie(
            "meeting_number",
            document.getElementById("meeting_number").value);
    });

    document.getElementById("clear_all").addEventListener("click", function(e) {
        testTool.deleteAllCookies();
        document.getElementById("display_name").value = "";
        document.getElementById("meeting_number").value = "";
        document.getElementById("meeting_pwd").value = "";
        document.getElementById("meeting_lang").value = "en-US";
        document.getElementById("meeting_role").value = 0;
        window.location.href = "/index.html";
    });

    document.getElementById('join_meeting').addEventListener('click', async function(e) {

        e.preventDefault();

        var meetingConfig = testTool.getMeetingConfig();
        if (!meetingConfig.mn || !meetingConfig.name) {
            alert("Meeting number or username is empty");
            return false;
        }


        console.log("CHIAMO IL SERVER");
        // generate zoom signature server side
        let response = await fetch(" here call server endpoint to generate signature  ");


        if (response.ok) { // if HTTP-status is 200-299
            // get the response body (the method explained below)
            let signature = await response.json();
            console.log("RESULT SIG: ", signature);
            console.log("LEAVE URL: ", url);
            console.log("USERNAME: ", meetConfig.userName);
            console.log("NAME: ", name);

            ZoomMtg.init({
                leaveUrl: url,
                isSupportChat: true,
                showMeetingHeader: false,
                disableJoinAudio: false,
                disableInvite: true,
                disableCORP: false,
                success: function() {
                    console.log("SUCCESS INIT");
                    ZoomMtg.join({
                        signature: signature,
                        meetingNumber: meetConfig.meetingNumber,
                        userName: name,
                        apiKey: meetConfig.apiKey,
                        userEmail: meetConfig.userName,
                        passWord: meetConfig.passWord,
                        success: function(res) {
                            $('#nav-tool').hide();
                            console.log("Meeting success");
                            $("#zmmtg-root").show();

                        },
                        error: function(res) {
                            console.log(res);
                        }
                    });
                },
                error: function(res) {
                    console.log(res);
                }
            });

        } else {
            alert("HTTP-Error: " + response.status);
        }



    });

    function copyToClipboard(elementId) {
        var aux = document.createElement("input");
        aux.setAttribute("value", document.getElementById(elementId).getAttribute('link'));
        document.body.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        document.body.removeChild(aux);
    }

    /*   // click copy jon link button
     window.copyJoinLink = function (element) {
       var meetingConfig = testTool.getMeetingConfig();
       if (!meetingConfig.mn || !meetingConfig.name) {
         alert("Meeting number or username is empty");
         return false;
       }
       var signature = ZoomMtg.generateSignature({
         meetingNumber: meetingConfig.mn,
         apiKey: API_KEY,
         apiSecret: API_SECRET,
         role: meetingConfig.role,
         success: function (res) {
           console.log(res.result);
           meetingConfig.signature = res.result;
           meetingConfig.apiKey = API_KEY;
           var joinUrl =
             testTool.getCurrentDomain() +
             "/meeting.html?" +
             testTool.serialize(meetingConfig);
           document.getElementById('copy_link_value').setAttribute('link', joinUrl);
           copyToClipboard('copy_link_value');
         },
       });*/
}