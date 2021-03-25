//Creating websocket server
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});
//Path to ressources files
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/sound', express.static(__dirname + '/sound'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/library',express.static(__dirname + '/library'));

server.listen(9997,function(){ 
    console.log('Listening on ' + server.address().port);
});

//Storing players in game
var playersInGame = [];
//Storing obtacles
var obstaclesInGame = [];
//Storing items
var itemsInGame = [];
//Highscore table
var highScore = [];

//Player class
var Player = function(id, x, y, angle, bullets, health, score) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.bullets = bullets;
    this.health = health;
    this.score = score;  
}

//Bonus items class
var BonusItem = function(id, x, y, bonusValue, bonusType) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.bonusValue = bonusValue;
    this.bonusType = bonusType;
}

//Game obstacles class
var GameObstacles = function(id, x, y, obstacleType) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.obstacleType = obstacleType;
}

//Providing random int 
function randomInt (lowNumber, highNumber) {
    return Math.floor(Math.random() * (highNumber - lowNumber) + lowNumber);
}

//Used for creating random obstacles objects
function createGameObstacles() {
    //Our random int for amount of obstacles
    var amount = randomInt(2,6);
    //Loop throught random int
    for(var i = 0; i < amount; i++) {
        var id = i;
        var x = randomInt(100, 1500);
        var y = randomInt(100, 1500);
        //Tells the game which sprite need to be created
        var obstacleType = randomInt(1,4);
        //Creating game obstacle and pushing it to the array
        var obstacle = new GameObstacles(id, x, y, obstacleType);
        obstaclesInGame.push(obstacle);
    } 
}

//Used for creating random items
function createAmmoItem() {
    var amount = 5;
    
    //Loop it 5 times
    for(var i = 0; i < amount; i++) {
        var id = "ammoBox" + i;
        var x = randomInt(100, 1500);
        var y = randomInt(100, 1500);
        var bonusValue = randomInt(1, 20);
        var bonusType = 1;
        //Pushing ammo item to the array of items
        var item = new BonusItem(id, x, y, bonusValue, bonusType);
        itemsInGame.push(item);
        //console.log(item);
    }  
}

//Used for creating random items
function createHealthItem() {
    var amount = 5;
    //Loop it 5 times
    for(var i = 0; i < amount; i++) {
        var id = "healthBox" + i;
        var x = randomInt(100, 1500);
        var y = randomInt(100, 1500);
        var bonusValue = randomInt(1, 20);
        var bonusType = 2;
        //Pushing ammo item to the array of items
        var item = new BonusItem(id, x, y, bonusValue, bonusType);
        itemsInGame.push(item);
        //console.log(item);
    }  
}


//Used for find the player by socket id
function findPlayerID(id) {
    for(var i = 0; i < playersInGame.length; i++){
        if(playersInGame[i].id == id){
            return playersInGame[i];
        } 
    }
    return false;
}

function findItemID(id) {
    for(var i = 0; i < itemsInGame.length; i++){
        if(itemsInGame[i].id == id){
            return itemsInGame[i];
        } 
    }
    return false;
}

//Listening on socket.io connected
io.sockets.on('connection', function(socket){
    //console.log("how many" + obstaclesInGame.length);
	//Test
    console.log("socket connected " + socket.id);
    //When socket disconnect
	socket.on('disconnect', onClientdisconnect);
    //When create new player
    socket.on('createNewPlayer', createPlayer); 
    //Used when player make movement
    socket.on('playerMovement', onPlayerMovement);
    //When player rotate tank turret
    socket.on('playerTankTurret', onPlayerTurretMovement);
    //When player fire
    socket.on('playerFire', onPlayerFire);
    //When player hit enemy tank
    socket.on('playerHitEnemy', onPlayerHitEnemy);
    //
    socket.on('playerCollectedAmmo', onPlayerCollectedAmmo);
    //
    socket.on('playerCollectedHealth', onPlayerCollectedHealth);
});

function onClientdisconnect() {
	console.log(this.id + ' disconnect');
    
    var removeClient = findPlayerID(this.id);
    
    if (removeClient) {
		playersInGame.splice(playersInGame.indexOf(removeClient), 1);
	}
    
    if (playersInGame.length < 0) {
        //Emptying array of game obstacles
        obstaclesInGame.length = 0;
        itemsInGame.length = 0;
    }
    
    this.broadcast.emit('removePlayer', {id: this.id});
}



function createPlayer(data) {
    console.log('create Player data: ' + data);
    
    var id = this.id;
    var x = data.x;
    var y = data.y;
    var angle = data.angle;
    //Our player initial values
    var bullets = 50;
    var health = 100;
    var score = 0; 
    
    //Creating player
    var newPlayer = new Player(id, x, y, angle, bullets, health, score);
    console.log('test ' + JSON.stringify(newPlayer));
    
    //Emit info about new player
    this.emit('createPlayer', {id: newPlayer.id, x: newPlayer.x, y: newPlayer.y, angle: newPlayer.angle, bullets});
    
    //If this is the first player, we create game obstacles and adding to the Array of obstacles
    if(playersInGame.length == 0 || obstaclesInGame.length <= 0) {
        createGameObstacles();
        createAmmoItem();
        createHealthItem();
        for(i = 0; i < obstaclesInGame.length; i++) {
            var id = obstaclesInGame[i].id;
            var x = obstaclesInGame[i].x;
            var y = obstaclesInGame[i].y;
            var obstacleType = obstaclesInGame[i].obstacleType;
            
            this.emit('createObstacles', {id: id, x: x, y: y, obstacleType: obstacleType}); 
        }        
        for(i = 0; i < itemsInGame.length; i++) {
            //console.log(itemsInGame.length);
            var id = itemsInGame[i].id;
            var x = itemsInGame[i].x;
            var y = itemsInGame[i].y;
            var bonusType = itemsInGame[i].bonusType;
            
            this.emit('createAmmoItems', {id: id, x: x, y: y, bonusType: bonusType}); 
        }
        
    //Else if this is another player we simply send the obstacles that are allready created
    } else if(playersInGame.length > 0) {
        for(i = 0; i < obstaclesInGame.length; i++) {
            var id = obstaclesInGame[i].id;
            var x = obstaclesInGame[i].x;
            var y = obstaclesInGame[i].y;
            var obstacleType = obstaclesInGame[i].obstacleType;
            
            this.emit('createObstacles', {id: id, x: x, y: y, obstacleType: obstacleType});
        }
        
        for(i = 0; i < itemsInGame.length; i++) {
            //console.log(itemsInGame.length);
            var id = itemsInGame[i].id;
            var x = itemsInGame[i].x;
            var y = itemsInGame[i].y;
            var bonusType = itemsInGame[i].bonusType;
    
            this.emit('createAmmoItems', {id: id, x: x, y: y, bonusType: bonusType}); 
        }
    }
    
    //Loop used to getting info about player that are already connected to the game
    for(i = 0; i < playersInGame.length; i++){
        existingPlayers = playersInGame[i];
        var id = existingPlayers.id;
        var x = existingPlayers.x;
        var y = existingPlayers.y;
        var angle = existingPlayers.angle;
        //Emiting info about enemies already conected to the game
        this.emit('createEnemy', {id: existingPlayers.id, x: existingPlayers.x, y: existingPlayers.y, angle: existingPlayers.angle})
    }
    
    //Broadcast new player info to the other connected sockets
    this.broadcast.emit('createEnemy', {id: newPlayer.id, x: newPlayer.x, y: newPlayer.y, angle: newPlayer.angle});
    //Pushing player info to the List
    playersInGame.push(newPlayer); 
}

//
function onPlayerMovement(data) {
    //console.log('onMovement' + JSON.stringify(data));
    var id = this.id;
    var x = data.x;
    var y = data.y;
    var angle = data.angle;
    
    this.broadcast.emit('onEnemyMovement', {id, x, y, angle});
    
    //Updating player in playersÍnGame
    for (var i in playersInGame) {        
        if (playersInGame[i].id == id) {
            playersInGame[i].x = x;
            playersInGame[i].y = y;
            playersInGame[i].angle = angle;
            break; 
        }
    }
}

function onPlayerTurretMovement(data) {
    var id = this.id;
    var angle = data.angle;
    
    this.broadcast.emit('onEnemyTurretMovement', {id, angle});
}

//When player fire bullet
function onPlayerFire(data) {
    //console.log('on player fire ' + JSON.stringify(data));
    var player = findPlayerID(this.id);
    var bulletsLeft = player.bullets - 1;
    //Updating bullets 
    updateBulletsAmount(player.id, bulletsLeft);
    
    var id = this.id;
    var currentX = data.x;
    var currentY = data.y;
    var currentAngle = data.angle;
    var currentRotation = data.rotation;
    
    this.emit('bulletsLeft', bulletsLeft);
    this.broadcast.emit('onEnemyFire', {id, currentX, currentY, currentAngle, currentRotation, bulletsLeft});
}

//When player hit enemy tank
function onPlayerHitEnemy(data) {
    console.log('player hit enemy ' + JSON.stringify(data));
    var enemy = findPlayerID(data.enemyID);
    var player = findPlayerID(data.playerID);

    if(enemy) {
        //Enemy lose 10 health when hit by bullet
        var health = enemy.health - 10;
        updatePlayerHealth(enemy.id, health);
        console.log(health);
        this.broadcast.to(enemy.id).emit('updateHealth', health);
        
    }
    
    if(player) {
        //Adding 10 score to player for hitting enemy tank
        var newScore = player.score + 10;        
        updatePlayerScore(player.id, newScore);
    }
    var score = player.score;
    this.emit('updateScore', score);
}

//Function when player picked item
function onPlayerCollectedAmmo(data) {
    var pickedItem = findItemID(data.itemID);
    var player = findPlayerID(data.playerID);
    
    //New amount of player bullets
    var bulletsUpdate = player.bullets + pickedItem.bonusValue;
    //Sending new amount of bullets to updateBulletsAmount() for update of bullets
    updateBulletsAmount(player.id, bulletsUpdate);
    
    this.broadcast.emit('onEnemyCollectedAmmo', {id: pickedItem.id});
    //Removing item from array
    itemsInGame.splice(itemsInGame.indexOf(pickedItem), 1);
}

function onPlayerCollectedHealth(data) {
    var pickedHealthItem = findItemID(data.itemID);
    var player = findPlayerID(data.playerID);
    
    //New amount of player bullets
    var healthUpdate = player.health + pickedHealthItem.bonusValue;
    //Sending new amount of bullets to updateBulletsAmount() for update of bullets
    updatePlayerHealth(player.id, healthUpdate); 
    
    this.broadcast.emit('onEnemyCollectedHealth', {id: pickedHealthItem.id});
    //Removing item from array
    itemsInGame.splice(itemsInGame.indexOf(pickedHealthItem), 1);
}


//Function for updating player score
function updatePlayerScore(id, newScore) {
    for (var i in playersInGame) {        
        if (playersInGame[i].id == id) {
            playersInGame[i].score = newScore;
            break; 
        }
    }
}

//Function for updating player health
function updatePlayerHealth(id, updateHealth) {
    for (var i in playersInGame) {        
        if (playersInGame[i].id == id) {
            playersInGame[i].health = updateHealth;
            break; 
        }
    }    
}

//Function for updating bullets
function updateBulletsAmount(id, bulletsLeft) {
   for (var i in playersInGame) {        
        if (playersInGame[i].id == id) {
            playersInGame[i].bullets = bulletsLeft;
            break; 
        }
    }    
}

