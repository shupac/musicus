define(function(require, exports, module) {

    // Import core Famous dependencies
    var FamousEngine          = require('famous/Engine');
    var Util                  = require('famous/Utility');
    var Surface               = require('famous/Surface');
    var Timer                 = require('famous-misc/Timer');
    require('famous-misc/FastClick');

    // Import Famous physics dependencies
    var Transitionable        = require('famous/Transitionable');
    var StiffSpringTransition = require('famous-physics/utils/StiffSpringTransition');
    var SpringTransition      = require('famous-physics/utils/SpringTransition');
    var WallTransition        = require('famous-physics/utils/WallTransition');
    var Slider                = require('famous-ui/Slider');

    // Import app specific dependencies
    var App                   = require('app/App');
    var HomeSection           = require('app/examples/Musicus/HomeSection');
    var MyItemsSection        = require('app/examples/Musicus/MyItemsSection');
    var DblScrollSection      = require('app/examples/Musicus/DblScrollSection');
    // var MeSection             = require('app/examples/Musicus/MeSection');
    var config                = require('app/examples/Musicus/config');
    var modalTemplate         = require('app/examples/Musicus/modal');

    // Register physics transitions engine
    Transitionable.registerMethod('spring', SpringTransition);
    Transitionable.registerMethod('wall', WallTransition);
    Transitionable.registerMethod('stiffspring', StiffSpringTransition);

    // Config and initialize app
    fbRef = new Firebase('https://founderapp.firebaseio.com');
    
    config.sections = [new HomeSection(), new MyItemsSection(), new DblScrollSection()];
    var twitterApp = new App(config);

    // Create the modal for the app
    var bundle = document.createDocumentFragment();

    var top = document.createElement('div');
    top.className = 'modalTop';
    bundle.appendChild(top);
    top.onclick = twitterApp.dismissModal.bind(twitterApp);

    var bottom = document.createElement('div');
    bottom.innerHTML = modalTemplate;
    bottom.className = 'modalBottom';
    bundle.appendChild(bottom);

    twitterApp.modal.setContent(bundle);

    // Register the events
    twitterApp.registerEvent('select', 'navigation', function(data) {
        this._currentSection = data.id;
        this.header.show && this.header.show(this._sectionTitles[data.id]);
        this.contentArea.show && this.contentArea.show(this._sections[data.id].get());
        if(twitterApp.showMenu) {
            twitterApp.toggleSlideRight();
        }
        var sectionTitle = this.getState();
        var homeSection = this.options.sections[0];
        var playlistSection = this.options.sections[1];
        var dblScrollSection = this.options.sections[2];
        if(sectionTitle === homeSection.title) {
            // Timer.setTimeout(function() {
                homeSection.flashFeedback();
                    homeSection.audioPlayer.play();
            // }, 100);
            if(homeSection.audioPlayer.getAttribute('src')) {
                Timer.setTimeout(function() {
                    homeSection.audioPlayer.play();
                }.bind(this), 1000);
            }
        }
        if(sectionTitle === playlistSection.title) {
            Timer.setTimeout(function() {
                playlistSection.playSong();
            }.bind(this), 1500);
        }
        if(sectionTitle === dblScrollSection.title) {
            // dblScrollSection.buildYscroll();
        }
    });

    twitterApp.registerEvent('leftMenu', 'header', function() {
        twitterApp.toggleSlideRight();
    });

    twitterApp.registerEvent('rightMenu', 'header', function() {
        twitterApp.toggleSlideLeft();
    });

    twitterApp.registerEvent('search', 'header', function() {
    });

    // create the main context
    twitterApp.mainDisplay = FamousEngine.createContext();
    twitterApp.mainDisplay.setPerspective(1500);
    fbRef.child('settings').child('perspective').on('value', function(val) {
        if(val.val()) {
            twitterApp.mainDisplay.setPerspective(val.val());
        }
    });
    twitterApp.mainDisplay.link(twitterApp);
    FamousEngine.pipe(twitterApp);

    // Select the beginning section
    twitterApp.select(twitterApp.options.sections[0].title);

});
