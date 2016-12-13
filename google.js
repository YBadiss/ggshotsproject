#!/usr/bin/env phantomjs

//--------------------------------------------------------

var page = require('webpage').create(),
    system = require('system'),
    action = null,
    q = null,
    numPages = null,
    currentPage = 1,
    name = null;

//--------------------------------------------------------

if (system.args.length < 4) {
  console.log('Usage: google.js <some Query>');
  phantom.exit(1);
} else {
  q = system.args[1];
  numPages = parseInt(system.args[2]);
  name = system.args[3];
}

//--------------------------------------------------------

start = function () {
  console.log('ACTION: start');
  page.evaluate( function(q) {
    $('input[name="q"]').val( q );
    $('form[action="/search"]').submit();
  }, q);
  page.render('start.png');
  action = pageShot;
}

pageShot = function () {
  console.log('ACTION: pageShot');

  selectSearch();
  page.render('search' + currentPage+ '.png');

  if (currentPage === numPages) {
    console.log("The end!");
    phantom.exit();
  }
  else {
    nextPage();
  }
}

selectSearch = function() {
  var clipRect = page.evaluate(function() {
    return document.getElementById('search').getBoundingClientRect();
  });
  page.clipRect = {
    top:    clipRect.top,
    left:   clipRect.left,
    width:  clipRect.width,
    height: clipRect.height
  };
}

nextPage = function() {
  console.log("ACTION: nextPage");
  currentPage++;
  action = pageShot;
  var href = page.evaluate(function() {
    return $("#nav").find("a:last").attr("href");
  });
  page.open('http://www.google.com' + href);
}

//--------------------------------------------------------

work = function () {
  if(action == null) action = start;
  //console.log( "URL: " + page.url );
  action.call();
}

injectJQuery = function (callback) {
  //  console.log('injecting JQuery');
  page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", callback);
}

page.onLoadFinished = function(status) {
//  console.log('Status: ' + status);
  if(status == 'success') {
    injectJQuery( work );
  } else {
    console.log('Connection failed.');
    phantom.exit();
  }
}

page.onConsoleMessage = function(msg){
      console.log('PAGE: ' + msg);
};

page.onResourceReceived = function (response) {
  if(response.stage == "end")
    console.log('Response (#' + response.id + ', status ' + response.status + '"): ' + response.url);
}

page.onUrlChanged = function (url) {
  console.log("URL: " + url);
}

//--------------------------------------------------------

page.open('http://www.google.com');
