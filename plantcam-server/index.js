const express = require('express');
const cors = require('cors');
const { exec } = require(`child_process`);
const NodeWebcam = require( "node-webcam" );
const https = require("https");
const gm = require('gm').subClass({imageMagick: true});

const config = {
    "location": "/dev/video0",
    "framerate": 30,
    "width": 640,
    "height": 480,
    "port": 3000,
}

let command = `ffmpeg -f v4l2 ` +
    `-framerate ${config.framerate} ` +
    `-input_format yuyv422 ` +
    `-video_size ${config.width}x${config.height} ` +
    `-i ${config.location} ` +
    `-c:v libx264 ` +
    `-vf format=yuv420p ` +
    `-hls_playlist 1 ` +
    `-remove_at_exit 1 ` +
    `manifest.mpd`;

let app = express();

let webcam = NodeWebcam.create({
    width: 640,
    height: 480,
    quality: 100,
    delay: 0,
    saveShots: true,
    output: "jpeg",
    device: "/dev/video3",
    callbackReturn: "location",
    verbose: false
});

const api = "https://api.open-meteo.com/v1/forecast?latitude=44.49&longitude=-73.11&current_weather=true&hourly=soil_moisture_0_1cm"

async function getWeather() {
    return new Promise((resolve, reject) => {
        https.get(api, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                let dataObj = JSON.parse(data);
                resolve({
                    "temperature": dataObj.current_weather.temperature,
                    "moisture": dataObj.hourly.soil_moisture_0_1cm[0],
                });
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
}

function readLightLevel() {
    return new Promise((resolve, reject) => {
        webcam.capture("light.jpg", function(err, data) {
            if (err) {
                console.log(err);
            }
            gm().in("light.jpg")
                .colorspace('GRAY')
                .out('-format')
                .out('%[fx:mean*100]')
                .toBuffer('info', function(err, buffer) {
                    resolve(buffer.toString());
                })
        });
    })
}


app.use(cors());
app.use(express.static('public'));

app.get('/info', async (req, res) => {
    let data = await getWeather();
    res.send({
        "light": await readLightLevel(),
        "temperature": data.temperature,
        "water": data.moisture,
    })
})

app.listen(config.port, `localhost`, () => {
    console.log(`Server started on port ${config.port}`);
    exec(command, {
      cwd: __dirname + `/public`
    }, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            process.exit(1);
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
        }
        console.log(`stdout: ${stdout}`);
    });
});


