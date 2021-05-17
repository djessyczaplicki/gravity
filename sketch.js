let ball;
let planetSprites = [];
let planets = [];
let frame = 0;
let speed = 0;
let destX = 0;
let destY = 0;
let degree = 0;
const numPlanets = 5;
let isPressed;
function preload() {
    ball = createSprite(windowWidth/2, windowHeight/4, 20, 20);
    planetSprites.push(loadImage("assets/earth.png")); // make planets smaller 
    planetSprites[0].width = 2;
    planetSprites[0].height = 2;
    ball.setCollider('circle', 0, 0, 20);
}


function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < numPlanets; i++) {
        const p = createSprite(random(100, 500), random(100, 500), 10, 10);
        p.setCollider("circle", 0, 0, 10);
        p.addImage(planetSprites[0]);
        planets.push(p);
    }
    
    ball.addAnimation('bola', 'assets/ball_01.png', 'assets/ball_10.png');
}



function draw() {
    background(10,10,12);
    degree = ball.getDirection();
    ball.setSpeed(speed, degree);

    if (isPressed) {
        stroke(255);
        destX = (mouseX - ball.position.x) * -1.5 + ball.position.x;
        destY = (mouseY - ball.position.y)  * -1.5 + ball.position.y
        line(ball.position.x, ball.position.y, destX, destY);
    }
    for (planet of planets) {
        let d = dist(ball.position.x, ball.position.y, planet.position.x, planet.position.y);
        if (d < 200) {
            // 
            ball.attractionPoint((200 - d) / 150, planet.position.x, planet.position.y);
        }
        ball.collide(planet);

    }

    frame++;
    drawSprites();

    // forces
    stroke(0,255,0);
    const theta = degree * Math.PI / 180;
    const dx = 100 * Math.cos(theta);
    const dy = 100 * Math.sin(theta);
    line(ball.position.x, ball.position.y, ball.position.x + dx, ball.position.y + dy);

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
    speed = Math.abs(speedVector) / 100;
    ball.setSpeed(speed, degree); // calcula el angulo
    console.log(degree);
}

