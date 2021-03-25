var enemyTank = function (id, game, enemyTank, x, y, angle) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.angle = angle;
    //this.game = game;
    this.player = enemyTank;
    this.enemyTank = game.add.sprite(this.x, this.y, 'tiger2');
    this.enemyTank.name = id;
    this.enemyTank.angle = angle;
    this.enemyTank.x = x;
    this.enemyTank.y = y;
    //Always init physics
    game.physics.enable(this.enemyTank, Phaser.Physics.ARCADE);
    this.enemyTank.enableBody = true;
    this.enemyTank.body.setSize(150,70,70,70);
    this.enemyTank.anchor.setTo(0.5, 0.5);
    this.enemyTank.body.immovable = true;
    this.enemyTank.body.collideWorldBounds = true; 
    
}

//Adding new enemy player
function addNewEnemy(data) {
    var id = data.id;
    var x = data.x;
    var y = data.y;
    var angle = data.angle;
    
    //We pushing new enemy to our Array of enemy pkayers
    enemyPlayers.push(new enemyTank(id, game, enemyTank, x, y));
    enemyPlayersTurret.push(new enemyTankTurret(id, game, enemyTankTurret, x, y));
}

//Used for removing enemy tank when disconnected
function removePlayerTank(data) {
    //Removing dissconnected player
    var removePlayerTank = findEnemy(data.id);
    var removePlayerTurret = findTurret(data.id);
	removePlayerTank.enemyTank.destroy();
    removePlayerTurret.enemyTankTurret.destroy();
	enemyPlayers.splice(enemyPlayers.indexOf(removePlayerTank), 1);
    enemyPlayersTurret.splice(enemyPlayersTurret.indexOf(removePlayerTurret), 1);
}

//When receiving data from server about enemy movement perform this
function enemyTankMovement(data) {
    //First find the right player by findEnemy()
    var updateEnemyPosition = findEnemy(data.id);
    var updateTurret = findTurret(data.id);
    
    for (var i in enemyPlayers) {        
        if (enemyPlayers[i].id == updateEnemyPosition.id) {
            enemyPlayers[i].x = updateEnemyPosition.x;
            enemyPlayers[i].y = updateEnemyPosition.y;
            enemyPlayers[i].angle = updateEnemyPosition.angle;
            break; 
        }
    }
    
    //If update perform this
    if(updateEnemyPosition) {    
        updateEnemyPosition.enemyTank.x = data.x;
        updateEnemyPosition.enemyTank.y = data.y;
        updateEnemyPosition.enemyTank.angle = data.angle;
        updateTurret.enemyTankTurret.x = data.x;
        updateTurret.enemyTankTurret.y = data.y;
    } 
}

//Used to find enemy tank entity
function findEnemy(id) {
	for (var i = 0; i < enemyPlayers.length; i++) {
		if (enemyPlayers[i].enemyTank.name == id) {
			return enemyPlayers[i];
		}
	}
}
