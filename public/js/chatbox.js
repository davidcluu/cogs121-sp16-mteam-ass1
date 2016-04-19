$(function (){
  var socket = io();

  var $trending = $('#trending');
  var $threads  = $('#threads');
  var $comments = $('#comments');

  var currentThread = '';
  var currentUser = $('#currentUser').text();

  var expanded = false;

  $('#messages').on('click', '.navUp', function(e){
    e.preventDefault();

    var PIXELS_PER_SECOND = 1500;

    var obj = $('body');
    var distance = Math.abs( $(document.body).scrollTop() - obj.offset().top );
    var scrollDuration = (distance / PIXELS_PER_SECOND) * 1000;

    obj.velocity('scroll', {
      duration: scrollDuration,
      easing: 'easing'
    });
  });

  $('#messages').on('click', '.deletePost', function(e){
    e.preventDefault();

    var $holder = $(this).closest('li')

    $.ajax({
      url: '/deleteComment',
      type: 'DELETE',
      data: {
        'user': $holder.find('.username').text(),
        'videoCaption': $holder.children('p').text(),
        'threadName': currentThread,
        'posted': $holder.find('.posted').text()
      }
    }).done(function(comments, textStatus, jqXHR) {
      $holder.parent('li').remove();
    });
  });

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
      console.log($headline.val());
      if ($headline.val() === "") {
        alert("Please write something for the headline!");
      } else {
        socket.emit('topicfeed', $headline.val());
      }

    $headline.val('');;
  })

  //Comments
  $('#submit-comment').submit(function(e){
    e.preventDefault();

    var $user_input = $('#user_input')
    var $video_input = $('#video_input')

    if ($video_input.val() === "") {
      alert("Please submit a video!");
    } else {
      socket.emit('newsfeed', {
        caption : $user_input.val(),
        video : $video_input.val(),
        threadName : currentThread
      });
    }

    $user_input.val('');
    $video_input.val('');
  })

  socket.on('topicfeed', function(data) {
    var parsedData = JSON.parse(data);
    parsedData.posted = new Date(parsedData.posted);

    $('#topics').prepend($('<li>').html(topicTemplate(parsedData)));
    alert("Headline successfully submitted!");
  });

  function topicTemplate(template) {
    var result = '<hr>' +
      '<li>' +
      '<div class="user">' +
      '<div class="user-info">' +
      '<div class="topic-style"><p>' + template.topic + '</p></div>' +
      '<span class="username">' + template.user + '</span>' +
      '<br/>' +
      '<span class="posted">' + template.posted + '</span>' +
      '</div>' +
      '</div>' +
      '<p><a href="#" class="btn btn-success pull-right comment-button" role="button">View Comment</a></p>' +
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
      '<p>' + template.videoCaption + '</p>';

    if (currentUser == template.user) {
      result = result + '<a href="#" class="btn btn-success deletePost" role="button"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span>&nbsp;&nbsp;Delete Post</a>';
    }

    result = result + '<a href="#" class="btn btn-success pull-right navUp" role="button"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></a>' +
      '</li>';

    return result;
  }

});
