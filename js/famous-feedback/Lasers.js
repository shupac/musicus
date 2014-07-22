define(function(require, exports, module) {  	
    var Engine = require('famous/Engine');
    var View = require('famous/View');
 	var Surface = require('famous/Surface'); 
    var Modifier = require('famous/Modifier');
    var Easing = require('famous-animation/Easing');
 	var FM = require('famous/Matrix');  	

    /*
     *  Deprecated.
     *  Assumes [0,0] origin!
     *  Widget to give some visual feedback on clicks.
     */
    function Lasers () {
        View.apply(this, arguments);

        this.arrows     = [];
        this.points     = [];
        this.pointMods  = [];
        this.arrowMods  = [];

        this._inTransition = [];

        Engine.on('click', shootLasers.bind(this));

        createLaser.call( this );
    }

    Lasers.prototype = Object.create(View.prototype);
	Lasers.prototype.constructor = Lasers;
    
    Lasers.DEFAULT_OPTIONS = { 
        zDepth: 2,
        pointSize: [50, 50],
        pointScale: [2,2],
        useArrow: false,
        arrowSize: [5, 100],
        fadeCurve: { 
            duration: 500,
            curve: Easing.inOutBackNorm
        },
        pointProperties: { 
            'border-radius': '50px',
            'border': '1px solid white'
        },
        arrowProperties: { 'background-color': '#ffffff' }
    }

    function createLaser () {

        var point =  new Surface({ 
            size: this.options.pointSize,
            properties: this.options.pointProperties 
        });

        var pointMod = new Modifier({ 
            opacity: 0,
            size: this.options.pointSize
        });

        var arrow = new Surface({ 
            size: this.options.arrowSize,
            properties: this.options.arrowProperties
        });

        var arrowMod = new Modifier({ opacity: 0 });

        this.points.push( point );
        this.pointMods.push( pointMod );

        this.arrows.push( arrow );
        this.arrowMods.push( arrowMod );

        this._inTransition.push( false );

        this.node.add( pointMod ).link( point ); 
        this.node.add( arrowMod ).link( arrow );

    }

    function shootLasers( e ) {

        var index = getAvailable.call( this );
        var pos = [e.pageX, e.pageY];
        
        if( !this.points[index] ) createLaser.call( this );

        animate.call( this, pos, index );

    }

    /*
     * get first laser not currently animating
     */
    function getAvailable () {
        for (var i = 0; i < this._inTransition.length; i++) {
            if( !this._inTransition[i] ) {
                return i;
            }
        };
        return this._inTransition.length;
    }

    function animate ( pos, i ) {

        var centerMatrix = getCenterMatrix( pos, this.options.pointSize);

        var size = this.options.pointSize;

        var movedPosition = [
            pos[0] - size[0], 
            pos[1] - size[1],  
            this.options.zDepth
        ];

        var boundTransition = (function  ( index ) {
            this._inTransition[index] = false; 
        }).bind(this, i);

        // point animation
        this.pointMods[i].halt()
        this.pointMods[i].setTransform( centerMatrix ); 
        this.pointMods[i].setTransform(
            FM.move( 
                FM.scale(this.options.pointScale[0], this.options.pointScale[1]), 
                movedPosition 
            ), 
            this.options.fadeCurve);

        this.pointMods[i].setOpacity( 1 );
        this.pointMods[i].setOpacity( 0, this.options.fadeCurve, boundTransition );
        
        this._inTransition[i] = true;

        movedPosition[0] += size[0] * 0.5 * this.options.pointScale[0];
        movedPosition[1] += size[1] * 0.5 * this.options.pointScale[1];

        // arrow positioning
        if( this.options.useArrow ) {
            var rotation = Math.random() * 2 * Math.PI;
            
            this.arrowMods[i].setOpacity( 1 );
            this.arrowMods[i].setOpacity( 0, this.options.fadeCurve);

            this.arrowMods[i].setTransform( 
                FM.multiply( FM.rotateZ( rotation ), FM.move( FM.scale( 0.00001, 0.00001 ), movedPosition, 2 )
            ));
            
            this.arrowMods[i].setTransform(
                FM.multiply( FM.rotateZ( rotation ), FM.move( FM.scale( 2, 2, 1), movedPosition )), 
                this.options.fadeCurve);
        }

    }

    function getCenterMatrix (pos, size) {
       return FM.translate( pos[0] - size[0] * 0.5, pos[1] - size[1] * 0.5, 2 ); 
    }

    module.exports = Lasers;
});
