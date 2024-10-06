class Controls{
    constructor(){
        this.forward=false;
        this.left=false;
        this.right=false;
        this.backwards=false;

        this.#addKeyboardListeners();

    }

    #addKeyboardListeners(){
        /*same thing as funcction(event)
        but arrow is more convenient, accesses
        the constructor
        */
        document.onkeydown=(event)=>{
            switch(event.key){
                case "ArrowUp":
                case "w":
                    this.forward = true;
                    break;
                case "ArrowLeft":
                case "a":
                    this.left = true;
                    break;
                case "ArrowRight":
                case "d":
                    this.right = true;
                    break;
                case "ArrowDown":
                case "s":
                    this.backwards = true;
                    break;
            }
            console.table(this);
        }
        document.onkeyup=(event)=>{
            switch(event.key){
                case "ArrowUp":
                case "w":
                    this.forward = false;
                    break;
                case "ArrowLeft":
                case "a":
                    this.left = false;
                    break;
                case "ArrowRight":
                case "d":
                    this.right = false;
                    break;
                case "ArrowDown":
                case "s":
                    this.backwards = false;
                    break;
            }
            console.table(this);
        }
    }
}