var http = require('http');
var azure = require('azure');
const express = require('express');
const router = express();
var app = require('./app');

router.get('/createtopic/', app.createTopic);

router.get('/createsubscription/', app.createsubscription);
router.get('/createMelbourneSubscription/', app.createMelbourneSubscription);
router.get('/createSydneySubscription/', app.createSydneySubscription);

router.get('/sendmessage/', app.sendmessage);

router.get('/receiveMessage/', app.receiveMessage);
router.get('/getsubscription/', app.getSubscription);

router.get('/', (req, res) => res.send('Hello World!'));

router.listen(3000, () => console.log('Example app listening on port 3000!'));
