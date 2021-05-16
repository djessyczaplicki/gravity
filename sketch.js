let ball;
let frame = 0;
function preload() {
}


function setup() {
    createCanvas(windowWidth, windowHeight);
    ball = createSprite(width/2, height/2, 10, 10);
    ball.addAnimation('bola', 'assets/ball_01.png', 'assets/ball_10.png');
    ball.friction = 0.1;
}



function draw() {
    background(10,10,12);ball.maxSpeed = 5;
    if (frame % 200 > 100) {
        ball.setSpeed(5, 0);
    } else {
        ball.setSpeed(-5, 0);
    }
    ball.attractionPoint(2.5, mouseX, mouseY);
    frame++;
    drawSprites();

}

function windowResized() {
    createCanvas(windowWidth, windowHeight);
}

