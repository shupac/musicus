define(function(require, exports, module) {
    var Surface = require('famous/Surface');
    var FM = require('famous/Matrix');
    var FEH = require('famous/EventHandler');
    var Utils = require('famous-utils/Utils');
    var Engine = require('famous/Engine');
    var View = require('famous/View');

    /** @constructor */
    function Slider( options )
    {
        View.apply( this );
        this.eventInput.pipe( this.eventOutput );

        this.options = {
            size            : undefined,
            range           : [0, 10],
            defaultValue    : undefined,
            precision       : 2,
            name            : 'Slider'
        };
        this.setOptions( options );

        if( this.options.defaultValue === undefined ) { 
            this.options.defaultValue = (this.options.range[0] + this.options.range[1]) * 0.5;
        }

        this.pos = []; 
        this.value = this.options.defaultValue; 

        this.name = name;  
        this._dirty = true; 
        this.currTouchId = null;             
    }

    Slider.prototype = Object.create( View.prototype );
    Slider.prototype.constructor = Slider;

    Slider.prototype.init = function () {

        this.fill = new Surface({ 
            size: this.options.size,
            classes: ['slider-fill', 'no-user-select']
        });

        this.back = new Surface({ 
            size: this.options.size,
            classes: ['slider-back', 'no-user-select' ]
        }); 
        this.backMatrix = FM.translate(0, 0, 1);

        this.label = new Surface({ 
            size        : this.options.size,
            classes     : ['slider-label', 'no-user-select' ],
            properties  : { 'font-size': this.options.size[1] * 0.75 + 'px', 'line-height': this.options.size[1] + 'px' },
            content     : labelTemplate.call( this )
        }); 
        this.labelMatrix = FM.translate(0, this.options.size[1], 1.2);

        // Events
        this.back.pipe( this );
        this.label.pipe( this );
        this.fill.pipe( this );

        this.on('touchstart', _handleTouchStart.bind(this));
        this.on('touchmove', _handleTouchMove.bind(this));
        this.on('touchend', _handleTouchEnd.bind(this));
        this.on('touchcancel', _handleTouchEnd.bind(this));

        this.on('mousedown', _handleMouseDown.bind(this));
        this.on('mousedown', _handleMouseDown.bind(this));
        
        this._mouseMove = _handleMouseMove.bind(this);
        this._mouseUp = _handleMouseUp.bind(this);
        this._mouseLeave = _handleMouseLeave.bind(this); 
        this._handleStart = _handleStart.bind( this );
        this._handleMove = _handleMove.bind( this );

        this._add( this.fill );
        this._add( this.back );
        this._add( this.label );    
    };

    function stopEvents ( e ) { 
        e.preventDefault();
        e.stopPropagation();        
    }

    // touchstart / mousedown
    function _handleTouchStart (event) {   
        stopEvents( event );
        
        if(this.currTouchId) return;
        var touch = event.changedTouches[0];
        this.currTouchId = touch.identifier;
        this._handleStart(touch);
    }

    function _handleMouseDown (event) {
        stopEvents( event );

        Engine.on('mousemove', this._mouseMove);
        Engine.on('mouseup', this._mouseUp);
        Engine.on('mouseout', this._mouseLeave); 
        
        this._handleStart(event);
    }

    function _handleStart (event) {
        if(this._dirty) {
            this.pos = Utils.getSurfacePosition(this.back);
            this._dirty = false; 
        }
        this.set( Utils.map( (event.pageX - this.pos[0]) / this.options.size[0] , 0.0, 1.0, this.options.range[0], this.options.range[1] , true) ); 
    }

    // touchmoves / mousedrags
    function _handleTouchMove (event) {
        stopEvents( event );

        for(var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];            
            if(touch.identifier == this.currTouchId) {
                this._handleMove(touch);
                break; 
            }
        }
    }

    function _handleMouseMove (event) {
        stopEvents( event );
        this._handleMove(event);
    } 

    function _handleMove (event) {
        this.set( Utils.map( (event.pageX - this.pos[0]) / this.options.size[0] , 0.0, 1.0, this.options.range[0], this.options.range[1] , true) ); 
    }

    function _handleTouchEnd (event) {    
        stopEvents( event );
        for(var i = 0; i < event.changedTouches.length; i++) {
            if(event.changedTouches[i].identifier == this.currTouchId) {
                this.currTouchId = undefined;                
                this.emit('update', {value: this.get()});
                break; 
            }
        }
    } 

    function _handleMouseUp (event) {
        stopEvents( event );
        this._endMouse();
    } 

    function _handleMouseLeave (event) { 
        var outElement = event.relatedTarget || event.toElement;
        if(!outElement || outElement.nodeName == "HTML") { // left the window
            this._endMouse();
        }
    }

    Slider.prototype._endMouse = function() {
        Engine.unbind('mousemove', this._mouseMove);
        Engine.unbind('mouseup', this._mouseUp);
        Engine.unbind('mouseout', this._mouseLeave); 
    };

    // Getters / Setters
    Slider.prototype.get = function() {
        return this.value;
    };

    Slider.prototype.setSize = function ( size ) {
        this.options.size = size;
    };

    Slider.prototype.getSize = function () {
        return this.options.size ? [this.options.size[0], this.options.size[1] * 2] : undefined;    
    };

    Slider.prototype.set = function(val) 
    {
        this.value = Math.min(Math.max(this.options.range[0], val), this.options.range[1]);        
        this.setLabelContent();
        this.emit('change', {value: this.get(), range: this.range});
        return this; 
    };

    Slider.prototype.setLabelContent = function() { 
        this.label.setContent( labelTemplate.call( this ) ); 
    };
    
    Slider.prototype.render = function() 
    {
        var fillSize = ((this.get() - this.options.range[0]) / (this.options.range[1] - this.options.range[0]));
        return [            
            {
                transform: this.backMatrix,
                target: this.back.render()
            },
            {
                transform: FM.move(FM.scale( fillSize, 1, 1 ), [ 0, 0, 1.125 ]),
                target: this.fill.render()            
            },                        
            {
                transform: this.labelMatrix,                
                target: this.label.render()
            } 
        ];
    };

    function labelTemplate () {
        return this.options.name + 
            " <span class='slider-value' style='float:right'>" + 
                this.value.toFixed(this.options.precision) + 
            "</span>";
    }

    module.exports = Slider;
});
