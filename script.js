// --- CONFIGURATION ---
// PASTE YOUR GOOGLE SCRIPT URL BELOW
const googleScriptUrl = "https://script.google.com/macros/s/AKfycbwKzXF9bI4044LjTBzaVgQSy1bLQToqKF-7yZCOjbSToALdNRkj9JDj13p-6Rtgai3Y/exec";
// ---------------------

// AUDIO SYSTEM
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function beep(f, d, t) {
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type = t; o.frequency.value = f; o.connect(g); g.connect(audioCtx.destination);
    o.start(); setTimeout(() => o.stop(), d);
}
function playSuccess() { beep(1000, 100, 'sine'); setTimeout(() => beep(1500, 100, 'sine'), 100); }
function playError() { beep(300, 400, 'sawtooth'); }

// PROCESSOR
function processID(id) {
    if (!id) return;
    if (html5QrcodeScanner.getState() === Html5QrcodeScannerState.SCANNING) html5QrcodeScanner.pause();

    showResult('status-warning', 'CHECKING', 'Searching Database...');

    fetch(googleScriptUrl + "?id=" + id)
        .then(res => res.text())
        .then(data => {
            if (data.includes("WELCOME")) {
                showResult('status-success', 'ACCESS GRANTED', data.replace("✅ WELCOME: ", ""));
                playSuccess();
            } else if (data.includes("ALREADY")) {
                showResult('status-warning', 'DUPLICATE', "Already Inside");
                playError();
            } else {
                showResult('status-error', 'DENIED', "ID Not Found");
                playError();
            }

            // Fast Resume
            setTimeout(() => {
                if (html5QrcodeScanner.getState() === Html5QrcodeScannerState.PAUSED) html5QrcodeScanner.resume();
                document.getElementById('result').style.display = 'none';
                document.getElementById('manualInput').value = "";
            }, 1500);
        })
        .catch(err => {
            showResult('status-error', 'ERROR', 'Network Fail');
            setTimeout(() => { if (html5QrcodeScanner.getState() === Html5QrcodeScannerState.PAUSED) html5QrcodeScanner.resume(); }, 1000);
        });
}

function showResult(cls, title, msg) {
    const r = document.getElementById('result');
    r.className = cls; r.style.display = 'block';
    r.innerHTML = `<span style="font-size:0.8rem;opacity:0.8;text-transform:uppercase;font-weight:700">${title}</span><span class="result-body">${msg}</span>`;
    if (navigator.vibrate) navigator.vibrate(cls === 'status-success' ? 50 : [50, 50, 50]);
}

function manualCheck() { processID(document.getElementById('manualInput').value); }
function onScanSuccess(decodedText) { processID(decodedText); }

const html5QrcodeScanner = new Html5QrcodeScanner("reader", {
    fps: 20, qrbox: 250, formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    videoConstraints: { facingMode: "environment" }
});
html5QrcodeScanner.render(onScanSuccess);