define(function(require, exports, module) {

    // Create all of the sliders of spring / stiff pring transitions
    var springSliders = function(name, direction, transition) {
        return [
            {
                type: 'slider',
                key: 'period',
                object: transition,
                uiOptions: {
                    range: [0, 1000],
                    name: name + ' ' + direction + ' Period'
                }
            },
            {
                type: 'slider',
                key: 'dampingRatio',
                object: transition,
                uiOptions: {
                    range: [0, 1],
                    name: name + ' ' + direction + ' Damping Ratio'
                }
            },
            {
                type: 'slider',
                key: 'velocity',
                object: transition,
                uiOptions: {
                    range: [0, 10],
                    name: name + ' ' + direction + ' Velocity'
                }
            }
        ]
    };

    // Create all of the sliders for all of the wall tranisitions
    var wallSliders = function(name, direction, transition) {
        return [
            {
                type: 'slider',
                key: 'period',
                object: transition,
                uiOptions: {
                    range: [0, 1000],
                    name: name + ' ' + direction + ' Period'
                }
            },
            {
                type: 'slider',
                key: 'dampingRatio',
                object: transition,
                uiOptions: {
                    range: [0, 1],
                    name: name + ' ' + direction + ' Damping Ratio'
                }
            },
            {
                type: 'slider',
                key: 'restitution',
                object: transition,
                uiOptions: {
                    range: [0, 1],
                    name: name + ' ' + direction + ' Restitution'
                }
            }
        ]
    };

    module.exports = function(name, component) {
        var sliders = [];

        // Will be more flexible in the future
        if (component.options.inTransition && component.options.inTransition.method === 'wall') {
            sliders = sliders.concat(wallSliders(name, 'In', component.options.inTransition));
        }
        else if(component.options.inTransition && (component.options.inTransition.method === 'spring' || component.options.inTransition.method === 'stiffspring')) {
            sliders = sliders.concat(springSliders(name, 'In', component.options.inTransition));
        }

        if (component.options.outTransition && component.options.outTransition.method === 'wall') {
            sliders = sliders.concat(wallSliders(name, 'Out', component.options.outTransition));
        }
        else if(component.options.outTransition && (component.options.outTransition.method === 'spring' || component.options.outTransition.method === 'stiffspring')) {
            sliders = sliders.concat(springSliders(name, 'Out', component.options.outTransition));
        }
        return sliders;
    };

});