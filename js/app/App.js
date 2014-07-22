define(function(require, exports, module) {

    // Import core libraries
    var FamousEngine       = require('famous/Engine');
    var View               = require('famous/View');
    var EventHandler       = require('famous/EventHandler');
    var RenderNode         = require('famous/RenderNode');
    var Util               = require('famous/Utility');
    var Surface            = require('famous/Surface');
    var HeaderFooterLayout = require('famous-misc/HeaderFooterLayout');
    var EdgeSwapper        = require('famous-misc/EdgeSwapper');
    var NavBar             = require('famous-widgets/NavBar');
    var NavMenu            = require('famous-widgets/NavMenu');
    // var TitleBar           = require('famous-widgets/TitleBar');
    var LightBox           = require('famous-misc/LightBox');
    var AutoUI             = require('famous-ui/AutoUI');
    var Modifier           = require('famous/Modifier');
    var FM                 = require('famous/Matrix');
    var ContainerSurface   = require('famous/ContainerSurface');
    var Slider             = require('famous-ui/Slider');

    // Import app specific dependencies
    var TitleNav           = require('app/TitleNav');
    var CustomSliders      = require('app/CustomSliders');

    // App template
    function App(options) {
        View.call(this);
        createTouchDisplay.call(this);

        // Set options
        this.options = Object.create(App.DEFAULT_OPTIONS);
        if(options) this.setOptions(options);
        this.getNavOptions();
        // Define the components
        this._components = {};

        // Lay out components
        this.lightbox = new LightBox();
        createLayout.call(this);
        createNavMenu.call(this);
        // createSlidersMenu.call(this);

        this.modal = new Surface({
            classes: ['modal'],
            size: [0,0]
        });

        this._add(Util.transformInFront).link(this.lightbox);

        // declare the render nodes
        this._currentSection = undefined;
        this._sections = {};
        this._navigationSections = {};
        this._sectionTitles = {};

        // Initialize sections if they were passed at instantiation time
        this.options.sections && this.initSections(this.options.sections);

        if (this.options.debug) {
            this.autoUI;
            createAutoUI.call(this);
            this.ui = new AutoUI({
                defaultSelected: this
            });
            this._add(new Modifier({transform: FM.translate( 0, 0, 1)})).link(this.ui);   
        }


        // Router logic
        var url = this.options.sections[0].title;
        if (window.location.hash) {
            var patt = /^#(\w+)/;
            url = patt.exec(window.location.hash)[1];
        }
    };

    App.prototype = Object.create(View.prototype);
    App.prototype.constructor = App;

    App.DEFAULT_OPTIONS = {
        sections: [],
        headerSize: 50,
        header: {
            widget: TitleNav,
            look: {
                size: [undefined, 50],
                side: 'top'
            },
            feel: {
                inTransition: true,
                outTransition: true
            }
        },
        navigation: {
            widget: NavMenu,
            look: {
                direction: Util.Direction.X,
                side: 'bottom'
            },
            feel: {
                inTransition: true,
                outTransition: true
            }
        },
        content: {
            widget: EdgeSwapper,
            feel: {
                inTransition: true,
                outTransition: true,
                overlap: false
            }
        },
        modal: {
            widget: Surface
        }
    };

    // Name of the current section
    App.prototype.getState = function() {
        return this._currentSection;
    };

    // Saves the sections and adds them to the edge-swapping content area
    App.prototype.section = function(id) {
        if(!(id in this._sections)) {
            this._sections[id] = new RenderNode();
            this._sections[id].setOptions = (function(options) {
                this._navigationSections[id] = {
                   content: options.navigation.icon + '<br />' + options.navigation.caption
                };
                this.navigation.setOptions({sections: this._navigationSections});
                this._sectionTitles[id] = options.title;
            }).bind(this);
        }
        return this._sections[id];
    };

    // Select piped to the nav selection
    App.prototype.select = function(id) {
        this._currentSection = id;
        if(!(id in this._sections)) return false;
        this.navigation.select(id);
        return true;
    };

    App.prototype.getOptions = function() {
        return this.options;
    };

    App.prototype.getNavOptions = function() {
        this.navWidth = this.options.navigation.look.size[0];
        this.navOffsetY = this.options.navigation.look.verticalOffset;
    };

    // Set options
    App.prototype.setOptions = function(options) {
        if(options.sections !== undefined) {
            this.options.sections = options.sections;
        }
        if(options.style !== undefined) this.options.style = options.style;
        if(options.header.widget !== undefined) this.options.header.widget = options.header.widget;
        if(options.header.look !== undefined) {
            for(var key in options.header.look) {
                this.options.header.look[key] = options.header.look[key];
            }
        }
        if(options.header.feel !== undefined) {
            this.options.header.feel = options.header.feel;
            if(this.header) this.header.setOptions({
                inTransition: this.options.header.feel.inTransition,
                outTransition: this.options.header.feel.outTransition
            });
        }
        if(options.footerSize !== undefined) {
            this.options.footerSize = options.footerSize;
            if(this.navigation) this.navigation.setOptions({size: [undefined, this.options.footerSize]});
            if(this.layout) this.layout.setOptions({footerSize: this.options.footerSize});
        }
        if(options.navigation.widget !== undefined) this.options.navigation.widget = options.navigation.widget;
        if(options.navigation.look !== undefined) {
            for(var key in options.navigation.look) {
                this.options.navigation.look[key] = options.navigation.look[key];
            }
            if(this.navigation) this.navigation.setOptions({look: this.options.navigation.look});
        }
        if(options.navigation.feel !== undefined) {
            this.options.navigation.feel = options.navigation.feel;
            if(this.navigation) this.navigation.setOptions({feel: this.options.navigation.feel});
        }
        if(options.content.widget !== undefined) this.options.content.widget = options.content.widget;
        if(options.content.feel !== undefined) {
            this.options.content.feel = options.content.feel;
            if(this.contentArea) this.contentArea.setOptions({
                inTransition: this.options.content.feel.inTransition,
                outTransition: this.options.content.feel.outTransition,
                overlap: this.options.content.feel.overlap
            });
        }
        if(options.content.widgetOptions !== undefined) {
            this.options.content.widgetOptions = options.content.widgetOptions;
        }
        if (options.debug !== undefined) {
            this.options.debug = options.debug;
        }
    };

    // Initialize the sections that were passed in
    App.prototype.initSections = function(sections) {
        _.each(sections, function(item) {
            var id = item.title;
            this.section(id).setOptions({
                title: item.title,
                navigation: item.navigation
            });
            this.section(id).link(item);

            if(item.pipe) {
                item.pipe(this.eventInput);
            }
        }.bind(this));
    };

    // Attach a widget to the nested HFLayouts
    App.prototype.attach = function(options, renderable) {
        this._components[options['key']] = renderable;
        renderable.pipe && renderable.pipe(this.eventOutput);

        if(!this._initialLayoutFilled) {
            this._nextArea.link(Util.transformInFront).link(renderable);
            this._nextArea = this.layout.id['content'];
            this._initialLayoutFilled = true;
        }
        else if (options['side'] === 'final') {
            this._nextArea.link(Util.transformBehind).link(renderable);
        }
        else {
            var layout = orientedLayout(options)
            var HFLayout = layout.layout;
            var container = layout.container;

            HFLayout.id[container].link(Util.transformInFront).link(renderable);
            this._nextArea.link(Util.transformBehind).link(HFLayout);

            this._nextArea = HFLayout.id['content'];
        }
    };

    // Modal controls
    App.prototype.showModal = function() {
        this.lightbox.show(this.modal);
    };

    App.prototype.dismissModal = function() {
        this.lightbox.hide();
    };

    // Event registation based on components
    App.prototype.registerEvent = function(eventName, component, cb) {
        this[component].on(eventName, cb.bind(this));
    };

    App.prototype.toggleSlideRight = function() {
        if(this.showMenu) {
            this.layoutModifier.setTransform(FM.translate(0, 0, 0), {
                duration: 200
            });
            this.showMenu = false;
        } else {
            // this.sliderModifier.setTransform(FM.translate(window.innerWidth-this.navWidth, 0, -2));
            // this.sliderModifier.setOpacity(0);
            // this.leftMenuModifier.setTransform(FM.translate(0, this.navOffsetY, -1));
            // this.leftMenuModifier.setOpacity(1);
            this.layoutModifier.setTransform(FM.translate(this.navWidth, 0, 0), {
                duration: 200
            });
            this.showMenu = true;
        }
    };

    App.prototype.toggleSlideLeft = function() {
        if(this.showSliders) {
            this.layoutModifier.setTransform(FM.translate(0, 0, 0), {
                duration: 200
            });
            this.showSliders = false;
        } else {
            this.leftMenuModifier.setTransform(FM.translate(0, 0, -2));
            this.leftMenuModifier.setOpacity(0);
            this.sliderModifier.setTransform(FM.translate(window.innerWidth-this.navWidth, 0, -1));
            this.sliderModifier.setOpacity(1);
            this.layoutModifier.setTransform(FM.translate(-this.navWidth, 0, 0), {
                duration: 200
            });
            this.showSliders = true;
        }
    };

    var createLayout = function() {
        // Create the base layout by the orientation of the header

        var baseLayout = orientedLayout(this.options.header.look);
        this.layout = baseLayout.layout
        
        this.layoutParentNode = new RenderNode();
        this.layoutModifier = new Modifier();
        this.layoutNode = new RenderNode();

        this.layoutBackgroundNode = new RenderNode();
        this.layoutBackgroundMod = new Modifier({
            transform: FM.translate(0, 0, 0)
        });

        this.layoutBackground = new ContainerSurface({
            size: [undefined, undefined],
            classes: ['layout-background']
        });

        this.layoutParentNode.link(this.layoutModifier).link(this.layoutNode);
        this.layoutNode.add(this.layoutBackgroundNode);
        this.layoutNode.add(this.layout);

        this.layoutBackgroundNode.link(this.layoutBackgroundMod).link(this.layoutBackground);

        this._add(this.layoutParentNode);
        this._nextArea = this.layout.id[baseLayout.container];  // Where the next widget will be placed
        this._initialLayoutFilled = false;

        // Create and attach the header
        this.header = new this.options.header.widget({
            size: this.options.header.look.size,
            look: this.options.header.look,
            inTransition: this.options.header.feel.inTransition,
            outTransition: this.options.header.feel.outTransition,
        });

        this.attach({
            side: this.options.header.look.side,
            key: 'header'
        }, this.header);

        // create and attach the content area
        var contentOptions = this.options.content.widgetOptions || {};
        contentOptions['inTransition'] = this.options.content.feel.inTransition;
        contentOptions['outTransition'] = this.options.content.feel.outTransition;
        contentOptions['overlap'] = this.options.content.feel.overlap;
        this.contentArea = new this.options.content.widget(contentOptions);

        this.attach({
            side: 'final', 
            key: 'contentArea'
        }, this.contentArea);
        this.eventInput.pipe(this.contentArea);
    };

    // Create a HeaderFooterLayout based on the orientation of the next widget
    var orientedLayout = function(options) {
        var headerSize = 0;
        var footerSize = 0;
        var direction;
        var container;

        // Define properties based on widget's orientation
        if (options['side'] === 'top') {
            direction = 1; 
            headerSize = options.size ? options.size[1] : renderable.getSize()[1];
            container = 'header';
        }
        else if (options['side'] === 'bottom') {
            direction = 1; 
            footerSize = options.size ? options.size[1] : renderable.getSize()[1];
            container = 'footer';   
        }
        else if (options['side'] === 'left') {
            direction = 0; 
            headerSize = options.size ? options.size[0] : renderable.getSize()[0];
            container = 'header';   
        }
        else {
            direction = 0; 
            footerSize = options.size !== undefined? options.size[0] : renderable.getSize()[0];
            container = 'footer';   
        }

        // Return the orientated HFLayout and a reference to the nextArea container
        return {
            layout: new HeaderFooterLayout({
                direction: direction,
                headerSize: headerSize,
                footerSize: footerSize
            }),
            container: container
        }
    };

    var createAutoUI = function() {
        this.autoUI = [];

        var components = ['header', 'navigation', 'contentArea'];
        for (var key in components) {
            component = components[key];
            if (this[component].lightbox) {
                this.autoUI = this.autoUI.concat(CustomSliders(component, this[component].lightbox));
            }
        }
    };

    var createNavMenu = function() {
        // create the navigation menu
        this.navigation = new this.options.navigation.widget({
            size: this.options.navigation.look.size,
            look: this.options.navigation.look,
            feel: this.options.navigation.feel
        });

        // create and attach the nav menu container
        this.leftMenuOffsetX = this.navWidth;

        this.leftMenuNode = new RenderNode();
        this.leftMenuModifier = new Modifier();
        // this.leftMenuModifier.setTransform(FM.translate(-this.leftMenuOffsetX, this.navOffsetY, 1));
        this.leftMenuModifier.setTransform(FM.translate(0, this.navOffsetY, -1));
        this.leftMenuContainer = new ContainerSurface({
            size: [this.navWidth, 400],
            classes: ['left-menu']
        });

        // attach the nav menu
        this.navNode = new RenderNode();
        this.navModifier = new Modifier();
        this.navModifier.setTransform(FM.translate(0, 45, 0));
        this.navNode.link(this.navModifier);
        this.navNode.link(this.navigation);

        // attach the nav menu container
        this.leftMenuContainer.add(new Surface({    
            content: '',
            size: [undefined, 10]
        }));
        this.leftMenuContainer.add(this.navNode);
        this.leftMenuNode.link(this.leftMenuModifier);
        this.leftMenuNode.link(this.leftMenuContainer);
        this._add(this.leftMenuNode);
    };

    var createSlidersMenu = function() {
        var sliderNode = new RenderNode();
        var self = this;
        this.sliderModifier = new Modifier({
            transform: FM.translate(window.innerWidth-this.navWidth, 0, -1)
        });
        var sliderSurf = new ContainerSurface({
            size: [this.navWidth, undefined],
            classes: ['slider-container']
        });

        var slider = new Slider({
            size: [this.navWidth, 30],
            defaultValue: 1500,
            range: [600,2000],
            precision: 0,
            name: 'Camera Distance'
        });

        slider.init();
        
        slider.on('change', function (e) {
            console.log(e);
            self.mainDisplay.setPerspective(e.value);
        });

        sliderSurf.add([
            slider
        ]);

        sliderNode.link(this.sliderModifier).link(sliderSurf);
        this._add(sliderNode);
    };

    var createTouchDisplay = function() {
        var node = new RenderNode();
        var mod = new Modifier({
            opacity: 0.5,
            // origin: [0.5, 0.5],
            // transform: FM.translate(0, 0, 400)
            scale: [0, 0, 1]
        });
        var surface = new Surface({
            size: [20, 20],
            properties: {
                'background-color': 'white',
                'border-radius': '20px'
            }
        });

        var down = false;
        window.addEventListener('touchstart', function(e) {
            mod.setTransform(FM.move(FM.scale(1, 1, 1), [e.pageX, e.pageY, 244]));
        }, false);

        window.addEventListener('touchmove', function(e) {
            mod.setTransform(FM.translate(e.pageX, e.pageY, 244));
        }, false);

        window.addEventListener('touchend', function(e) {
            mod.setTransform(FM.scale(0, 0, 1));
        }, false);

        node.link(mod).link(surface);
        this._add(node);
    }

    module.exports = App;
});
