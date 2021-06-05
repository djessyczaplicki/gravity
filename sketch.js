if (localStorage.getItem("firstTime") == null) {
    help();
    localStorage.setItem("firstTime", true);
}
let seed = localStorage.getItem("level") || 204296979;
let showSeed = localStorage.getItem("showSeed") == "true" || false;
const divSeed = document.getElementById("divSeed");
divSeed.style.display = (showSeed == true)?"inline":"none";
const lblSeed = document.getElementById("lblSeed");
lblSeed.textContent = seed;
const inptSeed = document.getElementById("inptSeed");
const winTextDiv = document.getElementById("winTextDiv");
const loseTextDiv = document.getElementById("loseTextDiv");
let directionalVector = localStorage.getItem("debug") == "true" || false;
let ball;
let debug = (localStorage.getItem("debug") == "true") || false;
let cameraActive = false;
const winSound = new Audio("sounds/winSound.wav");
const loseSound = new Audio("sounds/lose-sound.wav");

let hasShot = false;
const planetSprites = [];
const planets = [];
const stars = [];
let frame = 0;
let speed = 0;
let destX = 0;
let destY = 0;
let degree = 0;
const numPlanets = 8; // max 8;
const starsNum = 500; // LOWER THIS IF LAGGY
let isPressed;
function preload() {
    ball = createSprite(200, 200, 20, 20);
    planetSprites.push(loadImage("assets/earth30-2.png"));
    planetSprites.push(loadImage("assets/jupiter40.png"));
    planetSprites.push(loadImage("assets/mars24.png"));
    planetSprites.push(loadImage("assets/mercury23.png"));
    planetSprites.push(loadImage("assets/neptune34.png"));
    planetSprites.push(loadImage("assets/pluto20.png"));
    planetSprites.push(loadImage("assets/uranus35.png"));
    planetSprites.push(loadImage("assets/venus29.png"));
    const sizes = [30, 40, 24, 23, 34, 20, 35, 29];
    for (let i = 0; i < numPlanets; i++) {
        const p = new Planet(planetSprites[i], sizes[i]);
        planets.push(p);
    }
    ball.setCollider('circle', 0, 0, 20);
}

class Planet {
    static id = -1;
    constructor(img, size) {
        this.id = ++Planet.id;
        this.img = img;
        this.size = size-3;
        this.gravitationalField = size * 7;
        this.attractionForce = size / 20;
    }

    drawGravitationalField() {
        this.gfSpr = createSprite(this.sprite.position.x, this.sprite.position.y, this.gravitationalField, this.gravitationalField);
        this.gfSpr.draw = () => {
            noFill();
            stroke(255);
            ellipse(0, 0, this.gravitationalField);
        }
    }

    hideGravitationalField() {
        this.gfSpr.draw = () => {}
    }
}

class Star {
    constructor() {
        this.x = random(-500, windowWidth+500);
        this.y = random(-500, windowHeight+500);
        this.size = random(1,3);
    }

    draw() {
        fill(255);
        ellipse(this.x, this.y, this.size);
    }
}

function generateLevel() {
    for (let i = 0; i < numPlanets; i++) {
        const ref = BigInt(seed) ** BigInt(i+1);
        const p = planets[i];
        p.sprite = createSprite(Number((ref % 1200n + 100n)*BigInt(windowWidth)/1920n), Number((ref * 5n % 700n + 100n)*BigInt(windowHeight)/1080n), 10, 10);
        p.sprite.setCollider("circle", 0, 0, p.size);
        p.sprite.addImage(planetSprites[i]);
        // Draw gravity outline
        if (debug == true) {
            p.drawGravitationalField();
        }
        for (pla of planets) { // Avoid Overlaps
            if (pla.sprite == null) continue;
            p.sprite.overlap(pla.sprite, () => {
                i--;
                seed++;
                p.sprite.remove();
                console.log("overlap");
            })
        }
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    generateLevel();
    ball.addAnimation('bola', 'assets/ball_01.png', 'assets/ball_10.png');
    for (let i = 0; i < starsNum; i++) {
        stars.push(new Star());
    }
}


function draw() {
    background(10,10,12);
    degree = ball.getDirection();
    ball.setSpeed(speed, degree);
    for (star of stars) {
        star.draw();
    }

    if (isPressed) {
        stroke(255);
        destX = (camera.mouseX - ball.position.x) * -1.5 + ball.position.x;
        destY = (camera.mouseY - ball.position.y) * -1.5 + ball.position.y
        line(ball.position.x, ball.position.y, destX, destY);
    }
    for (planet of planets) {
        let d = dist(ball.position.x, ball.position.y, planet.sprite.position.x, planet.sprite.position.y);
        
        if (d < planet.gravitationalField / 2) {
            ball.attractionPoint((planet.gravitationalField / 2 - d) / 1000, planet.sprite.position.x, planet.sprite.position.y);
        }
        if (ball.position.x < 0 || ball.position.y < 0 
            || ball.position.x > windowWidth || ball.position.y > windowHeight) {
                lose();
            }
        // setting earth as the goal
        if (planets.indexOf(planet) != 0) ball.collide(planet.sprite);
        else {
            ball.overlap(planet.sprite, win);
        }
    }
    planet.gfSpr;
    frame++;
    drawSprites();
    // Directional Vector
    if (directionalVector) {
        stroke(0,255,0);
        const theta = degree * Math.PI / 180;
        const dx = 100 * Math.cos(theta);
        const dy = 100 * Math.sin(theta);
        line(ball.position.x, ball.position.y, ball.position.x + dx, ball.position.y + dy);
    }

    if (cameraActive) {
        camera.position.x = ball.position.x;
        camera.position.y = ball.position.y;
    }
}

function windowResized() {
    createCanvas(windowWidth, windowHeight);
}

function mousePressed() {
    if (hasShot && debug == false) return;
    isPressed = true;
}

function mouseReleased() {
    if (!isPressed) return;
    isPressed = false;
    hasShot = true;

    // delta = destination - origin -> deltaX = x2 - x1
    const deltaX = destX - ball.position.x;
    const deltaY = destY - ball.position.y;
    // theta Radians = arctan2 deltaY, deltaX
    const thetaRadians = Math.atan2(deltaY, deltaX);
    degree = thetaRadians * 180 / Math.PI;

    // Pythagoras theorema : a^2 + b^2 = c^2
    // speedVector = xlength^2 + ylength^2
    const speedVector = Math.sqrt((destX - ball.position.x) ** 2 + (destY - ball.position.y) ** 2);
    // 
    speed = Math.abs(speedVector) / 100;
    ball.setSpeed(speed, degree);
    camera.zoom = 1.3;
    camera.position.x = ball.position.x;
    camera.position.y = ball.position.y;
    cameraActive = true;
}

function setSeed(seed) {
    localStorage.setItem("level", seed);
    alert(localStorage.getItem("level"));
    window.location.reload();
}

function toggleSeed() {
    if (showSeed == true) localStorage.setItem("showSeed", false);
    else localStorage.setItem("showSeed", true);

    showSeed = localStorage.getItem("showSeed") == "true";
    divSeed.style.display = (showSeed == true)?"inline":"none";
}

function toggleDebug() {
    debug = (debug != true);
    localStorage.setItem("debug", debug);
    directionalVector = debug;
    for (p of planets) {
        if (debug == true) p.drawGravitationalField();
        else p.hideGravitationalField();
    }
}

function camTranslate(dx, dy) {
    const ox = camera.position.x;
    const oy = camera.position.y;
    const deltaX = dx - ox;
    const deltaY = dy - oy;
    cameraActive = false;
    const translate = setInterval(() => {
        if (Math.abs(camera.position.x - dx) < 3 && Math.abs(camera.position.y - dy) < 3) clearInterval(translate);
        camera.position.x += deltaX / 30;
        camera.position.y += deltaY / 30;
        camera.zoom += 0.05;
    }, 20);
}

function win(ball, earth) {
    ball.remove();
    camTranslate(earth.position.x, earth.position.y);
    winTextDiv.style.display = "block";
    winTextDiv.style.opacity = "1";
    document.getElementById("joamba").addEventListener("click", e => {
        if (showSeed == false) alert("You discovered an Easter Egg, now you can use the seeds to save your favourite maps :)")
        toggleSeed();
    });
    setInterval(() => movingSound.pause(), 1000);
    winSound.play();
}

function lose() {
    loseTextDiv.style.display = "block";
    loseTextDiv.style.opacity = "1";
    loseSound.play();
}


// dom
const btnHelp = document.getElementById("btnHelp");
const btn1 = document.getElementById("btn1");
const btn2 = document.getElementById("btn2");
const btn3 = document.getElementById("btn3");
const btn4 = document.getElementById("btn4");
const btn5 = document.getElementById("btn5");
const menu = document.getElementById("menu");
const volume = document.getElementById("volume");
let music = document.getElementById("music");

volume.value = localStorage.getItem("volume");
// events
btnHelp.addEventListener('click', help);
function help(e) {
    alert("\n---Welcome to Gravity !---\n\nYou are a lost ball in space, and you have to reach back the earth in order to win!\n\nHelp yourself with the gravity of the planets to redirect your trajectory and get home!");
}
btn1.addEventListener('click', e => {
    localStorage.setItem("level", 204296979);
    window.location.reload();
});
btn2.addEventListener('click', e => {
    localStorage.setItem("level", 612316573);
    window.location.reload();
});
btn3.addEventListener('click', e => {
    localStorage.setItem("level", 480136489);
    window.location.reload();
});
btn4.addEventListener('click', e => {
    localStorage.setItem("level", int(random(100, 999999999)));
    window.location.reload();
});
btn5.addEventListener('click', e => {
    window.location.reload();
});
inptSeed.addEventListener("keypress", e => {
    if (e.key == "Enter") {
        setSeed(inptSeed.value);

        window.location.reload();
    }
});
lblSeed.addEventListener("click", e => {
    const el = document.createElement('textarea');
    el.value = seed;	//str is your string to copy
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');	// Copy command
    document.body.removeChild(el);
    document.execCommand('copy');
    alert("Copied!");
});
menu.addEventListener("mouseenter", e => {
    isPressed = false;
});
menu.addEventListener("mousedown", e => {
    setTimeout(() => isPressed = false, 1);
})
volume.addEventListener("change", e => {
    music.setVolume(volume.value);
    localStorage.setItem("volume", volume.value);
})


// Music

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    // iframeId parameter should match your Iframe's id attribute
    music = new YT.Player('music', {
      width: 140,
      height: 105,
      videoId: 'wHGIlstqXMA',
      events: {
        'onReady': function (event) {
          event.target.setVolume(localStorage.getItem("volume"));
          event.target.playVideo();
        }
      }
    });
}
