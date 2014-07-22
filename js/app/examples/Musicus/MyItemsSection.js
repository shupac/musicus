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
    var ContainerSurface = require ('famous/ContainerSurface')

    //Import app specific dependencies
    var Tweets        = require('app/examples/Musicus/Tweets');
    var MyItemsView   = require('app/examples/Musicus/MyItemsView');

    //Physics Engine
    var PhysicsEngine = require('famous-physics/PhysicsEngine');
    var PhysicsTracker = require('famous-physics/utils/PhysicsTracker');

    //Forces and Constraints
    var VectorField = require('famous-physics/forces/VectorField');
    var Drag = require('famous-physics/forces/Drag');
    var Rod = require('famous-physics/constraints/Rod');
    var Walls = require('famous-physics/constraints/Walls');


    var PE = new PhysicsEngine({constraintSteps : 4});
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
            this.createContainer();
            this.importCards();
            this.showCard();
            this.nextSong();
            this.createPlayer();
            this.gyroMotion();
        }.bind(this));
    }
    

    Playlist.prototype = Object.create(View.prototype);
    Playlist.prototype.constructor = Playlist;
    Playlist.prototype.createContainer = function() {
        this.containerSurface = new ContainerSurface({
            size: [275, 400],
            classes: ['items-container']
        });

        this.containerNode = new RenderNode();        
        this.containerNode.link(new Modifier({
            origin : [0.5,.2],
            transform : FM.translate(0, 0, 3)
        })).link(this.containerSurface);

        this.containerSurface.add(this.imageSurface);

        this._add(this.containerNode); 

        this.imageNode = new RenderNode();        
        this.imageNode.link(new Modifier({
            origin : [.3,0],
            transform : FM.translate(0, 0, 2)
        }))

        this.imageSurface = new Surface({
            size: [275, 400],
            classes: ['containerImageSurface'],
            content: '<img height=" ' + window.innerHeight + '" width="' + window.width + '" src= "' + this.collection.models[currentSong].get('imageUrl') + '"/>',
        });

        this.imageNode.link(this.imageSurface);

        this._add(this.imageNode);
    }

    //imports cards and applies physics
    Playlist.prototype.importCards = function() {
        //Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);  // binds certain methods of event handler to module so can do things like module.pipe and module.on outside of the module.  Pipe() is how you send things.  
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);  // if want surface to react while outside module, do this.eventOutput.on('event', callback)

        var spacing = 50;   //spacing between particles on grid
        var N = this.collection.models.length;   //number of particles.   is all in collection
        this.particleRadius = 1;

        //force strengths
        var rodStiffness    = 0.7;
        var gravityStrength = 0.006;  // if higher than zero, unanchor bottom row
        var dragStrength    = 0.005;

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
                    m : 2,
                    shape : PE.BODIES.CIRCLE,
                    r : 30,
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

                // this.physicsTracker = new PhysicsTracker(particle);
                // particleSurface.pipe(this.physicsTracker);

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
            transform : FM.translate(-10, 220, 4)
        }))

        physicsNode.link(PE);
        this.containerSurface.add(physicsNode);
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
            transform : FM.translate(90, 20, 3)
        }));

        nextNode.link(this.nextButtonSurface);
        this.containerSurface.add(nextNode);

        this.nextButtonSurface.on('click', function() {
            this.updateSong();
        }.bind(this));
    }

    Playlist.prototype.updateSong = function() {
        currentSong++;
        this.shuffleGrid();
        document.getElementsByClassName('removable')[0].remove();
        this.cardTimer = Timer.setTimeout(function() {
            this.showCard();
        }.bind(this), 400);
        this.imageSurface.setContent('<img height=" ' + window.innerHeight + '" width="' + window.width + '" src= "' + this.collection.models[currentSong].get('imageUrl') + '"/>')
        this.playSongTimer = Timer.setTimeout(function() {
            this.playSong();
        }.bind(this), 600);
    }

    Particle.prototype.replace = function(obj){
        if (!this.node) this.node = new RenderNode();
        this.node.object = obj;
    };    

    Playlist.prototype.shuffleGrid = function() {
        if(this.transitionNode) {
            this.transitionNode.set(null);
        }
        
        this.transitionNode = new RenderNode();
        var transModifier = new Modifier({
            origin : [0.06,.29],
            classes: ['removable']
        })
        
        transModifier.setTransform(FM.translate(8, -80, 2), {duration: 400});
        this.transitionNode.link(transModifier)
        this.transitionNode.link(surfaceArray[currentSong-1]);
        this.containerSurface.add(this.transitionNode);

        var arr = PE.getParticles();

        for (var count = 0; count < arr.length; count++){
            arr[count].replace(surfaceArray[count+currentSong]);
            // var physicsTracker = new PhysicsTracker(arr[count]);
            // surfaceArray[count+currentSong].pipe(physicsTracker);
        };

        PE.setPos([-25, 0, 0], arr[24]);

        var newSurface = new Surface({
            size : [20, 20],
            content: '<img class="savedImage" src="' + this.collection.models[this.Nrows*this.Ncols+currentSong+1].get('imageUrl') + '"< />',
            classes: ['savedImage']
        });

        surfaceArray.push(newSurface);
    }

    Playlist.prototype.playSong = function() {    
        Timer.clear(this.playSongTimer);
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
            size: [70, 70]
        });

        playPauseNode.link(new Modifier({
            origin : [0.5,0],
            transform : FM.translate(5, 20, 3)
        }))

        playPauseNode.link(this.playPauseSurface);
        this.containerSurface.add(playPauseNode);

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
        Timer.clear(this.cardTimer);
        this.cardSurface = new Surface({
            content: '<img class="topImage" src="' + this.collection.models[currentSong].get('imageUrl') + '"< />',
            classes: ['topImage', 'removable'],
            size: [60, 60]
        });

        var showCardNode = new RenderNode();
        showCardNode.link(new Modifier({
            origin : [.5,0],
            transform: FM.translate(-90, 20, 3)
        }));

        showCardNode.link(this.cardSurface);
        this.containerSurface.add(showCardNode);
    }

    //Gyroscope tracking
    Playlist.prototype.gyroMotion = function() {
        window.addEventListener('deviceorientation', this.onDeviceMotion.bind(this));
    };

    Playlist.prototype.onDeviceMotion = function(event) {
        this.beta = event.beta; //front to back - front positive
        this.gamma = event.gamma; //left to right - right positive
        this.gravity.opts.direction.setXYZ(this.gamma/200,this.beta/50);
    };

    module.exports = Playlist;
});