define(function(require, exports, module) {
    //Import core Famous dependencies
    var View          = require('famous/View');
    var Surface       = require('famous/Surface');
    var EventHandler  = require('famous/EventHandler');
    var FM            = require('famous/Matrix');
    var RenderNode    = require('famous/RenderNode');
    var Modifier      = require('famous/Modifier');
    var Particle      = require('famous-physics/bodies/Particle')
    var Timer         = require('famous-misc/Timer');
    var Shaper        = require('famous-misc/Shaper')

    //Import app specific dependencies
    var Tweets        = require('app/examples/Musicus/Tweets');
    var MyItemsView        = require('app/examples/Musicus/MyItemsView');

    //Physics Engine
    var PhysicsEngine = require('famous-physics/PhysicsEngine');
    var PhysicsTracker = require('famous-physics/utils/PhysicsTracker');

    //Forces and Constraints
    var VectorField = require('famous-physics/forces/VectorField');
    var Drag = require('famous-physics/forces/Drag');
    var Rod = require('famous-physics/constraints/Rod');
    var Walls = require('famous-physics/constraints/Walls');


    var PE = new PhysicsEngine();
    var currentSong = 0;
    var surfaceArray = [];

    function Playlist() {
        View.call(this);

        // Set up navigation and title bar information
        this.title = 'Playlist',
        this.navigation = {
            caption: 'Playlist',
            icon: '<span class="icon">@</span>'
        };

        // Set up data and components
        this.collection = new Tweets([], {dataSource: 'https://founderapp.firebaseio.com/savedItems'});  //savedItems

        // When Firebase returns the data switch out of the loading screen
        this.collection.on('reset', function() {
            this.importCards();
            this.showCard();
            this.nextSong();
            this.createPlayer();
        }.bind(this));
    }

    Playlist.prototype = Object.create(View.prototype);
    Playlist.prototype.constructor = Playlist;
    Playlist.prototype.importCards = function() {
        
        //Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput); // binds certain methods of event handler to module so can do things like module.pipe and module.on outside of the module.  Pipe() is how you send things.  
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);  // if want surface to react while outside module, do this.eventOutput.on('event', callback)

        var spacing = 50;   //spacing between particles on grid
        var N = this.collection.models.length;        //number of particles.   is all in collection
        this.particleRadius = 1;

        // //force strengths
        // var rodStiffness    = 0.7;
        // var gravityStrength = 0.009;  // if higher than zero, unanchor bottom row
        // var dragStrength    = 0.005;

        //grid parameters
        this.Nrows = 5; // Math.floor(Math.sqrt(N)) to make more dynamic
        this.Ncols = 5; // fixed number of columns to fit screen

        var width = (this.Ncols-1) * spacing;
        var height = (this.Nrows-1) * spacing;

        var marginX = -width/2;
        var marginY = -height/2;

        //creates particle grid
        var grid = [[]];
        for (var row = 0; row < this.Nrows; row++){
            
            grid[row] = [];
            var y = marginY + spacing * row;
            
            for (var col = 0; col < this.Ncols; col++){
                
                var x = marginX + spacing * col;
                var p = [x,y,0];

                var particle = PE.createBody({  // particle not being shown; add surface for content
                    shape : PE.BODIES.PARTICLE,
                    r : this.particleRadius,
                    classes: ['imageParticles'],
                    p : p
                });

                var particleSurface = new Surface({
                    size : [20, 20],
                    content: '<img class="savedImage" src="' + this.collection.models[row*this.Ncols + col+1].get('imageUrl') + '"< />',
                    classes: ['savedImage']
                });

                surfaceArray.push(particleSurface);
                particle.add(particleSurface);

                this.physicsTracker = new PhysicsTracker(particle);
                particleSurface.pipe(this.physicsTracker);

                grid[row][col] = particle;
            };
        };

        //creates additional surface to reduce load lag
        var particleSurface = new Surface({
                    size : [20, 20],
                    content: '<img class="savedImage" src="' + this.collection.models[this.Nrows*this.Ncols+1].get('imageUrl') + '"< />',
                    classes: ['savedImage']
                });
        surfaceArray.push(particleSurface);


        //current constraint being used
        var rod = new Rod({
            length : spacing,
            stiffness : rodStiffness
        });

        //apply constraint to grid
        var particleRight, particleDown, particleCenter;
        for (var row = 0; row < this.Nrows; row++){
            for (var col = 0; col < this.Ncols; col++){   
                particleCenter = grid[row][col];
                
                if (row < this.Nrows-1) {
                    particleDown  = grid[row+1][col];
                    PE.attach(rod,  particleDown, particleCenter);
                };

                if (col < this.Ncols-1) {
                    particleRight = grid[row][col+1];
                    PE.attach(rod, particleRight, particleCenter);
                };
            };
        };

        //anchor top particles by setting their immunity to true
        for (var col = 0; col < this.Ncols; col++) {
            grid[0][col].setImmunity(Particle.IMMUNITIES.ALL);
        };

        this.gravity = new VectorField({
            field : VectorField.FIELDS.CONSTANT,
            strength : gravityStrength
        });

        this.drag = new Drag({strength : dragStrength});
        this.walls = new Walls({restitution : 0});

        PE.attach([this.gravity, this.drag, this.walls]);

        var physicsNode = new RenderNode();
        physicsNode.link(new Modifier({
            origin : [.49,0],
            transform : FM.translate(0, 200, 0)
        }))

        physicsNode.link(PE);
        this._add(physicsNode);
        particleSurface.pipe(this.eventOutput);
    };

    Playlist.prototype.nextSong = function() {
        var nextNode = new RenderNode();
        this.nextButtonSurface = new Surface({
            size : [70, 70],
            content: '<div></div>',
            classes: ['button', 'next']
        });

        nextNode.link(new Modifier({
            origin : [.5, 0],
            transform : FM.translate(15, 0, 0)
        }));

        nextNode.link(this.nextButtonSurface);
        this._add(nextNode);

        this.nextButtonSurface.on('click', function() {
            this.updateSong();
        }.bind(this));
    }

    Particle.prototype.replace = function(obj){
        if (!this.node) this.node = new RenderNode();
        this.node.object = obj;
    };    

    Playlist.prototype.shuffleGrid = function() {
        var arr = PE.getParticles();

        for (var count = 0; count < this.Nrows*this.Ncols; count++){
            arr[count].replace(surfaceArray[count+currentSong]);
            // var physicsTracker = new PhysicsTracker(arr[count]);
            surfaceArray[count+currentSong].pipe(this.physicsTracker);
        };

        PE.setPos([-25, 0, 0], arr[24]);

        var newSurface = new Surface({
            size : [20, 20],
            content: '<img class="savedImage" src="' + this.collection.models[this.Nrows*this.Ncols+currentSong+1].get('imageUrl') + '"< />',
            classes: ['savedImage']
        });

        surfaceArray.push(newSurface);
    }

    Playlist.prototype.updateSong = function() {
        this.audioPlayer.pause();
        currentSong++;
        Timer.clear(this.musicPlaying);
        this.shuffleGrid();
        document.getElementsByClassName('removable')[0].remove();
        this.showCard();

        Timer.setTimeout(function() {
            this.playSong();
        }.bind(this), 700);
    }

    Playlist.prototype.playSong = function() {    
        this.audioPlayer.setAttribute('src', this.collection.models[currentSong].get('previewUrl'));
        this.audioPlayer.play();
        this.playPauseSurface.removeClass('play');
        this.playPauseSurface.addClass('pause');
    }

    Playlist.prototype.createPlayer = function() {
        var playPauseNode = new RenderNode();
        this.audioPlayer = document.createElement('audio');
        this.playPauseSurface = new Surface({
            content: this.audioPlayer,
            classes: ['button'],
            size: [60, 60]
        });

        playPauseNode.link(new Modifier({
            origin : [0.5,0],
            transform : FM.translate(100, 10, 0)
        }))

        playPauseNode.link(this.playPauseSurface);
        this._add(playPauseNode);

        //on-off functionality
        this.playPauseSurface.on('click', function() {
            if(this.audioPlayer.paused) {
                this.audioPlayer.play();
                this.playPauseSurface.removeClass('play');
                this.playPauseSurface.addClass('pause');
            } else {
                this.audioPlayer.pause();
                this.playPauseSurface.removeClass('pause');
                this.playPauseSurface.addClass('play');
            }
        }.bind(this));
    };

    Playlist.prototype.showCard = function() {
        this.cardSurface = new Surface({
            content: '<img class="topImage" src="' + this.collection.models[currentSong].get('imageUrl') + '"< />',
            classes: ['topImage', 'removable'],
            size: [60, 60]
        });

        var showCardNode = new RenderNode();
        showCardNode.link(new Modifier({
            origin : [.5,0],
            transform: FM.translate(-90, 0, 0)
        }));

        showCardNode.link(this.cardSurface);
        this._add(showCardNode);
    }

    module.exports = Playlist;
});