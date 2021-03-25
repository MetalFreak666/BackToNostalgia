var socket;
socket = io.connect();
var socketReady = false;

//Emit the random position in x and y to the server
function onSocketConnected () {
    //Creating random x and y coordinates for player start location
    var x = randomInt(100, 800);
    var y = randomInt(100, 800);
    var angle = randomInt(0, 200);
    //Emit player start position to the server
    socket.emit('createNewPlayer', {x, y, angle});
}
//Providing random coordinates for new player
function randomInt (lowNumber, highNumber) {
    return Math.floor(Math.random() * (highNumber - lowNumber) + lowNumber);
}

//Adding playert tank sprite
function playerTank (id, x, y, angle) {
    //Constructor for playerTank
    playerTank.id = id;
    playerTank.x = x;
    playerTank.y = y;
    playerTank.angle = angle;
    //Adding sprite            
    playerTank = game.add.sprite(playerTank.x, playerTank.y, 'tiger2');
    playerTank.name = id;
    //Always init physics
    game.physics.enable(playerTank, Phaser.Physics.ARCADE);
    playerTank.anchor.setTo(0.5, 0.5);
    playerTank.enableBody = true;
    playerTank.body.setSize(150,70,70,70);
    playerTank.body.collideWorldBounds = true;
    //game.debug.spriteInfo(playerTank, 32, 32);
    game.camera.follow(playerTank);
    socketReady = true;
}

//Adding tank turret
function playerTankTurret (id, x, y, angle) {
    playerTankTurret.id = id;
    playerTankTurret.x = x;
    playerTankTurret.y = y;
    playerTankTurret.angle = angle;
    game.physics.enable(playerTankTurret, Phaser.Physics.ARCADE);
    playerTankTurret = game.add.sprite(playerTankTurret.x, playerTankTurret.y, 'tiger2turret');
    playerTankTurret.scale.x = 0.3;
    playerTankTurret.scale.y = 0.3;
    playerTankTurret.anchor.setTo(0.35, 0.51);    
}

//Game configuration
var game = new Phaser.Game(1000, 570, Phaser.AUTO, document.getElementById('game'),{ 
    preload: preload, 
    create: create, 
    update: update,
    render: render
});

//Game values:
var enemyPlayers;
var enemyPlayersTurret;
var playerBullet;
var bullet;

var enemyTank;
var enemyTankTurret;
var ammoBox;
var healthBox;

var enemyPlayers = [];
var enemyPlayersTurret = [];

//Storing game obstacles 
var obstaclesInGame = [];
var bonusGameItems = [];

var map;
var bulletTime = 0;
var nextFire = 0;

var tankSound;
var shootSound;
var tankHoldSound;
var makeSoundForward = false;
var makeHoldSound = false;
var makeFireSound = false;

//Phaser preload() function. Used for loading of assets resources for the game
function preload() {
    //Resources for game characters
    game.load.image('tiger2','assets/sprites/kingTiger.png');
    game.load.image('tiger2turret', 'assets/sprites/kingTigerTurret.png');
    game.load.image('bullet', 'assets/sprites/bullet.png');
    //Resources for game enviroment
    game.load.image('house', 'assets/sprites/house.png');
    game.load.image('bunker1', 'assets/sprites/bunker1.png');
    game.load.image('bunker2', 'assets/sprites/bunker2.png');
    game.load.image('ammoItem', 'assets/sprites/ammoBox.png');
    game.load.image('healthItem', 'assets/sprites/healthBox.png');
    //Resources for Tilmap
    game.load.tilemap('map', 'assets/map/map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/mapTileset.png',32,32);
    //Gameover
    game.load.image('gameover', 'assets/sprites/gameover.png');
    //Resources for sound
    game.load.audio('tankSound', 'sound/tanksound1.mp3');
    game.load.audio('shootSound', 'sound/shootSound.mp3');
    game.load.audio('tankHoldSound', 'sound/tankHold.mp3');
};

//Phaser create() function. Used when creating objects and performing socket communication
function create() {
    
    tankSound = game.add.audio('tankSound');
    shootSound = game.add.audio('shootSound');
    tankHoldSound = game.add.audio('tankHoldSound');
    //tankSound.play();
    //Calling create map function from map.js
    map();    
    //Creating player bullets group
    createPlayerBullet();
    //Creating enemy bullets group
    createEnemyBullets();
    //Initial handshake when client connect to the game
    onSocketConnected();
    //Socket.io handlers
    socket.on('createPlayer', createPlayerTank);
    //
    socket.on('removePlayer', removePlayerTank);
    //
    socket.on('createObstacles', addObstacle);
    //
    socket.on('createAmmoItems', addBonusItems);
    //
    socket.on('createEnemy', addNewEnemy);
    //
    socket.on('onEnemyMovement', enemyTankMovement);
    //
    socket.on('onEnemyTurretMovement', enemyTankTurretUpdate);
    //
    socket.on('onEnemyFire', onEnemyFire);
    //
    socket.on('bulletsLeft', fire);
    //
    socket.on('updateScore', updateScore);
    //
    socket.on('updateHealth', updateHealth);
    //
    socket.on('onEnemyCollectedAmmo', updateAmmoBoxes);
    //
    socket.on('onEnemyCollectedHealth', updateHealthBoxes);
    
    //Creating object that contains 4 hotkeys for Up,Down,Righ,Left 
    cursors = game.input.keyboard.createCursorKeys();
    //Adding Q and E keyboard key for turret rotation
    rotationLeftKey = game.input.keyboard.addKey(Phaser.Keyboard.Q);
    rotationRightKey = game.input.keyboard.addKey(Phaser.Keyboard.E);
    //Adding WASD controlling keys
    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    //Creating spacebar key for shooting
    space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    //Creating sound effects
    tankSound.loopFull();
    tankSound.play();
    shootSound.loopFull();
    shootSound.play();
    tankHoldSound.loopFull();
    tankHoldSound.play();
    
};

//Phaser update() core game loop. 
function update() {
    //console.log(makeFireSound);    
    if(makeSoundForward == false) {
        tankSound.pause();
        tankHoldSound.resume();
    } else if(makeSoundForward == true){
        tankSound.resume();
        tankHoldSound.pause();
    }
    
    if(makeFireSound == false) {
        shootSound.pause();
    } else if (makeFireSound == true){
        shootSound.resume();
    }
    
    //Check if socket is ready before calling playerTank object
    if(socketReady == true) {
        
        //Collision detection    
        for (var i = 0; i < enemyPlayers.length; i++) {
            //
            if(enemyPlayers[i]){
                //Collision between player and enemy 
                game.physics.arcade.collide(playerTank, enemyPlayers[i].enemyTank);
                //game.debug.body(enemyPlayers[i].enemyTank);
            } 
            //
            if(enemyPlayers[i]) {
                //var enemyPlayerID = enemyPlayers[i].enemyTank.name;
                game.physics.arcade.collide(playerBullet, enemyPlayers[i].enemyTank, playerHitEnemyTank);
                //game.debug.body(playerBullet);
            }
        }
        
        for(var i = 0; i < obstaclesInGame.length; i++) {
            game.physics.arcade.collide(playerTank, obstaclesInGame[i].gameObstacle);
            //game.debug.body(obstaclesInGame[i].gameObstacle);
            
        }
        
        for(var i = 0; i < obstaclesInGame.length; i++) {
            game.physics.arcade.collide(playerBullet, obstaclesInGame[i].gameObstacle, playerBulletHitObstacle);
        }
        
        for(var i = 0; i < bonusGameItems.length; i++) {
            game.physics.arcade.collide(playerTank, bonusGameItems[i].ammoBox, collectedAmmoItem);
            game.physics.arcade.collide(playerTank, bonusGameItems[i].healthBox, collectedHealthItem);
        }
        
        //Player movement values
        playerTank.body.velocity.x = 0;
        playerTank.body.velocity.y = 0;
        playerTank.body.angularVelocity = 0;
        
        //When performing turn right movement
        if(cursors.right.isDown || dKey.isDown) {
            playerTank.body.angularVelocity += 50;
            
        } 
        
        //When performing turn left movement
        if(cursors.left.isDown || aKey.isDown) {
            playerTank.body.angularVelocity -= 50;
        } 
        
        //When performing forward movement
        if(cursors.up.isDown || wKey.isDown) {
            game.physics.arcade.velocityFromAngle(playerTank.angle, 200, playerTank.body.velocity);
            playerTankTurret.x = playerTank.x;
            playerTankTurret.y = playerTank.y;
            makeSoundForward = true;
        } else if (!cursors.up.isDown || !wKey.isDown) {
            makeSoundForward = false;
        }
        
        //When performing backword movement
        if(cursors.down.isDown || sKey.isDown) {
            game.physics.arcade.velocityFromAngle(playerTank.angle, -100, playerTank.body.velocity);
            playerTankTurret.x = playerTank.x;
            playerTankTurret.y = playerTank.y;

        } 
        
        //When performing turret rotation to the left
        if(rotationLeftKey.isDown) {
            playerTankTurret.angle -=0.5;
        }
        
        //When performing turret rotation to the right
        if (rotationRightKey.isDown) {
            playerTankTurret.angle +=0.5;
            
        }
            
        //When shooting
        if(space.isDown) {
            makeFireSound = true;
            //Adding a delay so the fire function is not firing multipletime 
            if(game.time.now > nextFire) {
                socket.emit('playerFire', {x: playerTankTurret.x, y: playerTankTurret.y, angle: playerTankTurret.angle, rotation: playerTankTurret.rotation});
                fire();
                nextFire = game.time.now + 2000;
                
            }
        } else if (!space.isDown) {
            makeFireSound = false;
        }
        
        //Used for emit player position
        socket.emit('playerMovement', {x: playerTank.x, y: playerTank.y, angle: playerTank.angle});
        //Used for emit player turret position
        socket.emit('playerTankTurret', {angle: playerTankTurret.angle});
                
    }      
};

//Used for debug game sprites
function render() {
    if(socketReady == true) {
    //game.debug.cameraInfo(game.camera, 32, 32);
    //game.debug.spriteInfo(playerTank, 32, 32);
    //game.debug.spriteCoords(playerTank, 32, 500);
    //game.debug.text('Amount of bullets left' + playerTank.bullets, 32, 300);
    //Collision body box of player tank    
    //game.debug.body(playerTank);
    //game.debug.body(playerBullet);
    }
}

function collectedAmmoItem(playerTank, ammoBox) {
    var itemID = ammoBox.name;
    ammoBox.destroy();    
    var playerID = playerTank.name;
    console.log("ammobox " + itemID + playerID);
    //Sending item and player id to the server
    socket.emit('playerCollectedAmmo', {itemID: itemID, playerID: playerID});
    
    //var remove = findAmmoItem(itemID);
    //bonusGameItems.splice(bonusGameItems.indexOf(remove), 1);
    
}

function collectedHealthItem(playerTank, healthBox) {
    var itemID = healthBox.name;
    healthBox.destroy();
    var playerID = playerTank.name;
    console.log("healthbox " + itemID + playerID);
    socket.emit('playerCollectedHealth', {itemID: itemID, playerID: playerID});
    
    //var remove = findHealthItem(itemID);
    //bonusGameItems.splice(bonusGameItems.indexOf(remove), 1);
}


//Function for creating player tank
function createPlayerTank(data) {
    //console.log('createPlayerData ' + JSON.stringify(data));
    var id = data.id;
    var x = data.x;
    var y = data.y;
    var angle = data.angle;
    //var bullets = data.bullets;
    var PlayerTank = new playerTank(id, x, y, angle);
    var PlayerTankTurret = new playerTankTurret(id, x, y, angle);
}


function createEnemyBullets() {
    //Adding bullets
    enemyBullet = game.add.group();
    enemyBullet.enableBody = true;
    enemyBullet.physicsBodyType = Phaser.Physics.ARCADE;
    //playerBullet.physics.enable(playerBullet, Phaser.Physics.ARCADE);
    enemyBullet.createMultiple(30, 'bullet');
    enemyBullet.firerate = 100;
    enemyBullet.setAll('anchor.x', -10);
    enemyBullet.setAll('anchor.y', 0.9);
    enemyBullet.setAll('outOfBoundsKill', true);
    enemyBullet.setAll('checkWorldBounds', true);
    
}

//Used to reset playerBullet
function resetBullet(bullet){
    bullet.kill();
}


//Creating bullets
function createPlayerBullet() {
    //playerBullet = game.add.sprite(playerTank.x, playerTank.y, 'bullet');    
    //playerBullet.physicsBodyType = Phaser.Physics.ARCADE;
    //playerBullet.enableBody = true;
    //playerBullet.anchor.set('anchor.x', -10);
    //playerBullet.anchor.set('anchor.y', 0.9);
    
    playerBullet = game.add.group();
    playerBullet.createMultiple(50, 'bullet');
    playerBullet.physicsBodyType = Phaser.Physics.ARCADE;
    //playerBullet = game.add.sprite(playerTank.x, playerTank.y, 'bullet');    
    
    playerBullet.enableBody = true;
    //playerBullet.anchor.set('anchor.x', -10);
    //playerBullet.anchor.set('anchor.y', 0.9);
    playerBullet.setAll('anchor.x', -10);
    playerBullet.setAll('anchor.y', 0.9);
    playerBullet.setAll('outOfBoundsKill', true);
    playerBullet.setAll('checkWorldBounds', true);
    
    
}

function fire(data) {
    //Checking player bullets
    var bullet = playerBullet.getFirstExists(false);
    var bulletsLeft = data;
    //var nextFire = game.time.now + firerate;
    
    //Using for player HUD 
    var textarea = document.getElementById('bullets');
    textarea.value = bulletsLeft;
    
    //Checking the bullets
    if(bulletsLeft > 0) {
        //Adding firerate
        if (game.time.now > bulletTime) {
            bullet = playerBullet.getFirstExists(false);
            
            if (bullet) {
                bullet.reset(playerTank.x, playerTank.y);
                bullet.angle = playerTankTurret.angle;
                game.physics.arcade.enable(bullet);
                game.physics.arcade.velocityFromRotation(playerTankTurret.rotation, 800, bullet.body.velocity);
                bulletTime = game.time.now + 2000;
            }
        }
    }
}

function playerHitEnemyTank(enemyTank) {
    console.log("player hit enemy");
    var enemyTankID = enemyTank.name;
    var playerTankID = playerTank.name;
        
    //We emit to server enemy and our id    
    socket.emit('playerHitEnemy', {enemyID: enemyTankID, playerID: playerTankID});
    
}

function playerBulletHitObstacle(playerBullet, gameObstacle) {
    var bullet = playerBullet;
    var obstacle = gameObstacle;
    console.log('hit obstacle' + bullet + obstacle);
}


function onEnemyFire(data) {
    //enemyFire = true;
    //var enemyTank = findEnemy(data.id);
    var ebullet = enemyBullet.getFirstExists(false);
    ebullet.angle = data.currentAngle;
    if(ebullet){
        ebullet.reset(data.currentX, data.currentY);
        game.physics.arcade.velocityFromRotation(data.currentRotation, 500, ebullet.body.velocity);            
    }    
}

//Update score in HUD
function updateScore(data) {
    var score = data;
    var textarea = document.getElementById('score');
    textarea.value = score;
        
}

//Update player lifebar
function updateHealth(data) {
    var health = data;
    var textarea = document.getElementById('lifeBar');
    //Check player condition
    if(health >= 0) {
        textarea.value = health + "% left"; 
    
    //If player health is less then 0 his is dead!
    } else if (health <= 0) {
        textarea.value = "You are dead!";
        game.add.sprite(playerTank.x - (game.width / 3), playerTank.y - (game.height / 3), 'gameover');
    }
}