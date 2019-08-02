/**************************/
/*       MAP RELATED      */
/**************************/

function createMap() {
  map = L.map($('.storymap-map')[0], {
    zoomControl: false,
    attributionControl: false
  }).setView([53.09460389460539, 8.771724700927736], 15);

  const eastside = '#ad7fc7';

  stripes_eastside = new L.StripePattern({
    color: eastside,
    opacity: 1,
    angle: -10
  }).addTo(map);

  return map;
}

// Layer Styling
function styleFeatures(feature) {
  return {
    color: '#878d8e',
    fillPattern: stripes_eastside,
    fillOpacity: 0.8,
    weight: 1,
    smoothFactor: 1
  };
}

function pointToLayer(feature, latlng) {
  let style = [];
  for (var [key, value] of Object.entries(circlecolors)) {
    style[key] = {
      radius: 16,
      fillColor: value,
      color: '#878d8e',
      fillOpacity: 0.5,
      opacity: 1,
      weight: 1,
    };
    if (feature.meta.color == key) {
      return L.circleMarker(latlng, style[key]);
    }
  }
}

function onEachPoint(feature, layer) {
  let point = feature.geometry.coordinates;
  let bounds = L.latLng(point.reverse()).toBounds(150);

  setInterval(function () {
    // Check if L.Control.Locate is activated
    if (LocateControl._active) {
      let latlng = LocateControl._event.latlng;
      let sceneName = feature.properties.scene;
      if (latlng != undefined && bounds.contains(latlng) && !visited.includes(sceneName)) {
        map.setView(point, 16);

        let loop_before = loop.slice(0, loop.indexOf(sceneName));
        let loop_after = loop.slice(loop.indexOf(sceneName), loop.length);

        loop = loop_after.concat(loop_before);

        targetScene = sceneName;
        getSection(sections);

        // Prohibit Scene to be visited again
        visited.push(sceneName);

      }
    }
  }, 10000);

  if (feature.properties && feature.properties.name) {
    layer.bindPopup(feature.properties.name);
    layer.on({
      mouseover: function () {
        this.openPopup();
      },
      // mouseout: function() {
      //     this.closePopup();
      // },
      click: onItemClick,
    });
  };
}

function onEachStreet(feature, layer) {

  if (feature.properties && feature.properties.name) {
    layer.bindPopup(feature.properties.name);
    layer.on({
      mouseover: function () {
        this.openPopup();
      },
    });
  };
}

function onItemClick(item) {
  map.setView(item.latlng, 16);
  let sceneName = item.target.feature.properties.scene;

  let loop_before = loop.slice(0, loop.indexOf(sceneName));
  let loop_after = loop.slice(loop.indexOf(sceneName), loop.length);

  loop = loop_after.concat(loop_before);

  targetScene = sceneName;
  getSection(sections);
}

function getMapCredits(scene, layers, settings) {

  // Add Custom Attribution to bottomright
  $($('div.leaflet-bottom.leaflet-right')[0])
    .append($('<div>', {
      class: 'leaflet-control-attribution leaflet-control'
    }));

  let attribution = $('.leaflet-control-attribution');

  if (settings.credits) {
    $(attribution[0]).html(settings.credits + " | " + layers.carto_positron.layer.options.attribution);
  } else {
    $(attribution[0]).html(layers.carto_positron.layer.options.attribution);
  }

  for (layer = 0; layer < scene.layers.length; layer++) {
    if (scene.layers[layer].layer.options.attribution) {
      $(attribution[0]).append(" | " + scene.layers[layer].layer.options.attribution)
    }
  }
}

/**************************/
/*        STORYMAP        */
/**************************/

function buildSections(element, searchfor) {
  loadContent(sections);
  sections = $(element).find(searchfor);
  getSection(sections);
}

function loadContent(sections) {

  $.each(sections, function (key, element) {

    let section = $(element)
    let sectionContent = $(section).find('.section-content');
    let sceneName = section[0].dataset.scene;

    if (sectionContent.length != 0) {

      fetch('./data/content/dist/' + sceneName + '.html')
        .then(response => response.text())
        .then(content => {

          $(sectionContent[0]).html(content);
        });
    };

  });
}

function getSection(sections) {

  $.each(sections, function (key, element) {

    let section = $(element);
    // Keep for Development
    let sectionContent = $(element).children('.section-content')
    if (section[0].dataset.scene !== targetScene) {
      section.trigger('notviewing');
    } else {
      section.trigger('viewing');
      // Hide prevArrow
      toggleArrow(key);
    };
  });
}


function changeTitle(key) {
  let scene = scenes[key];
  $('a[class^="title section-heading"]').children().html(scene.name);
}

/**************************/
/*       NAVIGATION       */
/**************************/

function showPrevious() {

  function prevItem() {
    loop.unshift(loop[loop.length - 1]);
    loop.pop()
    return loop[0]
  }
  targetScene = prevItem()
  getSection(sections);

}

function showNext(key) {

  function nextItem(key) {
    loop.push(key);
    loop.shift()
    return loop[0]
  }

  targetScene = nextItem(key)

  getSection(sections);
  toggleArrow(key);

}

// History API
function backInHistory() {
  let key = window.location.hash.substr(1);

  let loop_before = loop.slice(0, loop.indexOf(key));
  let loop_after = loop.slice(loop.indexOf(key), loop.length);

  loop = loop_after.concat(loop_before);

  targetScene = key;
  getSection(sections);
}

// Can be removed after Development, just there for backwards navigation testing
function toggleArrow(key) {
  if (first) {
    $('#prevArrow').prop("disabled", true);
    first = false;
  } else {
    $('#prevArrow').prop("disabled", false);
  }
}

/**************************/
/*         SIDEBAR        */
/**************************/

function buildSidebar(key, sceneNames, sceneKeys) {
  let current = sceneKeys[sceneKeys.indexOf(key) % sceneKeys.length];
  generateList(key, sceneNames, sceneKeys, current);
  let list = document.getElementById("sidebarItems").getElementsByTagName("a");
  activateList(list, key);

}

function generateList(key, sceneNames, sceneKeys, current) {
  let ul = $('#sidebarItems')
  let length = Object.keys(sceneNames).length
  let count = 0;
  $.each(sceneNames, function (key, value) {
    let li = $('<li></li>')
    ul.append(li)
    if (count == 0) {
      li.html("<a href='#" + key + "' data-target='" + key + "'><i class='ion-sidebar-icon icon ion-md-home'></i><span class='spacer'></span>" + value + "</a>")
    }
    else if (count == length - 1) {
      li.html("<a href='#" + key + "' data-target='" + key + "'><i class='fa-sidebar-icon fas fa-flag-checkered'></i><span class='spacer'></span>" + value + "</a>")
    } else {
      if (scenes[key].navigateTo == false) {
        li.html("<a href='#" + key + "' data-target='" + key + "'><i class='ion-sidebar-icon icon ion-md-return-right'></i></i><span class='spacer'></span>" + value + "</a>")
        li.wrap('<ul class="sidebarSub"></ul>')
      } else {
        li.html("<a href='#" + key + "' data-target='" + key + "'><i class='fa-sidebar-icon fas fa-circle'><i class='icon-number'>" + count + "</i></i><span class='spacer'></span>" + value + "</a>")
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
    count = count + 1;
  });
}

function activateList(list, key) {

  $.each(list, function(key, value) {

    let sceneName = value.dataset.target

    $(value).click(function() {

      let loop_before = loop.slice(0, loop.indexOf(sceneName));
      let loop_after = loop.slice(loop.indexOf(sceneName), loop.length);

      loop = loop_after.concat(loop_before);

      targetScene = sceneName;
      getSection(sections);

      $('#sidebar').toggleClass('active');
      $('#sidebar').toggleClass('shadow');
      $('.overlay').removeClass('active');

    })
  });

}

function updateSidebar(key, sceneKeys) {
  let current = sceneKeys[sceneKeys.indexOf(key) % sceneKeys.length];
  let list = document.getElementById("sidebarItems").getElementsByTagName("a");

  $.each(list, function(key, value) {

    if (current == value.dataset.target) {
      $(value).find('i').addClass('active-icon')
      $(value).addClass('active')
      $(value).find('i').removeClass('inactive-icon')
    }
    else {
      $(value).find('i').removeClass('active-icon')
      $(value).removeClass('active')
      $(value).find('i').addClass('inactive-icon')
    }
  })

}
