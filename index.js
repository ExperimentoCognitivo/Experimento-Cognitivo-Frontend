var express = require('express');
var app = express();
var path = require('path');
var public = path.join(__dirname);
var axios = require("axios").default;

var serviceOnline = true;

async function wakeUp() {
    try {
        const options = { method: 'GET', url: process.env.URL_WAKE_UP };
        await axios.request(options);
    } catch (err) {
        console.log(err);
    } finally {
        return true;
    }
}

function checkStatus(req, res, next) {
    if (serviceOnline) {
        next();
    } else {
        res.sendFile(path.join(public, 'offline.html'));
    }
};

app.get('/administrador/2022/start', (req, res) => {
    wakeUp();
    serviceOnline = true;
    res.send("Experimento Online!");
})

app.get('/administrador/2022/stop', (req, res) => {
    serviceOnline = false;
    res.send("Experimento Offline!");
})

app.get('/', checkStatus, (req, res) => res.sendFile(path.join(public, 'index.html')));
app.use('/', checkStatus, express.static(public));
app.listen(process.env.PORT || 3001);
