var $body = $(document.body);
var navHeight = $(".navbar").outerHeight(true) + 10;

var sb = document.getElementById("sidebar");
$("#sidebar").affix({
  offset: {
    top: function () {
      const offsetTop = 0; // $("#sidebar").offset().top;
      const sideBarMargin = parseInt($("#sidebar").children(0).css("margin-top"), 10);
      const navOuterHeight = $("#PermitApplication").height();

      return (this.top = offsetTop - navOuterHeight - sideBarMargin);
    },
    bottom: function () {
      return (this.bottom = $("footer").outerHeight(true));
    }
  }
});

$body.scrollspy({
  target: "#rightSideNav",
  offset: navHeight
});