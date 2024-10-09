//set canvas and the width
const canvas=document.getElementById("myCanvas");
canvas.width=200;

//2d rendering context for drawing on the canvas
const ctx = canvas.getContext("2d");
//create new road and car object, start car in middle lane
const road = new Road(canvas.width/2,canvas.width*.9);
const car = new Car(road.getLaneCenter(1),100,30,50);

//start animation loop
animate();

function animate(){
    //update car position and control
    car.update();
    //adjust canvas height based on window size
    canvas.height=window.innerHeight;

    //save canvas and shift it to follow cars movements
    ctx.save();
    ctx.translate(0, -car.y + canvas.height*.7);

    //draw road and car on canvas
    road.draw(ctx);
    car.draw(ctx);

    //restore canvas state adn call animate function for following frames
    ctx.restore();
    requestAnimationFrame(animate);
    /*request animation frame calls 
    the function inside various times, 
    giving the illusion of annimation, creation of loop*/
}