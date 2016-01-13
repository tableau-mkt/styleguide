/**
 * Helper functions for all components.
 */

var Tabia = Tabia || {};

Tabia.yo = function (content) {
  window.console && console.log(content || "Yo");
};

Tabia.later = function (func, time) {
  setTimeout(func, time || 2000);
};

(function ($) {

  /**
   * Smooth Scroll to top of an element
   * @param  {jQuery Object} $element - Element to scroll to the top of
   * @param  {integer} duration       - Length of the animation
   * @param  {integer} offset         - Any offset to account for sticky elements
   * @param  {boolean} onlyUp         - Whether scroll should only happen if the scroll direction is up
   */
  Tabia.smoothScrollTop = function ($element, duration, offset, onlyUp) {
    duration = duration || 500;
    offset = offset || 0;
    onlyUp = onlyUp || false;

    var elementTop = $element.offset().top,
        pageTop = $(window).scrollTop(),
        scroll = !onlyUp;

    if (onlyUp && pageTop > elementTop) {
      scroll = true;
    }

    if (scroll) {
      $('body, html').animate({
        scrollTop: elementTop - offset
      }, duration);
    }
  }


  /**
   * A re-implementation of jQuery's slideDown() and slideUp() that animates the
   *  height of an element without requiring the use of display: none;
   *
   *  Helpful when needing to hide a video player while maintaining control via an
   *  API.
   *
   *  The element must have "overflow: hidden;" set in CSS for this to work properly.
   *  In order to have the element hidden by default, you mist also set "height: 0;"
   *  in CSS as well.
   */
  $.fn.slideHeight = function (direction, options) {
    var $el = $(this),
        options = options || {duration: 400, easing: "swing"};

    if (direction === "down") {
      var $elClone = $el.clone().show().css({"height":"auto"}).appendTo($el.parent()),
          elHeight = $elClone.outerHeight(true);

      // Removing clone needed for calculating height.
      $elClone.remove();

      $el.animate({
          height: elHeight
        },
        options.duration,
        options.easing,
        function() {
          // Reset the height to auto to ensure the height remains accurate on viewport resizing
          $el.css('height', 'auto');
        }
      );
    }

    if (direction === "up") {
      $el.animate({
        height: 0
      }, options);
    }

    return this;
  };


  /**
   * General Brightcove video embed binding.
   *
   * This is a generic setup for in-page embedded players. We can bind a VideoJS wrapped object to a data property on the player DOM element, allowing us to control players by selecting the DOM element and accessing the bcPlayer data property. E.g.:
   *
   * $('#my-playerthing').data('bcPlayer').play();
   * $('#my-playerthing').data('bcPlayer').pause();
   *
   * A more complicated example that retrieves the full video metadata via the Brightcove catalog method:
   *
   * var $video = $('#my-player-object');
   *
   * $video.data('bcPlayer').catalog.getVideo($video.data('videoId'),
   * function(error, data) {
   *   // Do things with the return.
   *   console.log(data);
   * });
   *
   * This presumes that the Brightcove API script has been loaded on page.
   */
  $(document).ready(function () {
    // Use the default Brightcove embed selector.
    var $players = $('.video-js');

    // Bail early if there aren't even any players.
    if (!$players.length || !typeof window.videojs === 'function') {
      return;
    }

    $players.each(function setupBrightcoveInstances() {
      var $this = $(this);

      // Pass in the DOM element, not the jQuery wrapped object.
      window.videojs($this[0]).ready(function prepareBrightcoveInstance() {
        $this.data('bcPlayer', this);
        $(document).trigger('brightcove:ready', $this.attr('id'));
      });
    });
  });

})(jQuery, window);
;
/**
 * Content Reveal utility.
 *
 * Set a wrapper around content as a revealable region. Assign a "trigger"
 * element as the toggle to expand and collapse the content region.
 *
 * Options:
 *   triggers - Required - [jQuery Ojbect] - element(s) to be used as a trigger
 *   contents - Optional - [jQuery Object] - element(s) to use as content wrapper
 *   closeLink - Optional - [boolean] - whether a close link should be added
 *   animation - Optional - [object] - animation settings for expanding/collapsing
 *
 * Usage:
 *  $('.contents-wrapper-selector').contentReveal({
 *    triggers: $('.triggers-selector')
 *  });
 *
 * @TODO: Can still use some cleanup and work to be a more agnostic plugin
 */

(function ($) {
  $.fn.contentReveal = function(options) {
    // Default settings
    var settings = $.extend({
      contents: $(this),
      closeLink: true,
      animation: {
        duration: 1000,
        easing: "easeInOutQuart"
      }
    }, options);

    if (settings.triggers) {
      // Run setup
      setup();

      settings.triggers.on('click.reveal', function(e) {
        var state = $(this).data('revealState');

        if (state == 'closed') {
          showContent(this);
        } else if (state == 'open') {
          hideContent(this);
        }
        e.preventDefault();
      });

      $('.reveal__close').on('click.reveal', function(e) {
        hideContent($(this).parent('.reveal__content').data('revealTrigger'));
        e.preventDefault();
      });

      // Trigger auto-reveal
      autoReveal();
    }

    // Show the target content
    function showContent(trigger, customAnimation) {
      var data = $(trigger).data(),
          $trigger = $(trigger),
          $target = $('#' + data.revealTarget),
          $curtain = $('#' + data.revealCurtain),
          hideText = data.revealHideText,
          type = data.revealType,
          media = data.revealMedia,
          scrollBehavior = data.revealScroll,
          $scrollTarget,
          scrollOffset = $('.sticky-wrapper .stuck').outerHeight(true),
          expandToggle = data.revealExpandToggle;

      customAnimation = customAnimation || settings.animation;

      $trigger.data('revealState', 'open').addClass('is-open');
      if (hideText != "") {
        $trigger.text(hideText);
      }

      // Video players break when we display none so using a custom reimplementation
      // of slideDown. See helpers.js.
      $target.slideHeight('down', customAnimation);

      $curtain.slideUp(customAnimation);

      if (media == "video") {
        var videoObj = $target.find('.reveal-video--brightcove')[0],
            player = videojs(videoObj);

        setTimeout(function() {
          player.play();
        }, customAnimation.duration/2);
      }

      // Scroll when reveal is clicked open.
      if (scrollBehavior) {
        switch (scrollBehavior) {
          case 'trigger':
            $scrollTarget = $trigger;
            break;
          case 'target':
            $scrollTarget = $target;
            break;
          default:
            $scrollTarget = $('#' + scrollBehavior);
            break;
        }
        Tabia.smoothScrollTop($scrollTarget, customAnimation.duration, scrollOffset, false);
      }
      else if ($curtain.length) {
        // Use curtain for scroll.
        Tabia.smoothScrollTop($curtain, customAnimation.duration, scrollOffset, true);
      }

      // Special expand icon handling
      if (expandToggle) {
        $trigger.addClass('link--collapse').removeClass('link--expand');
      }
    }

    // Hide the target content
    function hideContent(trigger) {
      var $trigger = $(trigger),
          data = $trigger.data(),
          $target = $('#' + data.revealTarget),
          $curtain = $('#' + data.revealCurtain),
          showText = data.revealShowText,
          media = data.revealMedia,
          expandToggle = data.revealExpandToggle;

      $trigger.data('revealState', 'closed').removeClass('is-open');

      if (typeof showText !== 'undefined') {
        $trigger.text(showText);
      }

      $target.slideHeight('up', settings.animation);

      $curtain.slideDown(settings.animation);

      if (media == "video") {
        var player = videojs($target.find('.reveal-video--brightcove')[0]);
        player.pause();
      }

      // Special expand icon handling
      if (expandToggle) {
        $trigger.addClass('link--expand').removeClass('link--collapse');
      }
    }

    // Hand-full of setup tasks
    function setup() {
      // Add reveal-state data
      settings.triggers.data('revealState', 'closed');

      settings.triggers.each(function(index, el) {
        var $trigger = $(this),
            $target = $('#' + $trigger.data('revealTarget')),
            showText = $trigger.text();

        // Link content back to it's corresponding trigger
        $target.data('revealTrigger', $trigger);

        // Special handling for links with an expand icon.
        if ($trigger.hasClass('link--expand')) {
          $trigger.data('revealExpandToggle', true);
        }

        // Save original trigger text
        if (typeof $trigger.data('revealHideText') !== undefined) {
          settings.triggers.data('revealShowText', showText);
        }
      });

      // // Set initial margin on content if there is a curtain
      // // @TODO this is for naimating the reveal as if the content is
      // // stationary and the elements above and below are revealing it.
      // // Currently, the content moves up as the curtain slides up.
      // settings.contents.each(function(index, el) {
      //   var data = $($(this).data('revealTrigger')).data(),
      //       $curtain = $("#" + data.revealCurtain);

      //   if ($curtain.length) {
      //     $(this).css('margin-top', -$curtain.outerHeight(true));
      //   }
      // });

      // Add a close icon to each content continer
      if (settings.closeLink) {
        settings.contents.prepend($('<a href="#" class="reveal__close" href="#"><i class="icon icon--close-window-style2"></i></a>'));
      }
    }

    function autoReveal() {
      var hash = window.location.hash;

      if (hash.length && settings.contents.is(hash)) {
        var $trigger = $(hash).data('revealTrigger');

        // Prevent scrolling to the anchor...
        setTimeout(function() {
          window.scrollTo(0, 0);
        }, 1);

        showContent($trigger, {duration: 0});
      }
    }

    return this;
  }
})(jQuery);
;
'use strict';

/**
 * jQuery Dynamic Select Filters
 *
 * Given a set of input radio options, generate a corresponding select list per
 * option group and binds change events so that using the select triggers the
 * original option inputs, which may now be hidden.
 *
 * The javascript init, with options thrown in:
 *

  $('.filter-set').dynamicSelectFilters({
    container: '.mobile-filter-set',
    groupHeading: '.filter-set__heading',
    onCreateSelectCallback: function () {
      // 'this' is the jQuery wrapped select element, created per group set.
      this.wrap('<div class="form-field__wrapper"><div class="form__select"></div></div>');

      // Perform additional event bindings as needed.
      this.on('click.namespace', function myCoolEvent(e) {
        doMyThings();
      });
    }
  });

 */
(function ($) {
  // Set plugin method name and defaults
  var pluginName = 'dynamicSelectFilters',
      defaults = {
        // A DOM selector of the container to place the dynamic <select> elements.
        // If not defined, one will be generated and placed before the first
        // option group found.
        container: false,
        // An optional DOM selector to provide a default option in the select
        // element. Should be located inside the grouping DOM element.
        groupHeading: '',
        // Callback function after each select is created. Passes in the newly
        // created select jQuery element to perform any additional modifications.
        onCreateSelectCallback: null
      };

  // plugin constructor
  function Plugin (element, options) {
    var $element = $(element);

    // Set up internals for tracking, just in case.
    this._name = pluginName;
    this._defaults = defaults;
    this._element = $element;

    // Use the init options.
    this.options = $.extend(true, defaults, options);

    // Do it now.
    this.init();
  }

  Plugin.prototype.init = function () {
    var _options = this.options,
        $radioGroups = this._element,
        $selectContainer = $(_options.container);

    if (!$radioGroups.length) {
      return;
    }

    // If no container for the select is defined, add one.
    if (!$selectContainer.length) {
      $radioGroups.eq(0).before('<div class="dynamic-select-container"></div>');
      $selectContainer = $radioGroups.eq(0).prev('.dynamic-select-container');
    }

    $radioGroups.each(function initSelectDuplication() {
      var $this = $(this),
          // Grouping label, generated as a disabled option within the select to
          // act as a label.
          groupHeading = $this.find(_options.groupHeading),
          $input = $this.find('input[type="radio"]'),
          $label = $this.find('label'),
          $select = $('<select>'),
          selectOptions = '';

      if (!$input.length) {
        return;
      }

      // If given a groupHeading element, use it to create a placeholder-esque
      // option for the current <select>
      if (groupHeading.length) {
        selectOptions = '<option class="select-placeholder" disabled selected>' + groupHeading.text().trim().replace(/\:$/, '') + '</option>';
      }

      // Continue building out the select options using all the radio/checkbox inputs.
      $input.each(function buildSelectOptions() {
        var $this = $(this),
            $label = $this.next('label'),
            triggerElement = '#' + $this.attr('id').trim(),
            isSelected = ($this.is(':checked')) ? 'selected' : '';

        // Let the option value be the input element to trigger, by DOM id.
        selectOptions += '<option value="' + triggerElement + '" ' + isSelected + '>' + $label.text() + '</option>';

        // Sync the select state when the option input is used.
        $this.on('change.dynamicfilter', function twoWayValueBind() {
          $select.find('option[value="' + triggerElement + '"]').prop('selected', true);
        });
      });

      // Flesh out the select, and enact bindings.
      $select.html(selectOptions)
        .on('change.dynamicfilter', function bindDynamicSelectActions() {
          var $triggerEl = $($(this).val());

          $triggerEl.prop('checked', true);
        })
        .appendTo($selectContainer);

        // Apply any per instance callbacks.
        if (typeof _options.onCreateSelectCallback === 'function') {
          _options.onCreateSelectCallback.call($select);
        }
    });
  };

  // Lightweight constructor, preventing against multiple instantiations
  $.fn[pluginName] = function (options) {
    return this.each(function initPlugin() {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName,
        new Plugin(this, options));
      }
    });
  };
})(jQuery);

;
"use strict";

/**
 * jQuery Float Labels
 *
 * A simple plugin to enable the floating label pattern. It makes no attempt to
 * control any interactions of the label within js. It just binds to events as
 * needed and triggers configurable CSS classes.
 *
 * The jQuery method is called on the wrapper element that contains both the field
 * and the label. It might look like:
 *
 * <div class="field__wrapper">
 *   <label class="field__label" for="this-field">My Super Label</label>
 *   <input name="this-field">
 * </div>
 *
 * The javascript init, with options thrown in:
 * $('.field__wrapper').floatLabel({
 *   activeClass: 'activated',
 *   focusClass: 'zenified'
 * });
 */
(function ($) {
  $(document).ready(function () {

    // Set plugin method name and defaults
    var pluginName = 'floatLabel',
        defaults = {
          // In case you want to preserve labels as visible for no js, or old
          // IE users.
          wrapperInitClass: 'has-float-label',
          // For a custom label selector, if you have multiple labels, for some
          // reason.
          labelSelector: false,
          // Class given to label when its field has a non-null value. Toggled
          // when the value is empty / falsy.
          activeClass: 'is-active',
          // Class given to input when it has an empty value.
          emptyClass: 'is-empty',
          // Class given to label when its field is focused. Toggled when it
          // loses focus.
          focusClass: 'has-focus'
        };

    // plugin constructor
    function Plugin (element, options) {
      var $element = $(element);

      // Set up internals for tracking, just in case.
      this._name = pluginName;
      this._defaults = defaults;
      this._element = $element;

      // Use the init options.
      this.options = $.extend(true, defaults, options);

      // Set up a couple of internals to keep track of input and label.
      this._wrapper = $element;
      this._input = this._findInput($element);
      this._label = this._findLabel($element);

      // Do it now.
      this.init();
    }

    // Utility: find a input that we want to alter the label for.
    Plugin.prototype._findInput = function($el) {
      var $textInputs = $el.find('input, textarea').not('[type="checkbox"], [type="radio"]');
      // The regular text input types.
      if ($textInputs.length) {
        return $textInputs;
      }
      // Try for select elements.
      else {
        return $el.find('select');
      }
    };

    // Utility: find a label in the field wrapper element.
    Plugin.prototype._findLabel = function(el) {
      // If a custom selector is provided
      if (this.options.labelSelector) {
        return $(el).find(this.options.labelSelector);
      }

      // Just try a label element.
      return $(el).find('label');
    };

    Plugin.prototype._checkValue = function () {
      var isEmpty = this._input.val() === '' || this._input.val() === '_none';

      // On empty value, add state classes to input and label.
      this._input.toggleClass(this.options.emptyClass, isEmpty);
      this._label.toggleClass(this.options.activeClass, !isEmpty);
    };

    Plugin.prototype._onKeyUp = function () {
      this._checkValue();
    };

    Plugin.prototype._onFocus = function () {
      this._label.addClass(this.options.focusClass);
      this._onKeyUp();
    };

    Plugin.prototype._onBlur = function () {
      this._label.removeClass(this.options.focusClass);
      this._onKeyUp();
    };

    Plugin.prototype.init = function () {
      // Mark the element as having been init'ed.
      this._element.addClass(this.options.wrapperInitClass);

      // Check value for initial active class.
      this._checkValue();

      // Event bindings to the input element with floatLabels namespace.
      this._input
        .off('keyup.floatLabels change.floatLabels')
        .on('keyup.floatLabels change.floatLabels', $.proxy(this._onKeyUp, this));
      this._input
        .off('blur.floatLabels')
        .on('blur.floatLabels', $.proxy(this._onBlur, this));
      this._input
        .off('focus.floatLabels')
        .on('focus.floatLabels', $.proxy(this._onFocus, this));
    };

    // Lightweight constructor, preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
      return this.each(function initPlugin() {
        // Allow the plugin to be instantiated more than once. Event handlers
        // will be re-bound to avoid issues.
        $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
      });
    };

  });
})(jQuery);
;
/**
 * Tabs content utility
 *
 * Create interactive tabs that switch between different visible content when
 * tabs are clicked.
 *
 * Options:
 *   contents - Required - [jQuery Object] - element(s) to use as content wrapper
 *   tabLinks - Optional - [jQuery Ojbect] - element(s) to be used as a trigger
 *   wrapper  - Optional - [jQuery Object] - Wrapping element around contents
 *     and tabLinks. This defaults to .tabs__wrapper, but may be overidden for
 *     specific cases.
 *   triggers - Optional - [jQuery Object] - additional elements (other than tabs)
 *     used for triggering the display of specific tabs
 *   animation - Optional - [object] - animation settings for expanding/collapsing
 *
 * Usage:
 *   $('.tab-links-selector').tabs({
 *     contents: $('.tab-contents-wrapper-selector'),
 *     triggers: $('.tab-triggers-selector')
 *   });
 *
 * @TODO: Can still use some cleanup and work to be a more agnostic plugin
 */

(function ( $ ) {
  $.fn.tabs = function(options) {
    // Default settings
    var settings = $.extend(true, {
      tabLinks: $(this),
      wrapper: $('.tabs__wrapper'),
      animation: {
        duration: 1000,
        easing: "easeInOutQuart"
      }
    }, options);

    if (settings.tabLinks.length && settings.contents.length) {
      settings.tabLinks.on('click.tabs', function(e) {
        if (!$(this).hasClass('is-active')) {
          var $link = $(this),
              $content = $('#' + $link.data('tab-content')),
              $wrapper = $link.closest(settings.wrapper),
              $previousLink = $link.closest("ul").find('a.is-active'),
              $previousContent = $('#' + $previousLink.data('tab-content')),
              previousContentHeight = $previousContent.outerHeight(true),
              $flyoutContainer = $content.closest('.flyout__content'),
              $contentClone = $content.clone().show().css({"height":"auto"}).appendTo($content.parent()),
              contentHeight = $contentClone.outerHeight(true);

          $contentClone.remove();

          // Manage active class
          settings.tabLinks.add($wrapper.find(settings.contents)).removeClass('is-active');
          $link.add($content).addClass('is-active');

          // Animate the height transition between tabs
          $content.height(previousContentHeight).animate({
            height: contentHeight,
          }, settings.animation);

          // Manage flyout container if tabs are within a flyout
          if ($flyoutContainer.length) {
            var $parent = $flyoutContainer.offsetParent(),
                parentPadding = $parent.outerHeight() - $parent.height(),
                flyoutHeight = $flyoutContainer.outerHeight(true),
                heightChange = contentHeight - previousContentHeight;

            // Adjust height of parent
            $parent.animate({
              height: flyoutHeight - parentPadding + heightChange,
            }, settings.animation);
          }
        }
        e.preventDefault();
      });

      if (settings.triggers) {
        settings.triggers.on('click.tabs-trigger', function(e) {
          var $link = settings.tabLinks.filter('[data-tab-content="' + $(this).data('tab-content') + '"]'),
              $content = $('#' + $(this).data('tab-content'));

          // Manage active class
          settings.tabLinks.add(settings.wrapper.find(settings.contents)).removeClass('is-active');
          $link.add($content).addClass('is-active');
        });
      }
    }

    return this;
  }
}( jQuery ));
;
/**
 * Simple content search behaviors.
 *
 * - Handle down/up arrow keys on pick list
 */

// Loose augmentation pattern. Creates top-level Tabia variable if it doesn't
// already exist.
var Tabia = Tabia || {};

// Create a base for this module's data and functions.
Tabia.contentSearch = {};

/**
 * DOM-ready callback.
 *
 * @param {Object} $
 *   jQuery
 */
Tabia.contentSearch.ready = function ($) {
  // Set up all the section search components on the page.
  $('.content-search').not('.contextual-search').each(function () {
    var $this = $(this);

    // Attach keydown handler with context.
    $this.find('.content-search__input').keydown(
      $.proxy(Tabia.contentSearch.keydownHandler, $this)
    );

    // Attach reset handler.
    $this.find('.content-search__reset').click(function (event) {
      // Allow overriding.
      var $resetEvent = $.Event('contentSearch:reset');
      $this.trigger($resetEvent);
      if (!$resetEvent.isDefaultPrevented()) {
        // Reset/empty the form, via AJAX.
        Tabia.contentSearch.resetForm($this);
      }
    });
  });
};

/**
 * Carry out the form reset.
 *
 * @param {jQuery Object} $search
 */
Tabia.contentSearch.resetForm = function($search) {
  $search.removeClass('is-populated');
  $search.find('.content-search__input').val('');
  $search.find('.content-search__submit').click();
};

/**
 * Carry out the form submit.
 *
 * @param {jQuery Object} $search
 */
Tabia.contentSearch.submitForm = function($search) {
  if ($search.find('.content-search__input').val() !== '') {
    $search.addClass('is-populated');
    $search.find('.content-search__submit').click();
  }
};

/**
 * Keydown handler.
 *
 * @param {Object} event
 */
Tabia.contentSearch.keydownHandler = function (event) {
  var $search = $(this[0]),
      $submitEvent = $.Event('contentSearch:submit');

  switch (event.which) {
    case 13: // ENTER
      // Allow overriding.
      $(document).trigger($submitEvent);
      // Submit the form, via AJAX.
      if (!$submitEvent.isDefaultPrevented()) {
        Tabia.contentSearch.submitForm($search);
      }
      event.preventDefault();
      break;
  }
};

// Attach our DOM-ready callback.
jQuery(Tabia.contentSearch.ready);
;
/**
 * Section search behaviors.
 *
 * - Toggle .is-open state on component, e.g., upon AJAX search result.
 * - Handle down/up arrow keys on pick list
 */

// Loose augmentation pattern. Creates top-level Tabia variable if it doesn't
// already exist.
var Tabia = Tabia || {};

// Create a base for this module's data and functions.
Tabia.contextualSearch = {};

/**
 * DOM-ready callback.
 *
 * @param {Object} $
 *   jQuery
 */
Tabia.contextualSearch.ready = function ($) {
  // Set up all the section search components on the page.
  $('.contextual-search').each(function () {
    var $this = $(this),
        // Initialze a data object for this instance.
        search = {
          selectionIndex: -1,
          // Save a reference to this element.
          element: this
        };
    // Attach keydown handler with our data context.
    $this.keydown($.proxy(Tabia.contextualSearch.keydownHandler, search));
    // Attach UI click handler. Don't propagate clicks to document.
    $this.find('.contextual-search__ui').click(function (event) {
      event.stopPropagation();
    });
    // Attach document click handler to close (blur) the results list.
    $(document).click(function contextualSearchBlur() {
      $(search.element).removeClass('is-open');
    });
    // Attach reset handler.
    $this.find('.content-search__reset').click(function contextualSearchReset() {
      $(search.element).removeClass('is-open');
    });
  });
};

/**
 * Keydown handler.
 *
 * @param {Object} event
 */
Tabia.contextualSearch.keydownHandler = function (event) {
  // Only handle keys when the results list is open.
  if (!$(this.element).hasClass('is-open')) {
    return;
  }

  switch (event.which) {
    case 38: // UP
      Tabia.contextualSearch.select.call(this, -1);
      break;
    case 40: // DOWN
      Tabia.contextualSearch.select.call(this, 1);
      break;
    case 27: // ESCAPE
      $(this.element).removeClass('is-open');
      break;
    case 13: // ENTER
      Tabia.contextualSearch.select(0);
      this.$rows.get(this.selectionIndex).click();
      event.preventDefault();
      break;
  }
};

/**
 * Set the row selection up/current/down.
 *
 * @param {Number} direction
 *   -1, 0, or 1
 */
Tabia.contextualSearch.select = function (direction) {
  this.$rows = $(this.element).find('.contextual-search__results-row');
  this.selectionIndex += direction;
  this.selectionIndex = Math.max(this.selectionIndex, 0);
  this.selectionIndex = Math.min(this.selectionIndex, this.$rows.length - 1);
  this.$rows.removeClass('is-selected')
    .eq(this.selectionIndex).addClass('is-selected');
};

// Attach our DOM-ready callback.
jQuery(Tabia.contextualSearch.ready);
;
// Loose augmentation pattern. Creates top-level Tabia variable if it doesn't
// already exist.
var Tabia = Tabia || {};

Tabia.form = {};

Tabia.form.initFloatLabels = function ($elements) {
  $elements.find('input, select, textarea')
    .not('[type="checkbox"], [type="radio"]')
    .closest('.form-field')
    .floatLabel({
      labelSelector: '.form-field__label'
    });
};

$(document).ready(function () {
  Tabia.form.initFloatLabels($('.has-float-label'));
});

$(document).on('initFloatLabels', function (e) {
  Tabia.form.initFloatLabels($(e.target));
});
;
/**
 * Responsive filters interaction
 *
 * See jquery.dynamicSelectFilters.js
 */
(function ($) {
  $(document).ready(function () {
    $('.responsive-filter').dynamicSelectFilters({
      container: '.responsive-filter__select',
      groupHeading: '.responsive-filter__heading',
      onCreateSelectCallback: function () {
        // 'this' is the jQuery wrapped select element, created per group set.
        this.wrap('<div class="form__select"></div>');
      }
    });
  });
})(jQuery);
;
/**
 * Custom Accordion implementation.
 */

(function($){
  $(document).ready(function(){
    var $accordion = $('.accordion');

    if (!$accordion.length) {
      return;
    }

    $('.accordion .accordion__content-wrapper').not('.open .accordion__content-wrapper').hide();
    $('.accordion .accordion__title-wrapper').click( function(e) {
      var $this = $(this),
          $openItems = $this.parent().siblings('.open');

      // Close other open items.
      $openItems.find('.accordion__content-wrapper').slideToggle(250, 'linear');
      $openItems.toggleClass('open');

      // Open new item.
      $this.siblings('.accordion__content-wrapper').slideToggle(250, 'linear');
      $this.parents('.accordion__item').toggleClass('open');

      e.preventDefault();
    });

    // Auto-scroll and expand accordions when linked to with a hash
    var hash = window.location.hash;
    if ($(hash).length && $(hash).closest('.accordion__item').length) {
      $(hash).siblings('.accordion__title').trigger('click');
    }
  });
})(jQuery);
;
/**
 * Context Switcher component
 */
(function($){
  $(document).ready(function(){
    var $triggers = $('.context-switcher__trigger'),
    $lists = $('.context-switcher__list'),
    animation = {
      duration: 500,
      easing: "easeInOutQuart"
    };
    
    if ($triggers.length && $lists.length) {
      // Run setup
      setup();


      $triggers.on('click.contextSwitcher', function(e) {
        var $trigger = $(this),
            $list = $trigger.closest('.context-switcher').find('.context-switcher__list');

        if ($trigger.hasClass('open')) {
          $list.slideUp(animation);
          $trigger.removeClass('open');
        } else {
          $list.slideDown(animation);
          $trigger.addClass('open');
        }
        e.preventDefault();
      });

      $lists.find('a').on('click.contextSwitcher', function(e) {
        var $option = $(this),
            $list = $option.closest('.context-switcher__list'),
            $trigger = $option.closest('.context-switcher').find('.context-switcher__trigger');

        $trigger.text($option.text());

        $list.slideUp(animation);
        $trigger.removeClass('open');

        $option.parent().addClass('selected').siblings().removeClass('selected');

        e.preventDefault();
      });
    }

  });

  // Hand-full of setup tasks
  function setup() {

  }

})(jQuery);
;
/**
 * Flyout content utility
 */
(function($){

  $(document).ready(function(){
    var $triggers = $('.flyout__trigger'),
        $contents = $('.flyout__content'),
        animation = {
          duration: 1000,
          easing: 'easeInOutQuart'
        };

    if ($triggers.length && $contents.length) {
      // Run setup
      setup();

      $triggers.on('click.flyout', function(e) {
        var trigger = this,
            $target = $('#' + $(trigger).data('flyoutTarget')),
            state = $target.data('flyoutState');

        if (state == 'closed') {
          setTimeout(function() {
            showContent(trigger);
          }, 1);
        } else if (state == 'open') {
          hideContent(trigger);
        }
        e.preventDefault();
      });

      $('.flyout__close-link').on('click.flyout', function(e) {
        $(this).closest('.flyout__content').data('flyoutTrigger').trigger('click.flyout');
        e.preventDefault();
      });
    }


    // Show the target content
    function showContent(trigger) {
      var data = $(trigger).data(),
          $target = $('#' + data.flyoutTarget),
          $parent = $target.offsetParent(),
          $slideout = $parent.find('.flyout__slideout'),
          parentPadding = $parent.outerHeight() - $parent.height(),
          offset = $('.sticky-wrapper .stuck').outerHeight(true);

      $target.data('flyoutState', 'open');

      // Adjust height of parent
      $parent.animate({
        height: $target.outerHeight(true) - parentPadding,
      }, animation);

      $slideout.add($target).animate({
        marginLeft: '-=100%',
      }, animation);

      Tabia.smoothScrollTop($parent, animation.duration, offset, true);
    }

    // Hide the target content
    function hideContent(trigger) {
      var data = $(trigger).data(),
          $target = $('#' + data.flyoutTarget),
          $parent = $target.offsetParent(),
          $slideout = $parent.find('.flyout__slideout'),
          slideoutHeight = $slideout.outerHeight(true);

      $target.data('flyoutState', 'closed');

      // Adjust height of parent
      $parent.animate({
        height: slideoutHeight,
      }, animation);

      $slideout.add($target).animate({
        marginLeft: '+=100%',
      }, animation);

      // Reset height of $parent to inherit in case of screen resizing that would
      // need to adjust the height.
      setTimeout(function() {
        $parent.css('height', 'inherit');
      }, animation.duration + 1);
    }

    // Hand-full of setup tasks
    function setup() {
      // Add flyout-state data
      $contents.data('flyoutState', 'closed');

      // Link content back to it's corresponding trigger
      $triggers.each(function(index, el) {
        var $target = $('#' + $(this).data('flyoutTarget'));
        $target.data('flyoutTrigger', $(this));
      });

      // Set the relative parent to hide overflow
      $contents.each(function(index, el) {
        $(this).show();
        $(this).offsetParent().css('overflow', 'hidden');
      });
    }

  });
})(jQuery);
;
/**
 * Gif Player utility.
 */
(function($){
  $(document).ready(function(){
    var $gifs = $('.gif-player');

    if ($gifs.length) {
      $gifs.each(function(index, el) {
        var $gif = $(this);

        // Store the static image source
        $gif.data('static-src', $gif.attr('src'));

        // Lazy load in gifs so they start animating after brought into view.
        // Switch back to placeholder when image has exited view.
        //
        // @todo store gif length in a data param and indicate when the gif is
        // being animated vs static. Add a replay button once the loop ends
        var inview = new Waypoint.Inview({
          element: $gif[0],
          entered: function(direction) {
            $gif.attr('src', $gif.data('gif-src'));
          },
          exited: function(direction) {
            $gif.attr('src', $gif.data('static-src'));
          }
        });

      });
    }
  });
})(jQuery);
;
(function($){
  $(document).ready(function(){
    var $heroSlideShow = $('.hero-slideshow');

    if($heroSlideShow.length) {
      $heroSlideShow.slick({
        dots: true,
        arrows: true,
        speed: 650,
        easing: "easeInOutQuart",
        slide: '.hero-slideshow__slide',
        autoplay: true,
        autoplaySpeed: 8000,
        responsive: [
          {
            breakpoint: 639,
            settings: {
              adaptiveHeight: true,
            }
          }
        ]
      });
    }
  });
})(jQuery);
;
(function($) {
  $.fn.moveProgressBar = function (progress) {
    var $el = $(this),
        $progress = $el.find('.progress'),
        progress = progress || parseInt($progress.data('progress')) || 0,
        treshold = [5, 50, 100],
        modifier = '';

    for (var i in treshold) {
      if (progress <= treshold[i]) {
        modifier = 'progress--' + treshold[i];
        break;
      }
    }

    // Make sure we have a valid percentage.
    progress = (progress > 100) ? 100 : progress;

    $progress.removeClass (function (index, css) {
      return (css.match (/(^|\s)progress--\S+/g) || []).join(' ');
    }).css({
      'width': progress + '%'
    }).addClass(modifier);
  };
}( jQuery ));
;
/** 
 * Reveal content component interaction
 * See jquery.contentReveal.js for details
 */

(function ( $ ) {
  $(document).ready(function(){
    $('.reveal__content').contentReveal({
      triggers: $('.reveal__trigger')
    });
  });
}( jQuery ));
;
/** 
 * Search Highlight utility.
 *
 * Searches through a list of items and highlights items that match the term.
 */
(function($){
  $(document).ready(function(){
    var $searches = $('.search-highlight input[type="search"]');
    
    if ($searches.length) {
      $searches.each(function(index, el) {
        var $search = $(el),
            $content = $('#' + $search.data('content')),
            highlightClass = $search.data('highlight-class') + " search-highlight__match",
            $contentItems = $content.find('li');

        $search.on('change paste keyup search', function(e) {
          var term = $(this).val().toLowerCase();
          $contentItems.each(function(index, item) {
            var text = $(item).text().toLowerCase();
            $(item).removeClass(highlightClass);
            if (term.length > 0 && text.indexOf(term) > -1) {
              $(item).addClass(highlightClass);
            }
          });
        });

      });
    }
  });
})(jQuery);
;
/**
 * Social share handling
 *
 * This is a simple hover based reveal for the social share display.
 */
(function ($) {
  $(document).ready(function () {
    var $socialShare = $('.social-share__wrapper');

    // Bail early if there aren't even any element.
    if (!$socialShare.length) {
      return;
    }

    // Utilize the slideHeight custom animation.
    // @TODO change this out to contentReveal, would likely involve refactor.
    $socialShare.each(function initSocialShare() {
      var $this = $(this),
          $widgets = $('.social-share__widgets'),
          animation = {
            duration: 500,
            easing: "easeInOutQuart"
          };

      $this.hoverIntent(
        function socialHoverOn() {
          $widgets.slideHeight('down', animation);
        },
        function socialHoverOff() {
          $widgets.slideHeight('up', animation);
        }
      );
    });

  });
})(jQuery);
;
(function($){
  $(document).ready(function(){

    /**
     * Allows making an element sticky on the page with just a 'sticky' class.
     */
    $('.sticky').each(function(i) {
      stickIt(this);
    });

    if (matchMedia('(min-width: 961px)').matches) {
      $('.sticky--desktop').each(function(i) {
        stickIt(this);
      });
    }

    if (matchMedia('(max-width: 960px) and (min-width: 640px)').matches) {
      $('.sticky--tablet').each(function(i) {
        stickIt(this);
      });
    }

    if (matchMedia('(max-width: 639px)').matches) {
      $('.sticky--mobile').each(function(i) {
        stickIt(this);
      });
    }

  });

  function stickIt(el) {
    var sticky = new Waypoint.Sticky({
      element: el
    });
  }
})(jQuery);
;
/**
 * Tabs component interaction
 * See jquery.tabs.js for details
 */

(function ( $ ) {
  $(document).ready(function() {
    $('.tabs__tab-link').tabs({
      contents: $('.tabs__tab-content'),
      triggers: $('.tabs__tab-trigger')
    });
  });
}( jQuery ));
;
/**
 * Brightcove video chapter handling.
 *
 * This handles chaptering interaction given an expected DOM structure. E.g.:
 * <ul class="video__chapters" data-chapters-for="[VIDEO DOM ID]">
 *   <li class="video__chapter" data-timestamp="60">Something</li>
 *   <li class="video__chapter" data-timestamp="120">Something else</li>
 * </ul>
 *
 * It listens for a brightcove:ready event that is raised per video instance as
 * it successfully creates a Brightcove videojs wrapped player object.
 */
(function ($, window) {
  $(document).ready(function () {
    var $chapterLists = $('[data-chapters-for]');

    // Bail early if there aren't even any lists of chapters.
    if (!$chapterLists.length || !typeof window.videojs === 'function') {
      return;
    }

    // Utilize the revealContent plugin.
    $chapterLists.each(function initChapterReveal() {
      $(this).contentReveal({
        triggers: $(this).next('.video-chapters__toggle-wrapper').find('.video-chapters__toggle'),
        closeLink: false
      });
    });

    // The Brightcove player binding is async. We wait for a raised event first
    // before binding the video chapter actions.
    $(document).on('brightcove:ready', function (e, data) {
      // The 'data' received here is the id attribute of the video player element.
      var $readyChapters = $chapterLists.filter('[data-chapters-for="' + data + '"]'),
          $videoElement = $('#' + data),
          BCPlayer = $videoElement.data('bcPlayer');

      // Bail early.
      if (!$readyChapters.length) {
        return;
      }

      $readyChapters.next('.video-chapters__toggle-wrapper').find('.video-chapters__toggle').on('click.toggle', function(e) {
        $(this).toggleClass('is-open');
      });

      $readyChapters.find('.video-chapters__chapter').on('click.chapter', function triggerVideoChapter (e) {
        var $this = $(this),
            timestamp = $this.data('timestamp');

        e.preventDefault();

        // Set the play time.
        BCPlayer.currentTime(timestamp);

        // Scroll.
        Tabia.smoothScrollTop($videoElement);

        // Play the video if it ain't playing.
        if (BCPlayer.paused()) {
          BCPlayer.play();
        }
      });
    });

  });
})(jQuery, window);
;
(function($) {
  /**
   * Callback function to insert the menu into the DOM.
   */
  window.tabAjaxMegaMenu = function(data) {
    var commands = {
      insert: function (response) {
        $(response.selector)[response.method](response.data);
      }
    };

    // Execute our commands.
    for (var i in data) {
      if (data[i]['command'] && commands[data[i]['command']]) {
        commands[data[i]['command']](data[i]);
      }
    }

    // Trigger event when our menu has been loaded.
    $(document).trigger('tabAjaxMegaMenu:ready');
  };
})(jQuery);
;
/**
 * Global gavigation interactions
 */
(function($){
  /**
   * Wait for custom event 'tabAjaxMegaMenu:ready' (i.e. menu drawers are fully loaded
   * via AJAX callback) before initiating mega menu client side behavior. If the drawers
   * are not being loaded via AJAX, the following snippet can be used to call the trigger
   *
   * $(document).ready(function() {
   *    $(document).trigger('tabAjaxMegaMenu:ready');
   * });
   *
   */
  $(document).one('tabAjaxMegaMenu:ready', function tabAjaxMenuReady() {
    var $globalNav = $('.global-nav__top'),
        $menu = $globalNav.find('.global-nav__primary-menu'),
        $expandableLinks = $menu.find('li a.expandable'),
        $drawers = $('.global-nav__drawer'),
        $hamburger = $globalNav.find('.hamburger'),
        $mobileWrapper = $globalNav.find('.global-nav__mobile-wrapper'),
        $mobileDrawerClose = $('.global-nav__drawer-close'),
        animation = {
          duration: 150,
          easing: 'linear'
        };

    // Do some initial sizing.
    sizing();

    // Size on window resize and orientation change.
    $(window).on('resize orientationchange', _.debounce(sizing, 100));

    // Desktop stuff.
    // Drawer Expanding interaction
    $expandableLinks.each(function (){
      var $link = $(this),
          $drawer = $drawers.filter('#' + $link.data('drawer-id')),
          $both = $link.add($drawer);

      // Handling for hover interaction of drawers. Uses the doTimeout jquery
      // utility to handle throttling and waiting on a small delay before
      // showing the drawer (essentially hoverintent)
      $both.hover(function () {
        $both.doTimeout( 'open', 200, function() {
          $both.addClass('is-open');
        });
      }, function () {
        $both.doTimeout( 'open', 200, function() {
          $both.removeClass('is-open');
        });
      });
    });

    $drawers.click(function(e) {
      e.stopPropagation();
    });

    // Tablet/mobile stuff.
    $expandableLinks.on('click.nav', function(e) {
      var $link = $(this),
          $drawer = $('#' + $link.data('drawer-id'));

      if (isMobile()) {
        $drawer.show().addClass('open');

        $drawer.add($mobileWrapper).animate({
          marginLeft: '-=100%'
        }, animation);

        e.preventDefault();
      }
    });

    $mobileDrawerClose.on('click.nav', function(e) {
      var $drawer = $(this).closest('.global-nav__drawer');

      closeDrawerMobile($drawer);

      e.preventDefault();
    });

    // Mobile menu
    $hamburger.on('click.global-nav', function(e) {
      var $openDrawer = $drawers.filter('.open'),
          drawerOptions = $.extend({}, animation);

      if ($openDrawer.length) {
        drawerOptions.done = function() {
          $openDrawer.css('margin-left', '100%');
          $mobileWrapper.css('margin-left', '0%');
        };

        $openDrawer.slideUp(drawerOptions).removeClass('open');
      }

      $mobileWrapper.slideToggle(animation);
      $hamburger.parent().toggleClass('open');
      e.preventDefault();
    });

    function closeDrawerMobile($drawer) {
      $drawer.add($mobileWrapper).animate({
        marginLeft: '+=100%'
      }, animation);

      setTimeout(function() {
        $drawer.hide().removeClass('open');
      }, animation.duration);
    }

    // Helper function to check whether we are on a mobile/tablet viewport.
    function isMobile() {
      return matchMedia('(max-width: 960px)').matches;
    }

    // Prepare our menu for the user's viewport.
    function sizing() {
      // Tablet/Mobile
      if (isMobile()) {
        // Adjust the height of the mobile menu
        mobileHeightAdjust();
      }
      // Desktop
      else {
        // Remove any mobile markup, and revert to original settings.
        $hamburger.removeClass('hamburger--open');
        $hamburger.parent().removeClass('open');
        $mobileWrapper.removeAttr('style');
        $drawers.removeAttr('style').removeClass('open');
      }
    }

    // Adjust the height of the mobile menu to take up the entire height.
    function mobileHeightAdjust() {
      // @todo this is pretty bad... Can probably figure out a clever CSS hack to
      // achieve this with vh units or something.
      var drawerHeight = $(window).outerHeight(true) - $globalNav.outerHeight(true);

      $mobileWrapper.add($drawers).each(function(index, el) {
        var $wrapper = $(el),
            origHeight = $wrapper.data('orig-height');

        if (isNaN(origHeight)) {
          origHeight = $wrapper.height();
          $wrapper.data('orig-height', origHeight);
        }

        if (origHeight < drawerHeight) {
          $wrapper.height(drawerHeight);
        }
      });
    }

  });

})(jQuery);
;
/**
 * Global search bar interaction
 */
(function($){
  $(document).ready(function(){
    var $search = $('.global-nav__search'),
        $closeSearch = $search.find('.global-nav__search-close');

    $search.on('click', function(e){
      e.preventDefault();
      $(this).parents('.global-nav__top').addClass('global-nav--search-shown');
      $(this).find('input[type="search"]').focus();
    });

    $closeSearch.on('click', function(e){
      e.stopPropagation();
      e.preventDefault();
      $search.parents('.global-nav__top').removeClass('global-nav--search-shown');
    });
  });
})(jQuery);
;
/**
 * Hamburger interaction interactions
 */
(function($){
  $(document).ready(function(){
    var $hamburger = $('.hamburger');

    if ($hamburger.length) {
      $hamburger.on('click.hamburger', function(e) {
        $(this).toggleClass('hamburger--open');
        e.preventDefault();
      });
    }
  });
})(jQuery);
;
/**
 * Sidebar nav  interaction including scroll-aware highlighting
 */

(function($){
  $(document).ready(function(){
    var $subnav = $('.subnav'),
        $links = $subnav.find('.subnav__links'),
        $linksWrapper = $links.find('.subnav__links-wrapper'),
        $anchors = $('.anchor-link');

    if ($links.length && $anchors.length) {
      $anchors.waypoint({
        handler: function(direction) {
          var id = this.element.id;
          if (direction === 'down') {
            $links.find('a[href="#' + id + '"]').parent().addClass('is-active').siblings().removeClass('is-active');
          } else if (direction === 'up') {
            $links.find('a[href="#' + id + '"]').parent().prev().addClass('is-active').siblings().removeClass('is-active');
          }
        },
        offset: $subnav.outerHeight(true)
      });

      // Handle scrolling of links on mobile
      mobileScroll();
      $(window).on('resize orientationchange', _.debounce(mobileScroll, 100));

      // Smooth Scroll for anchor links
      // @TODO generalize and separate from this component
      $links.find('a').click(function(e) {
        var element = $(this).attr('href'),
            offset = $subnav.outerHeight(true) - 1;

        // Offset for mobile
        if ($subnav.find(".sticky-wrapper").length) {
          offset = $subnav.find(".sticky-wrapper").outerHeight(true) - 1;
        }

        Tabia.smoothScrollTop($(element), 500, offset);
        e.preventDefault();
      });
    }

    // Manage scroll fading on mobile if there's overflow.
    function mobileScroll() {
      var width = $linksWrapper[0].offsetWidth,
          scrollWidth = $linksWrapper[0].scrollWidth;

      if (width < scrollWidth) {
        // Add right fade right away since we always start on the left.
        $links.addClass('fade-right');

        $linksWrapper.scroll(function () {
          var scrollPos = $linksWrapper.scrollLeft();

          // Add both fades and then remove below if needed.
          $links.addClass('fade-right fade-left');

          // Remove right fade when scrolled all the way to the right
          if (scrollPos === (scrollWidth - width)) {
            $links.removeClass('fade-right');
          }
          // Remove left fade when scrolled all the way to the left
          if (scrollPos === 0) {
            $links.removeClass('fade-left');
          }
        });
      } else {
        $links.removeClass('fade-left fade-right');
      }

    }
  });
})(jQuery);
;
/**
 * Topic Navigation interaction
 * Requires jquery.contentReveal.js and jquery.tabs.js
 */

(function ( $ ) {
  $(document).ready(function() {
    // Tabs integration
    $('.topic-nav__tabs a').tabs({
      contents: $('.topic-nav__drawer'),
      wrapper: $('.topic-nav')
    });

    // contentReveal interaction
    $('.topic-nav__drawers').contentReveal({
      triggers: $('.topic-nav__toggle'),
      closeLink: false
    });

    // Custom tweaks
    $('.topic-nav__toggle').on('click.topic-nav', function(e) {
      var $parentNav = $(this).closest('.topic-nav');

      if ($(this).data('revealState') == 'open') {
        $parentNav.find('.topic-nav__tabs a').eq(0).trigger('click').addClass('is-active');
      }
      else {
        $parentNav.find('.topic-nav__tabs a').removeClass('is-active');
      }
    });

    $('.topic-nav__tabs a').on('click.topic-nav', function(e) {
      var $toggle = $(this).closest('.topic-nav').find('.topic-nav__toggle');

      if ($toggle.data('revealState') == 'closed') {
        $toggle.trigger('click.reveal');
      }
    });

  });
}( jQuery ));
