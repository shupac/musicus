define(function(require, exports, module) {
    var Entity = require('famous/Entity');
    var EventHandler = require('famous/EventHandler');
    var Util = require('famous/Util');
    var Matrix = require('famous/Matrix');

    var CardsLayout = require('famous-misc/CardsLayout');
    var EdgeSwapper = require('famous-misc/EdgeSwapper');
    var Scrollview = require('famous-misc/Scrollview');
    var NavMenu = require('famous-widgets/NavMenu');

    function MenuApp(options) {
        this.options = Object.create(MenuApp.DEFAULT_OPTIONS);
        if(options) this.setOptions(options);

        // assemble the scroll
        this.menuSystem = new EdgeSwapper(this.options.navigationFeel);

        // create the navigation bar
        this.navigation = new NavMenu({
            size: [this.options.navigationLook.size, undefined],
            feel: this.options.navigationFeel,
            look: this.options.navigationLook
        });

        this.menuSystem.show(this.navigation);

        // create the content area
        this.contentArea = new CardsLayout({
            look: this.options.contentLook,
            feel: this.options.contentFeel
        });

        // assign received events to content area
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);

        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.contentArea.pipe(this.eventOutput);

        // navigation events are app events

        // declare the render nodes
        this._currScene = undefined;
        this.id = [];

        var navigation = [];
        var i;
        for(i = 0; i < this.options.titles.length; i++) {
            navigation[i] = this.options.titles[i];
        }
        this.navigation.setOptions({sections: navigation});
        for(i = 0; i < this.options.scenes.length; i++) {
            this.id[i] = this.options.scenes[i];
            if(this.getState() === i) this.select(i);
        }

        // respond to the the selection of a different section
        this.navigation.on('select', function(data) {
            this._currScene = data.id;
            this.contentArea.remove();
            this.id[data.id].render ? this.contentArea.show(this.id[data.id]) : this.contentArea.show(false);
        }.bind(this));

        this._entityId = Entity.register(this);
    }

    MenuApp.DEFAULT_OPTIONS = {
        scenes: [],
        titles: [],
        look: {
            navigationMargin: 10
        },
        navigationLook: {
            direction: Util.Direction.Y,
            classes: ['navigation'],
            onClasses: ['navigation', 'on'],
            offClasses: ['navigation', 'off'],
            size: [200, undefined],
            itemSize: [undefined, 50],
            itemSpacing: 10,
            crossfade: true
        },
        navigationFeel: {
            inTransition: {duration: 500, curve: 'easeOutBounce'},
            outTransition: {duration: 500, curve: 'easeIn'}
        },
        contentLook: {
            size: [500, undefined]
        },
        contentFeel: {
            dampingRatio: 1,
            period: 500,
            pageSwitchSpeed: 1
        }
    };

    MenuApp.prototype.show = function(widget){
        this.contentArea.show(widget);
    };

    MenuApp.prototype.contentOn = function(event, callback){
        this.contentArea.eventInput.on(event, callback);
    };

    MenuApp.prototype.getState = function() {
        return this._currScene;
    };

    MenuApp.prototype.select = function(id) {
        this._currScene = id;
        this.navigation.select(id);
    };

    MenuApp.prototype.getOptions = function() {
        return this.options;
    };

    MenuApp.prototype.setOptions = function(options) {
        if(options.scenes !== undefined) {
            this.options.scenes = options.scenes;
        }
        if(options.titles !== undefined) {
            this.options.titles = options.titles;
        }
        if(options.look !== undefined) this.options.look = options.look;
        if(options.navigationLook !== undefined) {
            this.options.navigationLook = options.navigationLook;
            if(this.navigation) this.navigation.setOptions({look: this.options.navigationLook});
        }
        if(options.navigationFeel !== undefined) {
            this.options.navigationFeel = options.navigationFeel;
            if(this.navigation) this.navigation.setOptions({feel: this.options.navigationFeel});
            if(this.menuSystem) this.menuSystem.setOptions({feel: this.options.navigationFeel});
        }
        if(options.navigationWidget !== undefined) this.options.navigationWidget = options.navigationWidget;
        if(options.contentFeel !== undefined) {
            this.options.contentFeel = options.contentFeel;
            if(this.contentArea) this.contentArea.setOptions({
                inTransition: this.options.contentFeel.inTransition,
                outTransition: this.options.contentFeel.outTransition,
                overlap: this.options.contentFeel.overlap
            });
        }
        if(options.contentLook !== undefined) this.options.contentLook = options.contentLook;
        if(options.contentWidget !== undefined) this.options.contentWidget = options.contentWidget;
    };

    MenuApp.prototype.render = function() {
        return this._entityId;
    }

    MenuApp.prototype.commit = function(context, transform, opacity, origin, size) {
        var navigationWidth = this.options.navigationLook.size[0] + 2*this.options.look.navigationMargin;
        var renderResult = [
            {
                transform: Matrix.translate(this.options.look.navigationMargin, 0),
                origin: [0, 0],
                target: this.menuSystem.render()
            },
            {
                size: [size[0] - navigationWidth, size[1]],
                origin: [1, 0],
                target: this.contentArea.render()
            }
        ];

        return {
            transform: transform,
            opacity: opacity,
            origin: origin,
            size: size,
            target: renderResult
        };
    };

    module.exports = MenuApp;
});
