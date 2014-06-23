// Generated by CoffeeScript 1.7.0

/*
 * jQuery Presto Plugin v1.0.0.alpha
 * http://matiasgagliano.github.com/presto/
 *
 * Copyright 2014, Matías Gagliano.
 * Dual licensed under the MIT or GPLv3 licenses.
 * http://opensource.org/licenses/MIT
 * http://opensource.org/licenses/GPL-3.0
 *
 */

(function() {
  "use strict";
  var $, Presto, canCreateURL, canReadFile, console, createBlobURL, defaults, errors, isFileInput, pluginName, revokeBlobURL, scope,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = jQuery;

  pluginName = 'presto';

  scope = 'presto';

  errors = {
    1: {
      n: 1,
      message: "The image couldn't be displayed."
    },
    2: {
      n: 2,
      message: "The image couldn't be uploaded."
    },
    3: {
      n: 3,
      message: "Image format not supported."
    }
  };

  defaults = {
    revokeUrls: true,
    iframe: false,
    before: null,
    beforeEach: null,
    success: null,
    error: null,
    always: null,
    after: null
  };

  console = window.console || {
    log: function() {}
  };

  isFileInput = function(input) {
    return input.prop('tagName') === 'INPUT' && input.attr('type') === 'file' || !!console.log('Presto error: Not a file input.');
  };

  createBlobURL = (window.URL && URL.createObjectURL.bind(URL)) || (window.webkitURL && webkitURL.createObjectURL.bind(webkitURL)) || window.createObjectURL;

  revokeBlobURL = (window.URL && URL.revokeObjectURL.bind(URL)) || (window.webkitURL && webkitURL.revokeObjectURL.bind(webkitURL)) || window.revokeObjectURL;

  canCreateURL = $.type(createBlobURL) === 'function';

  canReadFile = !!window.FileReader;

  Presto = (function() {
    function Presto(input, options) {
      this._doMagic = __bind(this._doMagic, this);
      var func, _i, _len, _ref;
      this.input = input = $(input);
      if (!isFileInput(input)) {
        return;
      }
      this.op = $.extend(true, {}, defaults, options, input.data(pluginName));
      _ref = ['before', 'beforeEach', 'success', 'error', 'always', 'after'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        func = _ref[_i];
        if ($.type(this.op[func]) !== 'function') {
          this.op[func] = null;
        }
      }
      if (!(this.op.iframe && this.op.iframe.url)) {
        this.op.iframe = false;
      }
      if (this.op.iframe) {
        $.extend(this.op.iframe, {
          dataType: 'iframe json',
          fileInputs: this.input
        });
      }
      this._castImgSpell = this._chooseSpell();
      if (!this._castImgSpell) {
        return;
      }
      this.enabled = true;
      this.input.on("change." + scope, this._doMagic);
    }

    Presto.prototype._chooseSpell = function() {
      if (canCreateURL) {
        return this._createURL;
      } else if (canReadFile) {
        return this._readFile;
      } else if (this.op.iframe) {
        return this._iframeTransport;
      } else {
        return console.log('Presto error: No method to display images.') || null;
      }
    };

    Presto.prototype._doMagic = function() {
      var total;
      if (!this.enabled) {
        return;
      }
      if (this.op.before && this.op.before(this.input) === false) {
        return;
      }
      total = this.input.val() ? 1 : 0;
      total = this.input[0].files != null ? this.input[0].files.length : void 0;
      if (total === 0) {
        return;
      }
      this.total = total;
      this.count = 0;
      return this._castImgSpell();
    };

    Presto.prototype._summonImg = function(src, data) {
      var img;
      img = $('<img>');
      img.on('load', (function(_this) {
        return function() {
          if (canCreateURL && _this.op.revokeURL) {
            revokeBlobURL(src);
          }
          return _this._success(img, data);
        };
      })(this));
      img.on('error', (function(_this) {
        return function() {
          if (canCreateURL && _this.op.revokeURL) {
            revokeBlobURL(src);
          }
          return _this._error(3);
        };
      })(this));
      return img.attr('src', src);
    };

    Presto.prototype._success = function(img, data) {
      this.count++;
      if (this.op.success) {
        this.op.success(img, data, this.input);
      }
      if (this.op.always) {
        this.op.always(this.input);
      }
      if (this.count === this.total && this.op.after) {
        return this.op.after(this.input);
      }
    };

    Presto.prototype._error = function(number) {
      this.count++;
      if (this.op.error) {
        this.op.error(errors[number], this.input);
      }
      if (this.op.always) {
        this.op.always(this.input);
      }
      if (this.count === this.total && this.op.after) {
        return this.op.after(this.input);
      }
    };

    Presto.prototype._createURL = function() {
      var file, _i, _len, _ref, _results;
      _ref = this.input[0].files;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (this.op.beforeEach && this.op.beforeEach(file, this.input) === false) {
          continue;
        }
        _results.push(this._summonImg(createBlobURL(file), file));
      }
      return _results;
    };

    Presto.prototype._readFile = function() {
      var file, _i, _len, _ref, _results;
      _ref = this.input[0].files;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (this.op.beforeEach && this.op.beforeEach(file, this.input) === false) {
          continue;
        }
        _results.push(this._read(file));
      }
      return _results;
    };

    Presto.prototype._read = function(file) {
      var reader;
      reader = new FileReader();
      reader.onload = (function(_this) {
        return function() {
          return _this._summonImg(reader.result, file);
        };
      })(this);
      reader.onerror = (function(_this) {
        return function() {
          return _this._error(1);
        };
      })(this);
      return reader.readAsDataURL(file);
    };

    Presto.prototype._iframeTransport = function() {
      var request;
      if (this.op.beforeEach && this.op.beforeEach(this.input.val(), this.input) === false) {
        return;
      }
      request = $.ajax(this.op.iframe);
      request.done((function(_this) {
        return function(data) {
          return _this._summonImg(data.src, data);
        };
      })(this));
      return request.fail((function(_this) {
        return function() {
          return _this._error(2);
        };
      })(this));
    };

    Presto.prototype.enable = function() {
      return this.enabled = true;
    };

    Presto.prototype.disable = function() {
      return this.enabled = false;
    };

    Presto.prototype.remove = function() {
      this.input.off("change." + scope, this._doMagic);
      return this.input.removeData(pluginName + 'Instance');
    };

    return Presto;

  })();

  $.fn[pluginName] = function(options) {
    if (typeof options !== 'string') {
      return this.each(function() {
        var presto;
        if (!$.data(this, pluginName + 'Instance')) {
          presto = new Presto(this, options);
          return $.data(this, pluginName + 'Instance', presto);
        }
      });
    } else if (options === 'enable' || options === 'disable' || options === 'remove') {
      return this.each(function() {
        var presto;
        presto = $.data(this, pluginName + 'Instance');
        if (presto != null) {
          return presto[options]();
        }
      });
    }
  };

}).call(this);
