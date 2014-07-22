define(function(require, exports, module) {  	
 	var Surface = require('famous/Surface'); 
    var View = require('famous/View');
 	var FM = require('famous/Matrix');  	
    var Modifier = require('famous/Modifier');
    var Easing = require('famous-animation/Easing');

    function RotateButton (options) {
        View.apply( this );
        this.eventInput.pipe( this.eventOutput );

        this.options = {
            surfaceOptions: {},
            openState: FM.identity,
            closeState: FM.rotateZ( Math.PI * 0.75 ),
            transition: { 
                curve: Easing.inOutBackNorm,
                duration: 500
            }
        }; 
        this.setOptions( options );

        this.surface = new Surface(this.options.surfaceOptions); 

        this.surface.pipe(this); 

        this.transform = new Modifier({ 
            origin : [0.5, 0.5], 
            size: this.surface.getSize() 
        });

        this._link( this.transform ).link( this.surface );

        this.surface.pipe( this );
        this.surface.on('click', this.toggle.bind( this ));

        this._state = false;

        this._boundOpen = this.emit.bind( this, 'open'); 
        this._boundClose = this.emit.bind( this, 'close'); 
        
    }
    RotateButton.prototype = Object.create( View.prototype );
    RotateButton.prototype.constructor = RotateButton;

    RotateButton.prototype.getSize = function () {
        return this.surface.getSize(); 
    };

    RotateButton.prototype.toggle = function (e) {
        if( e && e.stopPropagation ) e.stopPropagation();

        if( this._state == false ) {
            this.open(); 
        } else { 
            this.close();
        }
    };

    RotateButton.prototype.open = function () {
        this._state = true;
        this.transform.halt();
        this.emit('open');
        this.transform.setTransform( this.options.closeState, this.options.transition);
    }; 

    RotateButton.prototype.close = function () {
        this._state = false;
        this.transform.halt();
        this.emit('close');
        this.transform.setTransform( this.options.openState, this.options.transition);
    };

    module.exports = RotateButton;
});
