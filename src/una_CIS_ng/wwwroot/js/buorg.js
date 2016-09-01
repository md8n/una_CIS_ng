// See browser-update.org

var $buoop = {
  vs: { i: 11, f: 48, o: 25, s: 9 },
  c: 2,
  reminder: 0,
  text: "This website only supports current versions of web browsers.  Your browser (%s) is no longer considered current.  To use this website you must <a%s>update your browser</a>."
};
function $buo_f() {
  var e = document.createElement("script");
  e.src = "//browser-update.org/update.min.js";
  document.body.appendChild(e);
};
try { document.addEventListener("DOMContentLoaded", $buo_f, false) }
catch (e) { window.attachEvent("onload", $buo_f) }

//var $buoop = {
//  // browser versions to notify
//  vs: { i: 11, f: 35, o: 25, s: 7, c: 10 },

//  // after how many hours should the message reappear
//  // 0 = show all the time
//  reminder: 24,

//  // if the user closes message it reappears after x hours
//  reminderClosed: 150,

//  // callback function after the bar has appeared
//  onshow: function (infos) { },

//  // callback function if bar was clicked
//  onclick: function (infos) { },
//  onclose: function (infos) { },     //

//  // set a language for the message, e.g. "en"
//  // overrides the default detection
//  l: false,

//  // true = always show the bar (for testing)
//  test: false,

//  // custom notification html text
//  // Optionally include up to two placeholders "%s" which will be replaced with the browser version and contents of the link tag. Example: "Your browser (%s) is old.  Please <a%s>update</a>"
//  text: "",

//  // custom notification text for language "xx"
//  // e.g. text_de for german and text_it for italian
//  text_xx: "",

//  // open link in new window/tab
//  newwindow: true,

//  // the url to go to after clicking the notification
//  url: null
//};