/**@type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const collisionCanvas = document.getElementById("canvas2");
const collisionCtx = collisionCanvas.getContext("2d");
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;
ctx.font = "50px sans-serif";
let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;
let score = 0;
let ravens = [];

class Raven{
    constructor(){
        this.spriteWidth = 266;
        this.spriteHeight = 188;
        this.sizeModifier = Math.random()*0.6+0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.image = new Image();
        this.image.src = 'enemy2.png';
        this.MarkForDeletion = false;
        this.timeSinceFlap = 0;
        this.frame = 0;
        this.flapInterval = Math.random() * 50 + 20;
        this.directX = this.flapInterval * 0.125;
        this.directY = Math.random() * 5 - 2.5;
        this.angle = Math.random();
        this.angleSpeed = Math.random() * 0.2;
        this.curve = Math.random()*7;
        this.randomColor = [Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255)]
        this.color = 'rgb('+this.randomColor[0]+','+this.randomColor[1]+','+this.randomColor[2]+')';
        }
        update(delatTime){
           if(this.y < 0 || this.y > (canvas.height-this.height)){
            this.directY = this.directY*(-1);
           }  
           if(this.x+this.width < 0) this.x = canvas.width;
           else this.x -= this.directX;
           this.y +=  Math.sin(this.angle)*this.directY;
           this.angle += this.angleSpeed;
           this.timeSinceFlap += delatTime;
            if(this.timeSinceFlap > this.flapInterval){
               if(this.frame>4) 
               this.frame = 0;
               else 
               this.frame++;
               this.timeSinceFlap = 0;
            }
        
        if(this.x < 0 - this.width) this.MarkForDeletion = true;
    }
        draw(){
            collisionCtx.fillStyle = this.color;
            collisionCtx.fillRect(this.x, this.y, this.width, this.height);
            ctx.drawImage(this.image, this.frame*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }
};

let explosions = [];
class Exploson{
    constructor(x, y, size){
        this.image = new Image();
        this.image.src = 'boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.sound = new Audio();
        this.sound.src = 'boom.wav';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 80;
        this.frame = 0;
        this.MarkForDeletion = false;
    }
    update(delatTime){
        if(this.frame == 0) this.sound.play();
        this.timeSinceLastFrame += delatTime;
        if(this.timeSinceLastFrame > this.frameInterval){
            this.frame++;
            if(this.frame > 5) this.MarkForDeletion = true;
            
        }
        
    }
    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.size, this.size)
    }
};
function DrawScore(){
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 50, 75);
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 52, 80);
    
}

window.addEventListener('click', function(e){
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    const pc = detectPixelColor.data;

    ravens.forEach(object => {
        if(object.randomColor[0]==pc[0] && object.randomColor[1]==pc[1] && object.randomColor[2]==pc[2]){
            //collision Dertection
            object.MarkForDeletion = true;
            score++;
            explosions.push(new Exploson(object.x, object.y, object.width));
        }
    });
});

function animate(timestamp){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, collisionCanvas.width, collisionCanvas.height);
    let delatTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += delatTime;
    if(timeToNextRaven > ravenInterval){
        ravens.push(new Raven()); 
        timeToNextRaven = 0;
        ravens.sort(function(a,b){
            return a.width - b.width;
        })
    }
    DrawScore();
    [...ravens,...explosions].forEach(element => {
        element.update(delatTime);
        element.draw();
    });
    ravens = ravens.filter(element => !element.MarkForDeletion);
    explosions = explosions.filter(element => !element.MarkForDeletion);
    requestAnimationFrame(animate);
}
animate(0);