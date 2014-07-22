define(function(require, exports, module) {
    var FEH = require('famous/EventHandler');
    var CanvasSurface = require('famous/CanvasSurface');
 
    /*
     *  @class ColorButton : A canvas surface that is meant to draw background colors
     *      very frequently at highest framerate possible.
     *  @description : used in ColorPicker.
     *
     *  @name ColorButton
     *  @constructor
     */
    function ColorButton(size, initialColor) { 
        this.size = size;
        this.canvasSize = [this.size[0]*2, this.size[1]*2];

        CanvasSurface.call(this, {size: this.size, canvasSize: this.canvasSize });
        
        this.color = initialColor;
        this.colorSurface(this.color.getHex());
    }
    ColorButton.prototype = Object.create(CanvasSurface.prototype);

    ColorButton.prototype.colorSurface = function(color) {
        var ctx = this.getContext('2d');

        ctx.clearRect( 0, 0, this.canvasSize[0], this.canvasSize[1]);
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, this.canvasSize[0], this.canvasSize[1]);
    }

    module.exports = ColorButton;
});
