//Socket init
var socket = io.connect('http://localhost:9997'); 
//socket = io.connect();

//Phaser game configuration
game = new Phaser.Game(1000, 600, Phaser.AUTO, document.getElementById('game'));


var main = function(game) {
    
};

function onsocketConnected () {
    console.log('onsocketConnected');
    createPlayerTank();
    socket.emit('createNewPlayer', {x: 400, y: 400});
}

//Function for creating player tank
function createPlayerTank() {
    playerTank = game.add.sprite(400, 400, 'tiger2');
    playerTank.anchor.setTo(0.5, 0.5);
    //Always init physics
    game.physics.enable(playerTank, Phaser.Physics.ARCADE);
    playerTank.enableBody = true;
    playerTank.body.collideWorldBounds = true;
}

//Function for creating tilemap
function createMap() {
    //Loading tilemap 
    var map = game.add.tilemap('map');
    map.addTilesetImage('tilesheet', 'tileset');
    //Setting bounds to the world (x,y,gameWidth,gameHeight)
    game.world.setBounds(0, 0, 1600, 1600);
    //If map has a layers a loop must be created to load the layers    
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }
}

//Function for creating enemy player tank
function createEnemyPlayer(id, startX, startY) {
    this.x = startX;
    this.y = startY;
    this.id = id;
    this.playerTank = game.add.sprite(this.x, this.y);
    
}


main.prototype = {
    preload: function() {
        game.load.image('tiger2','assets/sprites/kingTiger.png');
        game.load.image('bullet', 'assets/sprites/bullet.png');
        game.load.tilemap('map', 'assets/test/map2.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.spritesheet('tileset', 'assets/test/decor.png',32,32);
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
    },
    
    create: function() {        
        console.log("client started");
		socket.on("connect", onsocketConnected); 
        createMap();
    },
    
    update: function() {
        
        
    },
    
    render: function() {
    
    }
}

var gameBoot = {
    init: function(gameContainerElementId){
		game.state.add('main', main);
		game.state.start('main'); 
    }
};

gameBoot.init("game");


