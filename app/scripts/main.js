/* jshint devel:true */
'use strict';

(function(scope, $, countdown, _, Egg, Modernizr, hex){
    var APP = scope.APP = {

        Flags : scope.app.Flags,

        images: data.images,

        // STATE
        // ==========================================================
        // TOTAL_IMAGES : this.images.length,
        IMAGES_PER_LOAD: 25,

        // REFERENCES
        // ==========================================================
        $window           : $(window),
        $body             : $('body'),
        $hero             : $('.hero-unit'),
        $heroBg           : $('.hero-bg'),
        $home             : $('.home'),
        $jk               : $('.jk'),
        $littleHeart      : $('.little-heart-container'),
        $hollowHeartbox   : $('.jk-jk-hahaha'),
        $jkBg             : $('.jkpg'),
        $hollowHeart      : $('.hollow-heart'),
        $link             : $('.link'),
        $sectionContainer : $('.section-container'),
        $page             : $('.page'),
        $gridBlock        : $('.grid-block'),
        $MenuIcon         : $('.menu-icon'),
        $usMore           : $('#us-more'),
        $usImages         : $('.us-image'),
        usContainer       : document.getElementById('us-container'),
        heartPath         : document.querySelector('.hollow-heart'),
        heartLength       : null,
        // $stdContainer  : $('.the-date-to-save-container'),

        windowHeight      : null,
        heartBeat         : null,
        heartTimeout      : null,
        jkTimer           : null,
        wall              : null,
        resizeTimer       : null,
        sectionHeight     : undefined,
        sectionFullHeight : undefined,
        pageHeight        : undefined,

        imagesLoaded: 0,
        totalImages: 0,

        hollowHeartIsAnimating : false,
        isChanged              : false,
        isMoreLoading          : false,
        isUsLoaded             : false,

        usedPicNumbers : [],

        // CONSTANTS
        // ==========================================================
        HEART_BEAT_INTERVAL: 1000,

        init: function(){

            _.bindAll(this,
                'onWindowResize',
                'onWindowScroll',
                'animateHeart',
                'onLinkClick',
                'onCloseClick',
                'onFlClick',
                'onUsMoreClick',
                // 'onLinkMouseover',
                // 'onLinkMouseout',
                'onMenuBtnClick',
                'onNavItemClick'
            );

            this.windowHeight = window.innerHeight;
            // this.$hero[0].scrollIntoView();

            // window.scrollTo(0,0);
            if(!!document.getElementById('countdown-container')){
                this.startCountdown();
                this.getHeartSize();
            }
            this.setHeadlinePosition();


            // SublimeLinter could not determine your shell PATH. It is unlikely that any linters will work

            var egg = new Egg();
            egg.AddCode('up,up,down,down,left,right,left,right,b,a', function() {

                APP.handleKonami();
              }, 'konami-code')
             .AddHook(function(){
                // console.log('Hook called for: ' + this.activeEgg.keys);
                // console.log(this.activeEgg.metadata);
              }).Listen();


            this.$body.removeClass('unloaded');

            this.checkRouting();

            this.totalImages = this.images.length;

            // this.initUs();



            // Just make a keyframe animation
            this.heartBeat = window.setInterval(APP.startBeat, this.HEART_BEAT_INTERVAL);

            // EVENTS
            // ==========================================================
            this.$window.on('resize',                  this.onWindowResize);
            this.$window.on('scroll',                  this.onWindowScroll);
            this.$hollowHeartbox.on('mouseover',       this.animateHeart);
            this.$body.on('click', '.menu-icon',       this.onMenuBtnClick);
            this.$body.on('click', '.nav-item',        this.onNavItemClick);
            this.$body.on('click', '.link',            this.onLinkClick);
            this.$body.on('click', '.flowers',         this.onFlClick);
            this.$body.on('click', '#us-more',         this.onUsMoreClick);
            // this.$body.on('click', '#us-some',         this.onUsMoreClick);
            // this.$body.on('mouseover', '.link',        this.onLinkMouseover);
            // this.$body.on('mouseout', '.link',         this.onLinkMouseout);
            this.$body.on('click', '.close',           this.onCloseClick);
            this.$body.on('touchstart', '.grid-block', this.onGridTap);
        },

        checkRouting: function() {
            var delay = window.scrollY < this.windowHeight && !this.Flags.Browser.isMobile ? 2500 : 100;

            if(hex.url.has('lodging')){
                setTimeout(function() {
                    $('.nav-lodging').trigger('click');
                }, delay);
            } else if (hex.url.has('us')) {
                setTimeout(function() {
                    $('.nav-us').trigger('click');
                }, delay);
            }

        },

        onWindowResize: function() {
            // hide all the images until we resize them
            // set the element you are scaling i.e. the first child nodes of ```.Collage``` to opacity 0
            if(!this.Flags.Browser.isMobile) {
                this.$usImages.css("opacity", 0);
            }
            // set a timer to re-apply the plugin
            if (this.resizeTimer) clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(this.collage, 200);
        },

        onGridTap: function(e) {
            if(Modernizr.touch){
                if(!$(this).hasClass('is-active')){
                    e.stopPropagation();
                    $(this).addClass('is-active').siblings().removeClass('is-active');
                } else {
                    $(this).removeClass('is-active');
                }
            }
        },

        onMenuBtnClick: function(){
            this.$body.toggleClass('menu-open');
        },

        // onLinkMouseover : function(e) {
        //     this.onLinkHover(e.currentTarget);
        // },

        // onLinkMouseout : function(e) {
        //     this.onLinkHover(e.currentTarget);
        // },

        // onLinkHover : function(el) {
        //     var $el = $(el),
        //         $section = $el.closest('section');
        //     if(!$section.hasClass('is-clicked')) {
        //         $section.toggleClass('is-hovered');
        //     }
        // },

        onLinkClick: function(e) {
            this.showPage(e.currentTarget);
        },
        onCloseClick: function(e) {
            this.closePage(e.currentTarget);
        },

        onFlClick: function(){
            if(this.isChanged) {
                console.log('Yay! If you see this shoot me an email.');
                $('.sister').css({
                    'background'      : '#000 url("../images/liz.jpg") center center no-repeat',
                    'background-size' : 'contain'
                });
                $('.flowers').addClass('look');
            }
        },

        handleKonami: function(){
            this.$body.toggleClass('konami');
            this.isChanged = !APP.isChanged;

            if($('.flowers').hasClass('look')){
                $('.sister').css({
                    'background'      : '',
                    'background-size' : ''
                });
                $('.flowers').removeClass('look');
            }
        },

        showPage: function(el) {
            var self               = this,
                $el                = $(el),
                attr               = $el.attr('id').split('-')[0],
                newPage            = attr + '-detail',
                newPath            = '?' + attr,
                $newPage           = $('#' + newPage),
                $section           = $('#' + attr),
                timerTimeout       = this.Flags.Browser.isMobile ? 1500 : 1000;

            if(this.Flags.Browser.isMobile) {
                console.log($el.parent());
            }

            if(attr === 'us' && !this.isUsLoaded) {
                this.loadUs();
                this.isUsLoaded = true;
            }
            // This can probably be removed now:
            this.$sectionContainer.each(function(){
                if($(this).hasClass('is-clicked')){
                    var $this           = $(this),
                        closePage       = $this.attr('id') + '-detail',
                        $closePageChild = $('#' + closePage + ' .close');

                    self.closePage($closePageChild);
                }
            });

            window.setTimeout(function() {
                self.scrollToPage(attr);
            }, timerTimeout);


            if(document.location.search !== newPath) {
                window.history.pushState('page2', 'Title', '/' + newPath);
            }

            if (!$section.hasClass('is-clicked')) {
                $section.addClass('is-clicked');
                $section.removeClass('is-hovered');
                $newPage.addClass('active');
            }
        },

        closePage: function(el) {
            var $el       = $(el),
                $page     = $el.closest('section'),
                newPage   = $el.attr('id').split('-')[0],
                $section  = $('#' + newPage);

            $page.removeClass('active');
            $section.removeClass('is-clicked is-active');
            window.history.pushState('page2', 'Title', '/');
        },

        scrollToPage: function(id) {
            var $el;

            if(id === 'lodging') {
                $el = $('#' + id);
            } else {
                $el = $('#' + id + '-detail');
            }

            $('html, body').stop().animate({
                scrollTop: $el.offset().top
            }, 500);
        },

        onNavItemClick: function(e) {
            var id = $(e.currentTarget).attr('id').split('-')[0],
                $el;
            e.preventDefault();

            this.scrollToPage(id);
            this.$body.removeClass('menu-open');
            this.showPage(e.currentTarget);
        },

        setHeadlinePosition: function() {
            this.$jk.css({
                top     : window.scrollY / 3,
                opacity : 1 - window.scrollY / window.innerHeight
            });
        },

        onWindowScroll: function() {
            if(window.scrollY < this.windowHeight && !this.Flags.Browser.isMobile) {
                this.setHeadlinePosition();
            }
        },

        startBeat: function(){
            var $el = APP.$littleHeart;

            if($el.hasClass('is-beating')) {
                $el.toggleClass('is-beating').toggleClass('is-really-beating');
            } else if ($el.hasClass('is-really-beating')) {
                $el.toggleClass('is-really-beating');
            } else {
                $el.toggleClass('is-beating');
            }
        },

        getHeartSize: function() {
            this.heartPath = document.querySelector('.hollow-heart');
            this.heartLength = this.heartPath.getTotalLength();
            // Clear any previous transition
            this.heartPath.style.transition = this.heartPath.style.WebkitTransition =
              'none';
            // Set up the starting positions
            this.heartPath.style.strokeDasharray = this.heartLength + ' ' + this.heartLength;
            this.heartPath.style.strokeDashoffset = this.heartLength;        },

        animateHeart: function(){
            this.getHeartSize();

            // Trigger a layout so styles are calculated & the browser
            // picks up the starting position before animating
            this.heartPath.getBoundingClientRect();
            // Define our transition
            this.heartPath.style.transition = this.heartPath.style.WebkitTransition =
              'stroke-dashoffset 1.0s ease-in-out';
            // Go!
            this.heartPath.style.strokeDashoffset = '0';
        },

        startCountdown: function() {
            countdown(
                new Date(2015, 9, 3, 15, 30),
                function(ts) {
                    document.getElementById('countdown-container').innerHTML = ts.toHTML();
                },
                countdown.MONTHS|countdown.DAYS|countdown.HOURS|countdown.MINUTES//|countdown.SECONDS
            );
        },

        getRandomNumber: function(maxNumber) {
            return Math.floor(Math.random() * maxNumber);
        },

        createEl: function(image) {
            var img = new Image();

            img.src = image.src;
            img.setAttribute('class', 'us-image');
            img.setAttribute('width', image.w)
            img.setAttribute('height', image.h)
            img.onload = this.onImageLoad(img);

            return img;
        },

        onImageLoad: function(img){
            this.imagesLoaded += 1;

            if(this.imagesLoaded === this.IMAGES_PER_LOAD || this.imagesLoaded === this.maxPerLoad) {
                this.createPhotoWall();
            }

        },

        loadUs: function(){
            this.appendImages();
        },

        onUsMoreClick: function(){
            if(!this.isMoreLoading) {
                this.imagesLoaded = 0;
                this.isMoreLoading = true;
                this.appendImages();
            }
        },

        appendImages: function() {
            var frag = document.createDocumentFragment();

            this.maxPerLoad = this.IMAGES_PER_LOAD < this.images.length ? this.IMAGES_PER_LOAD : this.images.length;

            for (var i = 0; i < this.maxPerLoad; i++) {
                var rando = this.getRandomNumber(this.images.length);
                    var el = this.createEl(this.images[rando]);
                    this.images.splice(rando,1)

                    if(!this.images.length) {
                        this.removeMoreBtn();
                    }

                frag.appendChild(el);
            };
            this.usContainer.appendChild(frag);
        },

        removeMoreBtn: function() {
            this.$usMore.hide();
        },

        collage: function() {
            $('#us-container').collagePlus({
                'fadeSpeed': 1000
            });
        },

        createPhotoWall: function() {
            var self = this,
                timeoutTime = this.Flags.Browser.isMobile ? 1000 :100;
            // console.log('init!');

            setTimeout(function() {
                $('#us-container').collagePlus({
                    'allowPartialLastRow' : true,
                    'fadeSpeed': 1000
                });
                self.$usImages     = $('.us-image');
                self.isMoreLoading = false;

            }, timeoutTime);

        }
    };

    APP.$window.on('load', function(){
        APP.init();
    });


})(window.__scope__ || window, jQuery, countdown, _, Egg, Modernizr, hex);