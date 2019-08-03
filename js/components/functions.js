

function loadContent (sections) {
  $.each(sections, function (key, element) {
    const section = $(element)
    const sectionContent = $(section).find('.section-content')
    const sceneName = section[0].dataset.scene

    if (sectionContent.length !== 0) {
      fetch('./data/content/dist/' + sceneName + '.html')
        .then(response => response.text())
        .then(content => {
          $(sectionContent[0]).html(content)
        })
    };
  })
}





/**************************/
/*       NAVIGATION       */
/**************************/

function showPrevious () {
  function prevItem () {
    loop.unshift(loop[loop.length - 1])
    loop.pop()
    return loop[0]
  }
  targetScene = prevItem()
  getSection(sections)
}

function showNext (key) {
  function nextItem (key) {
    loop.push(key)
    loop.shift()
    return loop[0]
  }

  targetScene = nextItem(key)

  getSection(sections)
  toggleArrow(key)
}



/**************************/
/*         SIDEBAR        */
/**************************/

function buildSidebar (key, sceneNames, sceneKeys) {
  const current = sceneKeys[sceneKeys.indexOf(key) % sceneKeys.length]
  generateList(key, sceneNames, sceneKeys, current)
  const list = document.getElementById('sidebarItems').getElementsByTagName('a')
  activateList(list, key)
}

function generateList (key, sceneNames, sceneKeys, current) {
  const ul = $('#sidebarItems')
  const length = Object.keys(sceneNames).length
  let count = 0
  $.each(sceneNames, function (key, value) {
    const li = $('<li></li>')
    ul.append(li)
    if (count == 0) {
      li.html("<a href='#" + key + "' data-target='" + key + "'><i class='ion-sidebar-icon icon ion-md-home'></i><span class='spacer'></span>" + value + '</a>')
    } else if (count == length - 1) {
      li.html("<a href='#" + key + "' data-target='" + key + "'><i class='fa-sidebar-icon fas fa-flag-checkered'></i><span class='spacer'></span>" + value + '</a>')
    } else {
      if (scenes[key].navigateTo == false) {
        li.html("<a href='#" + key + "' data-target='" + key + "'><i class='ion-sidebar-icon icon ion-md-return-right'></i></i><span class='spacer'></span>" + value + '</a>')
        li.wrap('<ul class="sidebarSub"></ul>')
      } else {
        li.html("<a href='#" + key + "' data-target='" + key + "'><i class='fa-sidebar-icon fas fa-circle'><i class='icon-number'>" + count + "</i></i><span class='spacer'></span>" + value + '</a>')
      }
    }

    if (key == current) {
      $(li).find('i').addClass('active-icon')
      $(li).find('a').addClass('active')
      $(li).find('i').removeClass('inactive-icon')
    } else {
      $(li).find('i').removeClass('active-icon')
      $(li).find('a').removeClass('active')
      $(li).find('i').addClass('inactive-icon')
    }
    count = count + 1
  })
}

function activateList (list, key) {
  $.each(list, function (key, value) {
    const sceneName = value.dataset.target

    $(value).click(function () {
      const scenesBefore = loop.slice(0, loop.indexOf(sceneName))
      const scenesAfter = loop.slice(loop.indexOf(sceneName), loop.length)

      loop = scenesAfter.concat(scenesBefore)

      targetScene = sceneName
      getSection(sections)

      $('#sidebar').toggleClass('active')
      $('#sidebar').toggleClass('shadow')
      $('.overlay').removeClass('active')
    })
  })
}

function updateSidebar (key, sceneKeys) {
  const current = sceneKeys[sceneKeys.indexOf(key) % sceneKeys.length]
  const list = document.getElementById('sidebarItems').getElementsByTagName('a')

  $.each(list, function (key, value) {
    if (current == value.dataset.target) {
      $(value).find('i').addClass('active-icon')
      $(value).addClass('active')
      $(value).find('i').removeClass('inactive-icon')
    } else {
      $(value).find('i').removeClass('active-icon')
      $(value).removeClass('active')
      $(value).find('i').addClass('inactive-icon')
    }
  })
}
