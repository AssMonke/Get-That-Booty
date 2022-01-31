const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const fps = 30; //60 may perform better on certain hardware
const movementSpeed = 2;
const cannonBallSpeed = 8;
const maxCannonAngle = 60;
const cannonAngleOffset = 30;
const fireRate = 1000;
const gravity = 4;
const baseDrag = new Vector(-0.005, 0.06);

function Vector(x, y)
{
    this.x = x;
    this.y = y;

    this.Add = function(deltaV)
    {
        this.x += deltaV.x;
        this.y += deltaV.y;
    }
}

var didPlayer1Win = null;

var t = 0;

cannonBalls = [];

var player1Pos = new Vector(150, 375);
var player1Rot = 20;
var player1CanFire = true;

var player2Pos = new Vector(canvas.width-150, 375);
var player2Rot = 20;
var player2CanFire = true;

var oceanAmplitude = 0;

var keyMap = [];
handleKeyInput = function(event)
{
    if((didPlayer1Win == null || event.keyCode == 82) && event.location != '1'){
        keyMap[event.keyCode] = event.type == 'keydown';
        return;
    }

    keyMap[event.keyCode] = false;
}
document.addEventListener('keydown', handleKeyInput);
document.addEventListener('keyup', handleKeyInput)

var dt = Date.now(); //delta time
var lastT = 0;

function Render()
{
    //#region input
    if(keyMap[82]){
        window.location.reload(true);
    }

    //player 1
    if (keyMap[65] && player1Pos.x > 0) //left
    {
        player1Pos.Add(new Vector(-movementSpeed * dt, 0));
    }
    else if (keyMap[68] && player1Pos.x < (canvas.width/2)-100) //right
    {
        player1Pos.Add(new Vector(movementSpeed * dt, 0));
    }

    if (keyMap[83] && player1Rot < maxCannonAngle) //down
    {
        player1Rot += dt;
    }
    else if (keyMap[87] && player1Rot > 0) //up
    {
        player1Rot -= dt;
    }

    if(keyMap[69] && player1CanFire)
    {
        let radian = (maxCannonAngle-player1Rot+cannonAngleOffset)*Math.PI/180;
        cannonBalls.push({pos: new Vector(player1Pos.x+35, GetSinY(player1Pos.x, 375, oceanAmplitude * 2)), force: new Vector(Math.cos(radian) * cannonBallSpeed, Math.sin(-radian) * cannonBallSpeed)});
        player1CanFire = false;
        setTimeout(() => player1CanFire = true, fireRate);
    }

    //player 2
    if (keyMap[37] && player2Pos.x > (canvas.width/2)+100) //left
    {
        player2Pos.Add(new Vector(-movementSpeed * dt, 0));
    }
    else if (keyMap[39] && player2Pos.x < canvas.width) //right
    {
        player2Pos.Add(new Vector(movementSpeed * dt, 0));
    }

    if (keyMap[40] && player2Rot < maxCannonAngle) //down
    {
        player2Rot += dt;
    }
    else if (keyMap[38] && player2Rot > 0) //up
    {
        player2Rot -= dt;
    }

    if(keyMap[16] && player2CanFire)
    {
        let radian = (maxCannonAngle-player2Rot+cannonAngleOffset)*Math.PI/180;
        cannonBalls.push({pos: new Vector(player2Pos.x-35, GetSinY(player2Pos.x, 375, oceanAmplitude * 2)), force: new Vector(-(Math.cos(radian) * cannonBallSpeed), Math.sin(-radian) * cannonBallSpeed)});
        player2CanFire = false;
        setTimeout(() => player2CanFire = true, fireRate);
    }

    //#endregion

    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear

    dt = (Date.now() - lastT) / (1000 / fps);
    // ctx.fillStyle = 'black';
    // ctx.font = "10px Arial";
    // ctx.fillText(dt, 0, 10);

    //ocean drawing
    oceanAmplitude = Math.sin(t * 0.01) * 5;
    SineWave(canvas.width, 400, oceanAmplitude);

    if(didPlayer1Win != null){
        if(didPlayer1Win){
            player2Pos.y += dt;
            DrawBoat2(player2Pos.x, player2Pos.y, 45);
            DrawBoat1(player1Pos.x, GetSinY(player1Pos.x, 375, oceanAmplitude * 2));
            EndGame("Player 1");
        }
        else if(!didPlayer1Win){
            player1Pos.y += dt;
            DrawBoat1(player1Pos.x, player1Pos.y, 45);
            DrawBoat2(player2Pos.x, GetSinY(player2Pos.x, 375, oceanAmplitude * 2));
            EndGame("Player 2");
        }
    }
    else{
        DrawBoat1(player1Pos.x, GetSinY(player1Pos.x, 375, oceanAmplitude * 2));
        DrawBoat2(player2Pos.x, GetSinY(player2Pos.x, 375, oceanAmplitude * 2));
    }

    for(let i = 0; i < cannonBalls.length; i++){
        if(cannonBalls[i].pos.y > canvas.height){//off screen
            cannonBalls.splice(i, 1)
        }
        else{
            DrawCannonBall(cannonBalls[i].pos, cannonBalls[i].force, i);
        }
    }

    lastT = Date.now();
    t++;
}
window.setInterval(Render, 1000/fps);

function DrawBoat1(x, y, angle=0)
{
    ctx.translate(x, y);
    ctx.rotate(angle * Math.PI / 180);
    
    //cannon
    ctx.fillStyle = "black";
    ctx.translate(35, 0);
    ctx.rotate(player1Rot * Math.PI / 180);
    ctx.fillRect(0, 0, 5, -15);
    ctx.rotate(-player1Rot * Math.PI / 180);
    ctx.translate(-35, 0);

    //hull
    ctx.fillStyle = "brown";
    ctx.fillRect(0, 0, 40, 20);

    //bowsprit
    ctx.strokeStyle = "brown";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(37, 3);
    ctx.lineTo(65, -3);
    ctx.stroke();

    //mast
    ctx.fillRect(15, 0, 5, -40);

    //sail
    ctx.fillStyle = "white";
    ctx.fillRect(18, -15, 10, -25);

    //captains quarters
    ctx.fillStyle = "brown";
    ctx.fillRect(-10, -10, 20, 20);

    ctx.rotate(-angle * Math.PI / 180);
    ctx.translate(-x, -y);
}
function DrawBoat2(x, y, angle=0)
{
    ctx.translate(x, y);
    ctx.rotate(-angle * Math.PI / 180);
    
    //cannon
    ctx.fillStyle = "black";
    ctx.translate(-35, 0);
    ctx.rotate(-player2Rot * Math.PI / 180);
    ctx.fillRect(0, 0, -5, -15);
    ctx.rotate(player2Rot * Math.PI / 180);
    ctx.translate(35, 0);

    //hull
    ctx.fillStyle = "brown";
    ctx.fillRect(0, 0, -40, 20);

    //bowsprit
    ctx.strokeStyle = "brown";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-37, 3);
    ctx.lineTo(-65, -3);
    ctx.stroke();

    //mast
    ctx.fillRect(-15, 0, -5, -40);

    //sail
    ctx.fillStyle = "white";
    ctx.fillRect(-18, -15, -10, -25);

    //captains quarters
    ctx.fillStyle = "brown";
    ctx.fillRect(10, -10, -20, 20);

    ctx.rotate(angle * Math.PI / 180);
    ctx.translate(-x, -y);
}

function DrawCannonBall(pos, force, i)
{
    ctx.fillStyle = "black";

    pos.Add(new Vector(force.x * dt, force.y + gravity * dt));

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 3, 0, 2*Math.PI);
    ctx.fill();

    let drag = force.x < 0 ? new Vector(-baseDrag.x, baseDrag.y) : baseDrag;

    if(cannonBalls[i].pos.y > player1Pos.y && cannonBalls[i].pos.y < 400 && cannonBalls[i].pos.x > player1Pos.x && cannonBalls[i].pos.x < player1Pos.x+35 && didPlayer1Win == null){
        EndGame("Player 2");
        didPlayer1Win = false;
        return;
    }
    if(cannonBalls[i].pos.y > player2Pos.y && cannonBalls[i].pos.y < 400 && cannonBalls[i].pos.x < player2Pos.x && cannonBalls[i].pos.x > player2Pos.x-35 && didPlayer1Win == null){
        EndGame("Player 1");
        didPlayer1Win = true;
        return;
    }

    if(cannonBalls[i].pos.y > 400){//in the water
        force.x += drag.x*15*dt;
        force.x = drag.x < 0 ? force.x < 0 ? 0 : force.x : force.x > 0 ? 0 : force.x;
        
        force.y -= drag.y*gravity*dt;
        force.y = force.y < -gravity+1 ? -gravity+1 : force.y;
    }
    else{
        force.Add(new Vector(drag.x * dt, drag.y * dt));
    }
}

function SineWave(length, yOffset, amplitude)
{
    ctx.fillStyle = "blue";
    let x = 0;
    
    for(let i = 0; i < length; i++)
    {
        let y = GetSinY(x, yOffset, amplitude);

        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillRect(x, y, 10, canvas.height);

        x+=1;
    }
}

function GetSinY(x, offset, amplitude)
{
    let y = Math.sin(x*Math.PI/180);

    if(y >=0){
        y = offset - y * amplitude;
    }
    else if( y < 0 ){
        y = offset + -y * amplitude;
    }

    return y;
}

function EndGame(winner)
{
    ctx.fillStyle = 'black';
    ctx.font = "30px Arial";
    ctx.fillText("Game Over! " + winner + " Got That Booty!", canvas.width/2 - 250, canvas.height/2 - 100);
    ctx.fillText("Press R to Restart.", canvas.width/2 - 125, canvas.height/2 - 70);
}
