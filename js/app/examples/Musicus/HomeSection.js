define(function(require, exports, module) {
    // Import core Famous dependencies
    var View          = require('famous/View');
    var Util          = require('famous/Utility');
    var Surface       = require('famous/Surface');
    var LightBox      = require('famous-misc/LightBox');
    var EventHandler  = require('famous/EventHandler');
    var FM            = require('famous/Matrix');
    var RenderNode    = require('famous/RenderNode');
    var Modifier      = require('famous/Modifier');
    var Timer         = require('famous-misc/Timer');
    var Circle        = require('famous-feedback/Circle');
    var FamousEngine  = require('famous/Engine');



    // Import app specific dependencies
    var Tweets        = require('app/examples/Musicus/Tweets');
    var SongCard      = require('app/examples/Musicus/SongCard');
    var SwipeStack    = require('app/examples/Musicus/SwipeStack');

    function Home() {
        View.call(this);
        createLoadingSurface.call(this);
        createVisualizer.call(this);
        this.autoPlay = true;

        // Set up navigation and title bar information
        this.title = 'Home',
        this.navigation = {
            caption: 'Home',
            icon: '<span class="icon entypo">&#8962;</span>'
        };

        this.circle = new Circle();
        this.circle.options = Object.create(Circle.DEFAULT_OPTIONS);
        this.circle.options.zDepth = 400;
        // this.circle.setOptions({
            // zDepth: 400
        // });

        // Initialize swipe stack
        this.collection = new Tweets([], {dataSource: 'https://founderapp.firebaseio.com/songs'});
        this.collection.on('reset', function() {
            this.swipeStack.initialize();
            // this.playCurrentSong();

            this.layoutBackground = new Surface({
                size: [undefined, undefined],
                content: '<img height=" ' + window.innerHeight + '" width="' + window.innerWidth + '" src= "' + this.swipeStack.getCurrentCard().cardView.model.get('imageUrl') + '"/>',
                classes: ['background-image']
            });

            this.layoutBackgroundNode.link(this.layoutBackgroundMod).link(this.layoutBackground);
            this._add(this.layoutBackgroundNode);
        }.bind(this));

        var stackOffsetY = 20;

        var swipeStackOptions = {
            cardOffsetZ: 120,
            cardOffsetY: 13,
            stackWindowOffset: stackOffsetY + 45
        };

        this.swipeStack = new SwipeStack(this.collection, SongCard, swipeStackOptions);

        // this.swipeStack.pipe(this.circle);
        // this._add(this.circle);

        createPlayPause.call(this);

        var swipeNode = new RenderNode();
        var swipeModifer = new Modifier({
            transform: FM.translate(0, stackOffsetY, 0)
        });

        fbRef.child('settings').child('stackSettings').on('value', function(val) {
            if(val.val()) {
                stackOffsetY = val.val().stackOffsetY;  
                stackScale = val.val().stackScale;  
                swipeModifer.setTransform(FM.move(FM.scale(stackScale, stackScale, 1), [0, stackOffsetY, 0]));
            }
        });

        fbRef.child('settings').child('autoplay').on('value', function(val) {
            this.autoPlay = val.val();
        }.bind(this));

        swipeNode.link(swipeModifer).link(this.swipeStack);
        this._add(swipeNode);

        this.layoutBackgroundNode = new RenderNode();
        this.layoutBackgroundMod = new Modifier({
            transform: FM.translate(0, 0, 2)
        });

        // set up events on swipe left and swipe right
        var saveRef = new Firebase('https://founderapp.firebaseio.com/savedItems');

        var setAudio = function() {
            this.isPlaying = false;
            this.isPaused = false;
            this.audioPlayer.setAttribute('src', null);
            this.playPauseSurface.removeClass('play');
            this.playPauseSurface.removeClass('pause');
            if(this.timer) Timer.clear(this.timer);
            this.loading.modifier.setOpacity(0);
            this.loading.modifier.setTransform(FM.translate(0, 0, -100));
            this.timer = Timer.setTimeout(function() {
                this.playCurrentSong();
            }.bind(this), 1000);
        };

        this.swipeStack.on('start', function() {
            Timer.clear(this.timer);
        }.bind(this));

        this.swipeStack.on('end', function() {
            if(!this.audioPlayer.paused || this.isPaused) return;
            console.log('end');
            setAudio.call(this);
        }.bind(this));

        this.swipeStack.on('swipeLeft', function() {
            setAudio.call(this);
            this.flashFeedback(false);
        }.bind(this));

        this.swipeStack.on('swipeRight', function() {
            var swipedCard = this.swipeStack.getSwipedCard();
            saveRef.push(swipedCard.cardView.model.attributes);
            setAudio.call(this);
            this.flashFeedback(true);
        }.bind(this));

        // ****************** FOR TESTING ***************** //
        document.addEventListener('keydown', function(e) {
           if(e.which === 32) this.swipeStack.swipeLeft(); 
        }.bind(this));
    };

    Home.prototype = Object.create(View.prototype);
    Home.prototype.constructor = Home;

    Home.prototype.playCurrentSong = function() {
        if(!this.autoPlay) return;
        var mod = this.loading.modifier;
        var self = this;
        var playPause = this.playPauseSurface;
        var previewUrl = this.swipeStack.getCurrentCard().cardView.model.get('previewUrl');
        var swipeStack = this.swipeStack;
        swipeStack.unpipeCard();
        mod.setOpacity(0.6);
        mod.setTransform(FM.translate(0, 150, 400));
        this.audioPlayer.setAttribute('src', previewUrl);
        this.audioPlayer.addEventListener('loadedmetadata', function() {
            // console.log('audio loaded');
            Timer.setTimeout(function() {
                mod.setOpacity(0);
                mod.setTransform(FM.translate(0, 0, -100));
                swipeStack.pipeCard();
                self.isPlaying = true;
            }, 100);
            playPause.addClass('pause');
            this.removeEventListener('loadedmetadata', arguments.callee, false);
        }, false);

        this.audioPlayer.play();
    };

    var createPlayPause = function() {
        var playPauseNode = new RenderNode();

        var playPauseModifier = new Modifier({
            transform: FM.translate(0, -30, 3),
            origin: [0.5, 1]
        });

        // Pre-load button images
        this.play = document.createElement('img');
        this.pause = document.createElement('img');
        this.play.setAttribute('src', '../../assets/play.png');
        this.pause.setAttribute('src', '../../assets/pause.png');

        this.audioPlayer = document.createElement('audio');
        this.playPauseSurface = new Surface({
            content: this.audioPlayer,
            classes: ['button', 'play'],
            size: [60, 60]
        });

        this.audioPlayer.addEventListener('ended', function() {
            shouldplay = false;
            console.log('ended');
            this.swipeStack.swipeLeft();
        }.bind(this));

        playPauseNode.link(playPauseModifier).link(this.playPauseSurface);
        this.playPauseSurface.removeClass('play');
        this.playPauseSurface.addClass('pause');
        playPauseNode.link(playPauseModifier).link(this.playPauseSurface);
        this.playPauseSurface.removeClass('pause');

        this.playPauseSurface.on('click', function() {
            if(this.audioPlayer.paused) {
                if($(this.audioPlayer).attr('src')) {
                    this.audioPlayer.play();
                } else {
                    this.playCurrentSong();
                }
                this.playPauseSurface.removeClass('play');
                this.playPauseSurface.addClass('pause');
                this.isPaused = false;
                this.isPlaying = true;
            } else {
                this.isPaused = true;
                this.isPlaying = false;
                shouldplay = false;
                this.audioPlayer.pause();
                this.playPauseSurface.removeClass('pause');
                this.playPauseSurface.addClass('play');
            }
        }.bind(this));

        this._add(playPauseNode);
    };

    var createLoadingSurface = function() {
        var node = new RenderNode();
        var modifier = new Modifier({
            origin: [0.5, 0],
            transform: FM.translate(0, 0, -100),
            opacity: 0
        });
        var surface = new Surface({
            size: [120, 40],
            content: '<img height="20" width="20" src="../../assets/spinner.gif"/> <span>Loading</span>',
            classes: ['loading']
        });
        this.loading = {
            node: node,
            modifier: modifier,
            surface: surface
        };
        node.link(modifier).link(surface);
        this._add(node);
    };

    var createVisualizer = function() {
        var visualizerArr = [];

        for(var i = 0; i < 20; i++){
            var surface1 = new Surface({
              size: [window.innerWidth/19,window.innerHeight],
              // content: 'VISUALIZE FONDLING  !!!!',
              classes: ['visualizerBar', 'vb'+i]
            });
            var mod1 = new Modifier({
                origin: [i/19,0],
                // translate: FM.translate(window.innerHeight, window.innerHeight, 0),
                opacity: 0.3
            });
            mod1.setTransform(FM.translate(0,window.innerHeight*.9,3))
            var node1 = new RenderNode();
            node1.link(mod1).link(surface1);
            this._add(node1);
            visualizerArr.push([surface1,mod1,node1]);
        }

        var yHeights = [.3,.4,.5,.6,.72,.73,.75,.755,.78,.79,.81];

        var yHeights = [[0.52,.88],[0.54,.88],[0.56,.88],[0.58,.88],[0.6,.88],[0.62,.88],[0.52,.88],[0.54,.88],[0.56,.88],[0.58,.88],[0.6,.88],[0.62,.88],[0.52,.88],[0.54,.88],[0.56,.88],[0.58,.88],[0.6,.88],[0.62,.88],[0.52,.88],[0.54,.88],[0.56,.88],[0.58,.88],[0.6,.88],[0.62,.88]]
        // for(var q = 0; q < yHeights.length; q++){
        //     yHeights[q] *= .7
        // }

        var speed = 300; // 100 - 800
        var track = 0;
        var random = true;

        var resetTransition = function(){
            for (var i = 0; i < 20; i++) {
                    visualizerArr[i][1].halt();
                }
            

        }
        fbRef.child('settings').child('visSpeed').on('value', function(val) {
            resetTransition();
            if(val.val()) speed = val.val();
        });

        fbRef.child('settings').child('visRandom').on('value', function(val) {
            resetTransition();
            random = val.val();
        });

        var stepVisualizer = function(){
            if(random){
                for (var i = 0; i < 20; i++) {
                    visualizerArr[i][1].setTransform(FM.translate(0,(1+Math.cos(track*.3))*1.3*window.innerHeight/4+window.innerHeight/1.4,3), {duration:speed+5})
                    track++;
                    if(track> 20) track =0;
                }
            } else{
                if(this.isPlaying){
                    for (var i = 0; i < 20; i++) {
                        var num = Math.random()*1.1+.1;
                        
                        var  y = window.innerHeight*(1-num*(yHeights[i][1]-yHeights[i][0]));        //window.innerHeight - 0.7*(Math.random()*window.innerHeight)
                        visualizerArr[i][1].setTransform(FM.translate(0, Math.min(y, window.innerHeight*.88), 3), {duration:speed+5});
                    }
                } else{
                    for (var i = 0; i < 20; i++) {
                        visualizerArr[i][1].halt();
                        visualizerArr[i][1].setTransform(FM.translate(0, window.innerHeight*.88, 3), {duration:speed+5});  //resting .88
                    }
                }
            }
            // window.requestAnimationFrame(stepVisualizer);
        }.bind(this);

        FamousEngine.on('prerender', stepVisualizer);
        // setInterval(stepVisualizer, speed+5);
        // window.requestAnimationFrame(stepVisualizer);

        // on('prerender')
    };

    Home.prototype.flashFeedback = function(like) {
        if(!this.layoutBackground) return;
        var color = 'red';
        if(like) color = 'green';
        this.layoutBackground.setContent('<div style="background-color:' + color + '; height:window.innerHeight; width:window.innerWidth;"><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/></div>');        

        var opacity = 0.75;
        var decrement = 0.025;
        var totalTime = 300;
        var step = 10;
        var intervalId;

        // Decrement opacity of green background from 0.75 to 0.25 over 200 ms
        this.layoutBackgroundMod.setOpacity(opacity);
        this.layoutBackgroundMod.setOpacity(0.25, {duration: 200});

        // Increment opacity of image from 0.25 to 0.75 over 200 ms
        Timer.setTimeout(function(){
            Timer.clear(intervalId);
            var imageUrl = this.swipeStack.getCurrentCard().cardView.model.get('imageUrl');
            fbRef.child('imageUrl').set(imageUrl);
            this.layoutBackground.setContent('<img height=" ' + window.innerHeight + '" width="' + window.innerWidth + '" src= "' + imageUrl + '"/>');

            this.layoutBackgroundMod.setOpacity(1, {duration: 200});

            Timer.setTimeout(function(){
                Timer.clear(intervalId);
            }.bind(this), totalTime);

        }.bind(this),totalTime);
    }

    module.exports = Home;
});

