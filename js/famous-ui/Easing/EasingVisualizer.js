define(function(require, exports, module) {
    var Easing = require('famous-animation/Easing');
    var FamousCanvasSurface = require('famous/CanvasSurface');
    var CanvasDrawer = require('./CanvasDrawer');

    /* @widget: takes an easing curve and outputs a visual representation of the curve.
    * all drawing done in an offscreen canvas that is never inserted into the dom.
    *
    * @param opts : {
    *      @param divisions { Number }      : Fidelity of the drawn line.
    *      @param function { Function }     : Normalized Curve to draw.
    *      @param size { Array.Number}      : Size of the canvasSurface.
    *      @param strokeColor { String }    : Color of the easing line. 
    *      @param fillColor { String }      : Color of the background.
    *   }
    */ 
    
    function EasingVisualizer(opts) {
        this.opts = { 
            size: [1000, 1000],
            strokeColor: '#33ccff',
            fillColor: '#333',
            fn: Easing.inOutBackNorm,
            divisions: 30
        }
        this.setOptions( opts );
        this.opts.canvasSize = [this.opts.size[0] * 2, this.opts.size[1] * 2];
        this.opts.gutter = Math.floor(this.opts.size[0] * .35);

        FamousCanvasSurface.call(this, {size: this.opts.size, canvasSize: this.opts.canvasSize });
        this.update();
    }

    EasingVisualizer.prototype = Object.create(FamousCanvasSurface.prototype);
    EasingVisualizer.prototype.constructor = EasingVisualizer;

    EasingVisualizer.prototype.setOptions = function(opts, destinationOpts) { 
        if( !destinationOpts) destinationOpts  = this.opts;
        for(var key in opts) destinationOpts[key] = opts[key];
    } 

    EasingVisualizer.prototype.setCurve = function(fn) { 
        this.opts.fn = fn;
        this.update();
    }

    EasingVisualizer.prototype.update = function() { 
        var offscreenCanvas = initOffscreen.call(this);
        var ctx = this.getContext('2d');
        ctx.drawImage(offscreenCanvas, 0, 0);
    }

    function initOffscreen() { 
        var canvas = document.createElement('canvas');
        canvas.width = this.opts.canvasSize[0];
        canvas.height = this.opts.canvasSize[1];

        var ctx = canvas.getContext('2d');
        ctx.strokeStyle = this.opts.strokeColor;
        ctx.lineWidth = 2;
        ctx.fillStyle = this.opts.fillColor;
        CanvasDrawer.rect(ctx, 0, 0, this.opts.canvasSize[0], this.opts.canvasSize[1]);

        var theta = 1 / this.opts.divisions;

        var xSize = this.opts.canvasSize[0] - this.opts.gutter;
        var ySize = this.opts.canvasSize[1] - this.opts.gutter;
        var initPos = this.opts.gutter * 0.5;

        for(var i = 1; i < this.opts.divisions; i++) { 
            var prevIndex = theta * (i - 1); 
            var index = theta * i;

            var x1 = prevIndex * xSize + initPos;
            var x2 = index * xSize + initPos;

            var y1 = ySize - this.opts.fn(prevIndex) * (ySize - this.opts.gutter);
            var y2 = ySize - this.opts.fn(index) * (ySize - this.opts.gutter);

            CanvasDrawer.lineTo(ctx, x1, y1, x2, y2);
        }
        return canvas;
    }

    module.exports = EasingVisualizer;
});
