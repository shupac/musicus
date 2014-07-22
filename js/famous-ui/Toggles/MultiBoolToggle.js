define(function(require, exports, module) {
    var FamousSurface = require('famous/Surface');
    var RenderNode = require('famous/RenderNode');
    var FM = require('famous/Matrix');
    var Modifier = require('famous/Modifier');
    var Transitionable = require('famous/Transitionable');
    var FEH = require('famous/EventHandler');
    var View = require('famous/View');
    var Easing = require('famous-animation/Easing');
    var BoolToggle = require('./BoolToggle');

    /*
     */
    function MultiBoolToggle( opts ) {
        View.apply( this );
        this.eventInput.pipe( this.eventOutput );
        
        this.options = {
            size: undefined, 
            values: [], 
            defaultSelected: 0, 
            name: undefined, 
            padding: 20,
            sizeTransition: {
                curve: Easing.inOutBackNorm,
                duration: 400
            },
            opacityTransition: { 
                curve: Easing.inOutBackNorm,
                duration: 400
            }
        } 
        this.setOptions( opts );

        this.value;
        this.label;
        this.labelTransform;
        this.usingLabel = false;

        this.bools = [];
        this.boolValues = [];
        this.transforms = [];


    }
    MultiBoolToggle.prototype = Object.create( View.prototype );
    MultiBoolToggle.prototype.constructor = MultiBoolToggle;

    /**
     * Initialize the widget.
     * @name MultiBoolToggle#init
     * @function
     */
    MultiBoolToggle.prototype.init = function () {
        if( this.options.size == undefined ) { 
            this.options.size = [undefined, undefined];
        }
        this.sizeState = new Transitionable([this.options.size[0], 0]);
        initLabel.call(this);
        initBools.call(this);
    }

    /**
     * Init label surface
     * @private
     */
    function initLabel () {
        if( this.options.name !== undefined ) {

            this.label = new FamousSurface({
                size: this.options.size, 
                content: '<div class="slider-label" style="margin-top:' + this.options.size[1] * 0.1 + 'px">' + this.options.name + '</div>'
            });            

            this.label.setProperties({'font-size': this.options.size[1]*.75+'px'})
            this.labelTransform = new Modifier();
            this.transforms.push( this.labelTransform );
            this.usingLabel = true;            

            this._add( this.labelTransform )._link( this.label );

            updateSize.call( this );
        }
    }

    /**
     * Init default bool toggles
     * @private
     */
    function initBools () { 
        for(var i = 0 ; i < this.options.values.length; i++) { 

            var bool = i == this.options.defaultSelected ? true : false;

            if( bool ) this.value = this.options.values[i];

            this._addToggle(bool, this.options.values[i], true);
        }
    }

    /**
     * Update Size state. 
     * @private
     */
    function updateSize () {
        this.sizeState.halt();
        var length = this.transforms.length;
        var height = length * this.options.size[1] + ( length - 1 ) * this.options.padding;
        this.sizeState.set( [this.options.size[0], height], this.options.sizeTransition );
    }

    /**
     * Loop through toggles and set them to the appropriate state.
     *
     * @name MultiBoolToggle#setSelectedToggle
     * @function
     * @param {Number} index of selected Item 
     */
    MultiBoolToggle.prototype.setSelectedToggle = function(selectedIndex) { 
        for(var i = 0; i < this.bools.length; i++) { 

            if(i == selectedIndex) { 

                this.bools[i].silentSet( true);
                this.boolValues[i] = true;
                this.value = this.options.values[i];

                this.emit('change', {value: this.options.values[i]});

            } else { 
                this.bools[i].silentSet( false );
                this.boolValues[i] = false;
            }
        }
    }

    /**
     * Set appropriate toggle via value string.
     *
     * @name MultiBoolToggle#set
     * @function
     * @param {String} Value of desired toggle to mark as selected. 
     */
    MultiBoolToggle.prototype.set = function (val) {
        var i = this.options.values.indexOf(val);
        this.setSelectedToggle( i );
    }

    /**
     * Set appropriate toggle via value string.
     *
     * @name MultiBoolToggle#get
     * @function
     * @returns {String} Value of selected Bool Toggle. 
     */
    MultiBoolToggle.prototype.get = function() { 
        return this.value;
    }

    /**
     * Add a toggle to this widget.
     *
     * @name MultiBoolToggle#addToggle
     * @function
     * @param {Boolean} value : of new Bool Toggle. 
     * @param {String}  name : of new Bool Toggle. 
     * @param {Boolean} noPush: don't add element to value array, 
     *                  for default values
     */
    MultiBoolToggle.prototype.addToggle = function ( value, name, noPush ) {
        var length = this.transforms.length;

        var toggle = new BoolToggle({
            size: this.options.size, 
            value: value, 
            name: name 
        });

        toggle.init();
        toggle.pipe( this );

        if( !noPush ) { 
            this.options.values.push( name );
        }

        var transform = new Modifier({
            transform: FM.translate(0, this.options.size[1] * length + this.options.padding * length),
            opacity: 0
        });

        transform.setOpacity( 1, this.options.opacityTransition );
        
        this.bools.push(toggle);

        this.transforms.push( transform );
        this._add( transform )._link( toggle );

        toggle.silentSet( value );
        this.boolValues.push( value );

        toggle.on('change', (function(i, arg) {

            if( this.boolValues[i] == true ) { 
                this.bools[i].silentSet(true); // ensure that it stays selected.
            } else { 
                this.setSelectedToggle( i );
            }

        }).bind(this, this.usingLabel ? length - 1 : length));

        updateSize.call( this );
    }

    /**
     * Get size of entire multi bool toggle. Returns undefined if not initalized,
     * allowing panelScroller to set the size.
     *
     * @name MultiBoolToggle#getSize
     * @function
     * @returns {Array : number} Size of the widget.
     */ 
    MultiBoolToggle.prototype.getSize = function () {
        if( this.sizeState ) {
            return this.sizeState.get();
        } else { 
            return undefined;
        }
    }

    /**
     * Set the size of each individual bool. 
     *
     * @name MultiBoolToggle#setSize
     * @function
     * @param {Array : number} size: [x, y] Size of each individual boolToggle.
     */ 
    MultiBoolToggle.prototype.setSize = function ( size ) {
        this.options.size = size;
    }

    /**
     * Remove a toggle from this widget.
     *
     * @name MultiBoolToggle#removeToggle
     * @function
     * @param {Number || String} value : index or string value of Bool Toggle to be removed. 
     */
    MultiBoolToggle.prototype.removeToggle = function ( val ) {
        var index, transformIndex; 
        if( typeof val == 'number' ) {
            index = val;
        } else if ( typeof val == 'string' ) { 
            index = this.options.values.indexOf( val );
        } 

        if( index >= 0 ) { 
            transformIndex = this.usingLabel ? index + 1 : index;

            this.transforms[ transformIndex ].setOpacity( 0, this.options.sizeTransition, (function (index, transformIndex) {

                this.branches.splice( transformIndex, 1 );
                this.bools.splice( index, 1 );
                this.options.values.splice( index, 1 );
                this.transforms.splice( transformIndex, 1 );
                updateSize.call( this );        


            }).bind( this, index, transformIndex ));
        }
    }

    module.exports = MultiBoolToggle;
});
