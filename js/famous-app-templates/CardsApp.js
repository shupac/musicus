define(function(require, exports, module) {
    var EventHandler = require('famous/EventHandler');
    var Util = require('famous/Util');
    
    var HeaderFooterLayout = require('famous-misc/HeaderFooterLayout');
    var EdgeSwapper = require('famous-misc/EdgeSwapper');
    
    var NavBar = require('famous-widgets/NavBar');
    var TitleBar = require('famous-widgets/TitleBar');

    function CardsApp(options) {
        this.options = Object.create(CardsApp.DEFAULT_OPTIONS);
        if(options) this.setOptions(options);

        // create the layout
        this.layout = new HeaderFooterLayout({
            headerSize: this.options.headerSize,
            footerSize: this.options.footerSize
        });

        // create the header
        this.header = new (this.options.headerWidget)({
            size: [undefined, this.options.headerSize],
            inTransition: this.options.headerFeel.inTransition,
            outTransition: this.options.headerFeel.outTransition
        });

        // create the navigation bar
        this.navigation = new (this.options.navigationWidget)({
            size: [undefined, this.options.footerSize],
            feel: this.options.navigationFeel 
        });

        // create the content area
        this.contentArea = new (this.options.contentWidget)({
            inTransition: this.options.contentFeel.inTransition,
            outTransition: this.options.contentFeel.outTransition,
            overlap: this.options.contentFeel.overlap              
        });

        // link endpoints of layout to widgets
        this.layout.id['header'].link(this.header);
        this.layout.id['footer'].link(this.navigation);
        this.layout.id['content'].link(Util.transformBehind).link(this.contentArea);
        
        // assign received events to content area
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventInput.pipe(this.contentArea);

        // navigation events are app events
        EventHandler.setOutputHandler(this, this.navigation);

        // declare the render nodes
        this._currScene = undefined;
        this.id = [];

        // setup all the scenes (load tweets, insert into view widgets, etc)
        _prepareScenes.call(this);

        // respond to the the selection of a different section
        this.navigation.on('select', function(data) {
            this._currScene = data.id;
            this.header.show(this.options.scenes[data.id].title);
            this.contentArea.show(this.id[data.id]);
        }.bind(this));

        // start on first section
        this.select(0);
    };

    CardsApp.DEFAULT_OPTIONS = {
        scenes: [],
        headerSize: 50,
        headerFeel: {
            inTransition: true,
            outTransition: true
        },
        headerWidget: TitleBar,
        footerSize: 50,
        navigationFeel: {
            inTransition: true,
            outTransition: true
        },
        navigationWidget: NavBar,
        contentFeel: {
            inTransition: true,
            outTransition: true,
            overlap: true
        },
        contentWidget: EdgeSwapper
    };

    function _prepareScenes() {
        var scenes = this.options.scenes;
        var navigation = [];
        for(var i = 0; i < scenes.length; i++) {
            navigation[i] = {content: scenes[i].navigation.icon + '<br />' + scenes[i].navigation.caption};
        };
        this.navigation.setOptions({sections: navigation});
    };

    CardsApp.prototype.getState = function() {
        return this._currScene;
    };

    CardsApp.prototype.select = function(id) {
        this._currScene = id;
        if(!(id in this.id)) return false;
        this.navigation.select(id);
        return true;
    };

    CardsApp.prototype.getOptions = function() {
        return this.options;
    };

    CardsApp.prototype.setOptions = function(options) {
        if(options.scenes !== undefined) {
            this.options.scenes = options.scenes;
            if(this.contentArea) _prepareScenes.call(this);
        }
        if(options.style !== undefined) this.options.style = options.style;
        if(options.headerSize !== undefined) {
            this.options.headerSize = options.headerSize;
            if(this.header) this.header.setOptions({size: [undefined, this.options.headerSize]});
            if(this.layout) this.layout.setOptions({headerSize: this.options.headerSize});
        }
        if(options.headerFeel !== undefined) {
            this.options.headerFeel = options.headerFeel;
            if(this.header) this.header.setOptions({
                inTransition: this.options.headerFeel.inTransition,
                outTransition: this.options.headerFeel.outTransition
            });
        }
        if(options.headerWidget !== undefined) this.options.headerWidget = options.headerWidget;
        if(options.footerSize !== undefined) {
            this.options.footerSize = options.footerSize;
            if(this.navigation) this.navigation.setOptions({size: [undefined, this.options.footerSize]});
            if(this.layout) this.layout.setOptions({footerSize: this.options.footerSize});
        }
        if(options.navigationFeel !== undefined) {
            this.options.navigationFeel = options.navigationFeel;
            if(this.navigation) this.navigation.setOptions({feel: this.options.navigationFeel});
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
        if(options.contentWidget !== undefined) this.options.contentWidget = options.contentWidget;
    };

    CardsApp.prototype.render = function() {
        return this.layout.render();
    };

    module.exports = CardsApp;
});
