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
  var y = document.getElementsByName('date')[0],
    d = new Date(), 
    day = d.getDate(), 
    month = d.getMonth()+1, 
    year = d.getFullYear();
  if(month < 10){month = '0'+month;}
  if(day < 10){day = '0'+day;}
  if(y.className !='leave-alone'){y.value = year+'-'+month+'-'+day;}
}
$(".numeric").numeric();

