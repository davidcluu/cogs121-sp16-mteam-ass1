(function($) {
  "use strict";

  var socket = io();
  $('#send_message').submit(function(e){
    e.preventDefault();

    var $user_input = $('#user_input')
    var $video_input = $('#video_input')
    socket.emit('newsfeed', { caption: $user_input.val(), video: $video_input.val()});
    $user_input.val('');
    $video_input.val('');
  })

  socket.on('newsfeed', function(data) {
    var parsedData = JSON.parse(data);
    parsedData.posted = new Date(parsedData.posted);

    $('#messages').prepend($('<li>').html(messageTemplate(parsedData)));

    function messageTemplate(template) {

      var result = '<div class="user">' +
        '<div class="user-info">' +
        '<span class="username">' + template.user + '</span><br/>' +
        '<span class="posted">' + template.posted + '</span>' +
        '</div>' +
        '</div>' +
        '<div class="message-content">' +
        '<iframe width="420" height="315" src=' + template.videoUrl + '></iframe>' +
        '<p>' + template.videoCaption + '</p>'
        '</div>';
      return result;
    }
  });
})($);
