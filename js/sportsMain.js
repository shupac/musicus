define(function(require, exports, module) {

    // Import core Famous dependencies
    var FamousEngine      = require('famous/Engine');
    var Util              = require('famous/Utility');
    var Surface           = require('famous/Surface');
    require('famous-misc/FastClick');

    // Import Famous physics dependencies
    var Transitionable    = require('famous/Transitionable');
    var StiffSpringTransition = require('famous-physics/utils/StiffSpringTransition');
    var SpringTransition = require('famous-physics/utils/SpringTransition');
    var WallTransition = require('famous-physics/utils/WallTransition');
    var Slider            = require('famous-ui/Slider');

    // Import app specific dependencies
    var App               = require('app/App');
    var NBASection        = require('app/examples/Sports/NBASection');
    var NFLSection        = require('app/examples/Sports/NFLSection');
    var EPLSection        = require('app/examples/Sports/EPLSection');
    var NHLSection        = require('app/examples/Sports/NHLSection');
    var MLBSection        = require('app/examples/Sports/MLBSection');
    var config            = require('app/examples/Sports/config');

    // Register physics transitions engine
    Transitionable.registerMethod('spring', SpringTransition);
    Transitionable.registerMethod('wall', WallTransition);
    Transitionable.registerMethod('stiffspring', StiffSpringTransition);

    // Config and initialize app
    config.sections = [new NBASection(), new NFLSection(), new EPLSection(), new NHLSection(), new MLBSection()];
    // config.sections = [new NBASection(), new NFLSection()];

    var sportsApp = new App(config);

    // Register the events
    sportsApp.registerEvent('select', 'navigation', function(data) {
        this._currentSection = data.id;
        this.header.show && this.header.show({
            title: this._sectionTitles[data.id],
            games: this._sections[data.id].object.getGamesInfo()
        });

        //console.log(this._sections[data.id].get().youtubeId);
        this.contentArea.getPlayer() && this.contentArea.getPlayer().loadVideoById(this._sections[data.id].get().youtubeId);
    });

    document.addEventListener('orientationchange', function() {
        this.contentArea.setSize([window.innerWidth - 150, window.innerHeight - 150])
    }.bind(sportsApp))

    // create the main context
    var mainDisplay = FamousEngine.createContext();
    
    mainDisplay.link(sportsApp);
    FamousEngine.pipe(sportsApp);

    // Select the beginning section
    sportsApp.select(sportsApp.options.sections[0].title);
});
