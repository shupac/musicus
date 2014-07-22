define(function(require, exports, module) {
    // Import core Famous dependencies
    var View               = require('famous/View');
    var Util               = require('famous/Utility');
    var Surface            = require('famous/Surface');
    var Utility            = require('famous/Utility');
    var LightBox           = require('famous-misc/LightBox');
    var EventHandler       = require('famous/EventHandler');
    var FM                 = require('famous/Matrix');
    var RenderNode         = require('famous/RenderNode');
    var Modifier           = require('famous/Modifier');
    var ContainerSurface   = require('famous/ContainerSurface');
    var Scrollview         = require('famous-misc/Scrollview');
    var ScrollContainer    = require('famous-widgets/ScrollContainer');
    var Matrix      = require('famous/Matrix');
    var Utility     = require('famous/Utility');

    // Import app specific dependencies
    var Tweets             = require('app/examples/Musicus/Tweets');
    var SongCard           = require('app/examples/Musicus/GenreCard');


    function DblScroll() {
        View.call(this);
        Scrollview.prototype.getSize = function() {
            return [300,undefined]
        }

        // Set up navigation and title bar information
        this.title = 'Genres',
        this.navigation = {
            caption: 'Genres',
            icon: '<span class="icon">#</span>'
        };


        this.lightBox = new LightBox({
            inOrigin: [0.5,0.0],
            outOrigin: [0.5, 0.5],
            showOrigin: [.5, 0.0],
            inTransform: FM.rotateZ(30),
            outTransform: FM.rotateZ(-30)
        });
        var RN = new RenderNode()
        var mod = new Modifier({
            transform: FM.translate(26, 150, 3)
        });
        

        var cont = new ContainerSurface();
        cont.add(this.lightBox);

        RN.link(mod);
        RN.link(cont);

        this._link(RN);
        // Set up data and components
        // this.genre = new Tweets([], {dataSource: 'https://founderapp.firebaseio.com/genre'});
        this.collection = new Tweets([], {dataSource: 'https://founderapp.firebaseio.com/songs'});

        this.scrollContainer = new Scrollview({
                direction: Util.Direction.X,
                itemSpacing: 140,
                margin: 2000,
                clipSize: window.innerWidth/2,
                paginated: true
            
        });

        var regular     = function(offset) {
            return (this.options.direction === Utility.Direction.X) ?
            Matrix.aboutOrigin([80, 0, -this.options.clipSize*1.2], Matrix.rotateY(offset*.355/this.options.clipSize)) :
            Matrix.translate(0, offset);
        };
        var master     = regular;
        this.scrollContainer.setOutputFunction(regular.bind(this.scrollContainer), master.bind(this.scrollContainer));



        this.containerSurface = new ContainerSurface({
                classes: ['OVERFLOWHIDDEN'],
                size: [undefined, undefined],
                paginated:true
        });
        var inTransition = new Modifier({
            origin: [0.5, 0]
        });
        this.containerSurface.link(inTransition).link(this.scrollContainer);
        this.containerSurface.pipe(this.scrollContainer);



        this.scrollView = [];
        for(var i =0; i < 6 ; i++){
            this.scrollView[i] = new Scrollview({
                itemSpacing:228,
                paginated: false,
                clipSize: 300
            })
        }
        this.lightBox.show(this.containerSurface);
        this.collection.on('reset',function(){
            this.buildYscroll();
        }.bind(this))
    };

    DblScroll.prototype = Object.create(View.prototype);
    DblScroll.prototype.constructor = DblScroll;

    DblScroll.prototype.buildYscroll = function(){
        var regular = function(offset) {
            return (this.options.direction === Utility.Direction.Y) ?
            Matrix.aboutOrigin([0, 125, -this.options.clipSize*.8], Matrix.rotateX(-offset*1.0/this.options.clipSize)) :
            Matrix.translate(0, offset);
        };
        var master = regular;

        function shuffle(o){
            for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        };

        var arr = [
            "http://cdn.overclock.net/9/96/96ac73f3_TRANCE66.jpeg",
            "http://fc00.deviantart.net/fs71/i/2010/011/2/0/House_Music_by_Labelrx.png",
            "http://superman.is/wp-content/uploads/2013/11/artworks-000036495325-33thku-original.jpg",
            "http://s3.hulkshare.com/song_images/original/a/a/1/aa1118431ab23d9399eaff3e66f1ae89.jpg",
            "http://webtaj.com/images/dubstep-music_362307.jpg",
            "http://makepixelart.com/peoplepods/files/images/48869.original.png"
        ]

        for(var i = 0 ; i < this.scrollView.length; i++){
            var datcollection = this.collection.map(function(item) {
                    var songCard = new SongCard({model: item});
                    var surface = songCard;
                    surface.pipe(this.eventOutput);
                    return surface;
            }.bind(this))
            var shuffled = shuffle(datcollection)
            datcollection[0].frontSurface.content= '<img class="item-image" src='+ arr[i]+ ' width=240 height=240/> '

            this.scrollView[i].sequenceFrom(shuffled);
            this.scrollView[i].setOutputFunction(regular.bind(this.scrollView[i]), master.bind(this.scrollView[i]));
        }

        //push these new scroll containers to the scrollcontainer
        var surfaceArray = [];
        for(var j = 0; j < this.scrollView.length; j++){
            var surface = new ContainerSurface();
            surface.link(this.scrollView[j]);
            surface.size = [300,300];
            surface.pipe(this.scrollView[j]);
            surfaceArray.push(surface);
        }
        this.scrollContainer.sequenceFrom(surfaceArray);
    }

    module.exports = DblScroll;
});
