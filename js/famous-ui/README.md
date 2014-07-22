FAMOUS - UI:
================================================================

SUBMODULES REQUIRED:
----------------------------------------------------------------


famous-color
famous-ext
famous-animation
famous-utils
famous-misc

```
git submodule add git@github.com:Famous/color.git js/famous-color
git submodule add git@github.com:Famous/ext.git js/famous-ext
git submodule add git@github.com:Famous/animation.git js/famous-animation
git submodule add git@github.com:Famous/famous-misc.git js/famous-misc
git submodule add git@github.com:Famous/utils.git js/famous-utils
```

UI Widgets included:
----------------------------------------------------------------

BoolToggle ( Boolean ) : true / false for a value.

MultiBoolToggle ( Radio Button ) : only one can be selected.

Slider ( number range ) : from a to b.

PanelScroller: A container to hold your UI in a scrollview

ColorPicker: A rgb picker.
    TODO: Add alpha.

MultiEasingToggler:
    Visualized Easing equations that you can pick.

Dropdown: 
    A key : value, single selector.


EXAMPLE of UI with a panel:
----------------------------------------------------------------
```
// First, you must require the UI elements you need:
var PanelScrollview = require('famous-ui/PanelScrollview');
var BoolToggle = require('famous-ui/Toggles/BoolToggle');
var MultiBoolToggle = require('famous-ui/Toggles/MultiBoolToggle');
var MultiEasingToggle = require('famous-ui/Easing/MultiEasingToggle');


// Then you must create a panel:
var ui = new PanelScrollview({
    width: 256,
    sliderHeight: 20
});


// create some UI Elements

var toggle = new BoolToggle({ value: true, name: 'Toggle!' });
var toggle2 = new BoolToggle({ value: true, name: 'Toggle!' });
var multiToggle = new MultiBoolToggle({
    values: ['value1', 'value2', 'value3']
});
var easingPicker = new MultiEasingToggle();


// listen to some events
toggle.on('change', function (e) {
    console.log( e );  
});

toggle2.on('change', function (e) {
    console.log( e );  
});

multiToggle.on('change', function (e) {
    console.log( e );  
});

easingPicker.on('change', function (e) {
    console.log( e );  
});


// add to the panel!
ui.add( [toggle, toggle2, multiToggle, easingPicker ] ); 
```
