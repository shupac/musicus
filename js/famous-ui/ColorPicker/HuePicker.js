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
    
    /*
     *  @class HuePicker : selection of hue.
     *  @description : used in ColorPicker.
     *
     *  @name HuePicker
     *  @constructor
     */
    function HuePicker(size, initialColor, pickerSize) { 
        // only get full hue of color.
        var hueColor = new Color();
        var hue = initialColor.getHue(); 
        hueColor.setFromHSL(hue, 100.0, 50.0);

        var pSize = pickerSize || [35, 35];
        CanvasPicker.call(this, size, hueColor, {
            railsY: true,
            pickerProperties: {
                border: '2px solid white',
                borderRadius: size[0]/2 + 'px',
                boxShadow: '0px 1px 0px #888',
                marginTop: '2px'
            },
            pickerPosX: 1 - hue / 360,
            pickerSize: pSize,
            colorPicker: true,
            normalizedColors: true
        });

        this.drawGradient(this.color.getCSSColor());

        this.on('change', this.drawPickerColor.bind(this));
        this.pickerColor;
    }
    HuePicker.prototype = Object.create(CanvasPicker.prototype);

    /**
     * Color the picker. Set to auto update based on the currently 
     *  selected color
     * @name HuePicker#drawPickerColor
     * @function
     * @param { Object } e : selected color emitted over the event
     */
    HuePicker.prototype.drawPickerColor = function(e) {
        if(this.pickerColor !== e.value.hex) { 
            this.picker.colorSurface(e.value.hex);
            this.pickerColor = e.value.hex;
        }
    };

    /**
     * Draw the gradient.
     * @name AlphaPicker#drawGradient
     * @function
     * @param { FamousColor } : selected color
     */
    HuePicker.prototype.drawGradient = function(color) { 

        var ctx = this.gradient.getContext('2d');

        ctx.clearRect(0, 0, this.canvasSize[0], this.canvasSize[1]);
        drawRainbow.call(this, ctx, [0, 0.5], [1, 0.5]);

    }

    /**
     * Draw full spectrum to canvas.
     * @name #drawRainbow
     * @param { ctx } 2d canvas context to draw to
     * @param { Array: [number, number] } startOrigin : Origin relative to canvas size to start drawing the gradient 
     * @param { Array: [number, number] } endOrigin   : Origin relative to canvas size to start drawing the gradient 
     * @function
     * @private
     */
    function drawRainbow(ctx, startOrigin, endOrigin) { 
        
        var gradient = ctx.createLinearGradient(
            this.canvasSize[0]*startOrigin[0], this.canvasSize[1]*startOrigin[1], 
            this.canvasSize[0]*endOrigin[0], this.canvasSize[1]*endOrigin[1]
        );

        gradient.addColorStop(0,    'rgb(255,   0,   0)') // r
        gradient.addColorStop(0.16, 'rgb(255,   0, 255)') // v
        gradient.addColorStop(0.33, 'rgb(0,     0, 255)') // b
        gradient.addColorStop(0.50, 'rgb(0,   255, 255)') // g
        gradient.addColorStop(0.67, 'rgb(0,   255,   0)') // y
        gradient.addColorStop(0.83, 'rgb(255, 255,   0)') // o
        gradient.addColorStop(1,    'rgb(255,   0,   0)') // r

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasSize[0], this.canvasSize[1]);

    }


    /*      Color Wavelength Spectrums: ROYGBIV
     *
     *      Red     620–750     130
     *      Orange  590–620      30
     *      Yellow  570-590      20
     *      Green   495–570      75
     *      Blue    450–495      45
     *      Violet  380-450      70
     *
     */

    module.exports = HuePicker;
});

