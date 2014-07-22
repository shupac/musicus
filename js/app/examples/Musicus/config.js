define(function(require, exports, module) {
  var Util = require('famous/Utility');
  var Matrix = require('famous/Matrix');

  module.exports = {
        debug: false,
        header: {
            look: {
                classes: ['header'],
                size: [undefined, 45],
                side: 'top'
            },
            feel: {
              inTransition : {
                method : 'wall',
                period : 300,
                dampingRatio : 0,
                restitution : .2
              },
              outTransition: {
                method : 'spring',
                period : 300,
                dampingRatio : .5,
                velocity : 0
              },
              overlap: true
            }
        },
        navigation:{
          look: {
            side: 'left',
            direction: Util.Direction.Y,
            size: [260, undefined],
            itemSize: [undefined, 60],
            verticalOffset: 30,
            itemSpacing: 0,
            onClasses: ['navigation', 'on'],
            offClasses: ['navigation', 'off']
          },
          feel: {
            inTransition: {
              curve: 'easeInOut',
              duration: 150
            },
            outTransition: {
              curve: 'easeInOut',
              duration: 150
            }
          }
        },
        content: {
          feel: {
            inTransition : {
              method : 'spring',
              period : 500,
              dampingRatio : 0.7,
              velocity : 0
            },
            outTransition: {
              method : 'spring',
              period : 200,
              dampingRatio : .5,
              velocity : 0
            },
            inTransform: Matrix.scale(0.1, 0.1, 0.1),
            overlap: true 
          }
        }
    }
});

// OTHER PHYSICS OPTIONS
// inTransition : {
//   method : 'spring',
//   period : 300,
//   dampingRatio : .6,
//   velocity : 0
// },
// inTransition : {
//   method : 'stiffspring',
//   period : 10,
//   dampingRatio : .6,
//   velocity : 0
// },