console.log('zoomrotate: Start');

(function(){
    var defaults, extend;
    console.log('zoomrotate: Init defaults');
    defaults = {
      zoom: 1, /** auto is false */
      rotate: 0,
      auto: true, /** true: only support 90/180/270 */
      debug: true
    };
    extend = function() {
      var args, target, i, object, property;
      args = Array.prototype.slice.call(arguments);
      target = args.shift() || {};
      for (i in args) {
        object = args[i];
        for (property in object) {
          if (object.hasOwnProperty(property)) {
            if (typeof object[property] === 'object') {
              target[property] = extend(target[property], object[property]);
            } else {
              target[property] = object[property];
            }
          }
        }
      }
      return target;
    };

  /**
    * register the zoomrotate plugin
    */
    videojs.plugin('zoomrotate', function(settings){
        if (defaults.debug) console.log('zoomrotate: Register init');

        var options, player, video, poster;
        options = extend(defaults, settings);

        /* Grab the necessary DOM elements */
        player = this.el();
        video = this.el().getElementsByTagName('video')[0];
        poster = this.el().getElementsByTagName('div')[1]; // div vjs-poster

        if (options.debug) console.log('zoomrotate: '+video.style);
        if (options.debug) console.log('zoomrotate: '+poster.style);
        if (options.debug) console.log('zoomrotate: '+options.rotate);
        if (options.debug) console.log('zoomrotate: '+options.zoom);

        /* Array of possible browser specific settings for transformation */
        var properties = ['transform', 'WebkitTransform', 'MozTransform',
                          'msTransform', 'OTransform'],
            prop = properties[0];

        /* Iterators */
        var i,j;

        /* Find out which CSS transform the browser supports */
        for(i=0,j=properties.length;i<j;i++){
          if(typeof player.style[properties[i]] !== 'undefined'){
            prop = properties[i];
            break;
          }
        }


        if (options.auto) {
            // get html element property
            function getStyle(element, property) {
                var proValue = null;
                if (!document.defaultView) {
                    proValue = element.currentStyle[property];
                } else {
                    proValue = document.defaultView.getComputedStyle(element)[property];
                }
                return proValue;
            }

            var parentWidth = parseFloat(getStyle(player, 'width'));
            var parentHeight = parseFloat(getStyle(player, 'height'));
            var videoWidth = parseFloat(video.videoWidth);
            var videoHeight = parseFloat(video.videoHeight);

            if (options.rotate % 180 == 0) {
                options.zoom = 1;
            }
            else if (options.rotate % 180 == 90) {

                var w_zoom = parentWidth / videoWidth;
                var h_zoom = parentHeight / videoHeight;
                var min_zoom = w_zoom > h_zoom ? h_zoom : w_zoom;

                // get video display rect
                var videoDispWidth = videoWidth * min_zoom;
                var videoDispHeight = videoHeight * min_zoom;

                var n_w_zoom = parentHeight / videoDispWidth;
                var n_h_zoom = parentWidth / videoDispHeight;
                var n_min_zoom = n_w_zoom > n_h_zoom ? n_h_zoom : n_w_zoom;

                // get rotate 90/270 video display rect
                var nVideoDispWidth = videoDispWidth * n_min_zoom;
                var nVideoDispHeight = videoDispHeight * n_min_zoom;

                options.zoom = n_min_zoom; // update zoom
            }
        }


        /* Let's do it */
        player.style.overflow = 'hidden';
        video.style[prop]='scale('+options.zoom+') rotate('+options.rotate+'deg)';
        poster.style[prop]='scale('+options.zoom+') rotate('+options.rotate+'deg)';
        if (options.debug) console.log('zoomrotate: Register end');
    });
})();

console.log('zoomrotate: End');
