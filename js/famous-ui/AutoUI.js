define(function(require, exports, module) {    
    var View                = require('famous/View');
    var FM                  = require('famous/Matrix');
    var Modifier            = require('famous/Modifier'); 
    var Easing              = require('famous-animation/Easing');

    var PanelScrollview     = require('famous-ui/PanelScrollview');
    var BoolToggle          = require('famous-ui/Toggles/BoolToggle');
    var MultiBoolToggle     = require('famous-ui/Toggles/MultiBoolToggle');
    var MultiEasingToggle   = require('famous-ui/Easing/MultiEasingToggle');
    var Dropdown            = require('famous-ui/Dropdown/Dropdown');
    var Slider              = require('famous-ui/Slider');
    var ColorPicker         = require('famous-ui/ColorPicker/ColorPicker');

    var Label               = require('famous-ui/Text/Label');
    

    function AutoPanel ( options ) {
        View.apply( this );
        this.eventInput.pipe( this.eventOutput );
        
        this.options = {
            scaleTransition: {
                curve: Easing.inOutBackNorm,
                duration: 500
            },
            opacityTransition: {
                curve: Easing.inOutBackNorm,
                duration: 500
            },
            saveValues: false,
            panelOptions: { },
            defaultSelected: undefined,
            defaultMatrix: FM.translate( 0, 0 ),
            animateIn: false
        }; 

        this.setOptions( options );

        this.panel = new PanelScrollview( this.options.panelOptions );
        this.autoUIElements = [];

        this.panelModifier = new Modifier({ transform: this.options.defaultMatrix });
        this._add( this.panelModifier ).link( this.panel );

        if( this.options.defaultSelected ) {
            this.setCurrentObject( this.options.defaultSelected );
        }
    }

    AutoPanel.prototype = Object.create( View.prototype );
    AutoPanel.prototype.constructor = AutoPanel;
    
    AutoPanel.UI_ELEMENTS = {
        'slider'            : Slider,
        'dropdown'          : Dropdown,
        'colorPicker'       : ColorPicker,
        'toggle'            : BoolToggle,
        'multiBoolToggle'   : MultiBoolToggle,
        'easing'            : MultiEasingToggle,
        'label'             : Label
    }; 

    AutoPanel.prototype.setCurrentObject = function ( obj ) {
        if( obj !== this.currentObj ) { 

            this.currentObject = obj;
            this.clear( addUI.bind( this ));
        }
    }; 

    // TODO: Export options as JSON
    AutoPanel.prototype.toJSON = function () {
  
    };

    AutoPanel.prototype.reset = function () {
        this.panel.reset();
        this.autoUIElements = [];
    };

    AutoPanel.prototype.clear = function ( callback ) {

        this._scaledDown = true;

        function clearCallback( callback ) {

            this.panelModifier.halt();
            this.panelModifier.setOpacity( 1, this.options.opacityTransition);
            
            this.reset();
            
            if( callback ) callback(); 
        }

        if( this.options.animateIn ) { 

            this.panelModifier.setOpacity( 0, this.options.opacityTransition);
            this.panelModifier.setTransform( 
                FM.move( FM.scale( 1, 0.00001 ), this.options.defaultMatrix), 
                this.options.scaleTransition, 
                clearCallback.bind(this, callback));

        } else { 

            this.reset();
            if( callback) callback();

        }
    }; 

    function addUI () {

        if( this.currentObject.autoUI ) { 

            for (var i = 0; i < this.currentObject.autoUI.length; i++) {

                var uiDefinition = this.currentObject.autoUI[i];

                if ( uiDefinition.type ) { 
                    this._optionToUI( uiDefinition, this.panel );
                }                 
            }
        }

        if( this._scaledDown ) { 

            this.panelModifier.setTransform( this.options.defaultMatrix, this.options.scaleTransition );
            this._scaledDown = false;
        }
    }

    AutoPanel.prototype._optionToUI = function ( uiDefinition ) {

        var Element = AutoPanel.UI_ELEMENTS[ uiDefinition.type ]; 
        var ui = new Element( uiDefinition.uiOptions );

        this.panel.add( ui );
        this.autoUIElements.push( ui );

        // with option and maybe callback
        if( uiDefinition.key ) {

            // allows you to pass in a reference to an object to set values on, defaults to this.options on selected item
            var objectReferecence = uiDefinition.object ? uiDefinition.object : this.currentObject.options;
            ui.on('change', (function ( obj, key, callback, arg) {

                obj[key] = arg.value;
                if( callback ) callback.call( this, arg.value );

            }).bind( this.currentObject, objectReferecence, uiDefinition.key, uiDefinition.callback ));


        // with callback only
        } else if ( uiDefinition.callback ) {
            
            ui.on( 'change', (function (callback, arg) {
                
                callback.call( this, arg.value );

            }).bind( this.currentObject, uiDefinition.callback ));

        }
    };

    module.exports = AutoPanel;
});
