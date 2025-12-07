
const axios = require('axios');

const ATTACKS = ['SQL Injection', 'XSS Payload', 'DDoS Volumetric', 'Port Scan', 'Brute Force'];
const SEVERITY = ['Low', 'Medium', 'High', 'Critical'];

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getIP() { return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`; }

async function attack() {
    try {
        const payload = {
            source_ip: getIP(),
            attack_type: getRandom(ATTACKS),
            severity: getRandom(SEVERITY)
        };

        // Hit your own local server
        await axios.post('http://localhost:5000/api/ingest', payload);
        // Removed console.log to keep terminal clean
    } catch (e) {
        // Silent fail - server might not be running
    }
}

// Fire an attack every 3 seconds
setInterval(attack, 3000);