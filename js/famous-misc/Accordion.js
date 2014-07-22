define(function(require, exports, module) {
    var Matrix = require('famous/Matrix');
    var Transitionable = require('famous/Transitionable');
    var Modifier = require('famous/Modifier');
    var Easing = require('./Easing');

    /**
     * @constructor
     */
    function Accordion(options) {
        this.state = new Transitionable(0);
        
        var options = options || {};
        
        if (!options.curve) options.curve = Easing.inOutQuadNorm;
        if (!options.duration) options.duration = 500;
        var transition = {curve: options.curve, duration: options.duration};
        
        this.options = {transition: transition};
        this.target = undefined;
        this._isOpen = false;
    }

    Accordion.prototype.render = function() {
        if (!this.state.get()) return;
        
        return {
            transform: Matrix.translate(0, (this.state.get()-1)*this.target.getSize()[1], 100*(this.state.get()-1)),
            target: this.target.render()
        };
    };
    
    Accordion.prototype.getSize = function() {
        var origSize = this.target.getSize();
        return [origSize[0], this.state.get()*origSize[1]];
    };
    
    Accordion.prototype.contentFrom = function(target) {
        this.target = target;
    };
    
    Accordion.prototype.setState = function(pos, transition, callback) {
        this.state.halt();
        this.state.set(pos, transition, callback);
    };
    
    Accordion.prototype.open = function(callback) {
        this._isOpen = true;
        this.setState(1, this.options.transition, callback);
    };
    
    Accordion.prototype.close = function(callback) {
        this._isOpen = false;
        this.setState(0, this.options.transition, callback);
    };
    
    Accordion.prototype.toggle = function(callback) {
        if (this._isOpen) {
            this.close(callback);
        }
        else {
            this.open(callback);
        }
    };
        
    module.exports = Accordion;
});
