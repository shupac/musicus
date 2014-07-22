define(function(require, exports, module) {
    var Surface = require('famous/Surface');
    var CanvasSurface = require('famous/CanvasSurface');
    var FM = require('famous/Matrix');
    var FEH = require('famous/EventHandler');
    var Modifier = require('famous/Modifier');
    var Utils = require('famous-utils/Utils');
    var Color = require('famous-color/Color');
    var Engine = require('famous/Engine');
    var Easing = require('famous-animation/Easing');
    var CanvasPicker = require('./CanvasPicker');
    var CanvasDrawer = require('famous-ui/Easing/CanvasDrawer');

    /*
     *  @class AlphaPicker : selection of alpha ( transparency ).
     *  @description : used in ColorPicker.
     *
     *  @name AlphaPicker
     *  @constructor
     */
    function AlphaPicker(size, initialColor, pickerSize) { 

        var pSize = pickerSize || [35, 35];

        CanvasPicker.call(this, size, initialColor, {
            railsY: true,
            pickerProperties: {
                border: '3px solid white',
                borderRadius: size[0]/2 + 'px',
                boxShadow: '0px 1px 0px #888',
                marginTop: '2px'
            },
            pickerPosX: initialColor.a,
            pickerSize: pSize,
            colorPicker: true,
            normalizedColors: true
        });

        this.alpha = this.color.a;

        this.backgroundCanvas = initBackground.call(this);
        this.drawGradient(this.color.getCSSColor());

        this.on('change', this.drawPickerColor.bind(this));
        this.pickerColor;
    }
    AlphaPicker.prototype = Object.create(CanvasPicker.prototype);

    /**
     * Color the picker. Set to auto update based on the currently 
     * selected color
     * @name AlphaPicker#drawPickerColor
     * @function
     * @param { Object } e : selected color emitted over the event
     */
    AlphaPicker.prototype.drawPickerColor = function(e) {
        this.picker.colorSurface(e.value.getCSSColor());
    }

    /**
     * Draw the gradient.
     * @name AlphaPicker#drawGradient
     * @function
     * @param { FamousColor } : selected color
     */
    AlphaPicker.prototype.drawGradient = function(color) { 
        var ctx = this.gradient.getContext('2d');

        ctx.clearRect(0, 0, this.canvasSize[0], this.canvasSize[1]);
        ctx.drawImage( this.backgroundCanvas, 0, 0 );
        createAlphaGradient.call(this, ctx, [0, 0], [1, 0], color);
    }

    /**
     * Calculate the alpha. Set the alpha and emit an event.
     * @name AlphaPicker#updateColor
     * @function
     */
    AlphaPicker.prototype.updateColor = function () {
        var alpha = parseFloat( (this._selectedCoords[0] / this.size[0]).toFixed( 2 ) ); 
        this.color.a = alpha;
        this.emit('change', { value: this.color });
    }

    /**
     * Create the main gradient. It draws from 0 to 1 in alpha.
     * @name #createAlphaGradient
     * @function
     * @return {Canvas}. 
     * @private
     */
    function createAlphaGradient(ctx, startOrigin, endOrigin, color) { 
        // remove only alpha part of rgba string
        colorAlpha = color.substring(0, color.length - 2);
        
        var gradient = ctx.createLinearGradient(
            this.canvasSize[0]*startOrigin[0], this.canvasSize[1]*startOrigin[1], 
            this.canvasSize[0]*endOrigin[0], this.canvasSize[1]*endOrigin[1]
        );

        gradient.addColorStop(0, colorAlpha + '0)');
        gradient.addColorStop(1, colorAlpha + '1)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasSize[0], this.canvasSize[1]);
    }

    /**
     * Create the background canvas. It draws grey and white tiled squares to represent transparency.
     * @name #initBackground
     * @function
     * @return {Canvas}. 
     * @private
     */
    function initBackground () {
        var canvas = document.createElement('canvas');
        canvas.width = this.canvasSize[0];
        canvas.height = this.canvasSize[1];

        var ctx = canvas.getContext('2d');
        // white background
        ctx.fillStyle = '#ffffff';
        CanvasDrawer.rect( ctx, 0, 0, this.canvasSize[0], this.canvasSize[1] );

        // tiled grey squares
        ctx.fillStyle = '#cccccc';

        var columns = 16;
        var rows = 2;

        var width = height = this.canvasSize[0] / columns;

         for (var i = 0; i < columns; i++) {
             for (var j = 0; j < rows; j++) {

                 // every other one
                 if( i % 2 == 0 && j % 2 == 0) {
                    
                     CanvasDrawer.rect( ctx, width * i, j * height, width, height );

                 }  else if( i % 2 == 1 && j % 2 == 1 ) { 

                     CanvasDrawer.rect( ctx, width * i, j * height, width, height );
                     
                 }
             };
         };
         return canvas;
    }

    module.exports = AlphaPicker;
});
