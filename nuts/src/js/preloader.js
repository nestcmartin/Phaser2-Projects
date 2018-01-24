'use strict';

Game.Preloader = function(game) {
	this.preloadBar = null;
};

Game.Preloader.prototype = {

	preload: function() {
		this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloaderBar');
		this.preloadBar.anchor.setTo(0.5, 0.5);

		this.time.advanceTiming = true;
		this.load.setPreloadSprite(this.preloadBar);

		// LOAD ASSETS
		this.load.tilemap('map', 'assets/level1.csv');
		this.load.image('tileset', 'assets/tileset.png');
		this.load.spritesheet('player', 'assets/player.png', 24, 26);
		this.load.spritesheet('buttons', 'assets/buttons.png', 193, 71);
		this.load.image('drag', 'assets/drag.png');
		this.load.image('enemy', 'assets/enemy.png');		
		this.load.image('nut', 'assets/nut.png');
	},

	create: function() {
		this.state.start('play');
	}
};