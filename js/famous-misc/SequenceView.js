define(function(require, exports, module) {
    /**
     * @class SequenceView
     *
     * @name SequenceView
     * @constructor
     *
     * @param {Array} array Array that will be viewed
     * @param {number} index Index of array to begin at
     * @param {boolean} loop Whether to loop around the array at end
     */
    function SequenceView(array, index, loop) {
        this.array = array;
        this.index = index || 0; 
        this.loop = loop || false;
        this._prev = undefined;
        this._prevIndex = undefined;
        this._next = undefined;
        this._nextIndex = undefined;
    };

    SequenceView.prototype.prev = function() {
        var prevIndex = this.index - 1;
        if(this.index == 0) {
            if(this.loop) prevIndex = this.array.length - 1;
            else return undefined;
        }
        if(!this._prev || this._prevIndex != prevIndex) {
            this._prev = new SequenceView(this.array, prevIndex, this.loop);
            this._prevIndex = prevIndex;
        }
        return this._prev;
    };

    SequenceView.prototype.next = function() {
        var nextIndex = this.index + 1;
        if(nextIndex >= this.array.length) {
            if(this.loop) nextIndex = 0;
            else return undefined;
        }
        if(!this._next || this._next != nextIndex) {
            this._next = new SequenceView(this.array, nextIndex, this.loop);
            this._nextIndex = nextIndex;
        }
        return this._next;
    };

    SequenceView.prototype.toString = function() {
        return this.index;
    };

    SequenceView.prototype.get = function() {
        return this.array[this.index];
    };

    SequenceView.prototype.getSize = function() {
        var target = this.get();
        if(!target) return;
        if(!target.getSize) return undefined;
        return target.getSize.apply(target, arguments);
    };

    SequenceView.prototype.render = function() {
        var target = this.get();
        if(!target) return;
        return target.render.apply(target, arguments);
    };

    module.exports = SequenceView;
});
