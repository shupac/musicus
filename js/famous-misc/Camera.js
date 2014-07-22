define(function(require, exports, module) {
    var Transitionable = require('famous/Transitionable');
    var Matrix = require('famous/Matrix');
    var Utility = require('famous/Utility');

    function Camera(matrix) {
        this._renderMatrix = Matrix.identity;
        
        this._scaleState = new Transitionable([1, 1, 1]);
        this._skewState = new Transitionable([0, 0, 0]);
        this._rotateState = new Transitionable([0, 0, 0]);
        this._translateState = new Transitionable([0, 0, 0]);

        this._dirty = false;

        if(matrix) this.lookAt(matrix);
    }

    Camera.prototype.halt = function() {
        this._scaleState.halt();
        this._skewState.halt();
        this._rotateState.halt();
        this._translateState.halt();
    };

    Camera.prototype.getScale = function() {
        return this._scaleState.get();
    };

    Camera.prototype.setScale = function(scale, transition, callback) {
        this._dirty = true;
        return this._scaleState.set(scale, transition, callback);
    };

    Camera.prototype.getSkew = function() {
        return this._skewState.get();
    };

    Camera.prototype.setSkew = function(skew, transition, callback) {
        this._dirty = true;
        return this._skewState.set(skew, transition, callback);
    };

    Camera.prototype.getRotation = function() {
        return this._rotateState.get();
    };

    Camera.prototype.setRotation = function(rotation, transition, callback) {
        this._dirty = true;
        return this._rotateState.set(rotation, transition, callback);
    };

    // deprecated, do not use; shimmed
    Camera.prototype.getSpin = Camera.prototype.getRotation;
    Camera.prototype.setSpin = Camera.prototype.setRotation;

    Camera.prototype.getPos = function() {
        return this._translateState.get();
    };

    Camera.prototype.setPos = function(pos, transition, callback) {
        this._dirty = true;
        return this._translateState.set(pos, transition, callback);
    };

    Camera.prototype.lookAt = function(matrix, transition, callback) {
        var onceCb = undefined;
        if(callback) onceCb = Utility.after(4, callback);
        this.halt();
        var endInterp = Matrix.interpret(matrix);
        this.setScale(endInterp.scale, transition, onceCb);
        this.setSkew(endInterp.skew, transition, onceCb);
        this.setRotation(endInterp.rotate, transition, onceCb);
        this.setPos(endInterp.translate, transition, onceCb);
    };

    function _calculateRenderMatrix() {
        var scaleMatrix = Matrix.scale.apply(this, this._scaleState.get());
        var skewMatrix = Matrix.skew.apply(this, this._skewState.get());
        var rotateMatrix = Matrix.rotate.apply(this, this._rotateState.get());
        var resultMatrix = Matrix.move(Matrix.multiply(scaleMatrix, skewMatrix, rotateMatrix), this._translateState.get());
        return Matrix.inverse(resultMatrix);
    };

    Camera.prototype.render = function(input) {
        this._dirty |= this._scaleState.isActive() || this._skewState.isActive() || this._rotateState.isActive() || this._translateState.isActive();
        if(this._dirty) {
            this._renderMatrix = _calculateRenderMatrix.call(this);
            this._dirty = false;
        }
        return {
            transform: this._renderMatrix,
            group: true,
            target: input
        };
    };

    module.exports = Camera;
});
