var gameItems = function(id, x, y, bonusType) {
    this.gameItemId = id;
    this.spawnX = x;
    this.spawnY = y;
    this.bonusType = bonusType;
    
    if(this.bonusType == 1) {
        this.ammoBox = game.add.sprite(this.x, this.y, 'ammoItem');
        this.ammoBox.name = id;
        this.ammoBox.x = x;
        this.ammoBox.y = y;
        game.physics.enable(this.ammoBox, Phaser.Physics.ARCADE);
        this.ammoBox.enableBody = true;
        this.ammoBox.body.immovable = true;
    
    } else if (this.bonusType == 2) {
        this.healthBox = game.add.sprite(this.x, this.y, 'healthItem');
        this.healthBox.name = id;
        this.healthBox.x = x;
        this.healthBox.y = y;
        game.physics.enable(this.healthBox, Phaser.Physics.ARCADE);
        this.healthBox.enableBody = true;
        this.healthBox.body.immovable = true;
    }   
}

function addBonusItems (data) {
    var id = data.id;
    var x = data.x;
    var y = data.y;
    var bonusType = data.bonusType;
    
    bonusGameItems.push(new gameItems(id, x, y, bonusType)); 
}

function updateAmmoBoxes(data) {
    console.log(data);
    var removeAmmoItem = findAmmoItem(data.id);
    if(removeAmmoItem){
        console.log(removeAmmoItem);
        removeAmmoItem.ammoBox.destroy();
        bonusGameItems.splice(bonusGameItems.indexOf(removeAmmoItem), 1);
    }
}


function updateHealthBoxes(data) {
    console.log(data);
    //var removeHealthItem = findHealthItem(data.id);
    
    var test = findGameItem(data.id);
    test.healthBox.destroy();
    /*
    if(removeHealthItem){
        removeHealthItem.healthBox.destroy();
        bonusGameItems.splice(bonusGameItems.indexOf(removeHealthItem), 1);
    } 
    */
}

function findGameItem(id){
    for(var i = 0; i < bonusGameItems.length; i++) {
        if(bonusGameItems[i].gameItemId == id){
            return bonusGameItems[i];
        } 
    } 
}


function findAmmoItem(id){
    for(var i = 0; i < bonusGameItems.length; i++) {
        if(bonusGameItems[i].ammoBox.name == id){
            return bonusGameItems[i];
        } 
    } 
}

function findHealthItem(id){
    for(var i = 0; i < bonusGameItems.length; i++) {
        if(bonusGameItems[i].healthBox.name == id){
            return bonusGameItems[i];
        } 
    } 
}

