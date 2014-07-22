define(function(require, exports, module) { 
    var View = require('famous/View');
    var FM = require('famous/Matrix');
    var Modifier = require('famous/Modifier');
    var Surface = require('famous/Surface');
    var Easing = require('famous-animation/Easing');
    var Utils = require('famous-utils/Utils');
    var Scrollview = require('famous-misc/Scrollview');
    var SequenceView = require('famous-misc/SequenceView');
    var RenderNode = require('famous/RenderNode');
    
    function DropdownItem(opts, value, selected) { 
        View.apply(this);
        this.eventInput.pipe( this.eventOutput );
        
        this.options = { 
            name: 'Food',
            itemSize: [216, 50],
            properties: {
                'color': '#ffffff',
                'background-color' : '#333',
                'border': '1px solid #ccc'
            },
            selectedProperties: { },
            template: function ( content ) {
                return '<h2 style="padding: 10px;">' + content + '</h2>';
            },
            defaultCurve: { 
                curve: Easing.inOutBackNorm,
                duration: 400
            },
            squishCurve: { 
                curve: Easing.outBounceNorm,
                duration: 400
            }
        }
        this.setOptions(opts);
        this.value = value;

        this._isSelected = selected || false;
        this._styleType;

        this.surface = new Surface({ size: this.options.itemSize, content: this.options.template(this.options.name) });
        this.transform = new Modifier();
        style.call( this );

        this.surface.pipe(this);
        this.surface.on('click', this.emit.bind(this, 'selection', { value: this.value, origin: this }));
        this.node.link( this.transform ).link( this.surface );
    }
    DropdownItem.prototype = Object.create(View.prototype);
    DropdownItem.prototype.constructor = DropdownItem;

    /**
     * Set state of selected to trigger styling.
     *
     * @name MultiBoolToggle#setSelected
     * @function
     * @param {Boolean} Selected, or not. 
     */
    DropdownItem.prototype.setSelected = function ( bool ) {
        this._isSelected = bool;
        style.call( this );
    }

    /**
     * Style the item.
     * @name style
     * @function
     * @private
     */
    function style() {
        this.transform.halt();
        if(this._isSelected) { 
            this.surface.setProperties( this.options.selectedProperties );
            this._styleType = true;
            this.transform.setTransform(FM.move(FM.scale( 0.7, 0.7 ), [ this.options.itemSize[0] * 0.125, this.options.itemSize[1] * 0.125]));
            this.transform.setTransform(FM.identity, this.options.squishCurve, this.emit.bind(this, 'selectionEnd'));
        } else { 
            this.surface.setProperties( this.options.properties );
            this._styleType = false;
            if(this.transform.getFinalTransform() !== FM.identity) { 
                this.transform.setTransform(FM.identity);
            }
        }
    }

    /**
     * Get size of item.
     *
     * @name MultiBoolToggle#getSize
     * @return {Array:number} size, [x, y] 
     */
    DropdownItem.prototype.getSize = function () {
        return this.surface.getSize();
    }

    /**
     * Get name of item.
     * @name MultiBoolToggle#getName
     * @return { String } name : name of item
     */
    DropdownItem.prototype.getName = function () {
        return this.options.name;
    }


    module.exports = DropdownItem;
});
