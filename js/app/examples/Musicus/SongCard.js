define(function(require, exports, module) {
	var View            = require('famous/View');
	var Modifier        = require('famous/Modifier');
	var Surface         = require('famous/Surface');
	var RenderNode      = require('famous/RenderNode');
	var EventHandler    = require('famous/EventHandler');
	var FM              = require('famous/Matrix');
	var Tracker         = require('famous-physics/utils/PhysicsTracker');
	var Particle        = require('famous-physics/bodies/Particle');
	var Physics         = require('famous-physics/PhysicsEngine');
	var Spring          = require('famous-physics/forces/Spring');
	var Spring          = require('famous-physics/forces/Spring');  
	

	function SongCard(options) { 
		View.apply(this);

		// Setting options
		this.options = {
			size: [250, 250]
		};

		this.model = options.model;

		if(options) this.setOpts(options);

		this.modifier = new Modifier();

		this._link(this.modifier);

		this.frontNode = new RenderNode();
		this.backNode = new RenderNode();
		this.frontModifier = new Modifier();
		this.backModifier = new Modifier({
			transform: FM.rotateY(Math.PI)
		});

		this.frontNode.link(this.frontModifier);
		this.backNode.link(this.backModifier);

		this._add(this.modifier).link(this.frontNode);
		this._add(this.modifier).link(this.backNode);

		this.construct();
		this.eventOutput.on('click', function() {
			// if(!this.moving) {
				// this.flip();
			// }
		}.bind(this));
	}

	SongCard.prototype = Object.create(View.prototype);
	SongCard.prototype.constructor = SongCard;

	SongCard.prototype.construct = function() {
		// construct front surface
		var imageSize = 240;

		var autoplay = "";
		// var autoplay = "autoplay";

		window.urls = [];

		var frontContent = '';
		frontContent += '<img class="item-image" src="' + this.model.get('imageUrl') + '" width=' + imageSize + ' height=' + imageSize + '/>';
		urls.push(this.model.get('imageUrl'));
		// frontContent += '<h2 class="item-title">' + this.model.get('artist') + '</h2>';
		// frontContent += '<h2 class="item-subtitle">' + this.model.get('title') + '</h2>';

		this.frontSurface = new Surface({
			size: this.options.size,
			classes: ['song-card', 'song-card-front'],
			content: frontContent
		});

		// construct back surface
		var backContent = '';
		// backContent += '<img class="item-waveform" src="' + this.model.get('waveformUrl') + '" />';
		backContent += '<h2 class="item-title">' + this.model.get('title') + '</h2>';

		// backContent += '<h2 class="item-description"> Artist </h2>';
		backContent += '<h2 class="item-attribute">' + this.model.get('artist') + '</h2>';
	
		// backContent += '<h2 class="item-description"> Year </h2>';
		// backContent += ' &middot; <h2 class="item-attribute">' + this.model.get('date').substr(0, 4) + '</h2>';

		// backContent += '<h2 class="item-description">  </h2>';
		backContent += '<h2 class="item-attribute"> Genre: ' + this.model.get('genre') + ' &middot ' + this.model.get('date').substr(0,4) + '</h2>';

		this.backSurface = new Surface({
			size: this.options.size,
			classes: ['song-card', 'song-card-back'],
			content: backContent
		});

		this.frontSurface.pipe(this.eventOutput);
		this.backSurface.pipe(this.eventOutput);

		this.frontNode.link(this.frontSurface);
		this.backNode.link(this.backSurface);
	};

	SongCard.prototype.flip = function() {
		if(!this.flipped) {
			this.modifier.setTransform(FM.rotateY(Math.PI), {duration: 300});
			this.flipped = true;
		} else {
			this.modifier.setTransform(FM.rotateY(0), {duration: 300});
			this.flipped = false;
		}
	};

	SongCard.prototype.disableFlip = function() {
		this.moving = true;
	};

	SongCard.prototype.enableFlip = function() {
		this.moving = false;
	};

	SongCard.prototype.setOpts = function(options) {
			for(var key in options) {
					this.options[key] = options[key];
			}
	};

	module.exports = SongCard;
});
