define(function(require, exports, module) {
    var Matrix = require('famous/Matrix');
    var EventHandler = require('famous/EventHandler');
    var GenericSync = require('famous-sync/GenericSync');
    var Transitionable = require('famous/Transitionable');

    /**
     * @constructor
     */
    function Draggable(options) {

        //default options
        this.options = {
            projection  : 'xy',
            transform : undefined,
            maxX  : Infinity,
            maxY  : Infinity,
            snapX : 0,
            snapY : 0,
            sensitivity : 1,
            duration : 0,
            curve : 'linear',
            callback : undefined
        };

        this.isActive = true;
        this.eventHandler = new EventHandler();

        this.posState = new Transitionable([0,0]);

        this.sync = new GenericSync(
            (function() {
                return this.getPos();
            }).bind(this)
        );

        this.setOptions(options);
        _bindEvents.call(this);
    }

    function _handleStart(){
        this.emit('dragstart', {p : this.getPos()});
    }

    function _handleMove(event){
        this.setPos(event.p);
        this.emit('dragmove', {p : this.getPos()});
    }

    function _handleEnd(){
        this.emit('dragend', {p : this.getPos()});
        
        if (this.options.callback) this.options.callback = this.options.callback.bind(this);
        
        this.posState.set([0,0], {
            duration : this.options.duration,
            curve : this.options.curve
        }, this.options.callback);

    }

    function _bindEvents() {
        this.sync.on('start', _handleStart.bind(this));
        this.sync.on('update', _handleMove.bind(this));
        this.sync.on('end', _handleEnd.bind(this));
    }

    Draggable.prototype.emit = function(event, data) {
        this.eventHandler.emit(event, data);
        this.sync.emit(event, data);
    };

    Draggable.prototype.on = function(type, handler) {
        this.eventHandler.on(type, handler);
        this.sync.on(type, handler);
    };

    Draggable.prototype.calcTransform = function(pos){
        var projection = this.options.projection;
        var maxX = this.options.maxX;
        var maxY = this.options.maxY;
        var snapX = this.options.snapX;
        var snapY = this.options.snapY;
        var sensitivity = this.options.sensitivity;

        //sensitivity
        var x = pos[0] * sensitivity;
        var y = pos[1] * sensitivity;

        //axes
        var tx = 0; var ty = 0;
        if (projection.constructor == String){
            var hasX = (projection.indexOf('x') != -1);
            var hasY = (projection.indexOf('y') != -1);
            tx = (hasX) ? x : 0;
            ty = (hasY) ? y : 0;
        }

        //axis can be a function of (x,y), returning (tx,ty)
        if (projection.constructor == Function){
            var t = projection(x,y);
            tx = t[0];
            ty = t[1];
        }

        //snapping
        if (snapX !== 0) tx -= tx % snapX;
        if (snapY !== 0) ty -= ty % snapY;

        //containment within maxX, maxY bounds
        tx = Math.max(Math.min(tx, maxX), -maxX);
        ty = Math.max(Math.min(ty, maxY), -maxY);

        var transform = Matrix.translate(tx,ty);
        if (this.options.transform){
            //warning: transform is independent of snapping!
            transform = Matrix.multiply(
                this.options.transform(x,y),
                transform
            );
        }

        return transform;
    };

    Draggable.prototype.setOptions = function(options){
        for (var key in options)
            this.options[key] = options[key];
    };

    Draggable.prototype.getOptions = function(){
        return this.options;
    };

    Draggable.prototype.getPos = function() {
        return this.posState.get();
    };

    Draggable.prototype.setPos = function(p) {
        this.posState.set(p);
    };

    Draggable.prototype.deactivate = function() {
        this.isActive = false;
    };
    
    Draggable.prototype.activate = function() {
        this.isActive = true;
    };
    
    Draggable.prototype.render = function(target) {
        if (this.isActive)  {
            var transform = this.calcTransform(this.getPos());
            return {transform: transform, target: target};
        }
        else return target;
    };

    module.exports = Draggable;

});
