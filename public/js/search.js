(function ($) {
  var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
      var matches, substringRegex;

      // an array that will be populated with substring matches
      matches = [];

      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i');

      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function(i, str) {
        if (substrRegex.test(str)) {
          matches.push(str);
        }
      });

      cb(matches);
    };
  };

  $('.typeahead').typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: 'components',
      source: substringMatcher(styleguideSearchData.terms)
    });

  $('.typeahead').bind('typeahead:select typeahead:autocomplete', function(ev, suggestion) {
    window.location = styleguideSearchData.termToURI[suggestion];
  });

  // Key events
  $(document).keydown(function(event) {
    // Show the form with alt + D. Use 2 keycodes as 'D' can be uppercase or lowercase.
    // 68/206 = d/D.
    if (event.altKey === true && (event.keyCode === 68 || event.keyCode === 206)) {
      event.preventDefault();
      $('.typeahead').focus();
    }
  });

  // Focus on load, if page is not scrolled.
  if (window.scrollY === 0) {
    $('.typeahead').focus();
  }
})(jQuery);
