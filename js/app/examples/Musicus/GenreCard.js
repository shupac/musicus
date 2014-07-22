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
    var imageWidth = 240;
    var imageHeight = 240;
    var autoplay = "";
    // var autoplay = "autoplay";

    var frontContent = '';
    frontContent += '<img class="item-image" src="' + this.model.get('imageUrl') + '" width=' + imageWidth + ' height=' + imageHeight + '/>';
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
    backContent += '<h2 class="item-title">' + this.model.get('artist') + '</h2>';
    backContent += '<h2 class="item-subtitle">' + this.model.get('title') + '</h2>';



    this.frontSurface.pipe(this.eventOutput);


    this.frontNode.link(this.frontSurface);

  };

  SongCard.prototype.flip = function() {
  };

  SongCard.prototype.disableFlip = function() {
    this.moving = true;
  };

  SongCard.prototype.enableFlip = function() {
    this.moving = false;
  };

  // SongCard.prototype.setModifier = function(transform) {
  //   this.modifier.setTransform(transform);
  // };

  module.exports = SongCard;
});
