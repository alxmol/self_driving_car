//set canvas and the width
const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=400;

//2d rendering context for drawing on the canvas
const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
//create new road and car object, start car in middle lane
const road = new Road(carCanvas.width/2,carCanvas.width*.9);
const car = new Car(road.getLaneCenter(1),100,30,50,"AI");
const traffic = [
    new Car(road.getLaneCenter(1),-100,30,50,"DUMMY", 2)
];

//start animation loop
animate();

function animate(time){
    for (let i = 0; i < traffic.length; i++){
        traffic[i].update(road.borders,[]);
    }
    //update car position and control
    car.update(road.borders, traffic);
    //adjust canvas height based on window size
    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    //save canvas and shift it to follow cars movements
    carCtx.save();
    carCtx.translate(0, -car.y + carCanvas.height*.7);

    //draw road and car on canvas
    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++){
        traffic[i].draw(carCtx, "grey");
    }
    car.draw(carCtx, "blue");

    //restore canvas state adn call animate function for following frames
    carCtx.restore();

    networkCtx.lineDashOffset = -time/50;

    Visualizer.drawNetwork(networkCtx, car.brain);
    requestAnimationFrame(animate);
    /*request animation frame calls 
    the function inside various times, 
    giving the illusion of annimation, creation of loop*/
}