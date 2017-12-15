var azure=require('azure');
var serviceBusService = azure.createServiceBusService("Endpoint=sb://hectagon.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=vnrg/O9fqvuLaCFeSBcgmug8XzXIgdMeWZPiPLfzq6s=");

var sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

var message = {
    body: '',
    customProperties: {
        messagenumber: 0
    }
}

module.exports.createTopic = function (req, res) {
    serviceBusService.createTopicIfNotExists('orders',function(error){
        if(!error){
            // Topic was created or exists
            console.log('topic created or exists.');
            sendJsonResponse(res, 200, "topic created or exists");
        }
    });
};

var createMelbourneSubscription = function (req, res) {
    serviceBusService.createSubscription('orders', 'MelbourneMessages', function(error){
        if(!error){
            sendJsonResponse(res, 200, "subscription created");
        }
    });
    var rule={
        deleteDefault: function(){
            serviceBusService.deleteRule('orders', 'MelbourneMessages',
                azure.Constants.ServiceBusConstants.DEFAULT_RULE_NAME,
            rule.handleError);
        },
        create: function(){
            var ruleOptions = {
                sqlExpressionFilter: 'branch == Melbourne'
            };
            rule.deleteDefault();
            serviceBusService.createRule('orders',
                'MelbourneMessages',
                'MelbourneMessageFilter',
                ruleOptions,
                rule.handleError);
        },
        handleError: function(error){
            if(error){
                console.log(error);
            }
        }
    }
};

var createSydneySubscription = function (req, res) {
    serviceBusService.createSubscription('orders', 'SydneyMessages', function(error){
        if(!error){
            sendJsonResponse(res, 200, "subscription created");
        }
    });
    var rule={
        deleteDefault: function(){
            serviceBusService.deleteRule('orders', 'SydneyMessages',
                azure.Constants.ServiceBusConstants.DEFAULT_RULE_NAME,
            rule.handleError);
        },
        create: function(){
            var ruleOptions = {
                sqlExpressionFilter: 'branch == Sydney'
            };
            rule.deleteDefault();
            serviceBusService.createRule('orders',
                'SydneyMessages',
                'SydneyMessageFilter',
                ruleOptions,
                rule.handleError);
        },
        handleError: function(error){
            if(error){
                console.log(error);
            }
        }
    }
};

module.exports.createsubscription = function (req, res) {
    if(req.query.branch=="Sydney")
    {
        createMelbourneSubscription(req, res);
    } else if (req.query.branch=="Melbourne") {
        createSydneySubscription(req,res);
    } else {
        sendJsonResponse(res, 400, "Please provide either Melbourne or Sydney branch on URL");
    }
};

var MelbourneMessage = {
        body: 'This is the message',
        customProperties: {
            branch: 'Melbourne' 
        }
    };

var SydneyMessage = {
    body: 'This is the message',
    customProperties: {
        branch: 'Sydney'
    }
};

var sendOrderMessage = function (req, res, message) {
    serviceBusService.sendTopicMessage('orders', message, function(error) {
        if (error) {
            console.log(error);
          } else {
              console.log("message sent");
              sendJsonResponse(res, 200, "message sent");
          }
    })
};

module.exports.sendmessage = function (req, res) {
    if(req.query.branch=='Sydney')
    {
        sendOrderMessage(req, res, SydneyMessage);
    } else {
        sendOrderMessage(req, res, MelbourneMessage);
    }
};

var receiveMelbourneMessage = function (req, res) {
    serviceBusService.receiveSubscriptionMessage('orders', 'MelbourneMessages', function(error, receivedMessage){
        if(!error){
            sendJsonResponse(res, 200, receivedMessage);
        }
    });
};

var receiveSydneyMessage = function (req, res) {
    serviceBusService.receiveSubscriptionMessage('orders', 'SydneyMessages', function(error, receivedMessage){
        if(!error){
            sendJsonResponse(res, 200, receivedMessage);
        }
    });
};

module.exports.receiveMessage = function (req, res) {
    if(req.query.branch == 'Sydney') {
        receiveSydneyMessage(req, res);
    } else if (req.query.branch == 'Melbourne') {
        receiveMelbourneMessage(req, res);
    } else {
        serviceBusService.receiveSubscriptionMessage('orders', 'AllMessages', function(error, receivedMessage){
            if(!error){
                sendJsonResponse(res, 200, receivedMessage);
            }
        });
    }
};

module.exports.getSubscription = function (req, res) {
    serviceBusService.getSubscription('orders', 'MelbourneMessages', function(error, subscriptionResult){
        if(!error) {
            sendJsonResponse(res, 200, subscriptionResult);
        }
    });
};
