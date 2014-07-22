define(function(require, exports, module) {  	
    var Engine          = require('famous/Engine');
    var View            = require('famous/View');
 	var Surface         = require('famous/Surface'); 
    var Modifier        = require('famous/Modifier');
 	var FM              = require('famous/Matrix');  	
    var Easing          = require('famous-animation/Easing');
    var Utils           = require('famous-utils/Utils');
    var FeedbackBase    = require('./FeedbackBase');

    function CircleFeedback () {

        FeedbackBase.apply( this, arguments );
       
        this.arrows     = [];
        this.points     = [];
        this.pointMods  = [];
        this.arrowMods  = []; 

        this.setContentRef( this.points );
    }

    CircleFeedback.prototype = Object.create(FeedbackBase.prototype);
	CircleFeedback.prototype.constructor = CircleFeedback;

    CircleFeedback.DEFAULT_OPTIONS = { 
        zDepth: 2,
        pointSize: [50, 50],
        pointScale: [2,2],
        arrowSize: [5, 100],
        fadeCurve: { 
            duration: 500,
            curve: Easing.inOutBackNorm
        },
        pointProperties: { 
            'borderRadius': '50px',
            'border': '1px solid white'
        },
        arrowProperties: { 'backgroundColor': '#ffffff' }
    }

    CircleFeedback.prototype.create = function  () {

        var point =  new Surface({ 
            size: this.options.pointSize,
            properties: this.options.pointProperties 
        });

        var pointMod = new Modifier({ 
            opacity: 0,
            size: this.options.pointSize,
            transform: FM.scale(0.001, 0.001)
        });

        this.points.push( point );
        this.pointMods.push( pointMod );


        this.node.add( pointMod ).link( point ); 

    }

    CircleFeedback.prototype.animate = function ( pos, i, boundCallback ) {

        var centerMatrix = Utils.getCenterMatrix( pos, this.options.pointSize, 2);

        var size = this.options.pointSize;

        var movedPosition = [
            pos[0] - size[0], 
            pos[1] - size[1],  
            this.options.zDepth
        ];

        this.pointMods[i].halt();
        this.pointMods[i].setTransform( centerMatrix ); 
        this.pointMods[i].setTransform(
            FM.move( 
                FM.scale(this.options.pointScale[0], this.options.pointScale[1]), 
                movedPosition 
            ), 
            this.options.fadeCurve);

        this.pointMods[i].setOpacity( 1 );
        this.pointMods[i].setOpacity( 0, this.options.fadeCurve, (function ( cb, i ) {

            if( cb ) cb();
            this.pointMods[i].setTransform( FM.scale(0.0001, 0.0001 ) );

        }).bind(this, boundCallback, i ));
        
    }

    module.exports = CircleFeedback;
});
