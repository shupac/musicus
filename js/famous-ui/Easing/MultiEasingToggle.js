define(function(require, exports, module) 
{    
    var EasingBool = require('./EasingBool');
    var Easing = require('famous-animation/Easing');
    var View = require('famous/View');
    var Modifier = require('famous/Modifier');
    var FM = require('famous/Matrix');    

    // @widget : MultiEasingToggle :  grid of EasingBools. Only one can be selected, and emits
    // events when a new one is selected. 
    function MultiEasingToggle(opts) { 
        View.apply(this);
        this.options = {
            easingFns           : [Easing.inOutBackNorm, Easing.outBounceNorm, Easing.inOutBackNorm, Easing.outBounceNorm],
            columns             : 3,
            size                : undefined,
            panelSize           : 216,
            easingAspect        : [1.25, 1],
            defaultSelected     : 0,
            easingBoolSize      : [undefined, undefined],
            selectedProperties  : undefined,
            normalProperties    : undefined
        }
        this.setOptions(opts);

        this.value = this.options.easingFns[this.options.defaultSelected];
        this.height = 0;
        this.bools = [];

        this.initialized = false;
    }

    MultiEasingToggle.prototype = Object.create(View.prototype);
    MultiEasingToggle.prototype.constructor = MultiEasingToggle;

    MultiEasingToggle.prototype.init = function () {
        var positions = getPositions.call(this);
        for (var i = 0; i < this.options.easingFns.length; i++) {
            value = (i == this.options.defaultSelected) ? true : false;

            var easingOpts = {
                value: value
            }

            if( this.options.selectedProperties ) easingOpts.selectedProperties = this.options.selectedProperties
            if( this.options.normalProperties ) easingOpts.normalProperties = this.options.normalProperties
                
            var bool = new EasingBool({ 
                fn: this.options.easingFns[i],
                size: this.options.easingBoolSize
                }, easingOpts);

            bool.on('change', setSelected.bind(this, i));
            bool.pipe(this);

            this._add(new Modifier(positions[i]))._link(bool);
            this.bools.push(bool);
        };

        this.initialized = true;
    }

    function getPositions() {
        var len = this.options.easingFns.length,
            positions = [],
            rowIndex = 0,
            colIndex = -1;

        for (var i = 0; i < len; i++) {

            colIndex = i % this.options.columns;
            if(colIndex === 0 && i !== 0) rowIndex++; 

            positions.push(FM.translate(
                colIndex * this.options.easingBoolSize[0], 
                rowIndex * this.options.easingBoolSize[1], 
                0 ));

            // last, set height
            if(i == len - 1) { 
                this.options.size[1] = (rowIndex + 1) * this.options.easingBoolSize[1];
            }
        };
        return positions;
    }

    function setSelected(selectedIndex, val) {
        var oppositeVal = !val;
        for (var i = 0; i <this.bools.length; i++) {
            if(i == selectedIndex) { 
                this.bools[i].silentSet( val );
            } else { 
                this.bools[i].silentSet( oppositeVal );
            }
        };
        this.value = this.options.easingFns[selectedIndex]; 
        this.emit('change', {value: this.value });
    }

    MultiEasingToggle.prototype.set = function (val) {
        var i = this.options.easingFns.indexOf(val);
        setSelected.call(this, i, true);
    }
    MultiEasingToggle.prototype.get = function() { 
        return this.value;
    }

    MultiEasingToggle.prototype.setSize = function(size) { 

        this.options.easingBoolSize[0] = Math.floor(size[0] / this.options.columns); 
        this.options.easingBoolSize[1] = Math.floor(this.options.easingBoolSize[0] / this.options.easingAspect[0]);

        this.options.size = [];
        this.options.size[0] = size[0];
    } 

    MultiEasingToggle.prototype.getSize = function() { 
        if( this.initialized ) { 
            return this.options.size;
        } else { 
            return undefined;
        }
    }    

    module.exports = MultiEasingToggle;
});
