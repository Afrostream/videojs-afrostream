(function (global, factory) {

  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = global.document ?
      factory(global, true) :
      function (w) {
        if (!w.document) {
          throw new Error('vjs requires a window with a document');
        }
        return factory(w);
      };
  } else {
    factory(global);
  }

  // Pass this if window is not defined yet
}(typeof window !== 'undefined' ? window : this, function (window, noGlobal) { /*jshint unused:false*/
  /*! videojs-afrostream - v0.17.5 - 2015-10-09
* Copyright (c) 2015 Brightcove; Licensed  */
/*! videojs-bitdash - v0.0.0 - 2015-10-09
* Copyright (c) 2015 benjipott; Licensed Apache-2.0 */
videojs.Bitdash = videojs.Html5.extend({
  init: function (player, options, ready) {
    videojs.Html5.call(this, player, options, ready);
    var video = document.getElementById('video').getElementsByTagName('video')[0];
    player.trigger('loadedmetadata');
  }
});

videojs.Bitdash.prototype.bitdashPlayer = {};

videojs.Bitdash.extend = function (original, context, key) {
  for (key in context) {
    if (context.hasOwnProperty(key)) {
      if (Object.prototype.toString.call(context[key]) === '[object Object]') {
        original[key] = videojs.Bitdash.extend(original[key] || {}, context[key]);
      }
      else {
        original[key] = context[key];
      }
    }
  }
  return original;
};

videojs.Bitdash.prototype.setSrc = function (src) {
  // Make sure source URL is absolute.
  this.bitdashPlayer.load(src);
};

videojs.Bitdash.prototype.load = function () {
  this.bitdashPlayer.load(this.player().currentSrc());
};


videojs.Bitdash.prototype.dispose = function () {
  this.bitdashPlayer.destroy();
  videojs.Html5.prototype.dispose.call(this);
};

videojs.Bitdash.extractMime = function (filename) {
  var reg = /(\/[^?]+).*/;
  var filePath = filename.match(reg);

  var parts = filePath[1].split('.');
  var type = (parts.length > 1) ? parts.pop() : 'mp4';
  return type;
};

videojs.Bitdash.extractType = function (source) {
  var type = videojs.Bitdash.extractMime(source.src);
  var rtType = {};
  switch (type) {
    case 'm3u8':
      rtType.type = 'application/vnd.apple.mpegurl';
      rtType.format = 'hls';
      break;
    case 'mpd':
      rtType.type = 'application/dash+xml';
      rtType.format = 'dash';
      break;
  }
  return rtType;
};

videojs.Bitdash.prototype.onClick = function (event) {
};

videojs.Bitdash.prototype.createEl = function () {
  var player = this.player_,
    el = player.tag,
    sources = {};
  videojs.Html5.disposeMediaElement(el);

  el = videojs.createEl('div', {
    id: player.id() + '_bitdash_api',
    className: 'vjs-tech'
  });//videojs.Html5.prototype.createEl.call(this);


  // associate the player with the new tag
  el.player = player;

  videojs.insertFirst(el, player.el());

  videojs.obj.each(player.options_.sources, function (key, source) {
    var typeSrc = videojs.Bitdash.extractType(source);
    sources[typeSrc.format] = source.src;
  });

  var conf = {
    key: this.options().key,
    source: sources,
    playback: {
      autoplay: player.options().autoplay,
      muted: player.options().muted,
      audioLanguage: ['fr', 'en'],
      subtitleLanguage: 'fr'
    },
    style: {
      width: '100%',
      height: '100%',
      //aspectratio: '16:9',
      controls: false
    }
  };

  this.bitdashPlayer = new bitdash(el.id).setup(conf);
  this.bitdashPlayer.addEventHandler('onReady', videojs.bind(this, function (data) {
    this.triggerReady();
  }));
  this.bitdashPlayer.addEventHandler('onPlay', videojs.bind(this, this.onPlay));
  this.bitdashPlayer.addEventHandler('onError', videojs.bind(this, this.onError));
  this.bitdashPlayer.addEventHandler('onVolumeChange', videojs.bind(this, this.onVolumeChange));
  this.bitdashPlayer.addEventHandler('onMute', videojs.bind(this, this.onVolumeChange));
  this.bitdashPlayer.addEventHandler('onUnmute', videojs.bind(this, this.onVolumeChange));
  this.bitdashPlayer.addEventHandler('onSeek', videojs.bind(this, this.onSeek));
  this.bitdashPlayer.addEventHandler('onStopBuffering', videojs.bind(this, this.onStopBuffering));
  this.bitdashPlayer.addEventHandler('onFullscreenEnter', videojs.bind(this, this.onFullscreenChange));
  this.bitdashPlayer.addEventHandler('onFullscreenExit', videojs.bind(this, this.onFullscreenChange));
  this.bitdashPlayer.addEventHandler('onPlaybackFinished', videojs.bind(this, this.onEnded));
  this.bitdashPlayer.addEventHandler('onTimeChanged', videojs.bind(this, this.onTimeChanged));
  this.bitdashPlayer.addEventHandler('onVideoPlaybackQualityChange', videojs.bind(this, this.onQualityChange));

  return el;
};

videojs.Bitdash.prototype.onQualityChange = function (e) {
  this.trigger('bitratechange');
};

videojs.Bitdash.prototype.onTimeChanged = function (e) {
  this.trigger('durationchange');
};

videojs.Bitdash.prototype.onFullscreenChange = function (e) {
  this.trigger('fullscreenchange');
};

videojs.Bitdash.prototype.onPlay = function (e) {
  this.trigger('play');
};

videojs.Bitdash.prototype.onError = function (e) {
  this.trigger('error');
};
videojs.Bitdash.prototype.onEnded = function (e) {
  this.trigger('ended');
};
videojs.Bitdash.prototype.onVolumeChange = function (e) {
  this.trigger('volumechange');
};
videojs.Bitdash.prototype.onStopBuffering = function (e) {
  this.trigger('seeked');
};
videojs.Bitdash.prototype.onSeek = function (e) {
  this.trigger('seeking');
};

videojs.Bitdash.prototype.play = function () {
  this.bitdashPlayer.play();
};
videojs.Bitdash.prototype.pause = function () {
  this.bitdashPlayer.pause();
};
videojs.Bitdash.prototype.paused = function () {
  return this.bitdashPlayer.isPaused();
};
videojs.Bitdash.prototype.currentTime = function () {
  return this.bitdashPlayer.getCurrentTime();
};
videojs.Bitdash.prototype.duration = function () {
  return this.bitdashPlayer.getDuration();
};
videojs.Bitdash.prototype.setCurrentTime = function (seconds) {
  this.bitdashPlayer.seek(seconds);
};
videojs.Bitdash.prototype.buffered = function () {
  return this.bitdashPlayer.isStalled();
};

videojs.Bitdash.prototype.volume = function () {
  return this.bitdashPlayer.getVolume() / 100;
};
videojs.Bitdash.prototype.setVolume = function (percentAsDecimal) {
  this.bitdashPlayer.setVolume(percentAsDecimal * 100);
};
videojs.Bitdash.prototype.muted = function () {
  return this.bitdashPlayer.isMuted();
};
videojs.Bitdash.prototype.setMuted = function (muted) {
  if (muted) {
    this.bitdashPlayer.mute();
  } else {
    this.bitdashPlayer.unmute();
  }
};
videojs.Bitdash.prototype.enterFullScreen = function () {
  this.bitdashPlayer.enterFullScreen();
};
videojs.Bitdash.prototype.exitFullScreen = function () {
  this.bitdashPlayer.exitFullScreen();
};
//
//videojs.Bitdash.prototype.poster = function(){ return this.el_.poster; };
//videojs.Bitdash.prototype.setPoster = function(val){ this.el_.poster = val; };
//
//videojs.Bitdash.prototype.preload = function(){ return this.el_.preload; };
//videojs.Bitdash.prototype.setPreload = function(val){ this.el_.preload = val; };
//
//videojs.Bitdash.prototype.autoplay = function(){ return this.el_.autoplay; };
//videojs.Bitdash.prototype.setAutoplay = function(val){ this.el_.autoplay = val; };
//
//videojs.Bitdash.prototype.controls = function(){ return this.el_.controls; };
//videojs.Bitdash.prototype.setControls = function(val){ this.el_.controls = !!val; };
//
//videojs.Bitdash.prototype.loop = function(){ return this.el_.loop; };
//videojs.Bitdash.prototype.setLoop = function(val){ this.el_.loop = val; };
//
//videojs.Bitdash.prototype.error = function(){ return this.el_.error; };
//videojs.Bitdash.prototype.seeking = function(){ return this.el_.seeking; };
//videojs.Bitdash.prototype.seekable = function(){ return this.el_.seekable; };
//videojs.Bitdash.prototype.ended = function(){ return this.el_.ended; };
//videojs.Bitdash.prototype.defaultMuted = function(){ return this.el_.defaultMuted; };
//
//videojs.Bitdash.prototype.playbackRate = function(){ return this.el_.playbackRate; };
//videojs.Bitdash.prototype.setPlaybackRate = function(val){ this.el_.playbackRate = val; };
//
//videojs.Bitdash.prototype.networkState = function(){ return this.el_.networkState; };
//videojs.Bitdash.prototype.readyState = function(){ return this.el_.readyState; };

/**
 * Whether the browser has built-in HLS support.
 */
videojs.Bitdash.supportsNativeHls = (function () {
  var
    video = document.createElement('video'),
    xMpegUrl,
    vndMpeg;

  // native HLS is definitely not supported if HTML5 video isn't
  if (!videojs.Html5.isSupported()) {
    return false;
  }

  xMpegUrl = video.canPlayType('application/x-mpegURL');
  vndMpeg = video.canPlayType('application/vnd.apple.mpegURL');
  return (/probably|maybe/).test(xMpegUrl) ||
    (/probably|maybe/).test(vndMpeg);
})();

videojs.Bitdash.isSupported = function () {
  // Only use the HLS tech if native HLS isn't available
  return !videojs.Bitdash.supportsNativeHls &&
    window.Uint8Array;
};

videojs.Bitdash.canPlaySource = function (srcObj) {
  var mpegurlRE = /^application\/dash\+xml/i;
  return mpegurlRE.test(srcObj.type);
};

videojs.options.techOrder.unshift('bitdash');


// Add Source Handler pattern functions to this tech
videojs.MediaTechController.withSourceHandlers(videojs.Bitdash);

/**
 * The default native source handler.
 * This simply passes the source to the video element. Nothing fancy.
 * @param  {Object} source   The source object
 * @param  {videojs.Flash} tech  The instance of the Flash tech
 */
/*jshint sub:true*/
videojs.Bitdash['nativeSourceHandler'] = {};

/**
 * Check Flash can handle the source natively
 * @param  {Object} source  The source object
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
videojs.Bitdash['nativeSourceHandler']['canHandleSource'] = function (source) {/*jshint sub:true*/
  return true;
};

/**
 * Pass the source to the flash object
 * Adaptive source handlers will have more complicated workflows before passing
 * video data to the video element
 * @param  {Object} source    The source object
 * @param  {videojs.Flash} tech   The instance of the Flash tech
 */
videojs.Bitdash['nativeSourceHandler']['handleSource'] = function (source, tech) {/*jshint sub:true*/
  tech.setSrc(source);
};

/**
 * Clean up the source handler when disposing the player or switching sources..
 * (no cleanup is needed when supporting the format natively)
 */
videojs.Bitdash['nativeSourceHandler']['dispose'] = function () {/*jshint sub:true*/
};

// Register the native source handler
videojs.Bitdash['registerSourceHandler'](videojs.Bitdash['nativeSourceHandler']);
/*jshint sub:true*/

(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  videojs.plugin('ga', function(options) {
    var dataSetupOptions, defaultsEventsToTrack, end, error, eventCategory, eventLabel, eventsToTrack, fullscreen, loaded, parsedOptions, pause, percentsAlreadyTracked, percentsPlayedInterval, play, resize, seekEnd, seekStart, seeking, sendbeacon, timeupdate, volumeChange;
    if (options == null) {
      options = {};
    }
    dataSetupOptions = {};
    if (this.options()["data-setup"]) {
      parsedOptions = JSON.parse(this.options()["data-setup"]);
      if (parsedOptions.ga) {
        dataSetupOptions = parsedOptions.ga;
      }
    }
    defaultsEventsToTrack = ['loaded', 'percentsPlayed', 'start', 'end', 'seek', 'play', 'pause', 'resize', 'volumeChange', 'error', 'fullscreen'];
    eventsToTrack = options.eventsToTrack || dataSetupOptions.eventsToTrack || defaultsEventsToTrack;
    percentsPlayedInterval = options.percentsPlayedInterval || dataSetupOptions.percentsPlayedInterval || 10;
    eventCategory = options.eventCategory || dataSetupOptions.eventCategory || 'Video';
    eventLabel = options.eventLabel || dataSetupOptions.eventLabel;
    options.debug = options.debug || false;
    percentsAlreadyTracked = [];
    seekStart = seekEnd = 0;
    seeking = false;
    loaded = function() {
      if (!eventLabel) {
        eventLabel = this.currentSrc().split("/").slice(-1)[0].replace(/\.(\w{3,4})(\?.*)?$/i, '');
      }
      if (__indexOf.call(eventsToTrack, "loadedmetadata") >= 0) {
        sendbeacon('loadedmetadata', true);
      }
    };
    timeupdate = function() {
      var currentTime, duration, percent, percentPlayed, _i;
      currentTime = Math.round(this.currentTime());
      duration = Math.round(this.duration());
      percentPlayed = Math.round(currentTime / duration * 100);
      for (percent = _i = 0; _i <= 99; percent = _i += percentsPlayedInterval) {
        if (percentPlayed >= percent && __indexOf.call(percentsAlreadyTracked, percent) < 0) {
          if (__indexOf.call(eventsToTrack, "start") >= 0 && percent === 0 && percentPlayed > 0) {
            sendbeacon('start', true);
          } else if (__indexOf.call(eventsToTrack, "percentsPlayed") >= 0 && percentPlayed !== 0) {
            sendbeacon('percent played', true, percent);
          }
          if (percentPlayed > 0) {
            percentsAlreadyTracked.push(percent);
          }
        }
      }
      if (__indexOf.call(eventsToTrack, "seek") >= 0) {
        seekStart = seekEnd;
        seekEnd = currentTime;
        if (Math.abs(seekStart - seekEnd) > 1) {
          seeking = true;
          sendbeacon('seek start', false, seekStart);
          sendbeacon('seek end', false, seekEnd);
        }
      }
    };
    end = function() {
      sendbeacon('end', true);
    };
    play = function() {
      var currentTime;
      currentTime = Math.round(this.currentTime());
      sendbeacon('play', true, currentTime);
      seeking = false;
    };
    pause = function() {
      var currentTime, duration;
      currentTime = Math.round(this.currentTime());
      duration = Math.round(this.duration());
      if (currentTime !== duration && !seeking) {
        sendbeacon('pause', false, currentTime);
      }
    };
    volumeChange = function() {
      var volume;
      volume = this.muted() === true ? 0 : this.volume();
      sendbeacon('volume change', false, volume);
    };
    resize = function() {
      sendbeacon('resize - ' + this.width() + "*" + this.height(), true);
    };
    error = function() {
      var currentTime;
      currentTime = Math.round(this.currentTime());
      sendbeacon('error', true, currentTime);
    };
    fullscreen = function() {
      var currentTime;
      currentTime = Math.round(this.currentTime());
      if ((typeof this.isFullscreen === "function" ? this.isFullscreen() : void 0) || (typeof this.isFullScreen === "function" ? this.isFullScreen() : void 0)) {
        sendbeacon('enter fullscreen', false, currentTime);
      } else {
        sendbeacon('exit fullscreen', false, currentTime);
      }
    };
    sendbeacon = function(action, nonInteraction, value) {
      if (window.ga) {
        ga('send', 'event', {
          'eventCategory': eventCategory,
          'eventAction': action,
          'eventLabel': eventLabel,
          'eventValue': value,
          'nonInteraction': nonInteraction
        });
      } else if (window._gaq) {
        _gaq.push(['_trackEvent', eventCategory, action, eventLabel, value, nonInteraction]);
      } else if (options.debug) {
        console.log("Google Analytics not detected");
      }
    };
    this.ready(function() {
      this.on("loadedmetadata", loaded);
      this.on("timeupdate", timeupdate);
      if (__indexOf.call(eventsToTrack, "end") >= 0) {
        this.on("ended", end);
      }
      if (__indexOf.call(eventsToTrack, "play") >= 0) {
        this.on("play", play);
      }
      if (__indexOf.call(eventsToTrack, "pause") >= 0) {
        this.on("pause", pause);
      }
      if (__indexOf.call(eventsToTrack, "volumeChange") >= 0) {
        this.on("volumechange", volumeChange);
      }
      if (__indexOf.call(eventsToTrack, "resize") >= 0) {
        this.on("resize", resize);
      }
      if (__indexOf.call(eventsToTrack, "error") >= 0) {
        this.on("error", error);
      }
      if (__indexOf.call(eventsToTrack, "fullscreen") >= 0) {
        return this.on("fullscreenchange", fullscreen);
      }
    });
    return {
      'sendbeacon': sendbeacon
    };
  });

}).call(this);

/*! videojs-metrics - v0.0.0 - 2015-10-08
* Copyright (c) 2015 benjipott; Licensed Apache-2.0 */
/*! videojs-metrics - v0.0.0 - 2015-10-7
 * Copyright (c) 2015 benjipott
 * Licensed under the Apache-2.0 license. */
(function (window, videojs) {
  'use strict';

  var defaults = {
      'option': true,
      'user_id': '',
      'method': 'POST',
      'responseType': 'json',
      'timeout': 1000,
      'url': '//stats.afrostream.tv/api/v1/events',
      'trackEvents': ['firstplay', 'ended', 'waiting', 'error', 'bitratechange', 'dispose']
    },
    metrics, getBrowser;
  /**
   * Get browser infos
   * @returns {{}}
   */
  getBrowser = function () {
    var data = {};
    var browser = null;
    var version = null;
    var os = null;
    var parseUserAgent, prepareData, renameOsx, cutSafariVersion;

    parseUserAgent = function () {
      var userAgent = navigator.userAgent.toLowerCase(),
        browserParts = /(ie|firefox|chrome|safari|opera)(?:.*version)?(?:[ \/])?([\w.]+)/.exec(userAgent),
        osParts = /(mac|win|linux|freebsd|mobile|iphone|ipod|ipad|android|blackberry|j2me|webtv)/.exec(userAgent);

      if (!!userAgent.match(/trident\/7\./)) {
        browser = 'ie';
        version = 11;
      } else if (browserParts && browserParts.length > 2) {
        browser = browserParts[1];
        version = browserParts[2];
      }

      if (osParts && osParts.length > 1) {
        os = osParts[1];
      }
    };

    prepareData = function () {
      data.browser = browser;
      data.version = parseInt(version, 10) || null;
      data.os = os;
    };

    renameOsx = function () {
      if (os === 'mac') {
        os = 'osx';
      }
    };

    cutSafariVersion = function () {
      if (os === 'safari') {
        version = version.substring(0, 1);
      }
    };

    parseUserAgent();

    // exception rules
    renameOsx();
    cutSafariVersion();

    prepareData();

    return data;
  };

  var BASE_KEYS = ['user_id', 'type', 'fqdn'];
  var REQUIRED_KEY = {
    'bandwidthIncrease': ['video_bitrate', 'audio_bitrate'],
    'bandwidthDecrease': ['video_bitrate', 'audio_bitrate'],
    'buffering': [],
    'error': ['number', 'message'],
    'start': ['os', 'os_version', 'web_browser', 'web_browser_version', 'resolution_size', 'flash_version', 'html5_video', 'relative_url'],
    'stop': ['timeout', 'frames_dropped']
  };

  /**
   * Initialize the plugin.
   * @param options (optional) {object} configuration for the plugin
   */
  metrics = function (options) {
    var settings = videojs.util.mergeOptions(defaults, options),
      player = this, setupTriggers, eventHandler, notify, xhr, pick, getRequiredKeys, browserInfo = getBrowser(),
      urlMatch = /https?:\/\/(?:www\.)?([-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b)*(\/[\/\d\w\.-]*)*(?:[\?])*(.+)*/gi,
      path = urlMatch.exec(player.currentSrc());

    settings.user_id = settings.user_id || 666;

    eventHandler = function (evt) {
      var data = {
        type: evt.type
      };

      switch (data.type) {
        case 'ended':
          data.type = 'stop';
          break;
        case 'firstplay':
          data.type = 'start';
          break;
        case 'waiting':
          data.type = 'buffering';
          break;
        default:
          break;
      }

      notify(data);

    };

    setupTriggers = function () {
      for (var i = settings.trackEvents.length - 1; i >= 0; i--) {
        player.on(settings.trackEvents[i], videojs.bind(this, eventHandler));
      }
    };

    pick = function (obj, list, context) {
      var result = {};

      if (typeof list === 'string') {
        list = [list];
      }

      Object.keys(obj)
        .forEach(function (key) {
          if (list.indexOf(key) > -1) {
            result[key] = obj[key];
          }
        }, context);

      return result;
    };

    getRequiredKeys = function (type) {
      return BASE_KEYS.concat(REQUIRED_KEY[type] || []);
    };

    notify = function (evt) {
      // Merge with default options
      evt.user_id = settings.user_id;
      evt.fqdn = path[1];
      evt.os = browserInfo.os;
      evt.os_version = browserInfo.version.toString();
      evt.web_browser = browserInfo.browser;
      evt.web_browser_version = browserInfo.web_browser_version;
      evt.resolution_size = screen.width + 'x' + screen.height;
      evt.flash_version = videojs.Flash.version().join(',');
      evt.html5_video = player.techName === 'html5';
      evt.relative_url = path[2];
      evt.timeout = false;
      evt.frames_dropped = 0;
      var pickedData = pick(evt, getRequiredKeys(evt.type));

      xhr(settings, pickedData);
    };

    xhr = function (url, data, callback) {
      var
        options = {
          method: 'GET',
          timeout: 45 * 1000
        },
        request,
        abortTimeout;

      if (typeof callback !== 'function') {
        callback = function () {
        };
      }

      if (typeof url === 'object') {
        options = videojs.util.mergeOptions(options, url);
        url = options.url;
      }

      var XHR = window.XMLHttpRequest;

      if (typeof XHR === 'undefined') {
        // Shim XMLHttpRequest for older IEs
        XHR = function () {
          try {
            return new window.ActiveXObject('Msxml2.XMLHTTP.6.0');
          } catch (e) {
          }
          try {
            return new window.ActiveXObject('Msxml2.XMLHTTP.3.0');
          } catch (f) {
          }
          try {
            return new window.ActiveXObject('Msxml2.XMLHTTP');
          } catch (g) {
          }
          throw new Error('This browser does not support XMLHttpRequest.');
        };
      }

      request = new XHR();
      request.open(options.method, url);
      request.url = url;
      request.requestTime = new Date().getTime();
      //request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      if (options.responseType) {
        request.responseType = options.responseType;
      }
      if (options.withCredentials) {
        request.withCredentials = true;
      }
      if (options.timeout) {
        abortTimeout = window.setTimeout(function () {
          if (request.readyState !== 4) {
            request.timedout = true;
            request.abort();
          }
        }, options.timeout);
      }

      request.onreadystatechange = function () {
        // wait until the request completes
        if (this.readyState !== 4) {
          return;
        }

        // clear outstanding timeouts
        window.clearTimeout(abortTimeout);

        // request timeout
        if (request.timedout) {
          return callback.call(this, 'timeout', url);
        }

        // request aborted or errored
        if (this.status >= 400 || this.status === 0) {
          return callback.call(this, true, url);
        }

        if (this.response) {
          this.responseTime = new Date().getTime();
          this.roundTripTime = this.responseTime - this.requestTime;
          this.bytesReceived = this.response.byteLength || this.response.length;
          this.bandwidth = Math.floor((this.bytesReceived / this.roundTripTime) * 8 * 1000);
        }

        return callback.call(this, false, url);
      };

      var queryString = '';
      if (typeof data === 'object') {
        for (var paramName in data) {
          queryString += (queryString.length === 0 ? '' : '&') + paramName + '=' + encodeURIComponent(data[paramName]);
        }
      }

      request.send(queryString);
      return request;
    };

    setupTriggers();
  };

  // register the plugin
  videojs.plugin('metrics', metrics);
})(window, window.videojs);

  return videojs;
}));
