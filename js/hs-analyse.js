// if you want to persist the key then you can do it here
// but make sure you don't push this to the interwebs!
var globalApiKey = "";

function rememberMe(checked, apiKey) {
  if (checked) {
    document.cookie = "apiKey="+apiKey+";";
  }
  else {
    document.cookie = "apiKey=";
  }
}

function buildMailboxes(apiKey) {
  if (globalApiKey == "") {
    globalApiKey = apiKey;
  }
  
  $.ajax({
    type: "GET"
    ,url: "https://api.helpscout.net/v1/mailboxes.json"
    ,dataType: "text"
    ,headers: {
      "Authorization": "Basic " + btoa(globalApiKey + ":" + "X")
    }
    ,success: function(data) {
      var json = JSON.parse(data);
      var mailboxes = new Array();
      var i = 0;
      $.each(json.items, function(idx, el) {
        mailboxes.push(el);
      });
      drawMailboxes(mailboxes);
    }
  });
}

function drawMailboxes(boxes) {
  // hide the messages
  $("#casesDiv").hide();

  // show the mailboxes
  $("#mailboxesDiv").css('visibility', 'visible');
  $("#mailboxesDiv").show();
  var rows = new Array();
  boxes = boxes.sort(function(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
  $.each(boxes, function(idx, el) {
    var row = "<tr>\n";
    row += "\t<td><a href='javascript:buildConversations("+el.id+")'>"+el.name+"</a></td>\n";
    row += "\t<td>"+el.email+"</td>\n";
    row += "</tr>";
    rows.push(row);
  });

  // empty from previous time
  $('#mailboxes').empty();
  
  var section = rows.join("\n");
  $('#mailboxes').append(section);
}

function buildConversations(mailboxId) {
  // hide the mailboxes
  $("#mailboxesDiv").hide();

  // show the cases
  $("#casesDiv").css('visibility', 'visible');
  $("#casesDiv").show();
  var monthNo = (new Date()).getMonth();
  $.ajax({
    type: "GET"
    ,url: "https://api.helpscout.net/v1/mailboxes/"+mailboxId+"/conversations.json"
    ,dataType: "text"
    ,headers: {
      "Authorization": "Basic " + btoa(globalApiKey + ":" + "X")
    }
    ,success: function(data) {
      var json = JSON.parse(data);
      var convos = new Array();
      var i = 0;
      $.each(json.items, function(idx, el) {
        var date = new Date(el.createdAt);
        if (date.getMonth() == monthNo) {
          if (el.threadCount == 1) {
            // unanswered
          }
          else {
            analyseConversation(el, convos);
          }
        }
      });
      drawConvosTable(convos);
    }
  });
}

function analyseConversation(el, convos) {
  $.ajax({
    type: "GET"
    ,url: "https://api.helpscout.net/v1/conversations/"+el.id+".json"
    ,dataType: "text"
    ,async: false
    ,headers: {
      "Authorization": "Basic " + btoa(globalApiKey + ":" + "X")
    }
    ,success: function(data) {
      var json = JSON.parse(data);
      // the threads variable has the email thread
      // the latest email is at key 0
      var item = json.item;
      var threads = json.item.threads;

      // I presume first message was from customer
      var firstMessage = threads[threads.length-1];
      var secondMessage = null;
      for (var i = threads.length-2; i >= 0; i--) {
        if (threads[i].type == "message" && threads[i].state == "published") {
          // we've found a thread item which is an answer from us
          secondMessage = threads[i];
          break;
        }
      }

      if (secondMessage == null) {
        console.log("unable to process", item);
        return null;
      }

      // time to first response
      el.timeTFR = (Date.parse(secondMessage.createdAt) - Date.parse(firstMessage.createdAt))/1000;
      convos.push(el)
    }
  });
}

function drawConvosTable(convos) {
  var rows = new Array();
  convos = convos.sort(function(a, b){
    return b.timeTFR-a.timeTFR;
  });
  $.each(convos, function(idx, el) {
    var row = "<tr>\n";
    row += "\t<td><a href='https://secure.helpscout.net/conversation/"+el.id+"/'>"+el.subject+"</a></td>\n";
    row += "\t<td>"+humanize.humanizeSeconds(el.timeTFR)+"</td>\n";
    row += "</tr>";
    rows.push(row);
  });

  // empty from previous time
  $('#cases').empty();

  if (rows.length > 0) {
    var headers = "<thead><tr><th>Subject</th><th>Time to First Response</th></tr>"
    $('#cases').append(headers)
    var section = rows.join("\n");
    $('#cases').append(section);
  }
  else {
   $('#cases').append("<tr><td>No conversations found!</td></tr>"); 
  }
}
