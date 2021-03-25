//Function for creating tilemap
var map = function () {
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
