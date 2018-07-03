var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*



     Creative Tim Modifications

     Lines: 236 was changed from top: 5px to top: 50% and we added margin-top: -9px. In this way the close button will be aligned vertically
     Line:219 - modified when the icon is set, we add the class "alert-with-icon", so there will be enough space for the icon.
	 Lines: 179/222 - class() was changed to html() so we can add the Material Design Icons



*/

/*
 * Project: Bootstrap Notify = v3.1.5
 * Description: Turns standard Bootstrap alerts into "Growl-like" notifications.
 * Author: Mouse0270 aka Robert McIntosh
 * License: MIT License
 * Website: https://github.com/mouse0270/bootstrap-growl
 */

/* global define:false, require: false, jQuery:false */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
    // Node/CommonJS
    factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
})(function ($) {
  // Create the defaults once
  var defaults = {
    element: 'body',
    position: null,
    type: "info",
    allow_dismiss: true,
    allow_duplicates: true,
    newest_on_top: false,
    showProgressbar: false,
    placement: {
      from: "top",
      align: "right"
    },
    offset: 20,
    spacing: 10,
    z_index: 1031,
    delay: 5000,
    timer: 1000,
    url_target: '_blank',
    mouse_over: null,
    animate: {
      enter: 'animated fadeInDown',
      exit: 'animated fadeOutUp'
    },
    onShow: null,
    onShown: null,
    onClose: null,
    onClosed: null,
    icon_type: 'class',
    template: '<div data-notify="container" class="col-11 col-md-4 alert alert-{0}" role="alert"><button type="button" aria-hidden="true" class="close" data-notify="dismiss"><i class="material-icons">close</i></button><i data-notify="icon" class="material-icons"></i><span data-notify="title">{1}</span> <span data-notify="message">{2}</span><div class="progress" data-notify="progressbar"><div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div></div><a href="{3}" target="{4}" data-notify="url"></a></div>'
  };

  String.format = function () {
    var str = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
      str = str.replace(RegExp("\\{" + (i - 1) + "\\}", "gm"), arguments[i]);
    }
    return str;
  };

  function isDuplicateNotification(notification) {
    var isDupe = false;

    $('[data-notify="container"]').each(function (i, el) {
      var $el = $(el);
      var title = $el.find('[data-notify="title"]').text().trim();
      var message = $el.find('[data-notify="message"]').html().trim();

      // The input string might be different than the actual parsed HTML string!
      // (<br> vs <br /> for example)
      // So we have to force-parse this as HTML here!
      var isSameTitle = title === $("<div>" + notification.settings.content.title + "</div>").html().trim();
      var isSameMsg = message === $("<div>" + notification.settings.content.message + "</div>").html().trim();
      var isSameType = $el.hasClass('alert-' + notification.settings.type);

      if (isSameTitle && isSameMsg && isSameType) {
        //we found the dupe. Set the var and stop checking.
        isDupe = true;
      }
      return !isDupe;
    });

    return isDupe;
  }

  function Notify(element, content, options) {
    // Setup Content of Notify
    var contentObj = {
      content: {
        message: (typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object' ? content.message : content,
        title: content.title ? content.title : '',
        icon: content.icon ? content.icon : '',
        url: content.url ? content.url : '#',
        target: content.target ? content.target : '-'
      }
    };

    options = $.extend(true, {}, contentObj, options);
    this.settings = $.extend(true, {}, defaults, options);
    this._defaults = defaults;
    if (this.settings.content.target === "-") {
      this.settings.content.target = this.settings.url_target;
    }
    this.animations = {
      start: 'webkitAnimationStart oanimationstart MSAnimationStart animationstart',
      end: 'webkitAnimationEnd oanimationend MSAnimationEnd animationend'
    };

    if (typeof this.settings.offset === 'number') {
      this.settings.offset = {
        x: this.settings.offset,
        y: this.settings.offset
      };
    }

    //if duplicate messages are not allowed, then only continue if this new message is not a duplicate of one that it already showing
    if (this.settings.allow_duplicates || !this.settings.allow_duplicates && !isDuplicateNotification(this)) {
      this.init();
    }
  }

  $.extend(Notify.prototype, {
    init: function init() {
      var self = this;

      this.buildNotify();
      if (this.settings.content.icon) {
        this.setIcon();
      }
      if (this.settings.content.url != "#") {
        this.styleURL();
      }
      this.styleDismiss();
      this.placement();
      this.bind();

      this.notify = {
        $ele: this.$ele,
        update: function update(command, _update) {
          var commands = {};
          if (typeof command === "string") {
            commands[command] = _update;
          } else {
            commands = command;
          }
          for (var cmd in commands) {
            switch (cmd) {
              case "type":
                this.$ele.removeClass('alert-' + self.settings.type);
                this.$ele.find('[data-notify="progressbar"] > .progress-bar').removeClass('progress-bar-' + self.settings.type);
                self.settings.type = commands[cmd];
                this.$ele.addClass('alert-' + commands[cmd]).find('[data-notify="progressbar"] > .progress-bar').addClass('progress-bar-' + commands[cmd]);
                break;
              case "icon":
                var $icon = this.$ele.find('[data-notify="icon"]');
                if (self.settings.icon_type.toLowerCase() === 'class') {
                  $icon.html(commands[cmd]);
                } else {
                  if (!$icon.is('img')) {
                    $icon.find('img');
                  }
                  $icon.attr('src', commands[cmd]);
                }
                break;
              case "progress":
                var newDelay = self.settings.delay - self.settings.delay * (commands[cmd] / 100);
                this.$ele.data('notify-delay', newDelay);
                this.$ele.find('[data-notify="progressbar"] > div').attr('aria-valuenow', commands[cmd]).css('width', commands[cmd] + '%');
                break;
              case "url":
                this.$ele.find('[data-notify="url"]').attr('href', commands[cmd]);
                break;
              case "target":
                this.$ele.find('[data-notify="url"]').attr('target', commands[cmd]);
                break;
              default:
                this.$ele.find('[data-notify="' + cmd + '"]').html(commands[cmd]);
            }
          }
          var posX = this.$ele.outerHeight() + parseInt(self.settings.spacing) + parseInt(self.settings.offset.y);
          self.reposition(posX);
        },
        close: function close() {
          self.close();
        }
      };
    },
    buildNotify: function buildNotify() {
      var content = this.settings.content;
      this.$ele = $(String.format(this.settings.template, this.settings.type, content.title, content.message, content.url, content.target));
      this.$ele.attr('data-notify-position', this.settings.placement.from + '-' + this.settings.placement.align);
      if (!this.settings.allow_dismiss) {
        this.$ele.find('[data-notify="dismiss"]').css('display', 'none');
      }
      if (this.settings.delay <= 0 && !this.settings.showProgressbar || !this.settings.showProgressbar) {
        this.$ele.find('[data-notify="progressbar"]').remove();
      }
    },
    setIcon: function setIcon() {

      this.$ele.addClass('alert-with-icon');

      if (this.settings.icon_type.toLowerCase() === 'class') {
        this.$ele.find('[data-notify="icon"]').html(this.settings.content.icon);
      } else {
        if (this.$ele.find('[data-notify="icon"]').is('img')) {
          this.$ele.find('[data-notify="icon"]').attr('src', this.settings.content.icon);
        } else {
          this.$ele.find('[data-notify="icon"]').append('<img src="' + this.settings.content.icon + '" alt="Notify Icon" />');
        }
      }
    },
    styleDismiss: function styleDismiss() {
      this.$ele.find('[data-notify="dismiss"]').css({
        position: 'absolute',
        right: '10px',
        top: '50%',
        marginTop: '-9px',
        zIndex: this.settings.z_index + 2
      });
    },
    styleURL: function styleURL() {
      this.$ele.find('[data-notify="url"]').css({
        backgroundImage: 'url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)',
        height: '100%',
        left: 0,
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: this.settings.z_index + 1
      });
    },
    placement: function placement() {
      var self = this,
          offsetAmt = this.settings.offset.y,
          css = {
        display: 'inline-block',
        margin: '15px auto',
        position: this.settings.position ? this.settings.position : this.settings.element === 'body' ? 'fixed' : 'absolute',
        transition: 'all .5s ease-in-out',
        zIndex: this.settings.z_index
      },
          hasAnimation = false,
          settings = this.settings;

      $('[data-notify-position="' + this.settings.placement.from + '-' + this.settings.placement.align + '"]:not([data-closing="true"])').each(function () {
        offsetAmt = Math.max(offsetAmt, parseInt($(this).css(settings.placement.from)) + parseInt($(this).outerHeight()) + parseInt(settings.spacing));
      });
      if (this.settings.newest_on_top === true) {
        offsetAmt = this.settings.offset.y;
      }
      css[this.settings.placement.from] = offsetAmt + 'px';

      switch (this.settings.placement.align) {
        case "left":
        case "right":
          css[this.settings.placement.align] = this.settings.offset.x + 'px';
          break;
        case "center":
          css.left = 0;
          css.right = 0;
          break;
      }
      this.$ele.css(css).addClass(this.settings.animate.enter);
      $.each(Array('webkit-', 'moz-', 'o-', 'ms-', ''), function (index, prefix) {
        self.$ele[0].style[prefix + 'AnimationIterationCount'] = 1;
      });

      $(this.settings.element).append(this.$ele);

      if (this.settings.newest_on_top === true) {
        offsetAmt = parseInt(offsetAmt) + parseInt(this.settings.spacing) + this.$ele.outerHeight();
        this.reposition(offsetAmt);
      }

      if ($.isFunction(self.settings.onShow)) {
        self.settings.onShow.call(this.$ele);
      }

      this.$ele.one(this.animations.start, function () {
        hasAnimation = true;
      }).one(this.animations.end, function () {
        if ($.isFunction(self.settings.onShown)) {
          self.settings.onShown.call(this);
        }
      });

      setTimeout(function () {
        if (!hasAnimation) {
          if ($.isFunction(self.settings.onShown)) {
            self.settings.onShown.call(this);
          }
        }
      }, 600);
    },
    bind: function bind() {
      var self = this;

      this.$ele.find('[data-notify="dismiss"]').on('click', function () {
        self.close();
      });

      this.$ele.mouseover(function () {
        $(this).data('data-hover', "true");
      }).mouseout(function () {
        $(this).data('data-hover', "false");
      });
      this.$ele.data('data-hover', "false");

      if (this.settings.delay > 0) {
        self.$ele.data('notify-delay', self.settings.delay);
        var timer = setInterval(function () {
          var delay = parseInt(self.$ele.data('notify-delay')) - self.settings.timer;
          if (self.$ele.data('data-hover') === 'false' && self.settings.mouse_over === "pause" || self.settings.mouse_over != "pause") {
            var percent = (self.settings.delay - delay) / self.settings.delay * 100;
            self.$ele.data('notify-delay', delay);
            self.$ele.find('[data-notify="progressbar"] > div').attr('aria-valuenow', percent).css('width', percent + '%');
          }
          if (delay <= -self.settings.timer) {
            clearInterval(timer);
            self.close();
          }
        }, self.settings.timer);
      }
    },
    close: function close() {
      var self = this,
          posX = parseInt(this.$ele.css(this.settings.placement.from)),
          hasAnimation = false;

      this.$ele.data('closing', 'true').addClass(this.settings.animate.exit);
      self.reposition(posX);

      if ($.isFunction(self.settings.onClose)) {
        self.settings.onClose.call(this.$ele);
      }

      this.$ele.one(this.animations.start, function () {
        hasAnimation = true;
      }).one(this.animations.end, function () {
        $(this).remove();
        if ($.isFunction(self.settings.onClosed)) {
          self.settings.onClosed.call(this);
        }
      });

      setTimeout(function () {
        if (!hasAnimation) {
          self.$ele.remove();
          if (self.settings.onClosed) {
            self.settings.onClosed(self.$ele);
          }
        }
      }, 600);
    },
    reposition: function reposition(posX) {
      var self = this,
          notifies = '[data-notify-position="' + this.settings.placement.from + '-' + this.settings.placement.align + '"]:not([data-closing="true"])',
          $elements = this.$ele.nextAll(notifies);
      if (this.settings.newest_on_top === true) {
        $elements = this.$ele.prevAll(notifies);
      }
      $elements.each(function () {
        $(this).css(self.settings.placement.from, posX);
        posX = parseInt(posX) + parseInt(self.settings.spacing) + $(this).outerHeight();
      });
    }
  });

  $.notify = function (content, options) {
    var plugin = new Notify(this, content, options);
    return plugin.notify;
  };
  $.notifyDefaults = function (options) {
    defaults = $.extend(true, {}, defaults, options);
    return defaults;
  };
  $.notifyClose = function (command) {
    if (typeof command === "undefined" || command === "all") {
      $('[data-notify]').find('[data-notify="dismiss"]').trigger('click');
    } else {
      $('[data-notify-position="' + command + '"]').find('[data-notify="dismiss"]').trigger('click');
    }
  };
});
/* Chartist.js 0.11.0
 * Copyright © 2017 Gion Kunz
 * Free to use under either the WTFPL license or the MIT license.
 * https://raw.githubusercontent.com/gionkunz/chartist-js/master/LICENSE-WTFPL
 * https://raw.githubusercontent.com/gionkunz/chartist-js/master/LICENSE-MIT
 */

!function (a, b) {
  "function" == typeof define && define.amd ? define("Chartist", [], function () {
    return a.Chartist = b();
  }) : "object" == (typeof module === 'undefined' ? 'undefined' : _typeof(module)) && module.exports ? module.exports = b() : a.Chartist = b();
}(this, function () {
  var a = { version: "0.11.0" };return function (a, b, c) {
    "use strict";
    c.namespaces = { svg: "http://www.w3.org/2000/svg", xmlns: "http://www.w3.org/2000/xmlns/", xhtml: "http://www.w3.org/1999/xhtml", xlink: "http://www.w3.org/1999/xlink", ct: "http://gionkunz.github.com/chartist-js/ct" }, c.noop = function (a) {
      return a;
    }, c.alphaNumerate = function (a) {
      return String.fromCharCode(97 + a % 26);
    }, c.extend = function (a) {
      var b, d, e;for (a = a || {}, b = 1; b < arguments.length; b++) {
        d = arguments[b];for (var f in d) {
          e = d[f], "object" != (typeof e === 'undefined' ? 'undefined' : _typeof(e)) || null === e || e instanceof Array ? a[f] = e : a[f] = c.extend(a[f], e);
        }
      }return a;
    }, c.replaceAll = function (a, b, c) {
      return a.replace(new RegExp(b, "g"), c);
    }, c.ensureUnit = function (a, b) {
      return "number" == typeof a && (a += b), a;
    }, c.quantity = function (a) {
      if ("string" == typeof a) {
        var b = /^(\d+)\s*(.*)$/g.exec(a);return { value: +b[1], unit: b[2] || void 0 };
      }return { value: a };
    }, c.querySelector = function (a) {
      return a instanceof Node ? a : b.querySelector(a);
    }, c.times = function (a) {
      return Array.apply(null, new Array(a));
    }, c.sum = function (a, b) {
      return a + (b ? b : 0);
    }, c.mapMultiply = function (a) {
      return function (b) {
        return b * a;
      };
    }, c.mapAdd = function (a) {
      return function (b) {
        return b + a;
      };
    }, c.serialMap = function (a, b) {
      var d = [],
          e = Math.max.apply(null, a.map(function (a) {
        return a.length;
      }));return c.times(e).forEach(function (c, e) {
        var f = a.map(function (a) {
          return a[e];
        });d[e] = b.apply(null, f);
      }), d;
    }, c.roundWithPrecision = function (a, b) {
      var d = Math.pow(10, b || c.precision);return Math.round(a * d) / d;
    }, c.precision = 8, c.escapingMap = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }, c.serialize = function (a) {
      return null === a || void 0 === a ? a : ("number" == typeof a ? a = "" + a : "object" == (typeof a === 'undefined' ? 'undefined' : _typeof(a)) && (a = JSON.stringify({ data: a })), Object.keys(c.escapingMap).reduce(function (a, b) {
        return c.replaceAll(a, b, c.escapingMap[b]);
      }, a));
    }, c.deserialize = function (a) {
      if ("string" != typeof a) return a;a = Object.keys(c.escapingMap).reduce(function (a, b) {
        return c.replaceAll(a, c.escapingMap[b], b);
      }, a);try {
        a = JSON.parse(a), a = void 0 !== a.data ? a.data : a;
      } catch (b) {}return a;
    }, c.createSvg = function (a, b, d, e) {
      var f;return b = b || "100%", d = d || "100%", Array.prototype.slice.call(a.querySelectorAll("svg")).filter(function (a) {
        return a.getAttributeNS(c.namespaces.xmlns, "ct");
      }).forEach(function (b) {
        a.removeChild(b);
      }), f = new c.Svg("svg").attr({ width: b, height: d }).addClass(e), f._node.style.width = b, f._node.style.height = d, a.appendChild(f._node), f;
    }, c.normalizeData = function (a, b, d) {
      var e,
          f = { raw: a, normalized: {} };return f.normalized.series = c.getDataArray({ series: a.series || [] }, b, d), e = f.normalized.series.every(function (a) {
        return a instanceof Array;
      }) ? Math.max.apply(null, f.normalized.series.map(function (a) {
        return a.length;
      })) : f.normalized.series.length, f.normalized.labels = (a.labels || []).slice(), Array.prototype.push.apply(f.normalized.labels, c.times(Math.max(0, e - f.normalized.labels.length)).map(function () {
        return "";
      })), b && c.reverseData(f.normalized), f;
    }, c.safeHasProperty = function (a, b) {
      return null !== a && "object" == (typeof a === 'undefined' ? 'undefined' : _typeof(a)) && a.hasOwnProperty(b);
    }, c.isDataHoleValue = function (a) {
      return null === a || void 0 === a || "number" == typeof a && isNaN(a);
    }, c.reverseData = function (a) {
      a.labels.reverse(), a.series.reverse();for (var b = 0; b < a.series.length; b++) {
        "object" == _typeof(a.series[b]) && void 0 !== a.series[b].data ? a.series[b].data.reverse() : a.series[b] instanceof Array && a.series[b].reverse();
      }
    }, c.getDataArray = function (a, b, d) {
      function e(a) {
        if (c.safeHasProperty(a, "value")) return e(a.value);if (c.safeHasProperty(a, "data")) return e(a.data);if (a instanceof Array) return a.map(e);if (!c.isDataHoleValue(a)) {
          if (d) {
            var b = {};return "string" == typeof d ? b[d] = c.getNumberOrUndefined(a) : b.y = c.getNumberOrUndefined(a), b.x = a.hasOwnProperty("x") ? c.getNumberOrUndefined(a.x) : b.x, b.y = a.hasOwnProperty("y") ? c.getNumberOrUndefined(a.y) : b.y, b;
          }return c.getNumberOrUndefined(a);
        }
      }return a.series.map(e);
    }, c.normalizePadding = function (a, b) {
      return b = b || 0, "number" == typeof a ? { top: a, right: a, bottom: a, left: a } : { top: "number" == typeof a.top ? a.top : b, right: "number" == typeof a.right ? a.right : b, bottom: "number" == typeof a.bottom ? a.bottom : b, left: "number" == typeof a.left ? a.left : b };
    }, c.getMetaData = function (a, b) {
      var c = a.data ? a.data[b] : a[b];return c ? c.meta : void 0;
    }, c.orderOfMagnitude = function (a) {
      return Math.floor(Math.log(Math.abs(a)) / Math.LN10);
    }, c.projectLength = function (a, b, c) {
      return b / c.range * a;
    }, c.getAvailableHeight = function (a, b) {
      return Math.max((c.quantity(b.height).value || a.height()) - (b.chartPadding.top + b.chartPadding.bottom) - b.axisX.offset, 0);
    }, c.getHighLow = function (a, b, d) {
      function e(a) {
        if (void 0 !== a) if (a instanceof Array) for (var b = 0; b < a.length; b++) {
          e(a[b]);
        } else {
          var c = d ? +a[d] : +a;g && c > f.high && (f.high = c), h && c < f.low && (f.low = c);
        }
      }b = c.extend({}, b, d ? b["axis" + d.toUpperCase()] : {});var f = { high: void 0 === b.high ? -Number.MAX_VALUE : +b.high, low: void 0 === b.low ? Number.MAX_VALUE : +b.low },
          g = void 0 === b.high,
          h = void 0 === b.low;return (g || h) && e(a), (b.referenceValue || 0 === b.referenceValue) && (f.high = Math.max(b.referenceValue, f.high), f.low = Math.min(b.referenceValue, f.low)), f.high <= f.low && (0 === f.low ? f.high = 1 : f.low < 0 ? f.high = 0 : f.high > 0 ? f.low = 0 : (f.high = 1, f.low = 0)), f;
    }, c.isNumeric = function (a) {
      return null !== a && isFinite(a);
    }, c.isFalseyButZero = function (a) {
      return !a && 0 !== a;
    }, c.getNumberOrUndefined = function (a) {
      return c.isNumeric(a) ? +a : void 0;
    }, c.isMultiValue = function (a) {
      return "object" == (typeof a === 'undefined' ? 'undefined' : _typeof(a)) && ("x" in a || "y" in a);
    }, c.getMultiValue = function (a, b) {
      return c.isMultiValue(a) ? c.getNumberOrUndefined(a[b || "y"]) : c.getNumberOrUndefined(a);
    }, c.rho = function (a) {
      function b(a, c) {
        return a % c === 0 ? c : b(c, a % c);
      }function c(a) {
        return a * a + 1;
      }if (1 === a) return a;var d,
          e = 2,
          f = 2;if (a % 2 === 0) return 2;do {
        e = c(e) % a, f = c(c(f)) % a, d = b(Math.abs(e - f), a);
      } while (1 === d);return d;
    }, c.getBounds = function (a, b, d, e) {
      function f(a, b) {
        return a === (a += b) && (a *= 1 + (b > 0 ? o : -o)), a;
      }var g,
          h,
          i,
          j = 0,
          k = { high: b.high, low: b.low };k.valueRange = k.high - k.low, k.oom = c.orderOfMagnitude(k.valueRange), k.step = Math.pow(10, k.oom), k.min = Math.floor(k.low / k.step) * k.step, k.max = Math.ceil(k.high / k.step) * k.step, k.range = k.max - k.min, k.numberOfSteps = Math.round(k.range / k.step);var l = c.projectLength(a, k.step, k),
          m = l < d,
          n = e ? c.rho(k.range) : 0;if (e && c.projectLength(a, 1, k) >= d) k.step = 1;else if (e && n < k.step && c.projectLength(a, n, k) >= d) k.step = n;else for (;;) {
        if (m && c.projectLength(a, k.step, k) <= d) k.step *= 2;else {
          if (m || !(c.projectLength(a, k.step / 2, k) >= d)) break;if (k.step /= 2, e && k.step % 1 !== 0) {
            k.step *= 2;break;
          }
        }if (j++ > 1e3) throw new Error("Exceeded maximum number of iterations while optimizing scale step!");
      }var o = 2.221e-16;for (k.step = Math.max(k.step, o), h = k.min, i = k.max; h + k.step <= k.low;) {
        h = f(h, k.step);
      }for (; i - k.step >= k.high;) {
        i = f(i, -k.step);
      }k.min = h, k.max = i, k.range = k.max - k.min;var p = [];for (g = k.min; g <= k.max; g = f(g, k.step)) {
        var q = c.roundWithPrecision(g);q !== p[p.length - 1] && p.push(q);
      }return k.values = p, k;
    }, c.polarToCartesian = function (a, b, c, d) {
      var e = (d - 90) * Math.PI / 180;return { x: a + c * Math.cos(e), y: b + c * Math.sin(e) };
    }, c.createChartRect = function (a, b, d) {
      var e = !(!b.axisX && !b.axisY),
          f = e ? b.axisY.offset : 0,
          g = e ? b.axisX.offset : 0,
          h = a.width() || c.quantity(b.width).value || 0,
          i = a.height() || c.quantity(b.height).value || 0,
          j = c.normalizePadding(b.chartPadding, d);h = Math.max(h, f + j.left + j.right), i = Math.max(i, g + j.top + j.bottom);var k = { padding: j, width: function width() {
          return this.x2 - this.x1;
        }, height: function height() {
          return this.y1 - this.y2;
        } };return e ? ("start" === b.axisX.position ? (k.y2 = j.top + g, k.y1 = Math.max(i - j.bottom, k.y2 + 1)) : (k.y2 = j.top, k.y1 = Math.max(i - j.bottom - g, k.y2 + 1)), "start" === b.axisY.position ? (k.x1 = j.left + f, k.x2 = Math.max(h - j.right, k.x1 + 1)) : (k.x1 = j.left, k.x2 = Math.max(h - j.right - f, k.x1 + 1))) : (k.x1 = j.left, k.x2 = Math.max(h - j.right, k.x1 + 1), k.y2 = j.top, k.y1 = Math.max(i - j.bottom, k.y2 + 1)), k;
    }, c.createGrid = function (a, b, d, e, f, g, h, i) {
      var j = {};j[d.units.pos + "1"] = a, j[d.units.pos + "2"] = a, j[d.counterUnits.pos + "1"] = e, j[d.counterUnits.pos + "2"] = e + f;var k = g.elem("line", j, h.join(" "));i.emit("draw", c.extend({ type: "grid", axis: d, index: b, group: g, element: k }, j));
    }, c.createGridBackground = function (a, b, c, d) {
      var e = a.elem("rect", { x: b.x1, y: b.y2, width: b.width(), height: b.height() }, c, !0);d.emit("draw", { type: "gridBackground", group: a, element: e });
    }, c.createLabel = function (a, d, e, f, g, h, i, j, k, l, m) {
      var n,
          o = {};if (o[g.units.pos] = a + i[g.units.pos], o[g.counterUnits.pos] = i[g.counterUnits.pos], o[g.units.len] = d, o[g.counterUnits.len] = Math.max(0, h - 10), l) {
        var p = b.createElement("span");p.className = k.join(" "), p.setAttribute("xmlns", c.namespaces.xhtml), p.innerText = f[e], p.style[g.units.len] = Math.round(o[g.units.len]) + "px", p.style[g.counterUnits.len] = Math.round(o[g.counterUnits.len]) + "px", n = j.foreignObject(p, c.extend({ style: "overflow: visible;" }, o));
      } else n = j.elem("text", o, k.join(" ")).text(f[e]);m.emit("draw", c.extend({ type: "label", axis: g, index: e, group: j, element: n, text: f[e] }, o));
    }, c.getSeriesOption = function (a, b, c) {
      if (a.name && b.series && b.series[a.name]) {
        var d = b.series[a.name];return d.hasOwnProperty(c) ? d[c] : b[c];
      }return b[c];
    }, c.optionsProvider = function (b, d, e) {
      function f(b) {
        var f = h;if (h = c.extend({}, j), d) for (i = 0; i < d.length; i++) {
          var g = a.matchMedia(d[i][0]);g.matches && (h = c.extend(h, d[i][1]));
        }e && b && e.emit("optionsChanged", { previousOptions: f, currentOptions: h });
      }function g() {
        k.forEach(function (a) {
          a.removeListener(f);
        });
      }var h,
          i,
          j = c.extend({}, b),
          k = [];if (!a.matchMedia) throw "window.matchMedia not found! Make sure you're using a polyfill.";if (d) for (i = 0; i < d.length; i++) {
        var l = a.matchMedia(d[i][0]);l.addListener(f), k.push(l);
      }return f(), { removeMediaQueryListeners: g, getCurrentOptions: function getCurrentOptions() {
          return c.extend({}, h);
        } };
    }, c.splitIntoSegments = function (a, b, d) {
      var e = { increasingX: !1, fillHoles: !1 };d = c.extend({}, e, d);for (var f = [], g = !0, h = 0; h < a.length; h += 2) {
        void 0 === c.getMultiValue(b[h / 2].value) ? d.fillHoles || (g = !0) : (d.increasingX && h >= 2 && a[h] <= a[h - 2] && (g = !0), g && (f.push({ pathCoordinates: [], valueData: [] }), g = !1), f[f.length - 1].pathCoordinates.push(a[h], a[h + 1]), f[f.length - 1].valueData.push(b[h / 2]));
      }return f;
    };
  }(window, document, a), function (a, b, c) {
    "use strict";
    c.Interpolation = {}, c.Interpolation.none = function (a) {
      var b = { fillHoles: !1 };return a = c.extend({}, b, a), function (b, d) {
        for (var e = new c.Svg.Path(), f = !0, g = 0; g < b.length; g += 2) {
          var h = b[g],
              i = b[g + 1],
              j = d[g / 2];void 0 !== c.getMultiValue(j.value) ? (f ? e.move(h, i, !1, j) : e.line(h, i, !1, j), f = !1) : a.fillHoles || (f = !0);
        }return e;
      };
    }, c.Interpolation.simple = function (a) {
      var b = { divisor: 2, fillHoles: !1 };a = c.extend({}, b, a);var d = 1 / Math.max(1, a.divisor);return function (b, e) {
        for (var f, g, h, i = new c.Svg.Path(), j = 0; j < b.length; j += 2) {
          var k = b[j],
              l = b[j + 1],
              m = (k - f) * d,
              n = e[j / 2];void 0 !== n.value ? (void 0 === h ? i.move(k, l, !1, n) : i.curve(f + m, g, k - m, l, k, l, !1, n), f = k, g = l, h = n) : a.fillHoles || (f = k = h = void 0);
        }return i;
      };
    }, c.Interpolation.cardinal = function (a) {
      var b = { tension: 1, fillHoles: !1 };a = c.extend({}, b, a);var d = Math.min(1, Math.max(0, a.tension)),
          e = 1 - d;return function f(b, g) {
        var h = c.splitIntoSegments(b, g, { fillHoles: a.fillHoles });if (h.length) {
          if (h.length > 1) {
            var i = [];return h.forEach(function (a) {
              i.push(f(a.pathCoordinates, a.valueData));
            }), c.Svg.Path.join(i);
          }if (b = h[0].pathCoordinates, g = h[0].valueData, b.length <= 4) return c.Interpolation.none()(b, g);for (var j, k = new c.Svg.Path().move(b[0], b[1], !1, g[0]), l = 0, m = b.length; m - 2 * !j > l; l += 2) {
            var n = [{ x: +b[l - 2], y: +b[l - 1] }, { x: +b[l], y: +b[l + 1] }, { x: +b[l + 2], y: +b[l + 3] }, { x: +b[l + 4], y: +b[l + 5] }];j ? l ? m - 4 === l ? n[3] = { x: +b[0], y: +b[1] } : m - 2 === l && (n[2] = { x: +b[0], y: +b[1] }, n[3] = { x: +b[2], y: +b[3] }) : n[0] = { x: +b[m - 2], y: +b[m - 1] } : m - 4 === l ? n[3] = n[2] : l || (n[0] = { x: +b[l], y: +b[l + 1] }), k.curve(d * (-n[0].x + 6 * n[1].x + n[2].x) / 6 + e * n[2].x, d * (-n[0].y + 6 * n[1].y + n[2].y) / 6 + e * n[2].y, d * (n[1].x + 6 * n[2].x - n[3].x) / 6 + e * n[2].x, d * (n[1].y + 6 * n[2].y - n[3].y) / 6 + e * n[2].y, n[2].x, n[2].y, !1, g[(l + 2) / 2]);
          }return k;
        }return c.Interpolation.none()([]);
      };
    }, c.Interpolation.monotoneCubic = function (a) {
      var b = { fillHoles: !1 };return a = c.extend({}, b, a), function d(b, e) {
        var f = c.splitIntoSegments(b, e, { fillHoles: a.fillHoles, increasingX: !0 });if (f.length) {
          if (f.length > 1) {
            var g = [];return f.forEach(function (a) {
              g.push(d(a.pathCoordinates, a.valueData));
            }), c.Svg.Path.join(g);
          }if (b = f[0].pathCoordinates, e = f[0].valueData, b.length <= 4) return c.Interpolation.none()(b, e);var h,
              i,
              j = [],
              k = [],
              l = b.length / 2,
              m = [],
              n = [],
              o = [],
              p = [];for (h = 0; h < l; h++) {
            j[h] = b[2 * h], k[h] = b[2 * h + 1];
          }for (h = 0; h < l - 1; h++) {
            o[h] = k[h + 1] - k[h], p[h] = j[h + 1] - j[h], n[h] = o[h] / p[h];
          }for (m[0] = n[0], m[l - 1] = n[l - 2], h = 1; h < l - 1; h++) {
            0 === n[h] || 0 === n[h - 1] || n[h - 1] > 0 != n[h] > 0 ? m[h] = 0 : (m[h] = 3 * (p[h - 1] + p[h]) / ((2 * p[h] + p[h - 1]) / n[h - 1] + (p[h] + 2 * p[h - 1]) / n[h]), isFinite(m[h]) || (m[h] = 0));
          }for (i = new c.Svg.Path().move(j[0], k[0], !1, e[0]), h = 0; h < l - 1; h++) {
            i.curve(j[h] + p[h] / 3, k[h] + m[h] * p[h] / 3, j[h + 1] - p[h] / 3, k[h + 1] - m[h + 1] * p[h] / 3, j[h + 1], k[h + 1], !1, e[h + 1]);
          }return i;
        }return c.Interpolation.none()([]);
      };
    }, c.Interpolation.step = function (a) {
      var b = { postpone: !0, fillHoles: !1 };return a = c.extend({}, b, a), function (b, d) {
        for (var e, f, g, h = new c.Svg.Path(), i = 0; i < b.length; i += 2) {
          var j = b[i],
              k = b[i + 1],
              l = d[i / 2];void 0 !== l.value ? (void 0 === g ? h.move(j, k, !1, l) : (a.postpone ? h.line(j, f, !1, g) : h.line(e, k, !1, l), h.line(j, k, !1, l)), e = j, f = k, g = l) : a.fillHoles || (e = f = g = void 0);
        }return h;
      };
    };
  }(window, document, a), function (a, b, c) {
    "use strict";
    c.EventEmitter = function () {
      function a(a, b) {
        d[a] = d[a] || [], d[a].push(b);
      }function b(a, b) {
        d[a] && (b ? (d[a].splice(d[a].indexOf(b), 1), 0 === d[a].length && delete d[a]) : delete d[a]);
      }function c(a, b) {
        d[a] && d[a].forEach(function (a) {
          a(b);
        }), d["*"] && d["*"].forEach(function (c) {
          c(a, b);
        });
      }var d = [];return { addEventHandler: a, removeEventHandler: b, emit: c };
    };
  }(window, document, a), function (a, b, c) {
    "use strict";
    function d(a) {
      var b = [];if (a.length) for (var c = 0; c < a.length; c++) {
        b.push(a[c]);
      }return b;
    }function e(a, b) {
      var d = b || this.prototype || c.Class,
          e = Object.create(d);c.Class.cloneDefinitions(e, a);var f = function f() {
        var a,
            b = e.constructor || function () {};return a = this === c ? Object.create(e) : this, b.apply(a, Array.prototype.slice.call(arguments, 0)), a;
      };return f.prototype = e, f["super"] = d, f.extend = this.extend, f;
    }function f() {
      var a = d(arguments),
          b = a[0];return a.splice(1, a.length - 1).forEach(function (a) {
        Object.getOwnPropertyNames(a).forEach(function (c) {
          delete b[c], Object.defineProperty(b, c, Object.getOwnPropertyDescriptor(a, c));
        });
      }), b;
    }c.Class = { extend: e, cloneDefinitions: f };
  }(window, document, a), function (a, b, c) {
    "use strict";
    function d(a, b, d) {
      return a && (this.data = a || {}, this.data.labels = this.data.labels || [], this.data.series = this.data.series || [], this.eventEmitter.emit("data", { type: "update", data: this.data })), b && (this.options = c.extend({}, d ? this.options : this.defaultOptions, b), this.initializeTimeoutId || (this.optionsProvider.removeMediaQueryListeners(), this.optionsProvider = c.optionsProvider(this.options, this.responsiveOptions, this.eventEmitter))), this.initializeTimeoutId || this.createChart(this.optionsProvider.getCurrentOptions()), this;
    }function e() {
      return this.initializeTimeoutId ? a.clearTimeout(this.initializeTimeoutId) : (a.removeEventListener("resize", this.resizeListener), this.optionsProvider.removeMediaQueryListeners()), this;
    }function f(a, b) {
      return this.eventEmitter.addEventHandler(a, b), this;
    }function g(a, b) {
      return this.eventEmitter.removeEventHandler(a, b), this;
    }function h() {
      a.addEventListener("resize", this.resizeListener), this.optionsProvider = c.optionsProvider(this.options, this.responsiveOptions, this.eventEmitter), this.eventEmitter.addEventHandler("optionsChanged", function () {
        this.update();
      }.bind(this)), this.options.plugins && this.options.plugins.forEach(function (a) {
        a instanceof Array ? a[0](this, a[1]) : a(this);
      }.bind(this)), this.eventEmitter.emit("data", { type: "initial", data: this.data }), this.createChart(this.optionsProvider.getCurrentOptions()), this.initializeTimeoutId = void 0;
    }function i(a, b, d, e, f) {
      this.container = c.querySelector(a), this.data = b || {}, this.data.labels = this.data.labels || [], this.data.series = this.data.series || [], this.defaultOptions = d, this.options = e, this.responsiveOptions = f, this.eventEmitter = c.EventEmitter(), this.supportsForeignObject = c.Svg.isSupported("Extensibility"), this.supportsAnimations = c.Svg.isSupported("AnimationEventsAttribute"), this.resizeListener = function () {
        this.update();
      }.bind(this), this.container && (this.container.__chartist__ && this.container.__chartist__.detach(), this.container.__chartist__ = this), this.initializeTimeoutId = setTimeout(h.bind(this), 0);
    }c.Base = c.Class.extend({ constructor: i, optionsProvider: void 0, container: void 0, svg: void 0, eventEmitter: void 0, createChart: function createChart() {
        throw new Error("Base chart type can't be instantiated!");
      }, update: d, detach: e, on: f, off: g, version: c.version, supportsForeignObject: !1 });
  }(window, document, a), function (a, b, c) {
    "use strict";
    function d(a, d, e, f, g) {
      a instanceof Element ? this._node = a : (this._node = b.createElementNS(c.namespaces.svg, a), "svg" === a && this.attr({ "xmlns:ct": c.namespaces.ct })), d && this.attr(d), e && this.addClass(e), f && (g && f._node.firstChild ? f._node.insertBefore(this._node, f._node.firstChild) : f._node.appendChild(this._node));
    }function e(a, b) {
      return "string" == typeof a ? b ? this._node.getAttributeNS(b, a) : this._node.getAttribute(a) : (Object.keys(a).forEach(function (b) {
        if (void 0 !== a[b]) if (b.indexOf(":") !== -1) {
          var d = b.split(":");this._node.setAttributeNS(c.namespaces[d[0]], b, a[b]);
        } else this._node.setAttribute(b, a[b]);
      }.bind(this)), this);
    }function f(a, b, d, e) {
      return new c.Svg(a, b, d, this, e);
    }function g() {
      return this._node.parentNode instanceof SVGElement ? new c.Svg(this._node.parentNode) : null;
    }function h() {
      for (var a = this._node; "svg" !== a.nodeName;) {
        a = a.parentNode;
      }return new c.Svg(a);
    }function i(a) {
      var b = this._node.querySelector(a);return b ? new c.Svg(b) : null;
    }function j(a) {
      var b = this._node.querySelectorAll(a);return b.length ? new c.Svg.List(b) : null;
    }function k() {
      return this._node;
    }function l(a, d, e, f) {
      if ("string" == typeof a) {
        var g = b.createElement("div");g.innerHTML = a, a = g.firstChild;
      }a.setAttribute("xmlns", c.namespaces.xmlns);var h = this.elem("foreignObject", d, e, f);return h._node.appendChild(a), h;
    }function m(a) {
      return this._node.appendChild(b.createTextNode(a)), this;
    }function n() {
      for (; this._node.firstChild;) {
        this._node.removeChild(this._node.firstChild);
      }return this;
    }function o() {
      return this._node.parentNode.removeChild(this._node), this.parent();
    }function p(a) {
      return this._node.parentNode.replaceChild(a._node, this._node), a;
    }function q(a, b) {
      return b && this._node.firstChild ? this._node.insertBefore(a._node, this._node.firstChild) : this._node.appendChild(a._node), this;
    }function r() {
      return this._node.getAttribute("class") ? this._node.getAttribute("class").trim().split(/\s+/) : [];
    }function s(a) {
      return this._node.setAttribute("class", this.classes(this._node).concat(a.trim().split(/\s+/)).filter(function (a, b, c) {
        return c.indexOf(a) === b;
      }).join(" ")), this;
    }function t(a) {
      var b = a.trim().split(/\s+/);return this._node.setAttribute("class", this.classes(this._node).filter(function (a) {
        return b.indexOf(a) === -1;
      }).join(" ")), this;
    }function u() {
      return this._node.setAttribute("class", ""), this;
    }function v() {
      return this._node.getBoundingClientRect().height;
    }function w() {
      return this._node.getBoundingClientRect().width;
    }function x(a, b, d) {
      return void 0 === b && (b = !0), Object.keys(a).forEach(function (e) {
        function f(a, b) {
          var f,
              g,
              h,
              i = {};a.easing && (h = a.easing instanceof Array ? a.easing : c.Svg.Easing[a.easing], delete a.easing), a.begin = c.ensureUnit(a.begin, "ms"), a.dur = c.ensureUnit(a.dur, "ms"), h && (a.calcMode = "spline", a.keySplines = h.join(" "), a.keyTimes = "0;1"), b && (a.fill = "freeze", i[e] = a.from, this.attr(i), g = c.quantity(a.begin || 0).value, a.begin = "indefinite"), f = this.elem("animate", c.extend({ attributeName: e }, a)), b && setTimeout(function () {
            try {
              f._node.beginElement();
            } catch (b) {
              i[e] = a.to, this.attr(i), f.remove();
            }
          }.bind(this), g), d && f._node.addEventListener("beginEvent", function () {
            d.emit("animationBegin", { element: this, animate: f._node, params: a });
          }.bind(this)), f._node.addEventListener("endEvent", function () {
            d && d.emit("animationEnd", { element: this, animate: f._node, params: a }), b && (i[e] = a.to, this.attr(i), f.remove());
          }.bind(this));
        }a[e] instanceof Array ? a[e].forEach(function (a) {
          f.bind(this)(a, !1);
        }.bind(this)) : f.bind(this)(a[e], b);
      }.bind(this)), this;
    }function y(a) {
      var b = this;this.svgElements = [];for (var d = 0; d < a.length; d++) {
        this.svgElements.push(new c.Svg(a[d]));
      }Object.keys(c.Svg.prototype).filter(function (a) {
        return ["constructor", "parent", "querySelector", "querySelectorAll", "replace", "append", "classes", "height", "width"].indexOf(a) === -1;
      }).forEach(function (a) {
        b[a] = function () {
          var d = Array.prototype.slice.call(arguments, 0);return b.svgElements.forEach(function (b) {
            c.Svg.prototype[a].apply(b, d);
          }), b;
        };
      });
    }c.Svg = c.Class.extend({ constructor: d, attr: e, elem: f, parent: g, root: h, querySelector: i, querySelectorAll: j, getNode: k, foreignObject: l, text: m, empty: n, remove: o, replace: p, append: q, classes: r, addClass: s, removeClass: t, removeAllClasses: u, height: v, width: w, animate: x }), c.Svg.isSupported = function (a) {
      return b.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#" + a, "1.1");
    };var z = { easeInSine: [.47, 0, .745, .715], easeOutSine: [.39, .575, .565, 1], easeInOutSine: [.445, .05, .55, .95], easeInQuad: [.55, .085, .68, .53], easeOutQuad: [.25, .46, .45, .94], easeInOutQuad: [.455, .03, .515, .955], easeInCubic: [.55, .055, .675, .19], easeOutCubic: [.215, .61, .355, 1], easeInOutCubic: [.645, .045, .355, 1], easeInQuart: [.895, .03, .685, .22], easeOutQuart: [.165, .84, .44, 1], easeInOutQuart: [.77, 0, .175, 1], easeInQuint: [.755, .05, .855, .06], easeOutQuint: [.23, 1, .32, 1], easeInOutQuint: [.86, 0, .07, 1], easeInExpo: [.95, .05, .795, .035], easeOutExpo: [.19, 1, .22, 1], easeInOutExpo: [1, 0, 0, 1], easeInCirc: [.6, .04, .98, .335], easeOutCirc: [.075, .82, .165, 1], easeInOutCirc: [.785, .135, .15, .86], easeInBack: [.6, -.28, .735, .045], easeOutBack: [.175, .885, .32, 1.275], easeInOutBack: [.68, -.55, .265, 1.55] };c.Svg.Easing = z, c.Svg.List = c.Class.extend({ constructor: y });
  }(window, document, a), function (a, b, c) {
    "use strict";
    function d(a, b, d, e, f, g) {
      var h = c.extend({ command: f ? a.toLowerCase() : a.toUpperCase() }, b, g ? { data: g } : {});d.splice(e, 0, h);
    }function e(a, b) {
      a.forEach(function (c, d) {
        u[c.command.toLowerCase()].forEach(function (e, f) {
          b(c, e, d, f, a);
        });
      });
    }function f(a, b) {
      this.pathElements = [], this.pos = 0, this.close = a, this.options = c.extend({}, v, b);
    }function g(a) {
      return void 0 !== a ? (this.pos = Math.max(0, Math.min(this.pathElements.length, a)), this) : this.pos;
    }function h(a) {
      return this.pathElements.splice(this.pos, a), this;
    }function i(a, b, c, e) {
      return d("M", { x: +a, y: +b }, this.pathElements, this.pos++, c, e), this;
    }function j(a, b, c, e) {
      return d("L", { x: +a, y: +b }, this.pathElements, this.pos++, c, e), this;
    }function k(a, b, c, e, f, g, h, i) {
      return d("C", { x1: +a, y1: +b, x2: +c, y2: +e, x: +f, y: +g }, this.pathElements, this.pos++, h, i), this;
    }function l(a, b, c, e, f, g, h, i, j) {
      return d("A", { rx: +a, ry: +b, xAr: +c, lAf: +e, sf: +f, x: +g, y: +h }, this.pathElements, this.pos++, i, j), this;
    }function m(a) {
      var b = a.replace(/([A-Za-z])([0-9])/g, "$1 $2").replace(/([0-9])([A-Za-z])/g, "$1 $2").split(/[\s,]+/).reduce(function (a, b) {
        return b.match(/[A-Za-z]/) && a.push([]), a[a.length - 1].push(b), a;
      }, []);"Z" === b[b.length - 1][0].toUpperCase() && b.pop();var d = b.map(function (a) {
        var b = a.shift(),
            d = u[b.toLowerCase()];return c.extend({ command: b }, d.reduce(function (b, c, d) {
          return b[c] = +a[d], b;
        }, {}));
      }),
          e = [this.pos, 0];return Array.prototype.push.apply(e, d), Array.prototype.splice.apply(this.pathElements, e), this.pos += d.length, this;
    }function n() {
      var a = Math.pow(10, this.options.accuracy);return this.pathElements.reduce(function (b, c) {
        var d = u[c.command.toLowerCase()].map(function (b) {
          return this.options.accuracy ? Math.round(c[b] * a) / a : c[b];
        }.bind(this));return b + c.command + d.join(",");
      }.bind(this), "") + (this.close ? "Z" : "");
    }function o(a, b) {
      return e(this.pathElements, function (c, d) {
        c[d] *= "x" === d[0] ? a : b;
      }), this;
    }function p(a, b) {
      return e(this.pathElements, function (c, d) {
        c[d] += "x" === d[0] ? a : b;
      }), this;
    }function q(a) {
      return e(this.pathElements, function (b, c, d, e, f) {
        var g = a(b, c, d, e, f);(g || 0 === g) && (b[c] = g);
      }), this;
    }function r(a) {
      var b = new c.Svg.Path(a || this.close);return b.pos = this.pos, b.pathElements = this.pathElements.slice().map(function (a) {
        return c.extend({}, a);
      }), b.options = c.extend({}, this.options), b;
    }function s(a) {
      var b = [new c.Svg.Path()];return this.pathElements.forEach(function (d) {
        d.command === a.toUpperCase() && 0 !== b[b.length - 1].pathElements.length && b.push(new c.Svg.Path()), b[b.length - 1].pathElements.push(d);
      }), b;
    }function t(a, b, d) {
      for (var e = new c.Svg.Path(b, d), f = 0; f < a.length; f++) {
        for (var g = a[f], h = 0; h < g.pathElements.length; h++) {
          e.pathElements.push(g.pathElements[h]);
        }
      }return e;
    }var u = { m: ["x", "y"], l: ["x", "y"], c: ["x1", "y1", "x2", "y2", "x", "y"], a: ["rx", "ry", "xAr", "lAf", "sf", "x", "y"] },
        v = { accuracy: 3 };c.Svg.Path = c.Class.extend({ constructor: f, position: g, remove: h, move: i, line: j, curve: k, arc: l, scale: o, translate: p, transform: q, parse: m, stringify: n, clone: r, splitByCommand: s }), c.Svg.Path.elementDescriptions = u, c.Svg.Path.join = t;
  }(window, document, a), function (a, b, c) {
    "use strict";
    function d(a, b, c, d) {
      this.units = a, this.counterUnits = a === f.x ? f.y : f.x, this.chartRect = b, this.axisLength = b[a.rectEnd] - b[a.rectStart], this.gridOffset = b[a.rectOffset], this.ticks = c, this.options = d;
    }function e(a, b, d, e, f) {
      var g = e["axis" + this.units.pos.toUpperCase()],
          h = this.ticks.map(this.projectValue.bind(this)),
          i = this.ticks.map(g.labelInterpolationFnc);h.forEach(function (j, k) {
        var l,
            m = { x: 0, y: 0 };l = h[k + 1] ? h[k + 1] - j : Math.max(this.axisLength - j, 30), c.isFalseyButZero(i[k]) && "" !== i[k] || ("x" === this.units.pos ? (j = this.chartRect.x1 + j, m.x = e.axisX.labelOffset.x, "start" === e.axisX.position ? m.y = this.chartRect.padding.top + e.axisX.labelOffset.y + (d ? 5 : 20) : m.y = this.chartRect.y1 + e.axisX.labelOffset.y + (d ? 5 : 20)) : (j = this.chartRect.y1 - j, m.y = e.axisY.labelOffset.y - (d ? l : 0), "start" === e.axisY.position ? m.x = d ? this.chartRect.padding.left + e.axisY.labelOffset.x : this.chartRect.x1 - 10 : m.x = this.chartRect.x2 + e.axisY.labelOffset.x + 10), g.showGrid && c.createGrid(j, k, this, this.gridOffset, this.chartRect[this.counterUnits.len](), a, [e.classNames.grid, e.classNames[this.units.dir]], f), g.showLabel && c.createLabel(j, l, k, i, this, g.offset, m, b, [e.classNames.label, e.classNames[this.units.dir], "start" === g.position ? e.classNames[g.position] : e.classNames.end], d, f));
      }.bind(this));
    }var f = { x: { pos: "x", len: "width", dir: "horizontal", rectStart: "x1", rectEnd: "x2", rectOffset: "y2" }, y: { pos: "y", len: "height", dir: "vertical", rectStart: "y2", rectEnd: "y1", rectOffset: "x1" } };c.Axis = c.Class.extend({ constructor: d, createGridAndLabels: e, projectValue: function projectValue(a, b, c) {
        throw new Error("Base axis can't be instantiated!");
      } }), c.Axis.units = f;
  }(window, document, a), function (a, b, c) {
    "use strict";
    function d(a, b, d, e) {
      var f = e.highLow || c.getHighLow(b, e, a.pos);this.bounds = c.getBounds(d[a.rectEnd] - d[a.rectStart], f, e.scaleMinSpace || 20, e.onlyInteger), this.range = { min: this.bounds.min, max: this.bounds.max }, c.AutoScaleAxis["super"].constructor.call(this, a, d, this.bounds.values, e);
    }function e(a) {
      return this.axisLength * (+c.getMultiValue(a, this.units.pos) - this.bounds.min) / this.bounds.range;
    }c.AutoScaleAxis = c.Axis.extend({ constructor: d, projectValue: e });
  }(window, document, a), function (a, b, c) {
    "use strict";
    function d(a, b, d, e) {
      var f = e.highLow || c.getHighLow(b, e, a.pos);this.divisor = e.divisor || 1, this.ticks = e.ticks || c.times(this.divisor).map(function (a, b) {
        return f.low + (f.high - f.low) / this.divisor * b;
      }.bind(this)), this.ticks.sort(function (a, b) {
        return a - b;
      }), this.range = { min: f.low, max: f.high }, c.FixedScaleAxis["super"].constructor.call(this, a, d, this.ticks, e), this.stepLength = this.axisLength / this.divisor;
    }function e(a) {
      return this.axisLength * (+c.getMultiValue(a, this.units.pos) - this.range.min) / (this.range.max - this.range.min);
    }c.FixedScaleAxis = c.Axis.extend({ constructor: d, projectValue: e });
  }(window, document, a), function (a, b, c) {
    "use strict";
    function d(a, b, d, e) {
      c.StepAxis["super"].constructor.call(this, a, d, e.ticks, e);var f = Math.max(1, e.ticks.length - (e.stretch ? 1 : 0));this.stepLength = this.axisLength / f;
    }function e(a, b) {
      return this.stepLength * b;
    }c.StepAxis = c.Axis.extend({ constructor: d, projectValue: e });
  }(window, document, a), function (a, b, c) {
    "use strict";
    function d(a) {
      var b = c.normalizeData(this.data, a.reverseData, !0);this.svg = c.createSvg(this.container, a.width, a.height, a.classNames.chart);var d,
          e,
          g = this.svg.elem("g").addClass(a.classNames.gridGroup),
          h = this.svg.elem("g"),
          i = this.svg.elem("g").addClass(a.classNames.labelGroup),
          j = c.createChartRect(this.svg, a, f.padding);d = void 0 === a.axisX.type ? new c.StepAxis(c.Axis.units.x, b.normalized.series, j, c.extend({}, a.axisX, { ticks: b.normalized.labels, stretch: a.fullWidth })) : a.axisX.type.call(c, c.Axis.units.x, b.normalized.series, j, a.axisX), e = void 0 === a.axisY.type ? new c.AutoScaleAxis(c.Axis.units.y, b.normalized.series, j, c.extend({}, a.axisY, { high: c.isNumeric(a.high) ? a.high : a.axisY.high, low: c.isNumeric(a.low) ? a.low : a.axisY.low })) : a.axisY.type.call(c, c.Axis.units.y, b.normalized.series, j, a.axisY), d.createGridAndLabels(g, i, this.supportsForeignObject, a, this.eventEmitter), e.createGridAndLabels(g, i, this.supportsForeignObject, a, this.eventEmitter), a.showGridBackground && c.createGridBackground(g, j, a.classNames.gridBackground, this.eventEmitter), b.raw.series.forEach(function (f, g) {
        var i = h.elem("g");i.attr({ "ct:series-name": f.name, "ct:meta": c.serialize(f.meta) }), i.addClass([a.classNames.series, f.className || a.classNames.series + "-" + c.alphaNumerate(g)].join(" "));var k = [],
            l = [];b.normalized.series[g].forEach(function (a, h) {
          var i = { x: j.x1 + d.projectValue(a, h, b.normalized.series[g]), y: j.y1 - e.projectValue(a, h, b.normalized.series[g]) };k.push(i.x, i.y), l.push({ value: a, valueIndex: h, meta: c.getMetaData(f, h) });
        }.bind(this));var m = { lineSmooth: c.getSeriesOption(f, a, "lineSmooth"), showPoint: c.getSeriesOption(f, a, "showPoint"), showLine: c.getSeriesOption(f, a, "showLine"), showArea: c.getSeriesOption(f, a, "showArea"), areaBase: c.getSeriesOption(f, a, "areaBase") },
            n = "function" == typeof m.lineSmooth ? m.lineSmooth : m.lineSmooth ? c.Interpolation.monotoneCubic() : c.Interpolation.none(),
            o = n(k, l);if (m.showPoint && o.pathElements.forEach(function (b) {
          var h = i.elem("line", { x1: b.x, y1: b.y, x2: b.x + .01, y2: b.y }, a.classNames.point).attr({ "ct:value": [b.data.value.x, b.data.value.y].filter(c.isNumeric).join(","), "ct:meta": c.serialize(b.data.meta) });this.eventEmitter.emit("draw", { type: "point", value: b.data.value, index: b.data.valueIndex, meta: b.data.meta, series: f, seriesIndex: g, axisX: d, axisY: e, group: i, element: h, x: b.x, y: b.y });
        }.bind(this)), m.showLine) {
          var p = i.elem("path", { d: o.stringify() }, a.classNames.line, !0);this.eventEmitter.emit("draw", { type: "line", values: b.normalized.series[g], path: o.clone(), chartRect: j, index: g, series: f, seriesIndex: g, seriesMeta: f.meta, axisX: d, axisY: e, group: i, element: p });
        }if (m.showArea && e.range) {
          var q = Math.max(Math.min(m.areaBase, e.range.max), e.range.min),
              r = j.y1 - e.projectValue(q);o.splitByCommand("M").filter(function (a) {
            return a.pathElements.length > 1;
          }).map(function (a) {
            var b = a.pathElements[0],
                c = a.pathElements[a.pathElements.length - 1];return a.clone(!0).position(0).remove(1).move(b.x, r).line(b.x, b.y).position(a.pathElements.length + 1).line(c.x, r);
          }).forEach(function (c) {
            var h = i.elem("path", { d: c.stringify() }, a.classNames.area, !0);this.eventEmitter.emit("draw", { type: "area", values: b.normalized.series[g], path: c.clone(), series: f, seriesIndex: g, axisX: d, axisY: e, chartRect: j, index: g, group: i, element: h });
          }.bind(this));
        }
      }.bind(this)), this.eventEmitter.emit("created", { bounds: e.bounds, chartRect: j, axisX: d, axisY: e, svg: this.svg, options: a });
    }function e(a, b, d, e) {
      c.Line["super"].constructor.call(this, a, b, f, c.extend({}, f, d), e);
    }var f = { axisX: { offset: 30, position: "end", labelOffset: { x: 0, y: 0 }, showLabel: !0, showGrid: !0, labelInterpolationFnc: c.noop, type: void 0 }, axisY: { offset: 40, position: "start", labelOffset: { x: 0, y: 0 }, showLabel: !0, showGrid: !0, labelInterpolationFnc: c.noop, type: void 0, scaleMinSpace: 20, onlyInteger: !1 }, width: void 0, height: void 0, showLine: !0, showPoint: !0, showArea: !1, areaBase: 0, lineSmooth: !0, showGridBackground: !1, low: void 0, high: void 0, chartPadding: { top: 15, right: 15, bottom: 5, left: 10 }, fullWidth: !1, reverseData: !1, classNames: { chart: "ct-chart-line", label: "ct-label", labelGroup: "ct-labels", series: "ct-series", line: "ct-line", point: "ct-point", area: "ct-area", grid: "ct-grid", gridGroup: "ct-grids", gridBackground: "ct-grid-background", vertical: "ct-vertical", horizontal: "ct-horizontal", start: "ct-start", end: "ct-end" } };c.Line = c.Base.extend({ constructor: e, createChart: d });
  }(window, document, a), function (a, b, c) {
    "use strict";
    function d(a) {
      var b, d;a.distributeSeries ? (b = c.normalizeData(this.data, a.reverseData, a.horizontalBars ? "x" : "y"), b.normalized.series = b.normalized.series.map(function (a) {
        return [a];
      })) : b = c.normalizeData(this.data, a.reverseData, a.horizontalBars ? "x" : "y"), this.svg = c.createSvg(this.container, a.width, a.height, a.classNames.chart + (a.horizontalBars ? " " + a.classNames.horizontalBars : ""));var e = this.svg.elem("g").addClass(a.classNames.gridGroup),
          g = this.svg.elem("g"),
          h = this.svg.elem("g").addClass(a.classNames.labelGroup);if (a.stackBars && 0 !== b.normalized.series.length) {
        var i = c.serialMap(b.normalized.series, function () {
          return Array.prototype.slice.call(arguments).map(function (a) {
            return a;
          }).reduce(function (a, b) {
            return { x: a.x + (b && b.x) || 0, y: a.y + (b && b.y) || 0 };
          }, { x: 0, y: 0 });
        });d = c.getHighLow([i], a, a.horizontalBars ? "x" : "y");
      } else d = c.getHighLow(b.normalized.series, a, a.horizontalBars ? "x" : "y");d.high = +a.high || (0 === a.high ? 0 : d.high), d.low = +a.low || (0 === a.low ? 0 : d.low);var j,
          k,
          l,
          m,
          n,
          o = c.createChartRect(this.svg, a, f.padding);k = a.distributeSeries && a.stackBars ? b.normalized.labels.slice(0, 1) : b.normalized.labels, a.horizontalBars ? (j = m = void 0 === a.axisX.type ? new c.AutoScaleAxis(c.Axis.units.x, b.normalized.series, o, c.extend({}, a.axisX, { highLow: d, referenceValue: 0 })) : a.axisX.type.call(c, c.Axis.units.x, b.normalized.series, o, c.extend({}, a.axisX, { highLow: d, referenceValue: 0 })), l = n = void 0 === a.axisY.type ? new c.StepAxis(c.Axis.units.y, b.normalized.series, o, { ticks: k }) : a.axisY.type.call(c, c.Axis.units.y, b.normalized.series, o, a.axisY)) : (l = m = void 0 === a.axisX.type ? new c.StepAxis(c.Axis.units.x, b.normalized.series, o, { ticks: k }) : a.axisX.type.call(c, c.Axis.units.x, b.normalized.series, o, a.axisX), j = n = void 0 === a.axisY.type ? new c.AutoScaleAxis(c.Axis.units.y, b.normalized.series, o, c.extend({}, a.axisY, { highLow: d, referenceValue: 0 })) : a.axisY.type.call(c, c.Axis.units.y, b.normalized.series, o, c.extend({}, a.axisY, { highLow: d, referenceValue: 0 })));var p = a.horizontalBars ? o.x1 + j.projectValue(0) : o.y1 - j.projectValue(0),
          q = [];l.createGridAndLabels(e, h, this.supportsForeignObject, a, this.eventEmitter), j.createGridAndLabels(e, h, this.supportsForeignObject, a, this.eventEmitter), a.showGridBackground && c.createGridBackground(e, o, a.classNames.gridBackground, this.eventEmitter), b.raw.series.forEach(function (d, e) {
        var f,
            h,
            i = e - (b.raw.series.length - 1) / 2;f = a.distributeSeries && !a.stackBars ? l.axisLength / b.normalized.series.length / 2 : a.distributeSeries && a.stackBars ? l.axisLength / 2 : l.axisLength / b.normalized.series[e].length / 2, h = g.elem("g"), h.attr({ "ct:series-name": d.name, "ct:meta": c.serialize(d.meta) }), h.addClass([a.classNames.series, d.className || a.classNames.series + "-" + c.alphaNumerate(e)].join(" ")), b.normalized.series[e].forEach(function (g, k) {
          var r, s, t, u;if (u = a.distributeSeries && !a.stackBars ? e : a.distributeSeries && a.stackBars ? 0 : k, r = a.horizontalBars ? { x: o.x1 + j.projectValue(g && g.x ? g.x : 0, k, b.normalized.series[e]), y: o.y1 - l.projectValue(g && g.y ? g.y : 0, u, b.normalized.series[e]) } : { x: o.x1 + l.projectValue(g && g.x ? g.x : 0, u, b.normalized.series[e]), y: o.y1 - j.projectValue(g && g.y ? g.y : 0, k, b.normalized.series[e]) }, l instanceof c.StepAxis && (l.options.stretch || (r[l.units.pos] += f * (a.horizontalBars ? -1 : 1)), r[l.units.pos] += a.stackBars || a.distributeSeries ? 0 : i * a.seriesBarDistance * (a.horizontalBars ? -1 : 1)), t = q[k] || p, q[k] = t - (p - r[l.counterUnits.pos]), void 0 !== g) {
            var v = {};v[l.units.pos + "1"] = r[l.units.pos], v[l.units.pos + "2"] = r[l.units.pos], !a.stackBars || "accumulate" !== a.stackMode && a.stackMode ? (v[l.counterUnits.pos + "1"] = p, v[l.counterUnits.pos + "2"] = r[l.counterUnits.pos]) : (v[l.counterUnits.pos + "1"] = t, v[l.counterUnits.pos + "2"] = q[k]), v.x1 = Math.min(Math.max(v.x1, o.x1), o.x2), v.x2 = Math.min(Math.max(v.x2, o.x1), o.x2), v.y1 = Math.min(Math.max(v.y1, o.y2), o.y1), v.y2 = Math.min(Math.max(v.y2, o.y2), o.y1);var w = c.getMetaData(d, k);s = h.elem("line", v, a.classNames.bar).attr({ "ct:value": [g.x, g.y].filter(c.isNumeric).join(","), "ct:meta": c.serialize(w) }), this.eventEmitter.emit("draw", c.extend({ type: "bar", value: g, index: k, meta: w, series: d, seriesIndex: e, axisX: m, axisY: n, chartRect: o, group: h, element: s }, v));
          }
        }.bind(this));
      }.bind(this)), this.eventEmitter.emit("created", { bounds: j.bounds, chartRect: o, axisX: m, axisY: n, svg: this.svg, options: a });
    }function e(a, b, d, e) {
      c.Bar["super"].constructor.call(this, a, b, f, c.extend({}, f, d), e);
    }var f = { axisX: { offset: 30, position: "end", labelOffset: { x: 0, y: 0 }, showLabel: !0, showGrid: !0, labelInterpolationFnc: c.noop, scaleMinSpace: 30, onlyInteger: !1 }, axisY: { offset: 40, position: "start", labelOffset: { x: 0, y: 0 }, showLabel: !0, showGrid: !0, labelInterpolationFnc: c.noop, scaleMinSpace: 20, onlyInteger: !1 }, width: void 0, height: void 0, high: void 0, low: void 0, referenceValue: 0, chartPadding: { top: 15, right: 15, bottom: 5, left: 10 }, seriesBarDistance: 15, stackBars: !1, stackMode: "accumulate", horizontalBars: !1, distributeSeries: !1, reverseData: !1, showGridBackground: !1, classNames: { chart: "ct-chart-bar", horizontalBars: "ct-horizontal-bars", label: "ct-label", labelGroup: "ct-labels", series: "ct-series", bar: "ct-bar", grid: "ct-grid", gridGroup: "ct-grids", gridBackground: "ct-grid-background", vertical: "ct-vertical", horizontal: "ct-horizontal", start: "ct-start", end: "ct-end" } };c.Bar = c.Base.extend({ constructor: e, createChart: d });
  }(window, document, a), function (a, b, c) {
    "use strict";
    function d(a, b, c) {
      var d = b.x > a.x;return d && "explode" === c || !d && "implode" === c ? "start" : d && "implode" === c || !d && "explode" === c ? "end" : "middle";
    }function e(a) {
      var b,
          e,
          f,
          h,
          i,
          j = c.normalizeData(this.data),
          k = [],
          l = a.startAngle;this.svg = c.createSvg(this.container, a.width, a.height, a.donut ? a.classNames.chartDonut : a.classNames.chartPie), e = c.createChartRect(this.svg, a, g.padding), f = Math.min(e.width() / 2, e.height() / 2), i = a.total || j.normalized.series.reduce(function (a, b) {
        return a + b;
      }, 0);var m = c.quantity(a.donutWidth);"%" === m.unit && (m.value *= f / 100), f -= a.donut && !a.donutSolid ? m.value / 2 : 0, h = "outside" === a.labelPosition || a.donut && !a.donutSolid ? f : "center" === a.labelPosition ? 0 : a.donutSolid ? f - m.value / 2 : f / 2, h += a.labelOffset;var n = { x: e.x1 + e.width() / 2, y: e.y2 + e.height() / 2 },
          o = 1 === j.raw.series.filter(function (a) {
        return a.hasOwnProperty("value") ? 0 !== a.value : 0 !== a;
      }).length;j.raw.series.forEach(function (a, b) {
        k[b] = this.svg.elem("g", null, null);
      }.bind(this)), a.showLabel && (b = this.svg.elem("g", null, null)), j.raw.series.forEach(function (e, g) {
        if (0 !== j.normalized.series[g] || !a.ignoreEmptyValues) {
          k[g].attr({ "ct:series-name": e.name }), k[g].addClass([a.classNames.series, e.className || a.classNames.series + "-" + c.alphaNumerate(g)].join(" "));var p = i > 0 ? l + j.normalized.series[g] / i * 360 : 0,
              q = Math.max(0, l - (0 === g || o ? 0 : .2));p - q >= 359.99 && (p = q + 359.99);var r,
              s,
              t,
              u = c.polarToCartesian(n.x, n.y, f, q),
              v = c.polarToCartesian(n.x, n.y, f, p),
              w = new c.Svg.Path(!a.donut || a.donutSolid).move(v.x, v.y).arc(f, f, 0, p - l > 180, 0, u.x, u.y);a.donut ? a.donutSolid && (t = f - m.value, r = c.polarToCartesian(n.x, n.y, t, l - (0 === g || o ? 0 : .2)), s = c.polarToCartesian(n.x, n.y, t, p), w.line(r.x, r.y), w.arc(t, t, 0, p - l > 180, 1, s.x, s.y)) : w.line(n.x, n.y);var x = a.classNames.slicePie;a.donut && (x = a.classNames.sliceDonut, a.donutSolid && (x = a.classNames.sliceDonutSolid));var y = k[g].elem("path", { d: w.stringify() }, x);if (y.attr({ "ct:value": j.normalized.series[g], "ct:meta": c.serialize(e.meta) }), a.donut && !a.donutSolid && (y._node.style.strokeWidth = m.value + "px"), this.eventEmitter.emit("draw", { type: "slice", value: j.normalized.series[g], totalDataSum: i, index: g, meta: e.meta, series: e, group: k[g], element: y, path: w.clone(), center: n, radius: f, startAngle: l, endAngle: p }), a.showLabel) {
            var z;z = 1 === j.raw.series.length ? { x: n.x, y: n.y } : c.polarToCartesian(n.x, n.y, h, l + (p - l) / 2);var A;A = j.normalized.labels && !c.isFalseyButZero(j.normalized.labels[g]) ? j.normalized.labels[g] : j.normalized.series[g];var B = a.labelInterpolationFnc(A, g);if (B || 0 === B) {
              var C = b.elem("text", { dx: z.x, dy: z.y, "text-anchor": d(n, z, a.labelDirection) }, a.classNames.label).text("" + B);this.eventEmitter.emit("draw", { type: "label", index: g, group: b, element: C, text: "" + B, x: z.x, y: z.y });
            }
          }l = p;
        }
      }.bind(this)), this.eventEmitter.emit("created", { chartRect: e, svg: this.svg, options: a });
    }function f(a, b, d, e) {
      c.Pie["super"].constructor.call(this, a, b, g, c.extend({}, g, d), e);
    }var g = { width: void 0, height: void 0, chartPadding: 5, classNames: { chartPie: "ct-chart-pie", chartDonut: "ct-chart-donut", series: "ct-series", slicePie: "ct-slice-pie", sliceDonut: "ct-slice-donut", sliceDonutSolid: "ct-slice-donut-solid", label: "ct-label" }, startAngle: 0, total: void 0, donut: !1, donutSolid: !1, donutWidth: 60, showLabel: !0, labelOffset: 0, labelPosition: "inside", labelInterpolationFnc: c.noop, labelDirection: "neutral", reverseData: !1, ignoreEmptyValues: !1 };c.Pie = c.Base.extend({ constructor: f, createChart: e, determineAnchorPosition: d });
  }(window, document, a), a;
});

/* perfect-scrollbar v0.6.13 */
!function t(e, n, r) {
  function o(i, s) {
    if (!n[i]) {
      if (!e[i]) {
        var a = "function" == typeof require && require;if (!s && a) return a(i, !0);if (l) return l(i, !0);var c = new Error("Cannot find module '" + i + "'");throw c.code = "MODULE_NOT_FOUND", c;
      }var u = n[i] = { exports: {} };e[i][0].call(u.exports, function (t) {
        var n = e[i][1][t];return o(n ? n : t);
      }, u, u.exports, t, e, n, r);
    }return n[i].exports;
  }for (var l = "function" == typeof require && require, i = 0; i < r.length; i++) {
    o(r[i]);
  }return o;
}({ 1: [function (t, e, n) {
    "use strict";
    function r(t) {
      t.fn.perfectScrollbar = function (t) {
        return this.each(function () {
          if ("object" == (typeof t === 'undefined' ? 'undefined' : _typeof(t)) || "undefined" == typeof t) {
            var e = t;l.get(this) || o.initialize(this, e);
          } else {
            var n = t;"update" === n ? o.update(this) : "destroy" === n && o.destroy(this);
          }
        });
      };
    }var o = t("../main"),
        l = t("../plugin/instances");if ("function" == typeof define && define.amd) define(["jquery"], r);else {
      var i = window.jQuery ? window.jQuery : window.$;"undefined" != typeof i && r(i);
    }e.exports = r;
  }, { "../main": 7, "../plugin/instances": 18 }], 2: [function (t, e, n) {
    "use strict";
    function r(t, e) {
      var n = t.className.split(" ");n.indexOf(e) < 0 && n.push(e), t.className = n.join(" ");
    }function o(t, e) {
      var n = t.className.split(" "),
          r = n.indexOf(e);r >= 0 && n.splice(r, 1), t.className = n.join(" ");
    }n.add = function (t, e) {
      t.classList ? t.classList.add(e) : r(t, e);
    }, n.remove = function (t, e) {
      t.classList ? t.classList.remove(e) : o(t, e);
    }, n.list = function (t) {
      return t.classList ? Array.prototype.slice.apply(t.classList) : t.className.split(" ");
    };
  }, {}], 3: [function (t, e, n) {
    "use strict";
    function r(t, e) {
      return window.getComputedStyle(t)[e];
    }function o(t, e, n) {
      return "number" == typeof n && (n = n.toString() + "px"), t.style[e] = n, t;
    }function l(t, e) {
      for (var n in e) {
        var r = e[n];"number" == typeof r && (r = r.toString() + "px"), t.style[n] = r;
      }return t;
    }var i = {};i.e = function (t, e) {
      var n = document.createElement(t);return n.className = e, n;
    }, i.appendTo = function (t, e) {
      return e.appendChild(t), t;
    }, i.css = function (t, e, n) {
      return "object" == (typeof e === 'undefined' ? 'undefined' : _typeof(e)) ? l(t, e) : "undefined" == typeof n ? r(t, e) : o(t, e, n);
    }, i.matches = function (t, e) {
      return "undefined" != typeof t.matches ? t.matches(e) : "undefined" != typeof t.matchesSelector ? t.matchesSelector(e) : "undefined" != typeof t.webkitMatchesSelector ? t.webkitMatchesSelector(e) : "undefined" != typeof t.mozMatchesSelector ? t.mozMatchesSelector(e) : "undefined" != typeof t.msMatchesSelector ? t.msMatchesSelector(e) : void 0;
    }, i.remove = function (t) {
      "undefined" != typeof t.remove ? t.remove() : t.parentNode && t.parentNode.removeChild(t);
    }, i.queryChildren = function (t, e) {
      return Array.prototype.filter.call(t.childNodes, function (t) {
        return i.matches(t, e);
      });
    }, e.exports = i;
  }, {}], 4: [function (t, e, n) {
    "use strict";
    var r = function r(t) {
      this.element = t, this.events = {};
    };r.prototype.bind = function (t, e) {
      "undefined" == typeof this.events[t] && (this.events[t] = []), this.events[t].push(e), this.element.addEventListener(t, e, !1);
    }, r.prototype.unbind = function (t, e) {
      var n = "undefined" != typeof e;this.events[t] = this.events[t].filter(function (r) {
        return !(!n || r === e) || (this.element.removeEventListener(t, r, !1), !1);
      }, this);
    }, r.prototype.unbindAll = function () {
      for (var t in this.events) {
        this.unbind(t);
      }
    };var o = function o() {
      this.eventElements = [];
    };o.prototype.eventElement = function (t) {
      var e = this.eventElements.filter(function (e) {
        return e.element === t;
      })[0];return "undefined" == typeof e && (e = new r(t), this.eventElements.push(e)), e;
    }, o.prototype.bind = function (t, e, n) {
      this.eventElement(t).bind(e, n);
    }, o.prototype.unbind = function (t, e, n) {
      this.eventElement(t).unbind(e, n);
    }, o.prototype.unbindAll = function () {
      for (var t = 0; t < this.eventElements.length; t++) {
        this.eventElements[t].unbindAll();
      }
    }, o.prototype.once = function (t, e, n) {
      var r = this.eventElement(t),
          o = function o(t) {
        r.unbind(e, o), n(t);
      };r.bind(e, o);
    }, e.exports = o;
  }, {}], 5: [function (t, e, n) {
    "use strict";
    e.exports = function () {
      function t() {
        return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
      }return function () {
        return t() + t() + "-" + t() + "-" + t() + "-" + t() + "-" + t() + t() + t();
      };
    }();
  }, {}], 6: [function (t, e, n) {
    "use strict";
    var r = t("./class"),
        o = t("./dom"),
        l = n.toInt = function (t) {
      return parseInt(t, 10) || 0;
    },
        i = n.clone = function (t) {
      if (t) {
        if (t.constructor === Array) return t.map(i);if ("object" == (typeof t === 'undefined' ? 'undefined' : _typeof(t))) {
          var e = {};for (var n in t) {
            e[n] = i(t[n]);
          }return e;
        }return t;
      }return null;
    };n.extend = function (t, e) {
      var n = i(t);for (var r in e) {
        n[r] = i(e[r]);
      }return n;
    }, n.isEditable = function (t) {
      return o.matches(t, "input,[contenteditable]") || o.matches(t, "select,[contenteditable]") || o.matches(t, "textarea,[contenteditable]") || o.matches(t, "button,[contenteditable]");
    }, n.removePsClasses = function (t) {
      for (var e = r.list(t), n = 0; n < e.length; n++) {
        var o = e[n];0 === o.indexOf("ps-") && r.remove(t, o);
      }
    }, n.outerWidth = function (t) {
      return l(o.css(t, "width")) + l(o.css(t, "paddingLeft")) + l(o.css(t, "paddingRight")) + l(o.css(t, "borderLeftWidth")) + l(o.css(t, "borderRightWidth"));
    }, n.startScrolling = function (t, e) {
      r.add(t, "ps-in-scrolling"), "undefined" != typeof e ? r.add(t, "ps-" + e) : (r.add(t, "ps-x"), r.add(t, "ps-y"));
    }, n.stopScrolling = function (t, e) {
      r.remove(t, "ps-in-scrolling"), "undefined" != typeof e ? r.remove(t, "ps-" + e) : (r.remove(t, "ps-x"), r.remove(t, "ps-y"));
    }, n.env = { isWebKit: "WebkitAppearance" in document.documentElement.style, supportsTouch: "ontouchstart" in window || window.DocumentTouch && document instanceof window.DocumentTouch, supportsIePointer: null !== window.navigator.msMaxTouchPoints };
  }, { "./class": 2, "./dom": 3 }], 7: [function (t, e, n) {
    "use strict";
    var r = t("./plugin/destroy"),
        o = t("./plugin/initialize"),
        l = t("./plugin/update");e.exports = { initialize: o, update: l, destroy: r };
  }, { "./plugin/destroy": 9, "./plugin/initialize": 17, "./plugin/update": 21 }], 8: [function (t, e, n) {
    "use strict";
    e.exports = { handlers: ["click-rail", "drag-scrollbar", "keyboard", "wheel", "touch"], maxScrollbarLength: null, minScrollbarLength: null, scrollXMarginOffset: 0, scrollYMarginOffset: 0, suppressScrollX: !1, suppressScrollY: !1, swipePropagation: !0, useBothWheelAxes: !1, wheelPropagation: !1, wheelSpeed: 1, theme: "default" };
  }, {}], 9: [function (t, e, n) {
    "use strict";
    var r = t("../lib/helper"),
        o = t("../lib/dom"),
        l = t("./instances");e.exports = function (t) {
      var e = l.get(t);e && (e.event.unbindAll(), o.remove(e.scrollbarX), o.remove(e.scrollbarY), o.remove(e.scrollbarXRail), o.remove(e.scrollbarYRail), r.removePsClasses(t), l.remove(t));
    };
  }, { "../lib/dom": 3, "../lib/helper": 6, "./instances": 18 }], 10: [function (t, e, n) {
    "use strict";
    function r(t, e) {
      function n(t) {
        return t.getBoundingClientRect();
      }var r = function r(t) {
        t.stopPropagation();
      };e.event.bind(e.scrollbarY, "click", r), e.event.bind(e.scrollbarYRail, "click", function (r) {
        var o = r.pageY - window.pageYOffset - n(e.scrollbarYRail).top,
            s = o > e.scrollbarYTop ? 1 : -1;i(t, "top", t.scrollTop + s * e.containerHeight), l(t), r.stopPropagation();
      }), e.event.bind(e.scrollbarX, "click", r), e.event.bind(e.scrollbarXRail, "click", function (r) {
        var o = r.pageX - window.pageXOffset - n(e.scrollbarXRail).left,
            s = o > e.scrollbarXLeft ? 1 : -1;i(t, "left", t.scrollLeft + s * e.containerWidth), l(t), r.stopPropagation();
      });
    }var o = t("../instances"),
        l = t("../update-geometry"),
        i = t("../update-scroll");e.exports = function (t) {
      var e = o.get(t);r(t, e);
    };
  }, { "../instances": 18, "../update-geometry": 19, "../update-scroll": 20 }], 11: [function (t, e, n) {
    "use strict";
    function r(t, e) {
      function n(n) {
        var o = r + n * e.railXRatio,
            i = Math.max(0, e.scrollbarXRail.getBoundingClientRect().left) + e.railXRatio * (e.railXWidth - e.scrollbarXWidth);o < 0 ? e.scrollbarXLeft = 0 : o > i ? e.scrollbarXLeft = i : e.scrollbarXLeft = o;var s = l.toInt(e.scrollbarXLeft * (e.contentWidth - e.containerWidth) / (e.containerWidth - e.railXRatio * e.scrollbarXWidth)) - e.negativeScrollAdjustment;c(t, "left", s);
      }var r = null,
          o = null,
          s = function s(e) {
        n(e.pageX - o), a(t), e.stopPropagation(), e.preventDefault();
      },
          u = function u() {
        l.stopScrolling(t, "x"), e.event.unbind(e.ownerDocument, "mousemove", s);
      };e.event.bind(e.scrollbarX, "mousedown", function (n) {
        o = n.pageX, r = l.toInt(i.css(e.scrollbarX, "left")) * e.railXRatio, l.startScrolling(t, "x"), e.event.bind(e.ownerDocument, "mousemove", s), e.event.once(e.ownerDocument, "mouseup", u), n.stopPropagation(), n.preventDefault();
      });
    }function o(t, e) {
      function n(n) {
        var o = r + n * e.railYRatio,
            i = Math.max(0, e.scrollbarYRail.getBoundingClientRect().top) + e.railYRatio * (e.railYHeight - e.scrollbarYHeight);o < 0 ? e.scrollbarYTop = 0 : o > i ? e.scrollbarYTop = i : e.scrollbarYTop = o;var s = l.toInt(e.scrollbarYTop * (e.contentHeight - e.containerHeight) / (e.containerHeight - e.railYRatio * e.scrollbarYHeight));c(t, "top", s);
      }var r = null,
          o = null,
          s = function s(e) {
        n(e.pageY - o), a(t), e.stopPropagation(), e.preventDefault();
      },
          u = function u() {
        l.stopScrolling(t, "y"), e.event.unbind(e.ownerDocument, "mousemove", s);
      };e.event.bind(e.scrollbarY, "mousedown", function (n) {
        o = n.pageY, r = l.toInt(i.css(e.scrollbarY, "top")) * e.railYRatio, l.startScrolling(t, "y"), e.event.bind(e.ownerDocument, "mousemove", s), e.event.once(e.ownerDocument, "mouseup", u), n.stopPropagation(), n.preventDefault();
      });
    }var l = t("../../lib/helper"),
        i = t("../../lib/dom"),
        s = t("../instances"),
        a = t("../update-geometry"),
        c = t("../update-scroll");e.exports = function (t) {
      var e = s.get(t);r(t, e), o(t, e);
    };
  }, { "../../lib/dom": 3, "../../lib/helper": 6, "../instances": 18, "../update-geometry": 19, "../update-scroll": 20 }], 12: [function (t, e, n) {
    "use strict";
    function r(t, e) {
      function n(n, r) {
        var o = t.scrollTop;if (0 === n) {
          if (!e.scrollbarYActive) return !1;if (0 === o && r > 0 || o >= e.contentHeight - e.containerHeight && r < 0) return !e.settings.wheelPropagation;
        }var l = t.scrollLeft;if (0 === r) {
          if (!e.scrollbarXActive) return !1;if (0 === l && n < 0 || l >= e.contentWidth - e.containerWidth && n > 0) return !e.settings.wheelPropagation;
        }return !0;
      }var r = !1;e.event.bind(t, "mouseenter", function () {
        r = !0;
      }), e.event.bind(t, "mouseleave", function () {
        r = !1;
      });var i = !1;e.event.bind(e.ownerDocument, "keydown", function (c) {
        if (!(c.isDefaultPrevented && c.isDefaultPrevented() || c.defaultPrevented)) {
          var u = l.matches(e.scrollbarX, ":focus") || l.matches(e.scrollbarY, ":focus");if (r || u) {
            var d = document.activeElement ? document.activeElement : e.ownerDocument.activeElement;if (d) {
              if ("IFRAME" === d.tagName) d = d.contentDocument.activeElement;else for (; d.shadowRoot;) {
                d = d.shadowRoot.activeElement;
              }if (o.isEditable(d)) return;
            }var p = 0,
                f = 0;switch (c.which) {case 37:
                p = c.metaKey ? -e.contentWidth : c.altKey ? -e.containerWidth : -30;break;case 38:
                f = c.metaKey ? e.contentHeight : c.altKey ? e.containerHeight : 30;break;case 39:
                p = c.metaKey ? e.contentWidth : c.altKey ? e.containerWidth : 30;break;case 40:
                f = c.metaKey ? -e.contentHeight : c.altKey ? -e.containerHeight : -30;break;case 33:
                f = 90;break;case 32:
                f = c.shiftKey ? 90 : -90;break;case 34:
                f = -90;break;case 35:
                f = c.ctrlKey ? -e.contentHeight : -e.containerHeight;break;case 36:
                f = c.ctrlKey ? t.scrollTop : e.containerHeight;break;default:
                return;}a(t, "top", t.scrollTop - f), a(t, "left", t.scrollLeft + p), s(t), i = n(p, f), i && c.preventDefault();
          }
        }
      });
    }var o = t("../../lib/helper"),
        l = t("../../lib/dom"),
        i = t("../instances"),
        s = t("../update-geometry"),
        a = t("../update-scroll");e.exports = function (t) {
      var e = i.get(t);r(t, e);
    };
  }, { "../../lib/dom": 3, "../../lib/helper": 6, "../instances": 18, "../update-geometry": 19, "../update-scroll": 20 }], 13: [function (t, e, n) {
    "use strict";
    function r(t, e) {
      function n(n, r) {
        var o = t.scrollTop;if (0 === n) {
          if (!e.scrollbarYActive) return !1;if (0 === o && r > 0 || o >= e.contentHeight - e.containerHeight && r < 0) return !e.settings.wheelPropagation;
        }var l = t.scrollLeft;if (0 === r) {
          if (!e.scrollbarXActive) return !1;if (0 === l && n < 0 || l >= e.contentWidth - e.containerWidth && n > 0) return !e.settings.wheelPropagation;
        }return !0;
      }function r(t) {
        var e = t.deltaX,
            n = -1 * t.deltaY;return "undefined" != typeof e && "undefined" != typeof n || (e = -1 * t.wheelDeltaX / 6, n = t.wheelDeltaY / 6), t.deltaMode && 1 === t.deltaMode && (e *= 10, n *= 10), e !== e && n !== n && (e = 0, n = t.wheelDelta), t.shiftKey ? [-n, -e] : [e, n];
      }function o(e, n) {
        var r = t.querySelector("textarea:hover, select[multiple]:hover, .ps-child:hover");if (r) {
          if (!window.getComputedStyle(r).overflow.match(/(scroll|auto)/)) return !1;var o = r.scrollHeight - r.clientHeight;if (o > 0 && !(0 === r.scrollTop && n > 0 || r.scrollTop === o && n < 0)) return !0;var l = r.scrollLeft - r.clientWidth;if (l > 0 && !(0 === r.scrollLeft && e < 0 || r.scrollLeft === l && e > 0)) return !0;
        }return !1;
      }function s(s) {
        var c = r(s),
            u = c[0],
            d = c[1];o(u, d) || (a = !1, e.settings.useBothWheelAxes ? e.scrollbarYActive && !e.scrollbarXActive ? (d ? i(t, "top", t.scrollTop - d * e.settings.wheelSpeed) : i(t, "top", t.scrollTop + u * e.settings.wheelSpeed), a = !0) : e.scrollbarXActive && !e.scrollbarYActive && (u ? i(t, "left", t.scrollLeft + u * e.settings.wheelSpeed) : i(t, "left", t.scrollLeft - d * e.settings.wheelSpeed), a = !0) : (i(t, "top", t.scrollTop - d * e.settings.wheelSpeed), i(t, "left", t.scrollLeft + u * e.settings.wheelSpeed)), l(t), a = a || n(u, d), a && (s.stopPropagation(), s.preventDefault()));
      }var a = !1;"undefined" != typeof window.onwheel ? e.event.bind(t, "wheel", s) : "undefined" != typeof window.onmousewheel && e.event.bind(t, "mousewheel", s);
    }var o = t("../instances"),
        l = t("../update-geometry"),
        i = t("../update-scroll");e.exports = function (t) {
      var e = o.get(t);r(t, e);
    };
  }, { "../instances": 18, "../update-geometry": 19, "../update-scroll": 20 }], 14: [function (t, e, n) {
    "use strict";
    function r(t, e) {
      e.event.bind(t, "scroll", function () {
        l(t);
      });
    }var o = t("../instances"),
        l = t("../update-geometry");e.exports = function (t) {
      var e = o.get(t);r(t, e);
    };
  }, { "../instances": 18, "../update-geometry": 19 }], 15: [function (t, e, n) {
    "use strict";
    function r(t, e) {
      function n() {
        var t = window.getSelection ? window.getSelection() : document.getSelection ? document.getSelection() : "";return 0 === t.toString().length ? null : t.getRangeAt(0).commonAncestorContainer;
      }function r() {
        c || (c = setInterval(function () {
          return l.get(t) ? (s(t, "top", t.scrollTop + u.top), s(t, "left", t.scrollLeft + u.left), void i(t)) : void clearInterval(c);
        }, 50));
      }function a() {
        c && (clearInterval(c), c = null), o.stopScrolling(t);
      }var c = null,
          u = { top: 0, left: 0 },
          d = !1;e.event.bind(e.ownerDocument, "selectionchange", function () {
        t.contains(n()) ? d = !0 : (d = !1, a());
      }), e.event.bind(window, "mouseup", function () {
        d && (d = !1, a());
      }), e.event.bind(window, "keyup", function () {
        d && (d = !1, a());
      }), e.event.bind(window, "mousemove", function (e) {
        if (d) {
          var n = { x: e.pageX, y: e.pageY },
              l = { left: t.offsetLeft, right: t.offsetLeft + t.offsetWidth, top: t.offsetTop, bottom: t.offsetTop + t.offsetHeight };n.x < l.left + 3 ? (u.left = -5, o.startScrolling(t, "x")) : n.x > l.right - 3 ? (u.left = 5, o.startScrolling(t, "x")) : u.left = 0, n.y < l.top + 3 ? (l.top + 3 - n.y < 5 ? u.top = -5 : u.top = -20, o.startScrolling(t, "y")) : n.y > l.bottom - 3 ? (n.y - l.bottom + 3 < 5 ? u.top = 5 : u.top = 20, o.startScrolling(t, "y")) : u.top = 0, 0 === u.top && 0 === u.left ? a() : r();
        }
      });
    }var o = t("../../lib/helper"),
        l = t("../instances"),
        i = t("../update-geometry"),
        s = t("../update-scroll");e.exports = function (t) {
      var e = l.get(t);r(t, e);
    };
  }, { "../../lib/helper": 6, "../instances": 18, "../update-geometry": 19, "../update-scroll": 20 }], 16: [function (t, e, n) {
    "use strict";
    function r(t, e, n, r) {
      function o(n, r) {
        var o = t.scrollTop,
            l = t.scrollLeft,
            i = Math.abs(n),
            s = Math.abs(r);if (s > i) {
          if (r < 0 && o === e.contentHeight - e.containerHeight || r > 0 && 0 === o) return !e.settings.swipePropagation;
        } else if (i > s && (n < 0 && l === e.contentWidth - e.containerWidth || n > 0 && 0 === l)) return !e.settings.swipePropagation;return !0;
      }function a(e, n) {
        s(t, "top", t.scrollTop - n), s(t, "left", t.scrollLeft - e), i(t);
      }function c() {
        w = !0;
      }function u() {
        w = !1;
      }function d(t) {
        return t.targetTouches ? t.targetTouches[0] : t;
      }function p(t) {
        return !(!t.targetTouches || 1 !== t.targetTouches.length) || !(!t.pointerType || "mouse" === t.pointerType || t.pointerType === t.MSPOINTER_TYPE_MOUSE);
      }function f(t) {
        if (p(t)) {
          Y = !0;var e = d(t);g.pageX = e.pageX, g.pageY = e.pageY, v = new Date().getTime(), null !== y && clearInterval(y), t.stopPropagation();
        }
      }function h(t) {
        if (!Y && e.settings.swipePropagation && f(t), !w && Y && p(t)) {
          var n = d(t),
              r = { pageX: n.pageX, pageY: n.pageY },
              l = r.pageX - g.pageX,
              i = r.pageY - g.pageY;a(l, i), g = r;var s = new Date().getTime(),
              c = s - v;c > 0 && (m.x = l / c, m.y = i / c, v = s), o(l, i) && (t.stopPropagation(), t.preventDefault());
        }
      }function b() {
        !w && Y && (Y = !1, clearInterval(y), y = setInterval(function () {
          return l.get(t) && (m.x || m.y) ? Math.abs(m.x) < .01 && Math.abs(m.y) < .01 ? void clearInterval(y) : (a(30 * m.x, 30 * m.y), m.x *= .8, void (m.y *= .8)) : void clearInterval(y);
        }, 10));
      }var g = {},
          v = 0,
          m = {},
          y = null,
          w = !1,
          Y = !1;n && (e.event.bind(window, "touchstart", c), e.event.bind(window, "touchend", u), e.event.bind(t, "touchstart", f), e.event.bind(t, "touchmove", h), e.event.bind(t, "touchend", b)), r && (window.PointerEvent ? (e.event.bind(window, "pointerdown", c), e.event.bind(window, "pointerup", u), e.event.bind(t, "pointerdown", f), e.event.bind(t, "pointermove", h), e.event.bind(t, "pointerup", b)) : window.MSPointerEvent && (e.event.bind(window, "MSPointerDown", c), e.event.bind(window, "MSPointerUp", u), e.event.bind(t, "MSPointerDown", f), e.event.bind(t, "MSPointerMove", h), e.event.bind(t, "MSPointerUp", b)));
    }var o = t("../../lib/helper"),
        l = t("../instances"),
        i = t("../update-geometry"),
        s = t("../update-scroll");e.exports = function (t) {
      if (o.env.supportsTouch || o.env.supportsIePointer) {
        var e = l.get(t);r(t, e, o.env.supportsTouch, o.env.supportsIePointer);
      }
    };
  }, { "../../lib/helper": 6, "../instances": 18, "../update-geometry": 19, "../update-scroll": 20 }], 17: [function (t, e, n) {
    "use strict";
    var r = t("../lib/helper"),
        o = t("../lib/class"),
        l = t("./instances"),
        i = t("./update-geometry"),
        s = { "click-rail": t("./handler/click-rail"), "drag-scrollbar": t("./handler/drag-scrollbar"), keyboard: t("./handler/keyboard"), wheel: t("./handler/mouse-wheel"), touch: t("./handler/touch"), selection: t("./handler/selection") },
        a = t("./handler/native-scroll");e.exports = function (t, e) {
      e = "object" == (typeof e === 'undefined' ? 'undefined' : _typeof(e)) ? e : {}, o.add(t, "ps-container");var n = l.add(t);n.settings = r.extend(n.settings, e), o.add(t, "ps-theme-" + n.settings.theme), n.settings.handlers.forEach(function (e) {
        s[e](t);
      }), a(t), i(t);
    };
  }, { "../lib/class": 2, "../lib/helper": 6, "./handler/click-rail": 10, "./handler/drag-scrollbar": 11, "./handler/keyboard": 12, "./handler/mouse-wheel": 13, "./handler/native-scroll": 14, "./handler/selection": 15, "./handler/touch": 16, "./instances": 18, "./update-geometry": 19 }], 18: [function (t, e, n) {
    "use strict";
    function r(t) {
      function e() {
        a.add(t, "ps-focus");
      }function n() {
        a.remove(t, "ps-focus");
      }var r = this;r.settings = s.clone(c), r.containerWidth = null, r.containerHeight = null, r.contentWidth = null, r.contentHeight = null, r.isRtl = "rtl" === u.css(t, "direction"), r.isNegativeScroll = function () {
        var e = t.scrollLeft,
            n = null;return t.scrollLeft = -1, n = t.scrollLeft < 0, t.scrollLeft = e, n;
      }(), r.negativeScrollAdjustment = r.isNegativeScroll ? t.scrollWidth - t.clientWidth : 0, r.event = new d(), r.ownerDocument = t.ownerDocument || document, r.scrollbarXRail = u.appendTo(u.e("div", "ps-scrollbar-x-rail"), t), r.scrollbarX = u.appendTo(u.e("div", "ps-scrollbar-x"), r.scrollbarXRail), r.scrollbarX.setAttribute("tabindex", 0), r.event.bind(r.scrollbarX, "focus", e), r.event.bind(r.scrollbarX, "blur", n), r.scrollbarXActive = null, r.scrollbarXWidth = null, r.scrollbarXLeft = null, r.scrollbarXBottom = s.toInt(u.css(r.scrollbarXRail, "bottom")), r.isScrollbarXUsingBottom = r.scrollbarXBottom === r.scrollbarXBottom, r.scrollbarXTop = r.isScrollbarXUsingBottom ? null : s.toInt(u.css(r.scrollbarXRail, "top")), r.railBorderXWidth = s.toInt(u.css(r.scrollbarXRail, "borderLeftWidth")) + s.toInt(u.css(r.scrollbarXRail, "borderRightWidth")), u.css(r.scrollbarXRail, "display", "block"), r.railXMarginWidth = s.toInt(u.css(r.scrollbarXRail, "marginLeft")) + s.toInt(u.css(r.scrollbarXRail, "marginRight")), u.css(r.scrollbarXRail, "display", ""), r.railXWidth = null, r.railXRatio = null, r.scrollbarYRail = u.appendTo(u.e("div", "ps-scrollbar-y-rail"), t), r.scrollbarY = u.appendTo(u.e("div", "ps-scrollbar-y"), r.scrollbarYRail), r.scrollbarY.setAttribute("tabindex", 0), r.event.bind(r.scrollbarY, "focus", e), r.event.bind(r.scrollbarY, "blur", n), r.scrollbarYActive = null, r.scrollbarYHeight = null, r.scrollbarYTop = null, r.scrollbarYRight = s.toInt(u.css(r.scrollbarYRail, "right")), r.isScrollbarYUsingRight = r.scrollbarYRight === r.scrollbarYRight, r.scrollbarYLeft = r.isScrollbarYUsingRight ? null : s.toInt(u.css(r.scrollbarYRail, "left")), r.scrollbarYOuterWidth = r.isRtl ? s.outerWidth(r.scrollbarY) : null, r.railBorderYWidth = s.toInt(u.css(r.scrollbarYRail, "borderTopWidth")) + s.toInt(u.css(r.scrollbarYRail, "borderBottomWidth")), u.css(r.scrollbarYRail, "display", "block"), r.railYMarginHeight = s.toInt(u.css(r.scrollbarYRail, "marginTop")) + s.toInt(u.css(r.scrollbarYRail, "marginBottom")), u.css(r.scrollbarYRail, "display", ""), r.railYHeight = null, r.railYRatio = null;
    }function o(t) {
      return t.getAttribute("data-ps-id");
    }function l(t, e) {
      t.setAttribute("data-ps-id", e);
    }function i(t) {
      t.removeAttribute("data-ps-id");
    }var s = t("../lib/helper"),
        a = t("../lib/class"),
        c = t("./default-setting"),
        u = t("../lib/dom"),
        d = t("../lib/event-manager"),
        p = t("../lib/guid"),
        f = {};n.add = function (t) {
      var e = p();return l(t, e), f[e] = new r(t), f[e];
    }, n.remove = function (t) {
      delete f[o(t)], i(t);
    }, n.get = function (t) {
      return f[o(t)];
    };
  }, { "../lib/class": 2, "../lib/dom": 3, "../lib/event-manager": 4, "../lib/guid": 5, "../lib/helper": 6, "./default-setting": 8 }], 19: [function (t, e, n) {
    "use strict";
    function r(t, e) {
      return t.settings.minScrollbarLength && (e = Math.max(e, t.settings.minScrollbarLength)), t.settings.maxScrollbarLength && (e = Math.min(e, t.settings.maxScrollbarLength)), e;
    }function o(t, e) {
      var n = { width: e.railXWidth };e.isRtl ? n.left = e.negativeScrollAdjustment + t.scrollLeft + e.containerWidth - e.contentWidth : n.left = t.scrollLeft, e.isScrollbarXUsingBottom ? n.bottom = e.scrollbarXBottom - t.scrollTop : n.top = e.scrollbarXTop + t.scrollTop, s.css(e.scrollbarXRail, n);var r = { top: t.scrollTop, height: e.railYHeight };e.isScrollbarYUsingRight ? e.isRtl ? r.right = e.contentWidth - (e.negativeScrollAdjustment + t.scrollLeft) - e.scrollbarYRight - e.scrollbarYOuterWidth : r.right = e.scrollbarYRight - t.scrollLeft : e.isRtl ? r.left = e.negativeScrollAdjustment + t.scrollLeft + 2 * e.containerWidth - e.contentWidth - e.scrollbarYLeft - e.scrollbarYOuterWidth : r.left = e.scrollbarYLeft + t.scrollLeft, s.css(e.scrollbarYRail, r), s.css(e.scrollbarX, { left: e.scrollbarXLeft, width: e.scrollbarXWidth - e.railBorderXWidth }), s.css(e.scrollbarY, { top: e.scrollbarYTop, height: e.scrollbarYHeight - e.railBorderYWidth });
    }var l = t("../lib/helper"),
        i = t("../lib/class"),
        s = t("../lib/dom"),
        a = t("./instances"),
        c = t("./update-scroll");e.exports = function (t) {
      var e = a.get(t);e.containerWidth = t.clientWidth, e.containerHeight = t.clientHeight, e.contentWidth = t.scrollWidth, e.contentHeight = t.scrollHeight;var n;t.contains(e.scrollbarXRail) || (n = s.queryChildren(t, ".ps-scrollbar-x-rail"), n.length > 0 && n.forEach(function (t) {
        s.remove(t);
      }), s.appendTo(e.scrollbarXRail, t)), t.contains(e.scrollbarYRail) || (n = s.queryChildren(t, ".ps-scrollbar-y-rail"), n.length > 0 && n.forEach(function (t) {
        s.remove(t);
      }), s.appendTo(e.scrollbarYRail, t)), !e.settings.suppressScrollX && e.containerWidth + e.settings.scrollXMarginOffset < e.contentWidth ? (e.scrollbarXActive = !0, e.railXWidth = e.containerWidth - e.railXMarginWidth, e.railXRatio = e.containerWidth / e.railXWidth, e.scrollbarXWidth = r(e, l.toInt(e.railXWidth * e.containerWidth / e.contentWidth)), e.scrollbarXLeft = l.toInt((e.negativeScrollAdjustment + t.scrollLeft) * (e.railXWidth - e.scrollbarXWidth) / (e.contentWidth - e.containerWidth))) : e.scrollbarXActive = !1, !e.settings.suppressScrollY && e.containerHeight + e.settings.scrollYMarginOffset < e.contentHeight ? (e.scrollbarYActive = !0, e.railYHeight = e.containerHeight - e.railYMarginHeight, e.railYRatio = e.containerHeight / e.railYHeight, e.scrollbarYHeight = r(e, l.toInt(e.railYHeight * e.containerHeight / e.contentHeight)), e.scrollbarYTop = l.toInt(t.scrollTop * (e.railYHeight - e.scrollbarYHeight) / (e.contentHeight - e.containerHeight))) : e.scrollbarYActive = !1, e.scrollbarXLeft >= e.railXWidth - e.scrollbarXWidth && (e.scrollbarXLeft = e.railXWidth - e.scrollbarXWidth), e.scrollbarYTop >= e.railYHeight - e.scrollbarYHeight && (e.scrollbarYTop = e.railYHeight - e.scrollbarYHeight), o(t, e), e.scrollbarXActive ? i.add(t, "ps-active-x") : (i.remove(t, "ps-active-x"), e.scrollbarXWidth = 0, e.scrollbarXLeft = 0, c(t, "left", 0)), e.scrollbarYActive ? i.add(t, "ps-active-y") : (i.remove(t, "ps-active-y"), e.scrollbarYHeight = 0, e.scrollbarYTop = 0, c(t, "top", 0));
    };
  }, { "../lib/class": 2, "../lib/dom": 3, "../lib/helper": 6, "./instances": 18, "./update-scroll": 20 }], 20: [function (t, e, n) {
    "use strict";
    var r,
        o,
        l = t("./instances"),
        i = function i(t) {
      var e = document.createEvent("Event");return e.initEvent(t, !0, !0), e;
    };e.exports = function (t, e, n) {
      if ("undefined" == typeof t) throw "You must provide an element to the update-scroll function";if ("undefined" == typeof e) throw "You must provide an axis to the update-scroll function";if ("undefined" == typeof n) throw "You must provide a value to the update-scroll function";"top" === e && n <= 0 && (t.scrollTop = n = 0, t.dispatchEvent(i("ps-y-reach-start"))), "left" === e && n <= 0 && (t.scrollLeft = n = 0, t.dispatchEvent(i("ps-x-reach-start")));var s = l.get(t);"top" === e && n >= s.contentHeight - s.containerHeight && (n = s.contentHeight - s.containerHeight, n - t.scrollTop <= 1 ? n = t.scrollTop : t.scrollTop = n, t.dispatchEvent(i("ps-y-reach-end"))), "left" === e && n >= s.contentWidth - s.containerWidth && (n = s.contentWidth - s.containerWidth, n - t.scrollLeft <= 1 ? n = t.scrollLeft : t.scrollLeft = n, t.dispatchEvent(i("ps-x-reach-end"))), r || (r = t.scrollTop), o || (o = t.scrollLeft), "top" === e && n < r && t.dispatchEvent(i("ps-scroll-up")), "top" === e && n > r && t.dispatchEvent(i("ps-scroll-down")), "left" === e && n < o && t.dispatchEvent(i("ps-scroll-left")), "left" === e && n > o && t.dispatchEvent(i("ps-scroll-right")), "top" === e && (t.scrollTop = r = n, t.dispatchEvent(i("ps-scroll-y"))), "left" === e && (t.scrollLeft = o = n, t.dispatchEvent(i("ps-scroll-x")));
    };
  }, { "./instances": 18 }], 21: [function (t, e, n) {
    "use strict";
    var r = t("../lib/helper"),
        o = t("../lib/dom"),
        l = t("./instances"),
        i = t("./update-geometry"),
        s = t("./update-scroll");e.exports = function (t) {
      var e = l.get(t);e && (e.negativeScrollAdjustment = e.isNegativeScroll ? t.scrollWidth - t.clientWidth : 0, o.css(e.scrollbarXRail, "display", "block"), o.css(e.scrollbarYRail, "display", "block"), e.railXMarginWidth = r.toInt(o.css(e.scrollbarXRail, "marginLeft")) + r.toInt(o.css(e.scrollbarXRail, "marginRight")), e.railYMarginHeight = r.toInt(o.css(e.scrollbarYRail, "marginTop")) + r.toInt(o.css(e.scrollbarYRail, "marginBottom")), o.css(e.scrollbarXRail, "display", "none"), o.css(e.scrollbarYRail, "display", "none"), i(t), s(t, "top", t.scrollTop), s(t, "left", t.scrollLeft), o.css(e.scrollbarXRail, "display", ""), o.css(e.scrollbarYRail, "display", ""));
    };
  }, { "../lib/dom": 3, "../lib/helper": 6, "./instances": 18, "./update-geometry": 19, "./update-scroll": 20 }] }, {}, [1]);