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



