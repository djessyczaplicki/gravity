let seed = localStorage.getItem("level") | 1;
let showSeed = localStorage.getItem("showSeed") | false;
const divSeed = document.getElementById("divSeed");
divSeed.style.display = (showSeed)?"inline":"none";
const lblSeed = document.getElementById("lblSeed");
lblSeed.textContent = seed;
const inptSeed = document.getElementById("inptSeed");
let directionalVector = false;

let ball;

// let world = [];
let planetSprites = [];
let planets = [];
let frame = 0;
let speed = 0;
let destX = 0;
let destY = 0;
let degree = 0;
const numPlanets = 8; // max 8;
let isPressed;
function preload() {
    ball = createSprite(100, 100, 20, 20);
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


}

function generateLevel() {
    for (let i = 0; i < numPlanets; i++) {
        const ref = BigInt(seed) ** BigInt(i+1);
        const p = planets[i];
        p.sprite = createSprite(Number(ref % 1200n + 100n), Number(ref * 5n % 700n + 100n), 10, 10);
        p.sprite.setCollider("circle", 0, 0, p.size);
        p.sprite.addImage(planetSprites[i]);
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    generateLevel();
    
    ball.addAnimation('bola', 'assets/ball_01.png', 'assets/ball_10.png');
}



function draw() {
    background(10,10,12);
    degree = ball.getDirection();
    ball.setSpeed(speed, degree);

    if (isPressed) {
        stroke(255);
        destX = (mouseX - ball.position.x) * -1.5 + ball.position.x;
        destY = (mouseY - ball.position.y) * -1.5 + ball.position.y
        line(ball.position.x, ball.position.y, destX, destY);
    }
    for (planet of planets) {
        let d = dist(ball.position.x, ball.position.y, planet.sprite.position.x, planet.sprite.position.y);
        
        if (d < planet.gravitationalField) {
            ball.attractionPoint((planet.gravitationalField - d) / 1200, planet.sprite.position.x, planet.sprite.position.y);
        }
        ball.collide(planet.sprite);

    }

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

}

function windowResized() {
    createCanvas(windowWidth, windowHeight);
}

function mousePressed() {
    isPressed = true;
}

function mouseReleased() {
    isPressed = false;

    // delta = destination - origin -> deltaX = x2 - x1
    const deltaX = destX - ball.position.x;
    const deltaY = destY - ball.position.y;
    // theta Radians = arctan2 deltaY, deltaX
    const thetaRadians = Math.atan2(deltaY, deltaX);
    degree = thetaRadians * 180 / Math.PI;

    // Pythagoras theorema : a^2 + b^2 = c^2
    // speedVector = xlength^2 + ylength^2
    const speedVector = Math.sqrt((destX - ball.position.x) ** 2 + (destY - ball.position.y));
    speed = Math.abs(speedVector) / 30;
    ball.setSpeed(speed, degree);
    console.log(degree);
}



function setSeed(seed) {
    localStorage.setItem("level", seed);
    window.location.reload();
}

function toggleSeed() {
    if (showSeed) localStorage.setItem("showSeed", 0);
    else localStorage.setItem("showSeed", 1);

    showSeed = localStorage.getItem("showSeed");
    divSeed.style.display = (showSeed)?"inline":"none";
}


// dom
const btn1 = document.getElementById("btn1");
const btn2 = document.getElementById("btn2");
const btn3 = document.getElementById("btn3");
const btn4 = document.getElementById("btn4");

// events
btn1.addEventListener('click', e => {
    localStorage.setItem("level", 11);
    window.location.reload();
});
btn2.addEventListener('click', e => {
    localStorage.setItem("level", 12);
    window.location.reload();
});
btn3.addEventListener('click', e => {
    localStorage.setItem("level", random(100, 999999999));
    window.location.reload();
});
btn4.addEventListener('click', e => {
    window.location.reload();
});
inptSeed.addEventListener("keypress", e => {
    if (e.key == "Enter") {
        setSeed(inptSeed.value);
        window.location.reload();
    }
});