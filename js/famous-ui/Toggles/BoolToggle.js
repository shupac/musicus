define(function(require, exports, module) {
    var FamousSurface = require('famous/Surface');
    var FM = require('famous/Matrix');
    var FEH = require('famous/EventHandler');
    var Modifier = require('famous/Modifier');
    var Easing = require('famous-animation/Easing');
    var RenderNode = require('famous/RenderNode');
    var Utils = require('famous-utils/Utils');
    var View = require('famous/View');

    function BoolToggle( opts ) { 
        View.apply( this );
        this.eventInput.pipe( this.eventOutput );
        
        this.options = {
            size: undefined, 
            value: true, 
            name: 'bool toggle', 
            transition: { 
                duration: 250,
                curve: Easing.inOutBackNorm
            }, 
            padding: 20
        }
        this.setOptions( opts );

        this.value = opts.value;
        this.name = opts.name;
    }

    BoolToggle.prototype = Object.create( View.prototype );
    BoolToggle.prototype.constructor = BoolToggle;
    
    /**
     * Initialize the widget.
     * @name BoolToggle#init
     * @function
     */
    BoolToggle.prototype.init = function () {
        if( this.options.size == undefined ) { 
            this.options.size = [undefined, undefined];
        }

        var opacity = this.options.value == true ? 1 : 0;

        this.label = new FamousSurface({
            size: this.options.size, 
            content: '<div style="border: 1px solid #ffffff; width:' + this.options.size[1] + 'px; height: ' +  this.options.size[1] + 'px; float: left;"></div>' +
                '<div class="slider-label" style="float: left; margin-left:' + this.options.size[1] + 'px;margin-top:' + this.options.size[1] * 0.1 + 'px">' + this.name + '</div>',
            properties: {'font-size': this.options.size[1]*.75+'px'}
        });

        this.fill = new FamousSurface({ 
            size: [this.options.size[1], this.options.size[1]] ,
            properties: { 'background-color': '#ffffff' }
        });

        this.transform = new Modifier({ 
            opacity: opacity,
            size: [this.options.size[1], this.options.size[1]]
        });

        this.labelTransform = new Modifier({
            transform: FM.translate(this.options.padding, 0)
        });
        
        // Events
        this.fill.pipe( this ); 
        this.label.pipe( this );
        this.on('click', handleClick.bind(this));
        
        // Render Tree
        this._add( this.transform )._link( this.fill );
        this._add( this.label );

        this.set( this.options.value ); 
    }
    /**
     * Trigger toggle on click. 
     * @private
     */
    function handleClick () { 
        this.toggle();
    }

    /**
     * Set value of toggle without emiting an event.
     * @name BoolToggle#silentSet
     * @function
     * @param {Boolean} Value of toggle. 
     */
    BoolToggle.prototype.silentSet = function(bool) { 
        this.value = bool;
        setTransform.call( this );
    }

    /**
     * Toggle the value of the toggle.
     * @name BoolToggle#toggle
     * @function
     */
    BoolToggle.prototype.toggle = function() { 
        this.set( !this.value );
    }

    /**
     * Set the value of the toggle.
     * @name BoolToggle#set
     * @param {Boolean} bool : value to set.
     * @function
     */
    BoolToggle.prototype.set = function( bool ) {
	    if (this.value === bool) return;
        this.value = bool;
        this.emit( 'change', {value: this.value });
        setTransform.call( this );
    }

    /**
     * Set the transform based on the current value. 
     * @private
     */
    function setTransform () { 

        this.transform.halt();

        var mtx = this.value ? 
            FM.scale(1, 1, 1) : 
            FM.move( FM.scale(0.0001, 0.0001, 0.0001), 
                [this.options.size[1] * 0.5, this.options.size[1] * 0.5, 0] );
    /**
     * Get the size of the toggle.
     * @name BoolToggle#getSize
     * @function
     */
        var op = this.value ? 1 : 0; 

        this.transform.setTransform(mtx, this.options.transition);
        this.transform.setOpacity(op, this.options.transition);

    }

    /**
     * Get the value of the toggle.
     * @name BoolToggle#get
     * @param {Boolean} bool : value to set.
     * @function
     */
    BoolToggle.prototype.get = function() { 
        return this.value; 
    }

    /**
     * Get the size of the toggle.
     * @name BoolToggle#getSize
     * @function
     */
    BoolToggle.prototype.getSize = function() { 
        return this.options.size; 
    }

    /**
     * Set the size of the toggle.
     * @name BoolToggle#getSize
     * @function
     */
    BoolToggle.prototype.setSize = function ( size ) {
        this.options.size = size; 
    }

    module.exports = BoolToggle;
});
