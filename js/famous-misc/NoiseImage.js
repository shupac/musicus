define(function(require, exports, module) {
    var canvas;

    function generateNoiseImage (size, fraction, seed) {
        if(!canvas) canvas = document.createElement('canvas');

        if(!size) size = [128, 128];
        if(!fraction) fraction = 8;

        canvas.width = size[0];
        canvas.height = size[1];

        var ctx = canvas.getContext("2d");

        var halfFraction = fraction>>1;
        var pixelSize = canvas.width/fraction;
        var length = (fraction * fraction)>>1;



        var hue = function() {
            var random = (Math.random() * 361)>>0;
            var result;
            if (seed) {
                result = (360 * (seed*0.125)) - ((Math.random() * (46))>>0);
            } else {
                result = random;
            }
            return result;
        };
        var saturation = function() {
            return 40 + (Math.random() * 61)>>0;
        };
        var light = function() {
            return 40 + (Math.random() * 61)>>0;
        };

        var color =  function() {
           ctx.fillStyle = 'hsl(' + hue() + ','+ saturation() +'%,' + light() +'%)';
        };

        color();
        ctx.fillRect(0,0,size[0],size[1]);
        color();

        var column,row;
        for (var i = 0; i < length; i++){
            if ((Math.random() + 0.5)>>0){
                row = (i / halfFraction)>>0;
                column = i - (halfFraction * row);
                ctx.fillRect(column * pixelSize, row * pixelSize, pixelSize, pixelSize);
                ctx.fillRect(((fraction-(column+1))) * pixelSize, row * pixelSize, pixelSize, pixelSize);
            }
        }

        var myImage = canvas.toDataURL("image/png");
        return myImage;
    }

    module.exports = {
       generate: generateNoiseImage
    };

});
