var unreadTopicsG = [];
var defaultHeight = 48;

function displayError(headerData) {
  var errorHTML = "<strong>" + headerData.title + "</strong>: <br>";
  errorHTML += headerData.message;
  
  var errorDiv = document.getElementById("error");
  errorDiv.innerHTML = errorHTML;
  errorDiv.setAttribute("class", "error");
  errorDiv.removeAttribute("style");
  document.getElementById("wrapper").setAttribute("style", "display:none");
  safari.extension.popovers[0].height = defaultHeight;
}

function displayUnread(headerData, unreadTopics) {
  unreadTopicsG = unreadTopics;
  updateHeader(headerData);

  var topics = "";
  var newHeight = defaultHeight;
  var maxHeight = 456;

  for (var i = 0; i < unreadTopics.length; i++) {
    // TODO: crop by pixels and not char number
    var subject = cropLine(unreadTopics[i].subject, 39);
    var by = cropLine(unreadTopics[i].by, 38);
    var url = unreadTopics[i].url;
    topics += createTopicHTML(subject, by, url);

    // adds some height by each topic until a given heigh limit
    if (newHeight < maxHeight) {
      console.log(newHeight);
      newHeight += 51;
    }
  }
  // adds some height to ensure the user sees there are more topics to read.
  if (newHeight >= maxHeight) {
    newHeight += 27;
  }

  document.getElementById("topics").innerHTML = topics;
  safari.extension.popovers[0].height = newHeight;
}

function createTopicHTML(subject, by, url) {
  var topicHTML = "<hr><div class='topic' onclick=\"openTab('" + url + "')\">";
  topicHTML += "<strong>" + subject + "</strong>";
  topicHTML += "<br> last topic by " + "<i>" + by + "</i></div>";
  return topicHTML;
}

function updateHeader(headerData) {
  var length = headerData.unreadN;
  var message = length + " unread " + isSingleTopic(length) + ".";

  if (length === 0) {
    document.getElementById("right-side").setAttribute("style", "display:none");
  } else {
    document.getElementById("right-side").removeAttribute("style");
  }
  
  document.getElementById("error").setAttribute("style", "display:none");
  document.getElementById("wrapper").removeAttribute("style");
  document.getElementById("title").innerHTML = headerData.mode;
  document.getElementById("message").innerHTML = message;
}

function isSingleTopic(length) {
  return (length === 1) ? "topic" : "topics";
}

// uses unreadTopicsG set on displayUnread
function openTabs() {
  var originalActiveTab = safari.application.activeBrowserWindow.activeTab;
  var firstTab = openTab(unreadTopicsG[0].url);

  for (var i = 1; i < unreadTopicsG.length; i++) {
      openTab(unreadTopicsG[i].url);
  }
  firstTab.activate();
  var changeFocusAll = safari.extension.settings.changeFocusAll;
  if (!changeFocusAll) {
    originalActiveTab.activate();
  }
}

function openTab(url) {
  var changeFocusSingle = safari.extension.settings.changeFocusSingle;
  var originalActiveTab = safari.application.activeBrowserWindow.activeTab;
  
  var newTab = safari.application.activeBrowserWindow.openTab();
  newTab.url = url;

  if (!changeFocusSingle) {
    originalActiveTab.activate();
  }
  return newTab;
}

function cropLine(line, size) {
  var newLine = line.slice(0, size);
  if (line !== newLine) {
    newLine += "...";
  }
  return newLine;
}