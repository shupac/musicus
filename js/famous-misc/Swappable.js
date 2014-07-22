define(function(require, exports, module) {
    var RenderNode = require('famous/RenderNode');
    var Matrix = require('famous/Matrix');
    var Modifier = require('famous/Modifier');

    /**
     * @constructor
     */
    function Swappable(options) {

        this.options = {
            initTransform  : Matrix.identity,
            initOpacity    : 0,
            finalTransform : Matrix.identity,
            finalOpacity   : 0,
            inTransition   : {duration : 500, curve : 'easeInOut'},
            outTransition  : {duration : 500, curve : 'easeInOut'},
            async          : false
        };

        this.nodes = {};
        this.transforms = [];

        this.currIndex = -1;
        this.prevIndex = -1;

        this.setOptions(options);

    }

    Swappable.prototype.item = function(i) {
        var result = new RenderNode(new Modifier(this.options.initTransform, this.options.initOpacity), true);
        this.nodes[i] = result;
        return result;
    };

    Swappable.prototype.select = function(i, callback) {
        if(i == this.currIndex) return;

        if(this.options.async) {
            _transitionOut.call(this, this.currIndex, (function() {
                _transitionIn.call(this, this.currIndex, callback);
            }).bind(this));
        }
        else{
            _transitionOut.call(this, this.currIndex);
            _transitionIn.call(this, i, callback);
        }
        this.currIndex = i;
    };

    function _transition(i, initTransform, initOpacity, finalTransform, finalOpacity, transition, callback) {
        if(!(i in this.nodes)) return;
        var transform = this.nodes[i].get();
        if(!transform.isMoving()) {
            if(initTransform) transform.setTransform(initTransform);
            if(initOpacity !== undefined) transform.setOpacity(initOpacity);
        }
        transform.setTransform(finalTransform, transition);
        transform.setOpacity(finalOpacity, transition, callback);
    }

    function _transitionIn(i, callback) {
        _transition.call(this, i, this.options.initTransform, this.options.initOpacity, Matrix.identity, 1, this.options.inTransition, callback);
    }

    function _transitionOut(i, callback) {
        _transition.call(this, i, undefined, undefined, this.options.finalTransform, this.options.finalOpacity, this.options.outTransition, callback);
    }

    Swappable.prototype.setOptions = function(options){
        for (var key in options) this.options[key] = options[key];
    };

    Swappable.prototype.getOptions = function(){
        return this.options;
    };

    Swappable.prototype.render = function() {
        var result = [];
        for(var i in this.nodes) {
            result.push(this.nodes[i].render());
        }
        return result;
    };

    module.exports = Swappable;

});
