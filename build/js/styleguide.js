$(document).ready(function() {
  $('.toggle-links__option').click(function(e) {
    $(this).addClass('is-active').siblings().removeClass('is-active');
    e.preventDefault();
  });
});
;
(function($) {
  $(document).ready(function() {
    $.ajax({
        // Use customer_menu=1 query parameter to include the optional customer menu.
        // @todo update this to www.tableau.com once global-header related PR is deployed (target late April 2019)
        // url: 'https://www.tableau.com/ajax/menu/jsonp/tabAjaxMenu',
        url: 'https://www.tableau.com/ajax/menu/jsonp/tabAjaxMenu',
        // url: '//local.tableau.com/ajax/menu/jsonp/tabAjaxMenu',
        dataType: 'jsonp',
        // Set a static callback and explicitly set caching to true to ensure
        // we don't cache bust ourselves into oblivion. Without these set,
        // a random callback name is generated and a timestamp is appended to
        // every request.
        jsonpCallback: 'jsonpMenuCallback',
        cache: true
    });
  });
})(jQuery);
;
/**
 * Quick demo of the jQuery datepicker widget
 */
(function($) {
  $(document).ready(function(){
    // Set up datepicker on the test input
    $('#datepicker-example').datepicker({
      minDate: 1,
      changeMonth: true,
      changeYear: true
    });

    // Hack in a kss wrapper so the styles get picked up by the widget since
    // it's appended to the body
    $('#ui-datepicker-div').wrap('<div class="kss-example-preview">');
  });
})(jQuery);
;
/**
 * Style guide overrides to make the form flyout component function in the style guide
 */

(function ( $ ) {
  $(document).ready(function(){
    if ($('.flyout-form').length && $('a[href="#form"]').length) {
      var $formWrapper = $('.flyout-form'),
          $triggers = $('a[href="#form"]'),
          $pageWrapper = '<div class="flyout-form__page-wrapper"></div>',
          $kssWrapper = $triggers.closest('.kss-example-preview-wrapper');

      // Remove the page wrapper
      if ($('body').children().first().hasClass('flyout-form__page-wrapper')) {
        $('body').children().first().children().unwrap();
      }

      // Add a wrapper around the kss wrapper
      $kssWrapper.wrapInner($pageWrapper);

      // Move the form wrapper back into the preview
      $kssWrapper.append($formWrapper);

      // Add a js wrapper so the js/no-js styles work properly
      $kssWrapper.wrapInner('<div class="js relative">');

      // Make sure the form wrapper becomes shown
      $formWrapper.show();
    }
  });
}( jQuery ));
;
/**
 * Fadable element.
 */

(function ($) {
  $(document).ready(function () {

    // Provide an example interaction.
    $('.fadable-toggle').on('click', function (e) {
      $('.fadable').toggleClass('fadable--faded-in').toggleClass('fadable--faded-out');
      e.preventDefault();
    });

  });
})(jQuery);
;
(function($){
  var $vizSlideshow = $('.fullbleed-slideshow');

  $(document).ready(function(){
    if ($vizSlideshow.length) {
      $vizSlideshow.slick({
        centerMode: true,
        centerPadding: '200px',
        slidesToShow: 1,
        arrows: true,
        speed: 650,
        easing: 'easeInOutQuart',
        slide: '.large-teaser',
        prevArrow: '<button class="slick-prev fullbleed-slideshow__arrow fullbleed-slideshow__arrow--prev"><i class="icon icon--chevron-left">Previous</i></button>',
        nextArrow: '<button class="slick-next fullbleed-slideshow__arrow fullbleed-slideshow__arrow--next"><i class="icon icon--chevron-right">Next</i></button>',
        responsive: [
          {
            breakpoint: 940,
            settings: {
              centerPadding: '50px'
            }
          },
          {
            breakpoint: 639,
            settings: {
              centerPadding: '25px',
              arrows: false,
              prevArrow: false,
              nextArrow: false
            }
          }
        ]
      });
    }
  });
})(jQuery);
;
(function($){
  $(document).ready(function(){
    var $content = $('#loading-overlay-content');

    $('#loading-overlay-trigger').click(function () {
      Components.loadingOverlay.show($content);
    });
  });
}( jQuery ));
;
(function($) {
  $(document).ready(function(){
    $('#show-modal-message').click(function (e) {
      e.preventDefault();
      Components.modalMessage.show();
    });

    $('#show-loading-modal-message').click(function (e) {
      e.preventDefault();
      Components.modalMessage.show(null, 'loading');
    });

    $('#close-modal-message').click(function (e) {
      e.preventDefault();
      Components.modalMessage.close();
    });
  });
}(jQuery));
;
(function($){
  $(document).ready(function(){
    $('.progress-bar').moveProgressBar();
  });
}( jQuery ));
;
(function($) {
  $(document).ready(function(){
    $('#highlighter').click(function () {
      $(this).sonarPulse();
    });
  });
}(jQuery));
;
(function($){
  var $vizSlideshow = $('.teaser-slideshow');

  $(document).ready(function(){
    if ($vizSlideshow.length) {
      $vizSlideshow.slick({
        slidesToShow: 3,
        slidesToScroll: 3,
        arrows: true,
        speed: 650,
        easing: 'easeInOutQuart',
        slide: '.teaser-item',
        prevArrow: '<button class="slick-prev teaser-slideshow__arrow teaser-slideshow__arrow--prev"><i class="icon icon--chevron-left">Previous</i></button>',
        nextArrow: '<button class="slick-next teaser-slideshow__arrow teaser-slideshow__arrow--next"><i class="icon icon--chevron-right">Next</i></button>',
        responsive: [
          {
            breakpoint: 940,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2,
            }
          },
          {
            breakpoint: 639,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              centerMode: true,
              centerPadding: '50px',
              arrows: false,
              prevArrow: false,
              nextArrow: false
            }
          }
        ]
      });
    }
  });
})(jQuery);
;
/**
 * Styleguide only script for randomizing the card wall cards.
 */
jQuery(function domReady($) {
  $('.card-wall').before('<a href="#" class="js-card-wall-random">Shuffle</a>');

  $('.js-card-wall-random').on('click', function (e) {
    var $cardWall = $('.card-wall'),
        cardWall = $cardWall[0];
    for (var i = cardWall.children.length; i >= 0; i--) {
      cardWall.appendChild(cardWall.children[Math.random() * i | 0]);
    }
    $cardWall.masonry('reloadItems');
    $cardWall.masonry();
    e.preventDefault();
  });
});
;
/**
 * Video playlist script for demo purposes only.
 */
(function ($, window) {
  $(document).ready(function () {
    var $playlistVideo = $('.video-playlist__link');

    $playlistVideo.click(function playlistVideoClick(e) {
      e.preventDefault();

      $('.video-playlist__item-wrapper.is-active').removeClass('is-active');
      $(this).closest('.video-playlist__item-wrapper').addClass('is-active');
    });

  });
})(jQuery, window);
;
/**
 * Global search autocomplete demo.
 */
(function($){
  $(document).ready(function(){
    var $search = $('.global-nav__search'),
        availableTags = [
          "Tableau",
          "Desktop",
          "Server",
          "Online",
          "Cloud",
          "Public",
          "Reader",
          "Business Intelligence",
          "Data",
          "Products",
          "Graphs",
          "Visualizations"
        ];

    // Search auto-complete for demo purposes. Requires jQuery UI Autocomplete
    // @todo add support for highlighting the searched characters in the list
    //    http://stackoverflow.com/questions/2435964/jqueryui-how-can-i-custom-format-the-autocomplete-plug-in-results
    $search.find('input').autocomplete({
      source: availableTags,
      appendTo: ".global-nav"
    });

  });
})(jQuery);
;
// On styleguide, simulate basic paging ability.
jQuery(function ($) {
  var $pageLinks = $('.pager__page, .pager__endcap');
  $pageLinks.find('a').click(function () {
    $pageLinks.removeClass('pager__page--current pager__endcap--current');
    $(this).parent().addClass('pager__page--current');
    return false;
  });
});
;
/**
 * News Interstitial interaction
 */

(function ($) {
  $(document).ready(function() {
    var id = $('.news-banner').attr('id');

    $.removeCookie('news-banner-' + id);
  });
}( jQuery ));
;
(function($){
  $(document).ready(function(){
    var $newsTicker = $('.news-ticker');

    if($newsTicker.length) {
      $newsTicker.slick({
        autoplay: true,
        speed: 1000,
        easing: 'easeInOutQuart',
        fade: true,
        slide: '.news-ticker__item',
        autoplaySpeed: 3000
      });
    }
  });
})(jQuery);
;
/**
 * Section search styleguide integration.
 */

jQuery(function ready($) {
  $('.contextual-search .content-search__input').keydown(function (event) {
    var keyCode = $.ui.keyCode;

    switch (event.keyCode) {
      case keyCode.UP:
      case keyCode.DOWN:
      case keyCode.ESCAPE:
      case keyCode.ENTER:
        break;
      default:
        $(this).parents('.contextual-search').addClass('is-open');
    }

  });
});
