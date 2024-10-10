
class Car{
    constructor(x,y,width,height){
        //initialize car position, dimensions, movement
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;

        //speed
        this.speed = 0;
        this.acceleration=0.45;
        this.maxSpeed = 4.5;
        this.friction = 0.03;
        //angle and turning
        this.angle = 0;
        this.turnAngle = 0;
        this.damaged = false;

        //sensor for detecting collisions
        this.sensor=new Sensor(this);
        //controls for user input
        this.controls=new Controls();
    }


    update(roadBorders){
        //update car and sensor position based on user inputs
        if (!this.damaged) {
            this.#move();
            this.polygon= this.#createPolygon();
            this.damaged= this.#assessDamage(roadBorders);
        }
        this.sensor.update(roadBorders);
    }

    #assessDamage(roadBorders){
        for (let i = 0; i < roadBorders.length; i++) {
            if (polysIntersect(this.polygon, roadBorders[i])) {
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


    draw(ctx){
        //draw car and sensor on canvas based on its angle and rotation
        if (this.damaged) {
            ctx.fillStyle = "red";
        }else{
            ctx.fillStyle = "black";
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();

        this.sensor.draw(ctx);
    }
}