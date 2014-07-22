define(function(require, exports, module) { 
    var View = require('famous/View');
    var FM = require('famous/Matrix');
    var Modifier = require('famous/Modifier');
    var Transitionable = require('famous/Transitionable');
    var Surface = require('famous/Surface');
    var Easing = require('famous-animation/Easing');
    var Utils = require('famous-utils/Utils');
    var Scrollview = require('famous-misc/Scrollview');
    var DropdownItem = require('./DropdownItem');
    var ContainerSurface = require('famous/ContainerSurface');

    function Dropdown( opts ) {
        View.apply(this);
        this.eventInput.pipe( this.eventOutput );

        this.options = { 
            items: [{ name: 'Apples',  value: 'apples'}, { name: 'Oranges',  value: 'oranges'}],
            defaultSelected: 0,
            itemSize: undefined,
            labelProperties: {
                'color': '#ffffff',
                'background-color' : '#333',
                'border': '1px solid #ccc'
            },
            itemProperties: {
                'color': '#ccc',
                'background-color' : '#fff',
                'border': '1px solid #ccc'
            },
            itemSelectedProperties: {
                'border': '3px solid #33ccff'
            },
            scrollviewOpts: { 
                direction: 1,
                clipSize: undefined,
            },
            height: 125,
            defaultCurve: { 
                curve: Easing.inOutBackNorm,
                duration: 500
            },
            labelFadeCurve: { 
                curve: Easing.inOutSineNorm,
                duration: 200
            },
            arrowSize: [20, 20],
            arrowPadding: [5, 10, 1],
            arrowContent: '<img src="js/famous-ui/img/arrowRight.svg"></img>',
            itemTemplate: undefined,
            labelTemplate: undefined,
            autoClose: false
        }

        this.setOptions( opts );

        this.options.scrollviewOpts.clipSize = this.options.height;

        this.label          = undefined;
        this.defaultMtx     = undefined;
        this.closedMtx      = undefined;
        this.arrowClosedPos = undefined;
        this.arrowOpenPos   = undefined;
        this.labelTemplate  = undefined; 
        this.itemTemplate   = undefined; 
        this.itemOpts       = undefined; 
        this.sizeState      = new Transitionable([0, 0]);
        
        this.items          = [];

        // STATE 
        this._isOpen        = false;
        this.initialized    = false;
    }
    Dropdown.prototype = Object.create(View.prototype);

    /**
     * Initialize the widget.
     * @name Dropdown#init
     * @function
     */
    Dropdown.prototype.init = function () {
        this.defaultMtx     = FM.translate( 0, this.options.itemSize[1], 0 );
        this.closedMtx      = FM.move(FM.scale(1, 0.01), [0, this.options.itemSize[1] , 0]);

        //arrow mtxs
        this.arrowClosedPos = FM.translate( 
            this.options.itemSize[0] - this.options.arrowSize[0] - this.options.arrowPadding[0], 
            this.options.arrowPadding[1], 
            this.options.arrowPadding[2]);

        this.arrowOpenPos = FM.move( FM.rotateZ( Math.PI * 0.5 ), 
            [ 
                this.options.itemSize[0] - this.options.arrowSize[0] * 0.25 - this.options.arrowPadding[0], 
                this.options.arrowPadding[1] , 
                this.options.arrowPadding[2]
            ]);

        this.labelTemplate   = this.options.labelTemplate || (function ( content ) {
            return '<h3 style="line-height:' + this.options.itemSize[1] + 'px; padding-left: 10px;">' + content + '</h3>';
            }).bind(this);

        this.itemTemplate   = this.options.itemTemplate || (function ( content ) {
            return '<h4 style="line-height:' + this.options.itemSize[1] + 'px; padding-left: 10px;">' + content + '</h4>';
            }).bind(this);
        
        this.itemOpts = {
            itemSize: this.options.itemSize,
            itemProperties: this.options.itemProperties,
            selectedProperties: this.options.itemSelectedProperties,
            template: this.itemTemplate
        }

        initLabel.call(this);
        initArrow.call(this);
        initScrollview.call(this);
        initDefaultItems.call(this); 
        this.sizeState.set( this.options.itemSize );
        this.initialized = true;
    }

    /**
     * Init label surface & transform
     * @private
     */
    function initLabel() {
        this.label = new Surface({
            size: this.options.itemSize, 
            content: this.labelTemplate(this.options.items[this.options.defaultSelected].name)
        });
        this.label.setProperties( this.options.labelProperties );
        this.labelTransform = new Modifier();
        this.node.add(this.labelTransform).link(this.label);
        this.label.on('click', this.toggleMenu.bind(this) );        
    }

    /**
     * Init arrow surface & transform
     * @private
     */
    function initArrow() {
        this.arrow = new Surface({
            size: this.options.arrowSize, 
            content: this.options.arrowContent 
        });
        this.arrowTransform = new Modifier({ transform: this.arrowClosedPos });
        this.node.add(this.arrowTransform).link(this.arrow);
    }

    /**
     * Init scrollview & transform
     * @private
     */
    function initScrollview() {
        this.scrollviewContainer = new ContainerSurface({ 
            size:  [this.options.itemSize[0], this.options.height],
            properties: { 'overflow': 'hidden' }
            });

        this.scrollview = new Scrollview( this.options.scrollviewOpts );
        this.scrollview.sequenceFrom(this.items);

        this.scrollviewTransform = new Modifier({ 
            transform: this.closedMtx, 
            opacity: 0,
            size: [this.options.itemSize[0], this.options.itemSize[1]]
            });

        this.node.add(this.scrollviewTransform).link(this.scrollviewContainer);
        this.scrollviewContainer.add(this.scrollview);
    }

    /**
     * Init default items passed into options object
     * @private
     */
    function initDefaultItems() {
        for (var i = 0; i < this.options.items.length; i++) {
            var item = this.options.items[i];
            this.addItem( item.name, item.value );
        };
        this.value = this.items[this.options.defaultSelected].value;
    }

    /**
     * Add an item to the Dropdown Menu.
     * @name Dropdown#addItem
     * @function
     * @param {String} name : Label name displayed
     * @param {String} value : string value emitted when selected
     */
    Dropdown.prototype.addItem = function ( name, value ) {

        var opts = this.itemOpts;
        opts.name = name;

        var item = new DropdownItem( opts, value, false );
        item.transform.setOpacity( 0 );
        item.transform.setOpacity( 1 , this.options.defaultCurve );
        this.items.push( item ); 
        item.pipe(this.scrollview);

        item.on('selection', handleSelection.bind(this));
        if(this.options.autoClose) {
            item.on('selectionEnd', this.closeMenu.bind(this));
        }
    }

    /**
     * Open the menu.
     * @name Dropdown#openMenu
     * @function
     */
    Dropdown.prototype.openMenu = function () {
        this._isOpen = true;
        setArrow.call(this, this._isOpen);
        setMenu.call(this, this._isOpen);
    }

    /**
     * Close the menu.
     * @name Dropdown#closeMenu
     * @function
     */
    Dropdown.prototype.closeMenu = function () {
        this._isOpen = false;
        setArrow.call(this, this._isOpen);
        setMenu.call(this, this._isOpen);
    }

    /**
     * Toggle the menu between open and closed.
     * @name Dropdown#closeMenu
     * @function
     */
    Dropdown.prototype.toggleMenu = function () {
        if(this._isOpen) this.closeMenu();
        else this.openMenu();
    }
    /**
     * Toggle the menu between open and closed.
     * @name Dropdown#get
     * @function
     * @returns {String} value of selected item in dropdown
     */
    Dropdown.prototype.get = function () {
        return this.value;
    }

    /**
     * Set the value of the dropdown via value.
     * @name Dropdown#set
     * @function
     * @returns {String} value of selected item in dropdown
     */
    Dropdown.prototype.set = function ( value) {
        var index = getIndexByValue.call( this, value )
        var item = this.items[index];

        this.value = item.value;
        setSelected.call(this, index);
        this.updateLabel( this.labelTemplate(item.getName()) );

        this.emit('change', { value: this.value });
    }

    /**
     * Set the clip height of the dropdown.
     * @name Dropdown#setHeight
     * @function
     * @param {Number} num : height in pixels 
     */
    Dropdown.prototype.setHeight = function ( num ) {
        this.options.height = num;
        this.options.scrollviewOpts.clipSize = num;
        this.scrollview.options.clipSize = num;
        this.scrollviewContainer.setSize( this.options.itemSize[0], num );
    }

    /**
     * Remove an item from the dropdown.
     * @name Dropdown#removeItem
     * @function
     * @param {String || Number} item : index or value of item to remove 
     */
    Dropdown.prototype.removeItem = function ( item ) {
        var index;
        if( typeof item == 'string' ) {
            index = getIndexByValue.call(this, item ); 
        } else if ( typeof item == 'number' ) {
            index = item;
        }
        if( index !== -1 ) { 
            this.items[index].transform.setOpacity(0, this.options.defaultCurve, (function ( index ) {
                this.items.splice( index , 1 );
                }).bind(this, index))
        }
    }    

    /**
     * Set arrow transform.
     * @function @private
     * @param { bool } bool : bool of open / closed
     */
    function setArrow ( bool ) {
        var mtx = bool ? this.arrowOpenPos : this.arrowClosedPos ;
        this.arrowTransform.setTransform( mtx, this.options.defaultCurve );
    }

    /**
     * Set menu transforms.
     * @function @private
     * @param { bool } bool : bool of open / closed
     */
    function setMenu ( bool ) {
        var opacity = bool ? 1 : 0.000001;
        var size    = bool ? [this.options.itemSize[0], this.options.height ] : [this.options.itemSize[0], this.options.itemSize[1] ];
        var mtx     = bool ? this.defaultMtx : this.closedMtx;
        this.scrollviewTransform.setOpacity(opacity, this.options.defaultCurve); 
        this.scrollviewTransform.setTransform( mtx, this.options.defaultCurve);
        this.sizeState.set(size, this.options.defaultCurve); 
    }

    /**
     * Set selected item.
     * @function @private
     */    
    function handleSelection(e) {
        var index = this.items.indexOf(e.origin);
        var item = this.items[index];
        if(item) { 
            this.set(item.value, index);
        }
    }

    /**
     * set all items to appropriate selected state
     * @function @private
     */    
    function setSelected(index) {
         for (var i = 0; i < this.items.length; i++) {
             if( index == i ) { 
                this.items[i].setSelected(true);
             } else { 
                this.items[i].setSelected(false);
             }
         };
    }

    /**
     * Update the label name.
     * @name Dropdown#updateLabel
     * @function
     * @param {String} value : of label  
     */
    Dropdown.prototype.updateLabel = function ( value ) {

        var updateLabel = function ( value ) {
            this.label.setContent( value );
            this.labelTransform.setOpacity( 1, this.options.labelFadeCurve );
        }

        this.labelTransform.setOpacity( 0, this.options.labelFadeCurve, updateLabel.bind(this, value));

    }

    /**
     * get index of item via value
     * @function @private
     */    
    function getIndexByValue ( value ) {
        for (var i = 0; i < this.items.length; i++) {
            if( this.items[i].value == value ) {
                return i;
            }
        };
        return -1;
    }

    /**
     * Set the size of each item.
     * @name Dropdown#setSize
     * @function
     * @param {Array : number} size : of item. 
     */
    Dropdown.prototype.setSize = function ( size ) {
        this.options.itemSize = [size[0], size[1] * 2]; 
    }

    /**
     * Get the size of the widget.
     * @name Dropdown#getSize
     * @function
     * @return {Array : number} size : of item. 
     */
    Dropdown.prototype.getSize =  function () {
        return this.initialized ? this.sizeState.get() : undefined;
    }

    module.exports = Dropdown;
});
