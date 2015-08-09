/* jshint devel:true */

(function(scope, $, countdown, _, Egg){
    'use strict';
    var APP = scope.APP = {

        // REFERENCES
        // ==========================================================
        $window          : $(window),
        $body            : $('body'),
        $hero            : $('.hero-unit'),
        $heroBg          : $('.hero-bg'),
        $home            : $('.home'),
        $jk              : $('.jk'),
        $littleHeart     : $('.little-heart-container'),
        $hollowHeartbox  : $('.jk-jk-hahaha'),
        $hollowHeart     : $('.hollow-heart'),
        $link            : $('.link'),
        $page            : $('.page'),
        heartPath        : document.querySelector('.hollow-heart'),
        heartLength      : null,
        // $stdContainer : $('.the-date-to-save-container'),

        windowHeight      : null,
        heartBeat         : null,
        heartTimeout      : null,
        sectionHeight     : undefined,
        sectionFullHeight : undefined,
        pageHeight        : undefined,

        hollowHeartIsAnimating: false,

        // CONSTANTS
        // ==========================================================
        HEART_BEAT_INTERVAL: 1200,

        init: function(){
            _.bindAll(this,
                'onWindowResize',
                'onWindowScroll',
                'animateHeart',
                'onLinkClick',
                'onCloseClick'
            );

            this.windowHeight = window.innerHeight;
            // this.$hero[0].scrollIntoView();

            // window.scrollTo(0,0);
            this.startCountdown();
            this.getHeartSize();
            this.setHeadlinePosition();

            // SublimeLinter could not determine your shell PATH. It is unlikely that any linters will work

            var egg = new Egg();
            egg
              .AddCode('up,up,down,down,left,right,left,right,b,a', function() {
                APP.$body.toggleClass('konami');
              }, 'konami-code')
             .AddHook(function(){
                // console.log('Hook called for: ' + this.activeEgg.keys);
                // console.log(this.activeEgg.metadata);
              }).Listen();


            this.$body.removeClass('unloaded');

            // Just make a keyframe animation
            this.heartBeat = window.setInterval(APP.startBeat, this.HEART_BEAT_INTERVAL);

            // EVENTS
            // ==========================================================
            this.$window.on('resize', this.onWindowResize);
            this.$window.on('scroll', this.onWindowScroll);
            this.$hollowHeartbox.on('mouseover', this.animateHeart);
            this.$body.on('click', '.link', this.onLinkClick);
            this.$body.on('click', '.close', this.onCloseClick);
        },

        onWindowResize: function() {
        },

        onLinkClick: function(e) {
            this.showPage(e.currentTarget);

        },

        showPage: function(el) {
            var $el                = $(el),
                newPage            = $el.attr('id') + '-detail',
                $newPage           = $('#' + newPage),
                newPageHeight      = $newPage.outerHeight(true),
                $section           = $el.closest('section'),
                offsetTop          = $section.offset().top,
                sectionHeight      = $section.height(),
                sectionOuterHeight = $section.outerHeight(true);

            // APP.$link.toggleClass('is-clicked');
            // APP.$page.removeClass('active');
            // This can probably be removed now:
            this.$link.each(function(link){
                if($(this).hasClass('is-clicked')){
                    this.closePage(this);
                }
            });

            if (!$el.hasClass('is-clicked')) {
                $el.addClass('is-clicked');

                this.sectionHeight     = sectionHeight;
                this.sectionFullHeight = sectionOuterHeight;
                this.pageHeight        = newPageHeight;

                $section.addClass('is-viewing');
                $newPage.css({
                        'top': offsetTop,
                        'height':sectionOuterHeight
                    }).addClass('active');

                this.animateHeight($section,newPageHeight,500);
                this.animateHeight($newPage,newPageHeight,500);
            }
        },

        onCloseClick: function(e) {
            this.closePage(e.currentTarget);
        },

        closePage: function(el) {
            var $page     = $(this).parent(),
                newPage   = $page.attr('id').split('-')[0],
                $referrer = $('#' + newPage),
                $section  = $referrer.closest('section');

            $referrer.removeClass('is-clicked');
            $page.removeClass('active').height(this.pageHeight);
            $section.removeClass('is-viewing');

            this.animateHeight($page,this.sectionFullHeight,500, true);
            this.animateHeight($section,this.sectionFullHeight,500, true);

        },

        animateHeight: function($el, height, dur, reset){
            $el.velocity({
                height: height
            }, {
                duration: dur,
                complete: function(el) {
                    if(reset) {
                        console.log(el);
                        $el.css({
                            'height': 'initial',
                            'top': 0,
                        });
                    }
                }
            });
        },

        setHeadlinePosition: function() {
            this.$jk.css({
                top: window.scrollY / 3,
                opacity: 1 - window.scrollY / window.innerHeight
            });
        },

        onWindowScroll: function() {
            if(window.scrollY < this.windowHeight) {
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
              'stroke-dashoffset 1.25s ease-in-out';
            // Go!
            this.heartPath.style.strokeDashoffset = '0';
        },

        startCountdown: function() {
            countdown(
                new Date(2015, 9, 3, 16),
                function(ts) {
                    document.getElementById('countdown-container').innerHTML = ts.toHTML();
                },
                countdown.MONTHS|countdown.DAYS|countdown.HOURS|countdown.MINUTES//|countdown.SECONDS
            );
        }
    };

    APP.$window.on('load', function(){
        APP.init();
    });

})(window.__scope__ || window, jQuery, countdown, _, Egg);