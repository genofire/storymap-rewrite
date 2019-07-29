//
function createMap() {
    map = L.map($('.storymap-map')[0], {
        zoomControl: false,
        attributionControl: false
    }).setView([53.09460389460539, 8.771724700927736], 15);

    var eastside = '#ad7fc7';

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
        smoothFactor: 1,
    };
}

function pointToLayer(feature, latlng) {
    var style = [];
    for (var [key, value] of Object.entries(circlecolors)) {
        style[key] = {
            radius: 16,
            fillColor: value,
            color: '#878d8e',
            fillOpacity: 0.5,
            opacity: 1,
            weight: 1,
        };
        if (feature.color == key) {
            return L.circleMarker(latlng, style[key]);
        }
    }
}

function onEachFeature(feature, layer) {
    var point = feature.geometry.coordinates;
    var bounds = L.latLng(point.reverse()).toBounds(150);

    setInterval(function(){
        // Check if L.Control.Locate is activated
        if (LocateControl._active) {
            var latlng = LocateControl._event.latlng;
            if (latlng != undefined && bounds.contains(latlng) && loaded[0] == itemName) {
                map.setView(point, 16);
                var itemName = feature.properties.scene;

                var loop_before = loop.slice(0, loop.indexOf(itemName));
                var loop_after = loop.slice(loop.indexOf(itemName), loop.length);

                loop = loop_after.concat(loop_before);

                gotoScene = itemName;
                getSection(sections);

                // Prohibit Scene to be loaded again
                loaded.push(itemName);
            }
        }
    }, 5000);

    if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.name);
        layer.on({
            mouseover: function() {
                this.openPopup();
            },
            // mouseout: function() {
            //     this.closePopup();
            // },
            click: onItemClick,
        });
    };
}

function onItemClick(item) {
    map.setView(item.latlng, 16);
    var itemName = item.target.feature.properties.scene;

    var loop_before = loop.slice(0, loop.indexOf(itemName));
    var loop_after = loop.slice(loop.indexOf(itemName), loop.length);

    loop = loop_after.concat(loop_before);

    gotoScene = itemName;
    getSection(sections);
}

function getMapCredits(scene, layers, settings) {

    // Add Custom Attribution to bottomright
    $($('div.leaflet-bottom.leaflet-right')[0])
    .append($('<div>', {class: 'leaflet-control-attribution leaflet-control'}));

    var attribution = $('.leaflet-control-attribution');

    if (settings.credits) {
    $(attribution[0]).html(settings.credits + " | " + layers.carto_positron.layer.options.attribution);
    }
    else {
    $(attribution[0]).html(layers.carto_positron.layer.options.attribution);
    }

    for (layer = 0; layer < scene.layers.length; layer++) {
        if (scene.layers[layer].layer.options.attribution) {
            $(attribution[0]).append(" | " + scene.layers[layer].layer.options.attribution)
        }
    }
}

function getSection(sections) {
    $.each(sections, function(key, element) {

        var section = $(element);
        if (section[0].dataset.scene !== gotoScene) {
            section.trigger('notviewing');
        } else {
            section.trigger('viewing');
            // Hide prevArrow
            toggleArrow();
        };
    });
}

function buildSections(element, searchfor) {
    sections = $(element).find(searchfor);
    getSection(sections);
}

function toggleArrow(key) {
    if (first) {
        $('#prevArrow').addClass('invisible');
        first = false;
    }
    else {
        $('#prevArrow').removeClass('invisible');
    }
}

function showNext(key) {

    function nextItem(key) {
        loop.push(key);
        loop.shift()
        return loop[0]
    }
    gotoScene = nextItem(key)
    getSection(sections);

    if (key == prelast) {
        $('#nextArrow').html("<a href='#'><i class='arrow-icon icon ion-md-home'></i></a>");
    }
    else {
        $('#nextArrow').html("<a href='#'><i class='arrow-icon icon ion-md-arrow-forward'></i></a>");
    }
}
