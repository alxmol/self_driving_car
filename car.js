
class Car{
    constructor(x,y,width,height, controlType, maxSpeed=4, color="blue"){
        //initialize car position, dimensions, movement
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;

        //speed
        this.speed = 0;
        this.acceleration=0.45;
        this.maxSpeed = maxSpeed;
        this.friction = 0.03;
        //angle and turning
        this.angle = 0;
        this.turnAngle = 0;
        this.damaged = false;

        this.useBrain = controlType == "AI";

        if (controlType != "DUMMY") {
            this.sensor=new Sensor(this);
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount, 6, 5]
            );
        }
        //controls for user input
        this.controls=new Controls(controlType);

        this.img = new Image();
        this.img.src = "car.png";

        this.mask = document.createElement('canvas');
        this.mask.width = this.width;
        this.mask.height = this.height;

        const maskCtx = this.mask.getContext('2d');
        this.img.onload = () => {
            maskCtx.fillStyle = color;
            maskCtx.fillRect(0, 0, this.width, this.height);
            maskCtx.fill();

            maskCtx.globalCompositeOperation = 'destination-atop';
            maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
        }
    }


    update(roadBorders, traffic){
        //update car and sensor position based on user inputs
        if (!this.damaged) {
            this.#move();
            this.polygon= this.#createPolygon();
            this.damaged= this.#assessDamage(roadBorders, traffic);
        }

        if (this.sensor){
            this.sensor.update(roadBorders, traffic);
            const offsets= this.sensor.readings.map(
                s=> s == null ? 0 : 1-s.offset
            );
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            if (this.useBrain) {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.backwards = outputs[3];
                this.controls.brake = outputs[4];
            }
        }
    }

    #assessDamage(roadBorders, traffic){
        for (let i = 0; i < roadBorders.length; i++) {
            if (polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        for (let i = 0; i < traffic.length; i++) {
            if (polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;
    }

    // create car polygon for collision detection
    #createPolygon(){
        const points = [];
        const radius = Math.hypot(this.width,this.height)/2;
        const alpha = Math.atan2(this.width,this.height);
        points.push({
            x: this.x - Math.sin(this.angle - alpha)*radius,
            y: this.y - Math.cos(this.angle - alpha)*radius
        });
        points.push({
            x: this.x - Math.sin(this.angle + alpha)*radius,
            y: this.y - Math.cos(this.angle + alpha)*radius
        });
        points.push({
            x: this.x - Math.sin(Math.PI+this.angle - alpha)*radius,
            y: this.y - Math.cos(Math.PI+this.angle - alpha)*radius
        });
        points.push({
            x: this.x - Math.sin(Math.PI+this.angle + alpha)*radius,
            y: this.y - Math.cos(Math.PI+this.angle + alpha)*radius
        });
        return points;

    }

    #move(){
        //speed based on forward/backward controls
        if(this.controls.forward){
            this.speed+=this.acceleration
        }
        if (this.controls.backwards){
            this.speed-=this.acceleration;
        }

        //cap speed to maxSpeed / half maxspeed, reverse
        if (this.speed>this.maxSpeed){
            this.speed=this.maxSpeed;
        }
        if(this.speed< -this.maxSpeed/2){
            this.speed= -this.maxSpeed/2
        }

        //braking functions
        if (this.controls.brake){
            if (this.speed > 0){
                this.speed -= this.acceleration * 2;
                if (this.speed < 0){
                    this.speed = 0;
                }            
            } else if (this.speed < 0){
                this.speed += this.acceleration * 2;
                if (this.speed > 0){
                    this.speed = 0;
                }
            }
        }

        //friction to slow car down
        if (this.speed>0){
            this.speed-=this.friction;
        }
        if(this.speed<0){
            this.speed+=this.friction;
        }
        if(Math.abs(this.speed)<this.friction){
            this.speed=0;
        }
        
        // Angular momentum for smoother turning
        if (this.controls.left) {
        this.turnAngle = Math.min(this.turnAngle + 0.002, 0.05);
        } else if (this.controls.right) {
        this.turnAngle = Math.max(this.turnAngle - 0.002, -0.05);
        } else {
        this.turnAngle *= 0.9;
        }

        //turn angle based on its speed
        if (this.speed != 0) {
        const flip = this.speed > 0 ? 1 : -1;
        this.angle += this.turnAngle * flip;
        }

        //update car position based on speed and angle
        this.x-=Math.sin(this.angle)*this.speed;
        this.y-=Math.cos(this.angle)*this.speed;
    }


    draw(ctx, drawSensor=false){
        if (this.sensor && drawSensor) {
            this.sensor.draw(ctx);
        }
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);
        if (!this.damaged) {
            ctx.drawImage(this.mask, -this.width/2, -this.height/2, this.width, this.height);
            ctx.globalCompositeOperation = "multiply";
        }
        ctx.drawImage(this.img, -this.width/2, -this.height/2, this.width, this.height);
        ctx.restore();
    }
}