$(function (){
  var socket = io();

  var $trending = $('#trending');
  var $threads  = $('#threads');
  var $comments = $('#comments');

  var currentThread = '';

  var expanded = false;

  $('#topics').on('click', '.comment-button', {}, function(e){
    e.preventDefault();

    currentThread = $(this).parent().siblings('p').text();

    if (!expanded) {
      var flag = false;

      $trending
        .velocity({
          width : 100.0/(12.0/3) + '%'
        },{
          duration : 500,
          complete : function() {
            $trending.removeAttr('style', '');
            showComments();
          }
        })
        .removeClass('col-md-5')
        .addClass('col-md-3');


      $threads
        .velocity({
          width : 100.0/(12.0/4) + '%'
        },{
          duration : 500,
          complete : function() {
            $threads.removeAttr('style', '');
            showComments();
          }
        })
        .removeClass('col-md-7')
        .addClass('col-md-4');

      function showComments() {
        if (!flag) {
          flag = true;
        }
        else {
          $comments
            .css('opacity', '0')
            .removeClass('hidden')
            .velocity({
              opacity : 1
            },{
              duration : 1000,
              complete : function() {
                $comments.removeAttr('style', '');
              }
            });

          $.get('/queryComments', {'threadName' : currentThread}, 'json')
            .done(function(comments, textStatus, jqXHR) {
              for (var i in comments) {
                var currComment = comments[i];
                $('#messages')
                  .prepend($('<li>').html(commentTemplate(currComment)));
              }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
              console.log('ERROR:');
              console.log(errorThrown);
            })

          expanded = true;
        }
      }

    }
    else {
      $('#messages').empty();

      $.get('/queryComments', {'threadName' : currentThread}, 'json')
        .done(function(comments, textStatus, jqXHR) {
          for (var i in comments) {
            var currComment = comments[i];
            $('#messages')
              .prepend($('<li>').html(commentTemplate(currComment)));
          }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          console.log('ERROR:');
          console.log(errorThrown);
        })
    }
  })

  //Threads
  $('#submit-thread').submit(function(e){
    e.preventDefault();

    var $headline = $('#headline')
    socket.emit('topicfeed', $headline.val());
    $headline.val('');
  })

  //Comments
  $('#submit-comment').submit(function(e){
    e.preventDefault();

    var $user_input = $('#user_input')
    var $video_input = $('#video_input')

    socket.emit('newsfeed', {
      caption : $user_input.val(),
      video : $video_input.val(),
      threadName : currentThread
    });

    $user_input.val('');
    $video_input.val('');
  })

  socket.on('topicfeed', function(data) {
    var parsedData = JSON.parse(data);
    parsedData.posted = new Date(parsedData.posted);

    $('#topics').prepend($('<li>').html(topicTemplate(parsedData)));
  });

  function topicTemplate(template) {
    var result = '<hr>' +
      '<li>' +
      '<div class="user">' +
      '<div class="user-info">' +
      '<span class="username">' + template.user + '</span>' +
      '<br/>' +
      '<span class="posted">' + template.posted + '</span>' +
      '</div>' +
      '</div>' +
      '<p>' + template.topic + '</p>' +
      '<p><a href="#" class="btn btn-info pull-right comment-button" role="button">Comment</a></p>' +
      '</li>';

    return result;
  }

  socket.on('newsfeed', function(data) {
    var parsedData = JSON.parse(data);
    parsedData.posted = new Date(parsedData.posted);
    $('#messages').prepend($('<li>').html(commentTemplate(parsedData)));
  });

  function commentTemplate(template) {
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
      '<a href="#" class="btn btn-success" role="button"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span>&nbsp;&nbsp;Delete Post</a>' +
      '<a href="#" class="btn btn-success pull-right" role="button"><span class="glyphicon glyphicon-comment" aria-hidden="true"></span>&nbsp;&nbsp;Comment</a>' +

      '</li>';

    return result;
  }

});
