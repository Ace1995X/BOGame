//Canvas
const canvas = document.getElementById('cnv'); //Dohvaćanje canvasa
const ctx = canvas.getContext('2d'); //2D kontekst
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//Konstante
const clearance = 20; //Udaljenost od ruba
const paddleHeight = 20;
const paddleWidth = 150;
const paddleColor = '#ff0000';
const ballRadius = 10;
const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = clearance + 30; //Gornji razmak za cigle
const brickOffsetLeft = (canvas.width / 4) - ((brickColumnCount * (brickWidth + brickPadding)) / 2); //Lijevi razmak za cigle

//Varijable
let paddleX = (canvas.width - paddleWidth) / 2; //Početna pozicija palice
let ballX = canvas.width / 2; //Početna pozicija lopte
let ballY = canvas.height - clearance - paddleHeight - ballRadius;
let ballDX = 3; //Brzina lopte
let ballDY = -3;
let rightPressed = false; //Jesu li strelice pritisnute
let leftPressed = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameOver = false; //Status igre

//Cigle
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 }; //Status 1 = cigla postoji
    }
}

//Cigla slika
const brickImage = new Image();
brickImage.src = './assets/bricktexture.jpg';

//Input igrača
document.addEventListener('keydown', keyDownHandler, false); //Pritisak
document.addEventListener('keyup', keyUpHandler, false); //Otpuštanje

//Kontrole igrača
function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true; //Desno kretanje
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true; //Lijevo kretanje
    } else if (e.key === ' ' && gameOver) {
        restartGame(); //Restart sa spacebarom
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false; //Deaktivira desno kretanje
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false; //Deaktivira lijevo kretanje
    }
}

//Crta loptu
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

//Crta palicu
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - clearance - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = paddleColor;
    ctx.fill();
    ctx.closePath();
}

//Crta cigle
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.drawImage(brickImage, brickX, brickY, brickWidth, brickHeight);
            }
        }
    }
}

//Crta rezultat
function drawScore() {
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#FF0000';
    ctx.fillText('Score: ' + score, canvas.width - clearance - 120, clearance + 20);
    ctx.fillText('High Score: ' + highScore, canvas.width - clearance - 120, clearance + 40);
}

//Crta granicu
function drawBorder() {
    ctx.beginPath();
    ctx.rect(clearance, clearance, canvas.width - 2 * clearance, canvas.height - 2 * clearance);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

//Sudar
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
                    ballDY = -ballDY; //Presumjeravanje lopte
                    b.status = 0; //Uklanjanje cigle
                    score++;
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('highScore', highScore);
                    }
                    if (score === brickRowCount * brickColumnCount) {
                        alert('YOU WIN, CONGRATULATIONS!');
                        document.location.reload();
                    }
                }
            }
        }
    }
}

//Crta sve
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawBorder();
    collisionDetection();

    //Provjera sudara sa zidovima
    if (ballX + ballDX > canvas.width - clearance - ballRadius || ballX + ballDX < clearance + ballRadius) {
        ballDX = -ballDX;
    }
    if (ballY + ballDY < clearance + ballRadius) {
        ballDY = -ballDY;
    } else if (ballY + ballDY > canvas.height - clearance - ballRadius) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            ballDY = -ballDY;
        } else {
            gameOver = true;
            ctx.font = '48px Arial';
            ctx.fillStyle = '#FF0000';
            ctx.fillText('GAME OVER', canvas.width / 2 - 150, canvas.height / 2);
            ctx.font = '24px Arial';
            ctx.fillText('Press Spacebar to Restart', canvas.width / 2 - 150, canvas.height / 2 + 50);
            return;
        }
    }

    ballX += ballDX;
    ballY += ballDY;

    //Kontrole/kretanje palice
    if (rightPressed && paddleX < canvas.width - clearance - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > clearance) {
        paddleX -= 7;
    }

    requestAnimationFrame(draw); //Nastavlja
}

//Restart
function restartGame() {
    gameOver = false;
    score = 0;
    ballX = canvas.width / 2;
    ballY = canvas.height - clearance - paddleHeight - ballRadius;
    ballDX = 3;
    ballDY = -3;
    paddleX = (canvas.width - paddleWidth) / 2;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = 1;
        }
    }
    draw();
}

//Pokreni igru
draw();
