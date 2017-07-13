var express = require("express"),
    app = express();

var helper = require('sendgrid').mail;
var fromEmail = new helper.Email(process.env.FROM_EMAIL);
var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);

var push = require("./lib/push.js"),
    registerDevice = push.registerDevice,
    unregisterDevice = push.unregisterDevice;
getSubscriptions = push.getSubscriptions;
subcribeToTag = push.subcribeToTag;
unSubcribeToTag = push.unSubcribeToTag;
reportMessage = push.reportMessage;

var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
var port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

app.post('/registeremail', function (request, response) {
    console.log('Request to register a emailId ' + request.body.emailId);
    if (request.body.emailId.trim().length == 0) {
        response.end("No email Id provided. Please provide a email Id");
    }
    else if (request.body.uniqueId.trim().length == 0) {
        response.end("No unique name provided. Please provide a unique name");
    }
    else {
        registerDevice(request.body.uniqueId, request.body.emailId, function (status, responseStr) {
            response.end(responseStr);
        });
    }
});

app.post('/send', function (request, response) {
    console.log("Send message to email " + request.body.properties.id);
    console.log("Send the alert " + request.body.alert);
    console.log("Device Id is " + request.body.deviceId);
    var payload = JSON.parse(request.body.payload);
    console.log("The notification Id is " + payload.nid);
    reportMessage(request.body.deviceId, payload.nid, 'SEEN', function () { }, function () { });

    var subject = request.body.alert;
    var content = new helper.Content('text/plain', request.body.payload);
    var toEmail = new helper.Email(request.body.properties.id);
    var mail = new helper.Mail(fromEmail, subject, toEmail, content);
    var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON()
    });

    sg.API(request, function (error, response) {
        if (error) {
            console.log('Error response received');
        }
        else {
            reportMessage(request.body.deviceId, payload.nid, 'OPEN', function () { }, function () { });
        }
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
    });
    response.end();
});

app.post('/subscribe/', function (request, response) {
    var uniqueId = request.body.uniqueName;
    var tagName = request.body.tagName;
    console.log("Subscribe the emailId " + uniqueId + " to the tag " + tagName);
    subcribeToTag(uniqueId, tagName, function (code, responseStr) {
        response.statusCode = code;
        response.end(responseStr);
    });

});

app.delete('/subscribe/:uniqueId/:tagName', function (request, response) {
    var uniqueId = request.params.uniqueId;
    var tagName = request.params.tagName;
    console.log("Unsubscribe the emailId " + uniqueId + " to the tag " + tagName);
    unSubcribeToTag(uniqueId, tagName, function (code, responseStr) {
        response.statusCode = code;
        response.end(responseStr);
    });

});

app.delete('/registeremail/:unique_name', function (request, response) {
    var uniqueId = request.params.unique_name;
    console.log('Request to unregister a email id ' + uniqueId);
    unregisterDevice(uniqueId, function (code, responseStr) {
        if (code == 204) {
            response.end("Unregistered device " + uniqueId);
        }
        else {
            response.end(responseStr);
        }

    });
});

app.get('/subscriptions/:emailId', function (request, response) {
    var emailId = request.params.emailId;
    console.log('Request to get subscriptions for a emailId ' + emailId);
    getSubscriptions("email", emailId, function (code, responseStr) {
        response.statusCode = code;
        response.end(JSON.stringify(responseStr));
    });

});

app.get('/health', function (request, response) {
    console.log('The node server is up and running');
    response.end();
});

app.listen(port);
console.log("Listening on port ", port);

require("cf-deployment-tracker-client").track();
