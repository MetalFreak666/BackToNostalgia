//Adding enemy tank turret to the game
var enemyTankTurret = function (id, game, enemyTankTurret, x, y, angle) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.game = game;
    this.turret = enemyTankTurret;
        
    this.enemyTankTurret = game.add.sprite(this.x, this.y, 'tiger2turret');
    game.physics.enable(this.enemyTankTurret, Phaser.Physics.ARCADE);
    this.enemyTankTurret.scale.x = 0.3;
    this.enemyTankTurret.scale.y = 0.3;
    this.enemyTankTurret.anchor.setTo(0.35, 0.51); 
}

//When receiving data from server about enemy turret movement perform this
function enemyTankTurretUpdate(data) {
    //First find the right player turret
    var updateTurretPosition = findTurret(data.id);
    //Performing if statement if updateTurretPossition
    if(updateTurretPosition) {
        updateTurretPosition.enemyTankTurret.angle = data.angle;
    }
}

//Used to find enemy tank turret entity
function findTurret(id) {
    for (var i = 0; i < enemyPlayersTurret.length; i++) {
		if (enemyPlayersTurret[i].id == id) {
			return enemyPlayersTurret[i];
		}
	}    
}


