const fs = require('fs');
const https = require('https');

const baseLat = 51.0;
const baseLng = 4.3;

const counters = [];
let seed = 12345;
function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

for (let i = 1; i <= 32; i++) {
  counters.push({
    id: `10${i}`,
    name: `Counter Location ${i}`,
    lat: baseLat + (random() - 0.5) * 0.8,
    lng: baseLng + (random() - 0.5) * 1.8,
  });
}

const roadData = {};

function fetchWithRetry(query, retries = 3) {
  return new Promise((resolve, reject) => {
    const dataString = 'data=' + encodeURIComponent(query);
    const options = {
      hostname: 'overpass-api.de',
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/112.0',
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(dataString)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch(e) {
            reject(new Error("Failed to parse JSON: " + data.substring(0,100)));
          }
        } else if (res.statusCode === 429 && retries > 0) {
          console.log('Rate limited, waiting 10s...');
          setTimeout(() => fetchWithRetry(query, retries - 1).then(resolve).catch(reject), 10000);
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data.substring(0, 100)}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(dataString);
    req.end();
  });
}

async function fetchAll() {
  console.log(`Fetching road data for ${counters.length} counters...`);
  
  for (let i = 0; i < counters.length; i++) {
    const c = counters[i];
    console.log(`Fetching [${i+1}/${counters.length}] ID: ${c.id}`);
    
    // Radius 1000m
    const query = `[out:json];way["highway"~"cycleway|path|residential|tertiary"](around:1000,${c.lat},${c.lng});out geom;`;
    
    try {
      const data = await fetchWithRetry(query);
      const roads = data.elements
        .filter(el => el.geometry)
        .map(el => el.geometry.map(pt => [pt.lat, pt.lon]));
      
      roadData[c.id] = roads;
      
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.error(`Failed for ${c.id}:`, e.message);
      roadData[c.id] = [];
    }
  }
  
  const finalData = {
    counters,
    roads: roadData
  };
  
  if (!fs.existsSync('src/data')) {
    fs.mkdirSync('src/data');
  }
  
  fs.writeFileSync('src/data/prefetchedRoads.json', JSON.stringify(finalData));
  console.log('Done! Saved to src/data/prefetchedRoads.json');
}

fetchAll();
