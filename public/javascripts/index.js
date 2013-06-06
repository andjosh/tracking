window.onload = function() {

  var socket = io.connect(window.location.hostname);
  var x = document.getElementById("age");

  socket.on('newAge', function (data) {
      if(data.years) {
          var html = data.years;
          x.innerHTML = html;
      }
      else {
          console.log("There is a problem with the infoBox:", data);
      }
  });
}



