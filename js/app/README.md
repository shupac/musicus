MenuApp Template
===========================

App.js represents the MenuApp template.  Essentially the template consists of 3 parts, navigation, header, and contentArea.  While these are just names and have default widgets that represent these paradigms, all of the components are interchangeble.  There is also a modal that has the ability to overlay the entire application.

The way the App.js works is by taking in a set of configuration options as well as a list of the sections.  These options include component size, positioning, look, and feel.

### Defaults

Header:      TitleNav (top)

Navigation:  NavBar (bottom)

ContentArea: Edgeswapper (fill)

Modal:       Surface


### Attaching components

The way that MenuApp works is by first attaching the header, then the navigation widget, and filling the remaining area with the contentArea.  You can attach the header and navigation to the "top", "bottom", "left", or "right".


Example in the app config file of a header being attached to the top

```
header: {
    widget: Scoreboard,
    look: {
        classes: ['header'],
        size: [undefined, 150],
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
            dampingRatio : .8,
            velocity : 0
        },
        overlap: true
    }
}
```

### Including physics transitions

Physics engines are attached to the global namespace which allows for you to define physics tranistions anywhere in the app.  

```
// Import Famous physics dependencies
var Transitionable        = require('famous/Transitionable');
var StiffSpringTransition = require('famous-physics/utils/StiffSpringTransition');
var SpringTransition      = require('famous-physics/utils/SpringTransition');
var WallTransition        = require('famous-physics/utils/WallTransition');
var Slider                = require('famous-ui/Slider');

// Register physics transitions engine
Transitionable.registerMethod('spring', SpringTransition);
Transitionable.registerMethod('wall', WallTransition);
Transitionable.registerMethod('stiffspring', StiffSpringTransition);
```

## Other important concepts to understand

### RenderNode

A render node represents a node in the render tree.  By attaching various widgets / components to the render node, you are showing, 

### View

A view is essentially an abstraction on a render node.  It can hold data, subcomponents, methods, and even have its own properties such as navigation options or title properties.

### CustomSliders

The CustomSliders.js takes in a lightbox and returns an objects for the autoUI properties so the app template can build display the sliders for any physics transitions.

### Section

A section is essentially whatever you need it to be.  The app will hold all of the information about your sections and allow you to transfer that information to the various other components in the app.  The default primitive for sections is a view.