define(function(require, exports, module) {  	
    var Engine          = require('famous/Engine');
    var View            = require('famous/View');
 	var Surface         = require('famous/Surface'); 
    var Modifier        = require('famous/Modifier');
 	var FM              = require('famous/Matrix');  	
    var Easing          = require('famous-animation/Easing');
    var Utils           = require('famous-utils/Utils');
    var FeedbackBase    = require('./FeedbackBase');

    function FontFeedback () {

        FeedbackBase.apply( this, arguments );
       
        this.fontSurfaces   = [];
        this.fontMods       = [];
        this._fontContent   = 0;

        this.setContentRef( this.fontSurfaces );

    }

    FontFeedback.prototype = Object.create(FeedbackBase.prototype);
	FontFeedback.prototype.constructor = FontFeedback;
    FontFeedback.DEFAULT_OPTIONS = { 
        zDepth: 2,
        fontContent: ['a', 'b', 'c', 'd', 'e', 'f'],
        properties : [ ],
        size: [150, 100],
        curve: { 
            duration: 500,
            curve: 'linear'
        },
        opacityCurve: { 
            duration: 600,
            curve: 'outSineNorm'
        },
        fontProperties: { },
        fontClasses: ['feedback-font'],
        radius: 300
    }

    FontFeedback.prototype.create = function  () {

        var fontSurface =  new Surface({ 
            size: this.options.size,
            properties: this.options.fontProperties,
            classes: this.options.fontClasses
        });

        var fontMod = new Modifier({ 
            opacity: 0,
            size: this.options.size,
            transform: FM.translate( 0, 0, -20 )
        });
        
        this.fontSurfaces.push( fontSurface );
        this.fontMods.push( fontMod );

        this.node.add( fontMod ).link( fontSurface ); 

    }

    FontFeedback.prototype.animate = function ( pos, i, boundCallback ) {

        var x = pos[0] - this.options.size[0] * 0.5;
        var y = pos[1] - this.options.size[1] * 0.5;

        var centerMatrix = FM.move( FM.scale( 0.5, 0.5 ), [x, y, this.options.zDepth]);
        var size = this.options.pointSize;

        var theta = Math.random() * Math.PI;

        var offset = getCircularOffset( theta, this.options.radius );

        this.fontSurfaces[i].setContent( this.getContent() ); 

        this.fontMods[i].halt()
        this.fontMods[i].setTransform( centerMatrix ); 
        this.fontMods[i].setTransform(
            FM.translate( x - offset[0] , y - offset[1] ),
            this.options.curve);

        this.fontMods[i].setOpacity( 1 );
        this.fontMods[i].setOpacity( 0, this.options.opacityCurve, boundCallback );

    }

    FontFeedback.prototype.getContent = function () {

        var index = this._fontContent;

        this._fontContent++;
        return this.options.fontContent[ index % this.options.fontContent.length ];
    }

    function getCircularOffset ( theta, radius ) {
        return [ Math.cos( theta ) * radius , Math.sin( theta ) * radius ];
    }

    module.exports = FontFeedback;
});
