var game = new Phaser.Game(1280, 720, Phaser.CANVAS, '');

var spacefield;
var backgroundv;
var player;
var cursors;
var bullets;
var bulletTime = 0;
var fireButton;
var enemies;
var score = 0;
var scoreString = '';
var scoreText;
var lives;
var enemyBullet;
var stateText;
var livingEnemies = [];
var firingTimer = 0;

var sounds = {
  
  musica: null,
  update: function() {
    if(!this.musica.isPlaying) this.musica.play();
  }
}

var mainState = {
	preload: function() {
		game.load.image('starfield', 'assets/starfield.png');
		game.load.image('player', 'assets/ship.png');
		game.load.image('bullet', 'assets/bullet.png');
		game.load.image('enemy', 'assets/enemy.png');
		game.load.image('enemyBullet', 'assets/enemyBullet.png');		
		game.load.image('live', 'assets/live.png');
		game.load.audio('ngin', ['assets/ngin.ogg']);
	},

	create: function() {

		game.physics.startSystem(Phaser.Physics.ARCADE);

		spacefield = game.add.tileSprite(0, 0, 1280, 1440, 'starfield')
		backgroundv = 5;
		
		player = game.add.sprite(game.world.centerX, game.world.centerY + 200, 'player');
		game.physics.arcade.enable(player,Phaser.Physics.ARCADE);
		cursors = game.input.keyboard.createCursorKeys();
		fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

		bullets = game.add.group();
		bullets.enableBody = true;
    	bullets.physicsBodyType = Phaser.Physics.ARCADE;
		bullets.createMultiple(30, 'bullet');
		bullets.setAll('anchor.x', 0.5);
		bullets.setAll('anchor.y', 1);
		bullets.setAll('outOfBoundsKill', true);
		bullets.setAll('checkWorldBounds', true);		

		enemies = game.add.group();
		enemies.enableBody = true;
		enemies.physicsBodyType = Phaser.Physics.ARCADE;
		createEnemies();

		enemyBullets = game.add.group();
	    enemyBullets.enableBody = true;
	    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
	    enemyBullets.createMultiple(30, 'enemyBullet');
	    enemyBullets.setAll('anchor.x', 0.5);
	    enemyBullets.setAll('anchor.y', 1);
	    enemyBullets.setAll('outOfBoundsKill', true);
	    enemyBullets.setAll('checkWorldBounds', true);

	    scoreString = 'Score : ';
	    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

	    lives = game.add.group();
	    game.add.text(game.world.width - 120, 10, 'Lives : ', { font: '34px Arial', fill: '#fff' });

	    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
	    stateText.anchor.setTo(0.5, 0.5);
	    stateText.visible = false;

	    for (var i = 0; i < 3; i++) 
	    {
	        var live = lives.create(game.world.width - 100 + (30 * i), 60, 'live');
	        live.anchor.setTo(0.5, 0.5);
	    }
	},

	update: function() {

		sounds.update();

		spacefield.tilePosition.y += backgroundv;

		if (player.alive)
	    {
	        //  Reset the player, then check for movement keys
	        player.body.velocity.setTo(0, 0);

	        if (cursors.left.isDown)
	        {
	            player.body.velocity.x = -200;
	        }
	        else if (cursors.right.isDown)
	        {
	            player.body.velocity.x = 200;
	        }

	        if (fireButton.isDown)
	        {
	            fireBullet();
	        }

	        if (game.time.now > firingTimer)
	        {
	            enemyFires();
	        }

	        game.physics.arcade.overlap(bullets, enemies, collisionHandler, null, this);
	        game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
	    }
	}

}

function fireBullet() {

	if(game.time.now > bulletTime) {

		bullet = bullets.getFirstExists(false);
		if(bullet) {
			bullet.reset(player.x + 40, player.y);
			bullet.body.velocity.y = -400;
			bulletTime = game.time.now + 200;
		}
	}
}

function createEnemies() {
	for(var y = 0; y < 4; y++) {
		for(var x = 0; x < 10; x++) {
			var enemy = enemies.create(x * 120, y * 70, 'enemy');
			enemy.anchor.setTo(0.5, 0.5);
            enemy.body.moves = false;
		}
	}

	enemies.x = 50;
	enemies.y = 50;

	var tween = game.add.tween(enemies).to( { x: 150 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

    tween.onLoop.add(descend, this);
}

function descend() {
	enemies.y += 10;
}

function collisionHandler (bullet, enemy) {

    //  When a bullet hits an enemy we kill them both
    bullet.kill();
    enemy.kill();

    //  Increase the score
    score += 20;
    scoreText.text = scoreString + score;

    if (enemies.countLiving() === 0)
    {
        score += 1000;
        scoreText.text = scoreString + score;

        enemyBullets.callAll('kill',this);
        stateText.text = " You Won, \n Click to restart";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }

}

function enemyHitsPlayer (player,bullet) {
    
    bullet.kill();

    live = lives.getFirstAlive();

    if (live)
    {
        live.kill();
    }

    // When the player dies
    if (lives.countLiving() < 1)
    {
        player.kill();
        enemyBullets.callAll('kill');

        stateText.text=" GAME OVER \n Click to restart";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }

}

function enemyFires () {

    //  Grab the first bullet we can from the pool
    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length=0;

    enemies.forEachAlive(function(enemy){

        // put every living enemy in an array
        livingEnemies.push(enemy);
    });


    if (enemyBullet && livingEnemies.length > 0)
    {
        
        var random=game.rnd.integerInRange(0,livingEnemies.length-1);

        // randomly select one of them
        var shooter=livingEnemies[random];
        // And fire the bullet from this enemy
        enemyBullet.reset(shooter.body.x, shooter.body.y);

        game.physics.arcade.moveToObject(enemyBullet,player,120);
        firingTimer = game.time.now + 2000;
    }
}

function restart () {
    lives.callAll('revive');
    enemies.removeAll();
    createEnemies();
    player.revive();
    stateText.visible = false;
}

game.state.add('mainState', mainState);

game.state.start('mainState');