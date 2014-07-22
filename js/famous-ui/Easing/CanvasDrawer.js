define(function(require, exports, module) {
    // will never type these out again.
    function lineTo(ctx, x1, y1, x2, y2) { 
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
    }

    function rect(ctx, x1, y1, w, h) { 
        ctx.beginPath();
        ctx.rect(x1, y1, w, h);
        ctx.fill();
        ctx.closePath();
    }
    
    module.exports = {
        lineTo: lineTo,
        rect: rect
    }
});
