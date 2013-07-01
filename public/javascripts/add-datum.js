window.onload = function() {

  var socket = io.connect(window.location.hostname);
  var x = document.getElementById("category");

  socket.on('newCategories', function (data) {
      if(data.names) {
          var html = '<input type="text" data-provide="typeahead" name="category" placeholder="Name/Category" data-source="'
                      + data.names
                      + '">';
          x.innerHTML = html;
      }
      else {
          console.log("There is a problem with the categories socket: ", data);
      }
  });
}
$(".numeric").numeric();

