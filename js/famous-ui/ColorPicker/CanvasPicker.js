define(function(require, exports, module) {
    var Surface = require('famous/Surface');
    var CanvasSurface = require('famous/CanvasSurface');
    var FM = require('famous/Matrix');
    var FEH = require('famous/EventHandler');
    var Modifier = require('famous/Modifier');
    var Utils = require('famous-utils/Utils');
    var Color = require('famous-color/Color');
    var Engine = require('famous/Engine');
    var Easing = require('famous-animation/Easing');
    var ColorButton = require('./ColorButton'); 
    var View = require('famous/View');
    
    /*
     *  Base class for GradientPicker, HuePicker and AlphaPicker.
     *  Creates a gradient on a canvas surface and a picker surface. 
     */
    function CanvasPicker(size, initialColor, opts) { 
        View.apply(this);
        this.eventInput.pipe( this.eventOutput );
        
        this.options = {
            pickerSize: [4, size[1] + 5],
            transition: {
                curve: Easing.inSineNorm,
                duration: 50
            },
            pickerPosX: 0,
            pickerPosY: 0,
            pickerZ: 2,
            railsY: false,
            pickerProperties: {},
            colorPicker: false
        }
        this.setOptions(opts);
        this.size = size;
        this.color = initialColor.clone();
        this.name = name;
        this.pos = [];
        this._dirty = true;
        this.canvasSize = [this.size[0]*2, this.size[1]*2];

        this._selectedCoords = [
            Utils.map(this.options.pickerPosX, 0, 1, 0, this.size[0]-1, true),
            Utils.map(this.options.pickerPosY, 0, 1, 0, this.size[1]-1, true),
        ]            
 
        this.gradient = new CanvasSurface({
            size: [this.size[0], this.size[0]], 
            canvasSize: [this.size[0]*2, this.size[0]*2]
        });

        var pickerPos = getPickerPos.call(this, this.size[0] * this.options.pickerPosX, this.size[1] * this.options.pickerPosY);

        this.pickerTransform = new Modifier({ 
            transform: FM.translate(pickerPos[0], pickerPos[1], 0)
        });

        if(this.options.colorPicker) { 
            this.picker = new ColorButton(this.options.pickerSize, this.color)
        } else { 
            this.picker = new Surface({ size: this.options.pickerSize });
        }

        this.picker.setProperties(this.options.pickerProperties);

        this._mousemove = mousemove.bind(this);
        this._mouseup = mouseup.bind(this);
        
        this.gradient.on('mousedown', mousedown.bind(this));
        this.picker.on('mousedown', mousedown.bind(this));

        this.gradient.on('touchstart', touchstart.bind(this));
        this.picker.on('touchstart', touchstart.bind(this));

        this.gradient.on('touchmove', touchmove.bind(this));
        this.picker.on('touchmove', touchmove.bind(this));

        this.gradient.on('click', blockEvent);
        this.picker.on('click', blockEvent);
        
        this.on('updatePosition', this.updateColor.bind(this));
        this.on('updatePosition', updatePicker.bind(this));

        // Render Tree
        this._add(this.pickerTransform)._link(this.picker);
        this._add(this.gradient);

    }
    CanvasPicker.prototype = Object.create(View.prototype);

    CanvasPicker.prototype.drawGradient = function(color) { 
        /* in hue / alpha / gradient picker */ 
    }

    /**
     * Get the color.
     * @name CanvasPicker#getColor
     * @function
     * @return {FamousColor}. 
     */
    CanvasPicker.prototype.getColor = function() {
        return this.color; 
    }

    /**
     * Get the size of the widget.
     * @name CanvasPicker#getSize
     * @function
     * @return {Array : number} size : of item. 
     */
    CanvasPicker.prototype.getSize = function() {
        return this.size;
    }

    /**
     * Read the color from the selected coordinate point of the canvas.
     * @name CanvasPicker#updateColor
     * @function
     */
    CanvasPicker.prototype.updateColor = function() {
        var ctx = this.gradient.getContext('2d');
        var data = ctx.getImageData(this._selectedCoords[0]*2, this._selectedCoords[1]*2, 1, 1).data;
        
        this.color.setFromRGBA(data[0], data[1], data[2]);
        this.emit('change', {value: this.color});
    }

    /**
     * Read the color from the selected coordinate point of the canvas.
     * @name #updatePicker
     * @param {Object} e : e.shouldAnimate comes from mousedown function, if you click once, it will animate to that position.
     *      Otherwise, it will instantly place the picker in the desired position. 
     * @function
     * @private
     */
    function updatePicker(e) {  
        var pickerPos = getPickerPos.call(this, this._selectedCoords[0], this._selectedCoords[1]);

        if(this.options.railsY) pickerPos[1] = 0;

        this.pickerTransform.halt(); 
        
        if(e.shouldAnimate) { 
            this.pickerTransform.setTransform(FM.translate(pickerPos[0], pickerPos[1], this.options.pickerZ), this.options.transition);
        } else { 
            this.pickerTransform.setTransform(FM.translate(pickerPos[0], pickerPos[1], this.options.pickerZ));
        }
    }

    /**
     * Get the pixel position for placement of the picker.
     * @name #getPickerPos
     * @param {Number} x : selectedCoord x
     * @param {Number} y : selectedCoord y
     * @function
     * @private
     */
    function getPickerPos(x, y) {
        var halfPicker = this.options.pickerSize[0] * 0.5;

        return [
            Utils.map(x, 0, this.size[0], - halfPicker, this.size[0] - halfPicker, true),
            this.options.railsY ? 0 : Utils.map(y, 0, this.size[1], - halfPicker, this.size[1] - halfPicker, true)
        ];
    }

    // Start Events
    function mousedown(e) {
        event.preventDefault(); event.stopPropagation();
        this._dirty = true; 
        eventChange.call(this, e, true);
        Engine.on('mousemove', this._mousemove);
        Engine.on('mouseup', this._mouseup);
        
    }
    function touchstart(e) {
        this._dirty = true; 
        event.preventDefault(); event.stopPropagation();
        eventChange.call(this, e.touches[0]);
    }
    // Drag Events
    function mousemove(e) {
        event.preventDefault(); event.stopPropagation();
        eventChange.call(this, e);
    }

    // End Events
    function mouseup(e) {
        event.preventDefault(); event.stopPropagation();
        Engine.unbind('mousemove', this._mousemove);
        Engine.unbind('mouseup', this._mouseup);
    }
    function touchmove(e) {
        event.preventDefault(); event.stopPropagation();
        eventChange.call(this, e.touches[0]);
    }
    function touchend(e) {
        event.preventDefault(); event.stopPropagation();
        eventChange.call(this, e.touches[0]);
    }

    function mouseout(e) { }

    function blockEvent(e) {
        event.preventDefault(); event.stopPropagation();
    }


    function eventChange(e, shouldAnimate) {
        if(this._dirty) {
            this.pos = Utils.getSurfacePosition(this.gradient);
            this._dirty = false;
        }
        this._selectedCoords = [
            Utils.clamp(e.pageX - this.pos[0], 0, this.size[0]-1), 
            Utils.clamp(e.pageY - this.pos[1], 0, this.size[1]-1)
        ];
        this.emit('updatePosition', {shouldAnimate: shouldAnimate});
    }

    module.exports = CanvasPicker;
});
