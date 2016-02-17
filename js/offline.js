'use strict';

var $text = document.querySelector('.js-text');

if (navigator.onLine) {
    goBack();
} else {
    window.addEventListener('online', goBack);
}

function goBack() {
    $text.innerHTML = 'Your connection is back! Redirecting you in 1s...';

    setTimeout(function () {
        location.href = './';
    }, 1000);
}