// server/kaiju.js
const axios = require('axios');

const ATTACKS = ['SQL Injection', 'XSS Payload', 'DDoS Volumetric', 'Port Scan', 'Brute Force'];
const SEVERITY = ['Low', 'Medium', 'High', 'Critical'];

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getIP() { return `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`; }

async function attack() {
    try {
        const payload = {
            source_ip: getIP(),
            attack_type: getRandom(ATTACKS),
            severity: getRandom(SEVERITY)
        };
        
        // Hit your own local server
        await axios.post('http://localhost:5000/api/ingest', payload);
        console.log(`🔥 FIRED: ${payload.attack_type} [${payload.severity}]`);
    } catch (e) {
        console.log("❌ Target Offline (Server not running)");
    }
}

// Fire an attack every 2 seconds
console.log("🦖 CYBER KAIJU ONLINE. Targeting Mainframe...");
setInterval(attack, 2000);