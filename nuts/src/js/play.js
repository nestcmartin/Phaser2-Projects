

EnemyBird = function(index, game, x, y) {

	this.bird = game.add.sprite(x, y, 'enemy');
	this.bird.anchor.setTo(0.5, 0.5);
	this.bird.name = index.toString();

	game.physics.enable(this.bird, Phaser.Physics.ARCADE);
	this.bird.body.immovable = true;
	this.bird.body.collideWorldBounds = true;
	this.bird.body.allowGravity = false;

	this.bird.tween = game.add.tween(this.bird).to(
		{ y: this.bird.y + 100 }, 2000, 'Linear', true, 0 , 100, true);
};

Game.Play = function(game) {

};

var map;
var layer;

var player;
var controls = {};
var playerSpeed = 150;
var jumpTimer = 0;

var button;
var drag;

var enemy;

var shootTime = 0;
var nuts;

Game.Play.prototype = {

	create: function(game) {
		this.stage.backgroundColor = '#3A5963';

		this.physics.arcade.gravity.y = 1400;

		map = this.add.tilemap('map', 64, 64);
		map.addTilesetImage('tileset');
		layer = map.createLayer(0);
		layer.resizeWorld();
		map.setCollisionBetween(0, 5);
		map.setTileIndexCallback(51, this.resetPlayer, this);
		map.setTileIndexCallback(50, this.getCoin, this);

		player = this.add.sprite(100, 560, 'player');
		player.anchor.setTo(0.5, 0.5);

		player.animations.add('iddle', [0, 1], 1, true);
		player.animations.add('jump', [2], 1, true);
		player.animations.add('run', [3, 4, 5, 6, 7, 8], 7, true);

		this.physics.arcade.enable(player);
		this.camera.follow(player);
		player.body.collideWorldBounds = true;

		controls = {
			right: this.input.keyboard.addKey(Phaser.Keyboard.D),
			left: this.input.keyboard.addKey(Phaser.Keyboard.A),
			up: this.input.keyboard.addKey(Phaser.Keyboard.W),
			shoot: this.input.keyboard.addKey(Phaser.Keyboard.UP),

		};

		button = this.add.button(this.world.centerX - 95, this.world.centerY + 200, 
			'buttons', function() { console.log("pressed"); }, this, 2, 1, 0);
		button.fixedToCamera = true;

		drag = this.add.sprite(player.x, player.y, 'drag');
		drag.anchor.setTo(0.5, 0.5);
		drag.inputEnabled = true;
		drag.input.enableDrag(true);

		enemy = new EnemyBird(0, game, player.x + 400, player.y - 200);

		nuts = this.add.group();
		nuts.enableBody = true;
		nuts.physicsBodyType = Phaser.Physics.ARCADE;
		nuts.createMultiple(5, 'nut');

		nuts.setAll('anchor.x', 0.5);
		nuts.setAll('anchor.y', 0.5);
		nuts.setAll('scale.x', 0.5);
		nuts.setAll('scale.y', 0.5);
		nuts.setAll('outOfBoundsKill', true);
		nuts.setAll('checkWorldBounds', true);

	},

	update: function() {

		this.physics.arcade.collide(player, layer);
		this.physics.arcade.collide(player, enemy.bird, this.resetPlayer);

		player.body.velocity.x = 0;

		if (controls.up.isDown 
			&& (player.body.onFloor() || player.body.touching.down) 
			&& this.time.now > jumpTimer)
		{
			player.animations.play('jump');
			player.body.velocity.y = -600;
			jumpTimer = this.time.now + 750;
		}

		if (controls.right.isDown) {
			player.animations.play('run');
			player.scale.setTo(1,1);
			player.body.velocity.x += playerSpeed;
		}

		if (controls.left.isDown) {
			player.animations.play('run');
			player.scale.setTo(-1,1);
			player.body.velocity.x -= playerSpeed;
		}

		if (player.body.velocity.x === 0 && player.body.velocity.y === 0) {
			player.animations.play('iddle');
		}

		if (controls.shoot.isDown) {
			this.shootNut();
		}

		if(checkOverlap(nuts, enemy.bird)) {
			enemy.bird.kill();
		}


	},

	resetPlayer: function() {
		player.reset(100, 560);
	},

	getCoin: function() {
		map.putTile(-1, layer.getTileX(player.x), layer.getTileY(player.y));
	},

	shootNut: function() {
		if(this.time.now > shootTime) {
			nut= nuts.getFirstExists(false);
			if(nut) {
				nut.reset(player.x, player.y);
				nut.body.velocity.y = -600;
				shootTime = this.time.now + 900;
			}
		}
	}
};

function checkOverlap(spriteA, spriteB) {
	var boundsA = spriteA.getBounds();
	var boundsB = spriteB.getBounds();

	return Phaser.Rectangle.intersects(boundsA, boundsB);
}