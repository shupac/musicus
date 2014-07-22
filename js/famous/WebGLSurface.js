define(function(require, exports, module) {
    var FamousSurface = require('./Surface');

    /**
     * @class An object designed to contain WebGL
     *   
     * @name WebGLSurface
     * @extends FamousSurface
     * @constructor
     */
    function WebGLSurface(size, options) {        
        this.options = options; 
        this._canvas = document.createElement('canvas');
        FamousSurface.call(this, size);
        this.setContent(this._canvas);
        this.setSize(size); 
    }

    WebGLSurface.prototype = Object.create(FamousSurface.prototype);

    /**
     * Returns the canvas element's WebGL context
     *
     * @name WebGLSurface#getContext
     * @function
     */
    WebGLSurface.prototype.getContext = function() {
        return this._canvas.getContext('experimental-webgl', this.options);
    };

    WebGLSurface.prototype.setSize = function(size) {        
        FamousSurface.prototype.setSize.apply(this, arguments);        
        this._canvas.style.width = size[0] + "px";
        this._canvas.style.height = size[1] + "px";
        var ratio = window.devicePixelRatio ? window.devicePixelRatio : 1;        
        this._canvas.width = size[0] * ratio; 
        this._canvas.height = size[1] * ratio; 
    };

    module.exports = WebGLSurface;
});

