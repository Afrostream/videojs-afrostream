/**
 * Streamroot MPEG-DASH Media Controller - Wrapper for Streamroot MPEG-DASH API
 * @param {videojs.Player|Object} player
 * @param {Object=} options
 * @param {Function=} ready
 * @constructor
 */
(function(videojs) {

  videojs.Streamroot = videojs.MediaTechController.extend({

    /** @constructor */
    init: function(player, options, ready) {

      // ///////////////////////////////////////
      // RODI : CopiÃ© depuis la tech HTML5

      videojs.MediaTechController.call(this, player, options, ready);

      // In iOS, if you move a video element in the DOM, it breaks video playback.
      this.features['movingMediaElementInDOM'] = !videojs.IS_IOS;

      // HTML video is able to automatically resize when going to fullscreen
      this.features['fullscreenResize'] = true;

      var source = options['source'];


      // If the element source is already set, we may have missed the loadstart event, and want to trigger it.
      // We don't want to set the source again and interrupt playback.
      if (source && this.el_.currentSrc === source.src && this.el_.networkState > 0) {
        player.trigger('loadstart');

        // Otherwise set the source if one was provided.
      } else if (source) {
        this.el_.src = source.src;
      }

      // ///////////////////////////////////////// ///////////////////////////////////////

      this.player_ = player;
      this.options_ = options;

      console.log("Streamroot MPEG-DASH Tech for VideoJS!");

      this.event_handlers = {
        onMetaData: videojs.Streamroot.onMetaData.bind(this),
        onBuffering: videojs.Streamroot.onBuffering.bind(this),
        onPlaying: videojs.Streamroot.onPlaying.bind(this),
        onFinish: videojs.Streamroot.onFinish.bind(this),
        onSpaceBar: videojs.Streamroot.onSpaceBar.bind(this),
        onKeyForward: videojs.Streamroot.onKeyForward.bind(this),
        onKeyRewind: videojs.Streamroot.onKeyRewind.bind(this)
      };

      /*require.config({
       baseUrl: this.player_.options_.DASHR_API
       })
       require(['api'], videojs.Streamroot.onReady.bind(this));*/

      // Maniere assez sale de mettre l'autoplay
      this.player_.ready(videojs.Streamroot.CheckAutoplay.bind(this));
      this.setupTriggers();


      // got from old onREady function
      var api = window.Streamroot.streamrootAPI;
      console.log('MPEG-DASH Module Loading');
      this.aDash = new api(this.el_, this.options_.source.src, this.event_handlers, this.player_.options_.sr_options);

      //this.player_.triggerReady();
      // histoire de setTimeout pas claire ! Hack dangereux...
      setTimeout(this.triggerReady.bind(this), 100);
    }
  });

  videojs.Streamroot.prototype.dispose = function() {
    videojs.MediaTechController.prototype.dispose.call(this);
  };

  videojs.Streamroot.prototype.setupTriggers = function() {
    for (var i = videojs.Streamroot.Events.length - 1; i >= 0; i--) {
      videojs.on(this.el_, videojs.Streamroot.Events[i], videojs.bind(this.player_, this.eventHandler));
    }
  };

  videojs.Streamroot.prototype.eventHandler = function(e) {
    this.trigger(e);
    e.stopPropagation();
  };

  videojs.Streamroot.prototype.createEl = function() {
    var player = this.player_,
    // If possible, reuse original tag for HTML5 playback technology element
      el = player.tag,
      newEl,
      clone;

    // Check if this browser supports moving the element into the box.
    // On the iPhone video will break if you move the element,
    // So we have to create a brand new element.
    if (!el || this.features['movingMediaElementInDOM'] === false) {
      // If the original tag is still there, clone and remove it.
      if (el) {
        clone = el.cloneNode(false);
        videojs.Streamroot.disposeMediaElement(el);
        el = clone;
        player.tag = null;
      } else {
        el = videojs.createEl('video', {
          id: player.id() + '_dashr_api',
          className: 'vjs-tech'
        });
      }
      // associate the player with the new tag
      el['player'] = player;
      videojs.insertFirst(el, player.el());
    }

    // Update specific tag settings, in case they were overridden
    var attrs = ['autoplay', 'preload', 'loop', 'muted'];
    for (var i = attrs.length - 1; i >= 0; i--) {
      var attr = attrs[i];
      if (player.options_[attr] !== null) {
        el[attr] = player.options_[attr];
      }
    }
    return el;
  };

  videojs.Streamroot.prototype.play = function() {
    this.aDash.play(); //SR: not sure if useful to use aDash here
    this.player_.trigger('play');
  };
  videojs.Streamroot.prototype.pause = function() {
    if (!this.el_.seeking) {
      this.aDash.pause(); //SR: not sure if useful to use aDash here
      this.player_.trigger('pause');
    }
  };
  videojs.Streamroot.prototype.paused = function() {
    return this.el_.paused;
  }; //ne pas pauser si on est en train de seeker
  videojs.Streamroot.prototype.currentTime = function() {
    return this.el_.currentTime;
  };
  videojs.Streamroot.prototype.setCurrentTime = function(seconds) {
    this.el_.currentTime = seconds;
  };

  videojs.Streamroot.prototype.duration = function() {
    return this.el_.duration || 0;
  };
  videojs.Streamroot.prototype.buffered = function() {
    var r = this.el_.buffered;
    //video-js doesn't handle buffer ranges with multiranges
    var max_time = this.getMaxTime(r);
    return videojs.createTimeRange(0, max_time);
  };

  videojs.Streamroot.prototype.getMaxTime = function(buf) {
    for (var i = 0; i < buf.length; i++) {
      if (buf.start(i) <= this.currentTime() && this.currentTime() <= buf.end(i)) {
        return buf.end(i);
      }
    }
    return this.currentTime();
  };

  videojs.Streamroot.prototype.volume = function() {
    return this.el_.volume;
  };
  videojs.Streamroot.prototype.setVolume = function(percentAsDecimal) {
    this.el_.volume = percentAsDecimal;
  };
  videojs.Streamroot.prototype.muted = function() {
    return this.el_.muted;
  };
  videojs.Streamroot.prototype.setMuted = function(muted) {
    this.el_.muted = muted;
  };

  videojs.Streamroot.prototype.width = function() {
    return this.el_.offsetWidth;
  };
  videojs.Streamroot.prototype.height = function() {
    return this.el_.offsetHeight;
  };

  videojs.Streamroot.prototype.src = function(src) {
    this.el_.src = src;
  };
  videojs.Streamroot.prototype.load = function() {
    this.el_.load();
  };
  videojs.Streamroot.prototype.currentSrc = function() {
    return this.el_.currentSrc;
  };

  videojs.Streamroot.prototype.preload = function() {
    return this.el_.preload;
  };
  videojs.Streamroot.prototype.setPreload = function(val) {
    this.el_.preload = val;
  };
  videojs.Streamroot.prototype.autoplay = function() {
    return this.el_.autoplay;
  };
  videojs.Streamroot.prototype.setAutoplay = function(val) {
    this.el_.autoplay = val;
  };
  videojs.Streamroot.prototype.loop = function() {
    return this.el_.loop;
  };
  videojs.Streamroot.prototype.setLoop = function(val) {
    this.el_.loop = val;
  };

  videojs.Streamroot.prototype.error = function() {
    return this.el_.error;
  };
  // networkState= function(){ return this.el.networkState; },
  // readyState= function(){ return this.el.readyState; },
  videojs.Streamroot.prototype.seeking = function() {
    return this.el_.seeking;
  };
  // initialTime= function(){ return this.el.initialTime; },
  // startOffsetTime= function(){ return this.el.startOffsetTime; },
  // played= function(){ return this.el.played; },
  // seekable= function(){ return this.el.seekable; },
  videojs.Streamroot.prototype.ended = function() {
    return this.el_.ended;
  };
  // videoTracks= function(){ return this.el.videoTracks; },
  // audioTracks= function(){ return this.el.audioTracks; },
  // videoWidth= function(){ return this.el.videoWidth; },
  // videoHeight= function(){ return this.el.videoHeight; },
  // textTracks= function(){ return this.el.textTracks; },
  // defaultPlaybackRate= function(){ return this.el.defaultPlaybackRate; },
  // playbackRate= function(){ return this.el.playbackRate; },
  // mediaGroup= function(){ return this.el.mediaGroup; },
  // controller= function(){ return this.el.controller; },
  videojs.Streamroot.prototype.controls = function() {
    return this.player_.options_.controls;
  };
  videojs.Streamroot.prototype.defaultMuted = function() {
    return this.el_.defaultMuted;
  };
  videojs.Streamroot.prototype.supportsFullScreen = function() {
    if (typeof this.el_.webkitEnterFullScreen == 'function') {

      // Seems to be broken in Chromium/Chrome && Safari in Leopard
      if (/Android/.test(videojs.USER_AGENT) || !/Chrome|Mac OS X 10.5/.test(videojs.USER_AGENT)) {
        return true;
      }
    }
    return false;
  };

  videojs.Streamroot.prototype.enterFullScreen = function() {
    var video = this.el_;
    if (video.paused && video.networkState <= video.HAVE_METADATA) {
      // attempt to prime the video element for programmatic access
      // this isn't necessary on the desktop but shouldn't hurt
      this.el_.play();

      // playing and pausing synchronously during the transition to fullscreen
      // can get iOS ~6.1 devices into a play/pause loop
      setTimeout(function() {
        video.pause();
        video.webkitEnterFullScreen();
      }, 0);
    } else {
      video.webkitEnterFullScreen();
    }
  };
  videojs.Streamroot.prototype.exitFullScreen = function() {
    this.el_.webkitExitFullScreen();
  };



  /* StreamrootDash Support Testing -------------------------------------------------------- */

  videojs.Streamroot.isSupported = function() {
    // voir api.js
    return window.Streamroot.isStreamrootHtml5Supported();
  };

  videojs.Streamroot.canPlaySource = function(srcObj) {
    if (srcObj.type in vjs.Streamroot.formats || srcObj.type in vjs.Streamroot.streamingFormats) { return 'maybe'; }
  };

  videojs.Streamroot.formats = {
    'video/dash': 'DASH',
    'video/smooth': 'SMOOTH'
  };

  videojs.Streamroot.streamingFormats = {
  };

  // List of all HTML5 events (various uses).
  videojs.Streamroot.Events = 'loadstart,suspend,abort,error,emptied,stalled,loadedmetadata,loadeddata,canplay,canplaythrough,playing,waiting,seeking,seeked,ended,durationchange,timeupdate,progress,ratechange,volumechange'.split(','); // tous sauf play et pause pour pouvoir controler les etat reels de lecture/buffering.

  videojs.Streamroot.disposeMediaElement = function(el) {
    if (!el) {
      return;
    }

    el['player'] = null;

    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }

    // remove any child track or source nodes to prevent their loading
    while (el.hasChildNodes()) {
      el.removeChild(el.firstChild);
    }

    // remove any src reference. not setting `src=''` because that causes a warning
    // in firefox
    el.removeAttribute('src');

    // force the media element to update its loading state by calling load()
    if (typeof el.load === 'function') {
      el.load();
    }
  };

  // HTML5 Feature detection and Device Fixes --------------------------------- //

  // Override Android 2.2 and less canPlayType method which is broken
  if (videojs.IS_OLD_ANDROID) {
    document.createElement('video').constructor.prototype.canPlayType = function(type) {
      return (type && type.toLowerCase().indexOf('video/mp4') != -1) ? 'maybe' : '';
    };
  }

  // Keyboard Shortcuts ---------------------------------------------------------

  videojs.Streamroot.prototype.addKeyboardShortcuts = function() {
    var self = this;
    // activates the keyboard shortcuts document.onkeydown = function (e) {
  }

  // Event callbacks ------------------------------------------------------------
  videojs.Streamroot.CheckAutoplay = function() {
    if (this.el_.autoplay && this.paused()) {
      this.play();
    }
  }

  videojs.Streamroot.onMetaData = function(trackList) {
    //removed the different quality buttons

    console.log('onMetaDataReceived');
    //console.log(trackList);
    var audiotracksinfos = [];
    var videotracksinfos = [];
    for(var i=0;i<trackList.length;i++) {
      trackList[i].bitrate = (trackList[i].bandwidth/1000).toFixed(0);
      //console.log(trackList[i]);
      if(trackList[i].type == 'audio') {
        audiotracksinfos.push(trackList[i]);
      } else if(trackList[i].type =='video') {
        videotracksinfos.push(trackList[i]);
      }
    }
    if(audiotracksinfos.length) {
      var audioButton = new videojs.AudioButton(this.player_,audiotracksinfos);
      this.player_.controlBar.addChild(audioButton);
    }
    if(videotracksinfos.length) {
      var videoButton = new videojs.VideoButton(this.player_,videotracksinfos);
      this.player_.controlBar.addChild(videoButton);
    }
  };

  videojs.Streamroot.onBuffering = function() {
    this.player_.trigger("waiting");
  };

  videojs.Streamroot.onPlaying = function() {
    this.player_.trigger("playing");
  };

  videojs.Streamroot.onFinish = function() {
    this.player_.trigger("ended");
    this.pause();
  };

  videojs.Streamroot.onSpaceBar = function() {
    console.log("onspace");
    //console.log(this);
    if (this.paused()) {
      this.play();
    } else {
      this.pause();
    }
  };

  videojs.Streamroot.onKeyForward = function() {
    this.setCurrentTime(this.currentTime() + 10);
  };

  videojs.Streamroot.onKeyRewind = function() {
    this.setCurrentTime(this.currentTime() - 10);
  };


  /* Text Track Menu Items
   ================================================================================ */
  videojs.AlternativeTrackMenuItem = videojs.MenuItem.extend({

    init: function(player, options, parent) {
      // Modify options for parent MenuItem class's init.

      function _levelLabel(level) {
        if (level.label) return level.label;
        else if (level.auto) return "auto";
        else if (level.height) return level.height + "p";
        else if (level.width) return Math.round(level.width * 9 / 16) + "p";
        else if (level.bitrate) return level.bitrate + "kbps";
        else return 0;
      };
      this.parentMenu = parent;
      var prefix = options.lang ? '[' + options.lang + ']' : "";
      if (!options.auto) {
        options.label = prefix + _levelLabel(options);
      } else {
        options.label = (options.lang) ? '[' + options.lang + '] ' + "Auto" : 'Auto';
      }
      this.track = options;
      options.selected = options.selected || false;
      videojs.MenuItem.call(this, player, options);
    },

    onClick: function() {
      videojs.MenuItem.prototype.onClick.call(this);
      for (var i = 0; i < this.parentMenu.items.length; i++) {
        if (this !== this.parentMenu.items[i]) {
          this.parentMenu.items[i].selected(false);
        }
      }
      this.player_.tech.aDash.switchRepresentation(this.track.type, this.track.id_aset, this.track.id_rep);
    }

  });

  /* Alternative Tracks Button
   // Herite de sprpriÃ©tÃ©s de MenuButton,
   // mais comme on override createMenu, on doit aussi overrider l'init
   ================================================================================ */
  videojs.AlternativeTrackButton = videojs.MenuButton.extend({

    init: function(player, options) {

      videojs.Button.call(this, player, options);
      this.options_ = this.options = options;
      this.player_ = this.player = player;

      this.menu = this.createMenu();
    },

    createMenu: function() {

      var menu = new videojs.Menu(this.player_);

      // Add a title list item to the top => inutile maintenant
      /*    menu.el_.appendChild(videojs.createEl("li", {
       className: "videojs-menu-title",
       innerHTML: videojs.capitalize(this.kind)
       }));*/
      this.items = new Array();

      for (var i = 0; i < this.options.length; i++) {
        if (this.options[i].auto) {
          var m = new videojs.AlternativeTrackMenuItem(this.player_, {
            type: this.options[i].type,
            lang: this.options[i].lang,
            id_rep: this.options[i].id_rep,
            auto: true,
            selected: this.options[i].selected
          }, this);
        } else {
          var id_aset = this.options[i].id_aset;
          //var bw = this.options[i].bandwidth;
          var bitrate = this.options[i].bitrate;
          var id_rep = this.options[i].id_rep;
          var selected = this.options[i].selected | false;
          var height = this.options[i].height;
          var width = this.options[i].width;

          if (this.options[i].lang) {
            var tracklang = this.options[i].lang;
          };
          var buttonOptions = {
            type: this.options[i].type,
            lang: tracklang,
            id_aset: id_aset,
            id_rep: id_rep,
            bitrate: bitrate,
            width : width,
            height : height,
            selected: selected
          };
          var m = new videojs.AlternativeTrackMenuItem(this.player_, buttonOptions, this);
        }
        this.items.push(m);
        menu.addItem(m);
      };

      // Add list to element
      this.addChild(menu);
      return menu;
    },

    buildCSSClass: function() {
      return this.className + " vjs-menu-button " + videojs.MenuItem.prototype.buildCSSClass.call(this);
    },

  });

  /////////////////////////////////////////////////////////
  // extensions des boutons videoJS !

  videojs.AudioButton = videojs.AlternativeTrackButton.extend({

    init: function(player, options) {
      videojs.AlternativeTrackButton.call(this, player, options);
    },
    kind: "audio",
    buttonText: "Audio Tracks",
    className: "vjs-sr-audiotracks-button"
  });

  videojs.VideoButton = videojs.AlternativeTrackButton.extend({

    init: function(player, options) {
      videojs.AlternativeTrackButton.call(this, player, options);
    },
    kind: "video",
    buttonText: "Video Tracks",
    className: "vjs-sr-videotracks-button"
  });
})(videojs)