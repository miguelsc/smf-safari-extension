(function() {

  function performCommand(event) {
    if (event.command === "get-unread") {
      requestUrl(handleRequest);
    }
  }

  function getUrl() {
    var forumUrl = safari.extension.settings.forumUrl;
    var mode = safari.extension.settings.mode;
    var url = forumUrl + "?action=" + mode;

    return url;
  }

  function requestUrl(callback) {
    var url = getUrl();
    var request = new XMLHttpRequest();
    request.open("GET", url);
    request.onreadystatechange = function() {
      callback(request);
    };
    request.send();
  }

  function handleRequest(request) {
    var headerData = {};
    var filteredTopics = [];

    if (request.readyState != 4) return;
    if (request.status === 200) {
      var mode = (safari.extension.settings.mode === "unread") ? "unread" : "unread replies";
      var responseHTML = request.responseText;
      var unreadTopics = getUnread(responseHTML);
      
      filteredTopics = filterUnread(unreadTopics);
      
      headerData.status = "CHECK";
      headerData.mode = mode;
      headerData.unreadN = filteredTopics.length;
    } else {
      headerData.status = "ERROR";
      headerData.title = "Error";
      headerData.message = "The connection to the server failed.";
    }
    showPopover(headerData, filteredTopics);
  }

  function getUnread(responseText) {
    console.log(responseText);
    var container = document.createElement("div");
    container.innerHTML = responseText;

    var subjectList = container.getElementsByClassName("subject");
    var lastPostList = container.getElementsByClassName("lastpost");

    var unreadList = [];
    console.log(subjectList);
    for (var i = 0; i < subjectList.length; i++) {
      var links = subjectList[i].getElementsByTagName("a");

      var topicName = links[0].text;
      var url = links[1].href;
      var by = lastPostList[i].lastElementChild.text;

      var item = {
        "subject": topicName,
        "url": url,
        "by": by
      };
      unreadList.push(item);
    }
    return unreadList;
  }

  function showPopover(headerData, filteredTopics) {
    var popover = safari.extension.popovers[0].contentWindow;
    if (headerData.status === "ERROR") {
      popover.displayError(headerData);
    } else {
      popover.displayUnread(headerData, filteredTopics);
    }
    safari.extension.toolbarItems[0].showPopover();
  }

  function openTabs(unreadTopics) {
    for (var i = 0; i < unreadTopics.length; i++) {
      openTab(unreadTopics[i].url);
    }
  }

  function openTab(url) {
    safari.application.activeBrowserWindow.openTab().url = url;
  }

  function filterUnread(unreadTopics) {
    var ignoredTopics = safari.extension.settings.ignoredTopics;
    var filteredUnread = [];
    for (var i = 0; i < unreadTopics.length; i++) {
      if (!isIgnoredUrl(ignoredTopics, unreadTopics[i].url)) {
        filteredUnread.push(unreadTopics[i]);
      }
    }
    return filteredUnread;
  }

  function isIgnoredUrl(ignoredTopics, url) {
    if (ignoredTopics === undefined) return;
    var ignoredTopicsList = ignoredTopics.split(/,\s*/);
    var topicNumber = url.match(/topic=(\d+)/);
  
    for (var key in ignoredTopicsList) {
      if (ignoredTopicsList[key] === topicNumber[1]) {
        return true;
      }
    }
    return false;
  }

  function notify(title, options) {
    var url = options.url;
    if(window.Notification) {
        console.log(Notification.permission);
        if (Notification.permission === 'default') {
          Notification.requestPermission(function() {
            alert(options);
            notify(title, options);
          });
        }
        else if(Notification.permission === 'granted') {
          var notification = new Notification(title, options);
          notification.onclick = function(options) {
            openTab(url);
          };
        }
    }
  }

  safari.application.addEventListener("command", performCommand, false);
  
})();