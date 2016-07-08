var $body = $(document.body);
var navHeight = $('.navbar').outerHeight(true) + 10;


$('#sidebar').affix({
  offset: {
    top: function () {
      var offsetTop = $('#sidebar').offset().top;
      var sideBarMargin = parseInt($('#sidebar').children(0).css('margin-top'), 10);
      var navOuterHeight = $('#masthead').height();

      return (this.top = offsetTop - navOuterHeight - sideBarMargin);
    },
    bottom: function () {
      return (this.bottom = $('footer').outerHeight(true));
    }
  }
});

$body.scrollspy({
  target: '#rightSideNav',
  offset: navHeight
});