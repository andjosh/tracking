window.onload = function() {

  var socket = io.connect(window.location.hostname),
  		x = document.getElementById("age"),
  		named = document.getElementsByName("uid"),
			graph = document.getElementById("graph");

  socket.on('newAge'+named[0].content, function (data) {
      if(data.years) {
          var html = data.years;
          x.innerHTML = html;
      }
      else {
          console.log("There is a problem with the infoBox:", data);
      }
  });
}
function preloadDatum(text, classic) {
  var x = document.getElementsByName('category')[0], y = document.getElementsByClassName(classic)[0];
  x.value = text;
  x.setAttribute('style', 'background:#eef0fa;transition: 0.3s;-moz-transition: 0.3s;-webkit-transition: 0.3s;-o-transition: 0.3s;');
  y.setAttribute('style', 'position:relative;z-index:-1000;opacity:0;transition: 0.5s;-moz-transition: 0.5s;-webkit-transition: 0.5s;-o-transition: 0.5s;')
}