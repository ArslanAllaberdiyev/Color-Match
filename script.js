const container = document.getElementById('game-container');
const timerDisplay = document.getElementById('timer');
const message = document.getElementById('message');
const uiLayer = document.getElementById('ui-layer');

const hS = document.getElementById('h-slider');
const sS = document.getElementById('s-slider');
const lS = document.getElementById('l-slider');

let target = { h: 0, s: 0, l: 0 };
let colorHistory = JSON.parse(localStorage.getItem('chromaHistory')) || [];

function generateWeirdColor() {
    let newColor;
    let attempts = 0;

    while (attempts < 50) {
        // High variance randomization for "weird" tones
        const h = Math.floor(Math.random() * 360);
        const s = Math.floor(Math.pow(Math.random(), 0.6) * 100); 
        const l = Math.floor(Math.random() * 65) + 15; 

        newColor = { h, s, l };

        // Ensure color isn't too close to recent history
        const isUnique = colorHistory.every(prev => {
            const hDiff = Math.min(Math.abs(prev.h - h), 360 - Math.abs(prev.h - h));
            return hDiff > 30 || Math.abs(prev.l - l) > 15;
        });

        if (isUnique) break;
        attempts++;
    }

    colorHistory.push(newColor);
    if (colorHistory.length > 15) colorHistory.shift();
    localStorage.setItem('chromaHistory', JSON.stringify(colorHistory));
    return newColor;
}

function update() {
    const h = hS.value, s = sS.value, l = lS.value;
    container.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;
    
    hS.style.background = `linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))`;
    sS.style.background = `linear-gradient(to right, hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))`;
    lS.style.background = `linear-gradient(to right, #000, hsl(${h}, ${s}%, 50%), #fff)`;
}

[hS, sS, lS].forEach(el => el.addEventListener('input', update));

async function init() {
    const words = ["READY", "SET", "GO"];
    for (let w of words) { 
        message.innerText = w; 
        await new Promise(r => setTimeout(r, 800)); 
    }
    message.innerText = "";

    target = generateWeirdColor();
    container.style.backgroundColor = `hsl(${target.h}, ${target.s}%, ${target.l}%)`;
    timerDisplay.classList.remove('hidden');

    let time = 0;
    const t = setInterval(() => {
        time += 0.01; 
        timerDisplay.innerText = time.toFixed(2);
        if(time >= 5.0) { 
            clearInterval(t); 
            timerDisplay.classList.add('hidden'); 
            uiLayer.classList.remove('hidden'); 
            update(); 
        }
    }, 10);
}

document.getElementById('submit-btn').onclick = () => {
    const uH = parseInt(hS.value), uS = parseInt(sS.value), uL = parseInt(lS.value);
    
    let hD = Math.abs(target.h - uH); 
    if(hD > 180) hD = 360 - hD;
    
    const hErr = (hD / 180) * 1.0;
    const sErr = (Math.abs(target.s - uS) / 100) * 0.8;
    const lErr = (Math.abs(target.l - uL) / 100) * 1.2;

    const totalErr = (hErr + sErr + lErr) / 3;
    const score = (10 * Math.pow(1 - totalErr, 1.5)).toFixed(2);

    uiLayer.classList.add('hidden');
    document.getElementById('result-layer').classList.remove('hidden');

    document.getElementById('top-half').style.backgroundColor = `hsl(${uH}, ${uS}%, ${uL}%)`;
    document.getElementById('bottom-half').style.backgroundColor = `hsl(${target.h}, ${target.s}%, ${target.l}%)`;
    document.getElementById('final-score').innerText = score;
    document.getElementById('user-vals').innerText = `H:${uH}° S:${uS}% B:${uL}%`;
    document.getElementById('target-vals').innerText = `H:${target.h}° S:${target.s}% B:${target.l}%`;
};

window.onload = init;
