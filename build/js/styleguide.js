(function($) {
  $(document).ready(function() {
    $.ajax({
        url: 'https://give:feedback@redesign-tableau.gotpantheon.com/ajax/megamenu/jsonp/tabAjaxMegaMenu',
        type: 'POST',
        dataType: 'jsonp'
    });
  });
})(jQuery);
;
/**
 * Section search styleguide integration.
 */

jQuery(function ready($) {
  $('.contextual-search__input').keydown(function (event) {
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
;
/**
 * Responsive filters demo
 *
 * Just for the styleguide.
 */
(function ($) {
  $(document).ready(function () {
    $('.filter-set').dynamicSelectFilters({
      container: '.mobile-filter-set',
      groupHeading: '.filter-set__heading',
      onCreateSelectCallback: function () {
        // 'this' is the jQuery wrapped select element, created per group set.
        this.wrap('<div class="form-field__wrapper"><div class="form__select"></div></div>');
      }
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
        prevArrow: '<button class="fullbleed-slideshow__arrow fullbleed-slideshow__arrow--prev"><i class="icon icon--slideshow-prev">Previous</i></button>',
        nextArrow: '<button class="fullbleed-slideshow__arrow fullbleed-slideshow__arrow--next"><i class="icon icon--slideshow-next">Next</i></button>',
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
    $search.find("input").autocomplete({
      source: availableTags,
      appendTo: ".global-nav"
    });

  });
})(jQuery);
