define(function(require, exports, module) {
    var Surface = require('famous/Surface');
    var CanvasSurface = require('famous/CanvasSurface');
    var FM = require('famous/Matrix');
    var FEH = require('famous/EventHandler');
    var Modifier = require('famous/Modifier');
    var Transitionable = require('famous/Transitionable');
    var Utils = require('famous-utils/Utils');
    var Color = require('famous-color/Color');
    var View = require('famous/View');
    var Engine = require('famous/Engine');
    var Utils = require('famous-utils/Utils');
    var Easing = require('famous-animation/Easing');
    var Time = require('famous-utils/Time');

    // Color Picker Pieces
    var GradientPicker = require('./GradientPicker');
    var HuePicker = require('./HuePicker');
    var AlphaPicker = require('./AlphaPicker');
    var ColorButton = require('./ColorButton'); 

    function ColorPicker ( options ) { 
        View.apply( this );

        this.options = {
            transition: {
                curve: Easing.inOutBackNorm,
                duration: 400
            },
            hueSize: 30,
            pickerSize: [25, 25],
            size: undefined,
            defaultColor: new Color( 80, 255, 255 ),
            name : '',
            useAlpha: true,
            padding: 5
        }; 

        this.setOptions( options );
        this.color = this.options.defaultColor;

        this.sizeState = new Transitionable([0, 0]);

        this.visible = false;
        this.boundListener = false;

        this._closeListen = this.hide.bind(this);
    }

    ColorPicker.prototype = Object.create(View.prototype);
    ColorPicker.prototype.constructor = ColorPicker;

    ColorPicker.prototype.init = function () {

        this.defaultPositions = {
            gradientPicker  : FM.translate( 0, this.options.size[1], 1),
            huePicker       : FM.translate( 0, this.options.size[1] + this.options.size[0] , 1),
            alphaPicker     : FM.translate( 0, this.options.size[1] * 2 + this.options.size[0] + this.options.padding * 3, 1)
        }; 

        this.gradientPicker = new GradientPicker([this.options.size[0], this.options.size[0]], this.color);
        this.gradientTransform = new Modifier({ transform: this.defaultPositions.gradientPicker });

        this.huePicker = new HuePicker([this.options.size[0], this.options.hueSize], this.color, this.options.pickerSize);
        this.hueTransform = new Modifier({ transform: this.defaultPositions.huePicker  });

        this.openingSurface = new ColorButton(this.options.size, this.color, this.options.name);
        this.openingTransform = new Modifier();

        this._add(this.hueTransform)._link(this.huePicker);
        this._add(this.openingTransform)._link(this.openingSurface);
        this._add(this.gradientTransform)._link(this.gradientPicker); 

        this.openingSurface.on('click', this.togglePicker.bind(this));

        this.huePicker.on('change', updateFromHue.bind(this));
        this.gradientPicker.on('change', updateFromGradient.bind(this));

        this.on('change', updateColorButton.bind(this));


        if( this.options.useAlpha ) { 
            this.alphaPicker = new AlphaPicker([this.options.size[0], this.options.hueSize], this.color, this.options.pickerSize )
            this.alphaTransform = new Modifier({ transform: this.defaultPositions.alphaPicker });
            this._add( this.alphaTransform )._link( this.alphaPicker );
            this.alphaPicker.on('change', updateFromAlpha.bind(this));
        }

        this.hide();
    };

    // TODO
    ColorPicker.prototype.set = function (r, g, b, a) {
        
    };

    ColorPicker.prototype.get = function() { 
        return this.gradientPicker.getColor();
    };

    ColorPicker.prototype.emitChange = function() { 
        this.emit('change', {value: this.get()});
    };

    ColorPicker.prototype.togglePicker = function() {
        if(this.visible == false) {
            this.show();
        } else {
            this.hide();
        }
    };
    
    ColorPicker.prototype.hide = function(e) {
        
        this.visible = false;

        // all hidden at same spot.
        var hiddenMatrix = FM.multiply( FM.scale( 1, 0.0000001 ), this.defaultPositions.gradientPicker);

        this.hueTransform.halt();
        this.hueTransform.setOpacity(0, this.options.transition);
        this.hueTransform.setTransform(hiddenMatrix, this.options.transition );

        this.gradientTransform.halt();
        this.gradientTransform.setOpacity(0, this.options.transition);
        this.gradientTransform.setTransform(hiddenMatrix, this.options.transition );

        if( this.options.useAlpha ) { 

            this.alphaTransform.halt();
            this.alphaTransform.setOpacity(0, this.options.transition);
            this.alphaTransform.setTransform( hiddenMatrix, this.options.transition );
        } 

        this.sizeState.set([this.options.size[0], this.options.size[1]], this.options.transition );

        if(this.boundListener == true) this.unbindClickClose(); 
    };

    ColorPicker.prototype.show = function() {
        
        this.emit('showing');
        this.visible = true;

        this.hueTransform.halt();
        this.hueTransform.setOpacity(1, this.options.transition);
        this.hueTransform.setTransform( this.defaultPositions.huePicker, this.options.transition );

        this.gradientTransform.halt();
        this.gradientTransform.setOpacity(1, this.options.transition);
        this.gradientTransform.setTransform( this.defaultPositions.gradientPicker, this.options.transition );

        if( this.options.useAlpha ) { 

            this.alphaTransform.halt();
            this.alphaTransform.setOpacity(1, this.options.transition);
            this.alphaTransform.setTransform( this.defaultPositions.alphaPicker, this.options.transition );

            this.sizeState.set(
                [
                    this.options.size[0], 
                    this.gradientPicker.getSize()[1] + this.huePicker.getSize()[1] + this.openingSurface.getSize()[1] + this.alphaPicker.getSize()[1]
                ], 
                this.options.transition );

        } else { 

            this.sizeState.set(
                [
                    this.options.size[0], 
                    this.gradientPicker.getSize()[1] + this.huePicker.getSize()[1] + this.openingSurface.getSize()[1]
                ], 
                this.options.transition );
        }

        Engine.defer(this.bindClickClose.bind(this));
    };

    ColorPicker.prototype.setSize = function ( size ) {
        this.options.size = size;
    };

    ColorPicker.prototype.getSize = function () {
        return this.options.size ? this.sizeState.get() : undefined;
    };

    ColorPicker.prototype.bindClickClose = function () {
        Engine.on('click', this._closeListen);
        this.boundListener = true;
    };

    ColorPicker.prototype.unbindClickClose = function() {
        Engine.unbind('click', this._closeListen);
        this.boundListener = false;
    };

    ColorPicker.prototype.render = function( input ) {
        return {
            size: this.sizeState.get(),
            target: this.node.render()
        }
    };

    function updateFromHue(e) {

        var color = e.value.getCSSColor();
        this.gradientPicker.drawGradient(color);

        syncColors.call( this );
    }

    function updateFromGradient() {
        syncColors.call( this );
    }

    function updateFromAlpha() {
        syncColors.call( this );
    }

    function syncColors() {
        var newColor = this.gradientPicker.getColor();

        if( this.options.useAlpha ) {
            newColor.a = this.alphaPicker.getColor().a;
        }

        this.color = newColor;
        updateColorButton.call( this, {value: this.color });
        
        this.emitChange();
    }

    function updateColorButton(e) {
        var color = e.value.getCSSColor();
        this.openingSurface.colorSurface(color);
    }

    module.exports = ColorPicker;
});
