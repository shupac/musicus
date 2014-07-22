define(function(require, exports, module) {
    var EasingVisualizer = require('./EasingVisualizer'); 
    var FEH = require('famous/EventHandler');
    
    // @widget: single toggle of an easing visualizer
    // maintains state, and emits change events on clicks.
    // Since it is useless on it's own, only use with a MultiEasingToggler
    function EasingBool (options, easingOpts) {
        this.easingOpts = {
            value: false,
            selectedProperties: { 
                'border': '3px solid #33ccff'
            },
            normalProperties: { 
                'border': 'none'
            }
        }
        EasingVisualizer.apply(this, arguments);
        this.setOptions( easingOpts, this.easingOpts );

        this.on('click', this.toggle.bind(this));

        highlight.call(this);
    }

    EasingBool.prototype = Object.create(EasingVisualizer.prototype);
    EasingBool.prototype.constructor = EasingBool;

    EasingBool.prototype.silentSet = function (bool) {
        this.easingOpts.value = bool; 
        highlight.call(this);
    }

    EasingBool.prototype.toggle = function () { 
        this.set( !this.value );
    }

    EasingBool.prototype.set = function (bool) {
        this.easingOpts.value = bool;
        this.emit( 'change', { value: this.easingOpts.value });
        highlight.call( this );
    }

    function highlight () {
        var properties = this.easingOpts.value ? 
            this.easingOpts.selectedProperties : 
            this.easingOpts.normalProperties;
        this.setProperties(properties);
    }

    module.exports = EasingBool;
});
