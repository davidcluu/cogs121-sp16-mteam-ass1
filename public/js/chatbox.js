$(function (){
  var socket = io();

  $('#submit_video').submit(function(e){
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
      var result = '<hr>' + 
        '<li>' + 
        '<div class="user">' + 
        '<div class="user-info">' +
        '<span class="username">' + template.user + '</span>' +
        '<br/>' +
        '<span class="posted">' + template.posted + '</span>' +
        '</div>' + 
        '</div>' + 
        '<div class="embed-responsive embed-responsive-4by3 message-content">' +
        '<iframe class="embed-responsive-item video" src="' + template.videoUrl + '"></iframe>' +
        '</div>' + 
        '<p>' + template.videoCaption + '</p>' +
        '<p><a href="#" class="btn btn-info pull-right" role="button">Comment</a></p>' +
        '</li>';

      return result;
    }
  });
});
