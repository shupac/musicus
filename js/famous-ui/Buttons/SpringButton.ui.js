define(function(require, exports, module) { 
    var SpringButton = require('./SpringButton');

    function SpringButtonAutoUI( options ) {
        SpringButton.apply( this, arguments ); 
        this.autoUI = 
        [
            // PHYSICS
            {
                type: 'label',
                uiOptions: {
                    content: 'PHYSICS',
                    properties: { 
                        'border-bottom' : '1px solid #f2786f',
                        'color' : '#f2786f',
                        'font-size': '16px'
                    }
                }
            },
            {
                option: 'springPeriod',
                type: 'slider',
                uiOptions: { 
                    range: [100, 2000],
                    name: 'SPRING DURATION'
                }
            },
            {
                option: 'springPeriod',
                callback: this.setDamping,
                type: 'slider',
                uiOptions: { 
                    range: [0.002, 0.8],
                    name: 'SPRING DAMPING'
                }
            },

            // APPEARANCE
            {
                type: 'label',
                uiOptions: {
                    content: 'APPEARANCE',
                    properties: { 
                        'border-bottom' : '1px solid white',
                        'color' : 'rgba( 255, 255, 255, 1 )',
                        'font-size': '16px'
                    }
                }
            },
            {
                callback: this.setBackgroundColor,
                type: 'colorPicker',
                uiOptions: {
                    name: 'Background Color'
                }
            },
            {
                callback: this.setBorderColor,
                type: 'colorPicker',
                uiOptions: {
                    name: 'Stroke Color'
                }
            },
            {
                callback: this.setBorderRadius,
                type: 'slider',
                uiOptions: { 
                    range: [0, 100],
                    name: 'BORDER RADIUS'
                }
            }
        ]; 
    }

    SpringButtonAutoUI.prototype = Object.create( SpringButton.prototype );
    
    SpringButtonAutoUI.prototype.setPeriod = function ( val ) {
        this.setOptions({ period: val });
    };

    SpringButtonAutoUI.prototype.setDamping = function ( val ) {
        this.setOptions({ dampingRatio: val });
    };
    
    SpringButtonAutoUI.prototype.setBackgroundColor = function ( arg ) {
        this.surface.setProperties({ 
            'background-color': arg.getCSSColor()
        });
    };
    
    SpringButtonAutoUI.prototype.setBorderColor = function ( arg ) {
        this.surface.setProperties({ 
            'border': '1px solid ' + arg.getCSSColor()
        });
    };

    SpringButtonAutoUI.prototype.setBorderRadius = function ( arg ) {
        this.surface.setProperties({ 
            'border-radius': arg + 'px'
        });
    };

    module.exports = SpringButtonAutoUI;
});
