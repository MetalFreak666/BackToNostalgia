//Game obstacles class
var gameObstacle = function(id, x, y, obstacleType, game) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.obstacleType = obstacleType;
    this.game = game;
        
    if(this.obstacleType == 1) {
        this.gameObstacle = game.add.sprite(this.x, this.y, 'bunker1');
        game.physics.enable(this.gameObstacle, Phaser.Physics.ARCADE);
        this.gameObstacle.body.enable = true;
        this.gameObstacle.body.checkCollision.up = true;
        this.gameObstacle.body.checkCollision.down = true;  
        
        this.gameObstacle.body.immovable = true;
    
    } else if (this.obstacleType == 2) {
        this.gameObstacle = game.add.sprite(this.x, this.y, 'bunker2');
        game.physics.enable(this.gameObstacle, Phaser.Physics.ARCADE);
        this.gameObstacle.body.enable = true;
        this.gameObstacle.body.checkCollision.up = true;
        this.gameObstacle.body.checkCollision.down = true;  
        this.gameObstacle.body.immovable = true;
        
    } else if (this.obstacleType == 3) {
        this.gameObstacle = game.add.sprite(this.x, this.y, 'house');
        game.physics.enable(this.gameObstacle, Phaser.Physics.ARCADE);
        this.gameObstacle.body.enable = true;
        this.gameObstacle.body.checkCollision.up = true;
        this.gameObstacle.body.checkCollision.down = true;  
        this.gameObstacle.body.immovable = true;
    }
}

//
function addObstacle(data) {
    var id = data.id;
    var x = data.x;
    var y = data.y;
    var obstacleType = data.obstacleType;
    
    obstaclesInGame.push(new gameObstacle(id, x, y, obstacleType, game));
}