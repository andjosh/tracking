window.onload = function() {

  var timesTemps = [];
  var socket = io.connect(window.location.hostname);
  var infoBox = document.getElementById("infoBox");

  socket.on('timeTemp', function (data) {
      if(data.message) {
          timesTemps.push(data);
          var html = '';
          for(var i=0; i<timesTemps.length; i++) {
              html += timesTemps[i].message + '<br />';
          }
          infoBox.innerHTML = html;
      }
      else if(data.tm) {
          var html = '';
          html += data.tp + ' at ' + data.tm + '<br />';
          infoBox.innerHTML = html;
      } 
      else {
          console.log("There is a problem with the infoBox:", data);
      }
  });
}



