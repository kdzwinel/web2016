'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var ref = new Firebase("https://webappsin2016.firebaseio.com");
var uid = null;

ref.child('slide_number').on('value', function (snapshot) {
    goToSlide(parseInt(snapshot.val(), 10));
});

var $apis = document.querySelector('.apis ul');
var $swStatus = document.querySelector('.sw h1');

ref.onAuth(function (authData) {
    if (authData) {
        console.log("Authenticated with uid:", authData.uid);
        uid = authData.uid;
        showApis();
    } else {
        console.log("Client unauthenticated.");
        auth();
    }
});

function auth() {
    ref.authAnonymously(function (error, authData) {
        if (error) {
            console.log("Login Failed!", error);
        } else {
            console.log("Authenticated successfully with payload:", authData);
            uid = authData.uid;

            sendData();
            randomColor();
        }
    });
}

function showApis() {
    var apis = [{ name: 'batteryapi', desc: 'Battery API', check: Modernizr.batteryapi || 'getBattery' in navigator }, { name: 'devicemotion', desc: 'Device Montion API' }, { name: 'fullscreen', desc: 'Fullscreen  API' }, { name: 'geolocation', desc: 'Geolocation API' }, { name: 'getusermedia', desc: 'User Media API (camera & mic)' }, { name: 'notification', desc: 'Notification API' }, { name: 'peerconnection', desc: 'Peer To Peer Connection API' }, { name: 'pointerlock', desc: 'Pointer lock API' }, { name: 'serviceworker', desc: 'ServiceWorker API' }, { name: 'speechrecognition', desc: 'Speech recognition API' }, { name: 'speechsynthesis', desc: 'Speech Synthesis API' }, { name: 'vibrate', desc: 'Vibration API' }, { name: 'webgl', desc: 'WebGL' }];

    $apis.innerHTML = '';
    apis.forEach(function (api) {
        var li = document.createElement('li');

        if (api.check || Modernizr[api.name]) {
            li.classList.add('supported');
        }

        li.innerHTML = api.desc;

        $apis.appendChild(li);
    });
}

function sendData() {
    ref.child('users/' + uid).set({
        screen: {
            width: screen.width,
            height: screen.height
        },
        apis: {
            batteryapi: Modernizr.batteryapi || 'getBattery' in navigator, //Battery API and Battery Status API
            devicemotion: Modernizr.devicemotion,
            fullscreen: Modernizr.fullscreen,
            geolocation: Modernizr.geolocation,
            getusermedia: Modernizr.getusermedia,
            notification: Modernizr.notification,
            peerconnection: Modernizr.peerconnection,
            pointerlock: Modernizr.pointerlock,
            serviceworker: Modernizr.serviceworker,
            speechrecognition: Modernizr.speechrecognition,
            speechsynthesis: Modernizr.speechsynthesis,
            vibrate: Modernizr.vibrate,
            webgl: Modernizr.webgl
        },
        useragent: navigator.userAgent
    });
}

function updateScreenSize() {
    if (!uid) {
        return;
    }

    ref.child('users/' + uid + '/screen').update({
        width: screen.width,
        height: screen.height
    });
}

function updateColor(color) {
    if (!uid) {
        return;
    }

    ref.child('users/' + uid + '/color').set(color);
    canvas.style.borderColor = '#' + color;
}

window.addEventListener('resize', function () {
    drawColorPicker();
    updateScreenSize();
});

// COLORPICKER

var canvas = document.getElementById("picker");
var context = canvas.getContext("2d");
var canvasMargin = 20;

canvas.addEventListener('click', function (e) {
    var x = e.offsetX;
    var y = e.offsetY;

    changeColor(x, y);
});

function changeColor(x, y) {
    var rgb = context.getImageData(x, y, 1, 1).data;
    updateColor(rgbToHex(rgb));

    var size = 1;
    var maxSize = 20;

    drawColorPicker();

    requestAnimationFrame(function ripple() {
        size += 4;

        context.beginPath();
        context.moveTo(x, y);
        context.arc(x, y, size, 0, 360, false);
        context.closePath();
        context.fillStyle = "rgba(255,255,255,0.4)";
        context.fill();

        if (size < maxSize) {
            requestAnimationFrame(ripple);
        }
    });
}

function randomColor() {
    var x = Math.floor(canvas.width * Math.random());
    var y = Math.floor(canvas.height * Math.random());

    changeColor(x, y);
}

function drawColorPicker() {
    canvas.width = window.innerWidth - canvasMargin;
    canvas.height = window.innerHeight - canvasMargin;

    var bigger = canvas.width > canvas.height ? canvas.width : canvas.height;

    var x = canvas.width / 2;
    var y = canvas.height / 2;
    var radius = bigger * 2;
    var counterClockwise = false;

    for (var angle = 0; angle <= 360; angle += 1) {
        var startAngle = (angle - 2) * Math.PI / 180;
        var endAngle = angle * Math.PI / 180;
        context.beginPath();
        context.moveTo(x, y);
        context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
        context.closePath();
        context.fillStyle = 'hsl(' + angle + ', 100%, 50%)';
        context.fill();
    }
}

drawColorPicker();

function rgbToHex(_ref) {
    var _ref2 = _slicedToArray(_ref, 3);

    var r = _ref2[0];
    var g = _ref2[1];
    var b = _ref2[2];

    if (r > 255 || g > 255 || b > 255) throw "Invalid color component";

    var s = (r << 16 | g << 8 | b).toString(16);

    return ("000000" + s).slice(-6);
}

// CHANGING SLIDES

var $slidesStrip = document.querySelector('.slides_strip');
function goToSlide() {
    var num = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

    $slidesStrip.style.transform = 'translateX(-' + num * 100 + 'vw)';
}

// SERVICE WORKER

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/web2016/sw.js').then(function (registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope, registration);
        $swStatus.innerHTML = 'ServiceWorker registered! &#x1F386; <br/> Try reloading this page while offline.';
    }).catch(function (err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
        $swStatus.innerHTML = 'ServiceWorker failed to register for some reason &#x1F635;';
    });
} else {
    $swStatus.innerHTML = 'ServiceWorker is not supported on your device &#x1F62D; (yet!)';
}