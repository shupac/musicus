define(function(require, exports, module) {
    var Surface = require('famous/Surface');
    var CanvasSurface = require('famous/CanvasSurface');
    var FM = require('famous/Matrix');
    var FEH = require('famous/EventHandler');
    var Modifier = require('famous/Modifier');
    var Utils = require('famous-utils/Utils');
    var Color = require('famous-color/Color');
    var Easing = require('famous-animation/Easing');
    var CanvasPicker = require('./CanvasPicker');
    
    /*
     *  @class GradientPicker : selection of saturation / lightness.
     *  @description : used in ColorPicker.
     *
     *  @name GradientPicker
     *  @constructor
     */
    function GradientPicker(size, initialColor) { 
        var saturation =  initialColor.getSaturation() / 100;
        var brightness  = initialColor.getBrightness() / 100;
        initialColor.setSaturation( 100 );

        CanvasPicker.call(this, size, initialColor, {
            pickerSize: [26, 26],
            pickerProperties: { 
                borderRadius: '13px',
                border: '1px solid white'
            },
            pickerPosX: saturation,
            pickerPosY: 1 - brightness 
        }); 

        this.drawGradient(this.color.getCSSColor());
    }
    GradientPicker.prototype = Object.create(CanvasPicker.prototype);

    /**
     * Draw the gradient.
     * @name GradientPicker#drawGradient
     * @function
     * @param { FamousColor } : selected color
     */
    GradientPicker.prototype.drawGradient = function(color) { 
        var ctx = this.gradient.getContext('2d');

        ctx.clearRect(0, 0, this.canvasSize[0], this.canvasSize[1]);
        createGradient.call(this, ctx, 'rgba(255, 255, 255, 1)', color, [0, 0.5], [1, 0.5]);
        createGradient.call(this, ctx, 'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0)', [0.5, 1], [0.5, 0]);
        this.updateColor();
        
    }

    /**
     * Called twice to draw two gradients: 
     *  1. horizontal: from white to active color and 
     *  2. vertical: overlay from black transparent to full 
     *  transparent to allow you to select saturation and brightness.
     *
     * @name #createGradient
     * @param { ctx } 2d canvas context to draw to
     * @param { String } startColor : color to start drawing
     * @param { String } endColor : end color to draw.
     * @param { Array: [number, number] } startOrigin : Origin relative to canvas size to start drawing the gradient 
     * @param { Array: [number, number] } endOrigin   : Origin relative to canvas size to start drawing the gradient 
     * @function
     * @private
     */
    function createGradient(ctx, startColor, endColor, startOrigin, endOrigin) { 
        
        var gradient = ctx.createLinearGradient(
            this.canvasSize[0]*startOrigin[0], this.canvasSize[1]*startOrigin[1], 
            this.canvasSize[0]*endOrigin[0], this.canvasSize[1]*endOrigin[1]
        );

        gradient.addColorStop(0, startColor);
        gradient.addColorStop(1, endColor);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasSize[0], this.canvasSize[1]);

    }
    module.exports = GradientPicker;
});
