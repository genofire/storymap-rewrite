// Layer Styling
function styleFeatures(feature) {
    return {
        color: '#878d8e',
        fillPattern: stripes_eastside,
        fillOpacity: 0.8,
        weight: 1,
        smoothFactor: 1,
    }
}

function pointToLayer(feature, latlng) {
    var style = []
    for (const [key, value] of Object.entries(circlecolors)) {
        style[key] = {
            radius: 16,
            fillColor: value,
            color: '#878d8e',
            fillOpacity: 0.5,
            opacity: 1,
            weight: 1,
        }
        if (feature.color == key) {
            return L.circleMarker(latlng, style[key]);
        }
    }
}

function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.name);
        layer.on({
            mouseover: hoverInItem,
            // mouseout: hoverOutItem,
            click: onItemClick,
        });
    }
}

function hoverInItem(item) {
    this.openPopup();
}

function hoverOutItem(item) {
    this.closePopup();
}

function onItemClick(item) {
    map.setView(item.latlng, 16)
    showNext(item.scene)
}

function getSection(sections) {

    $.each(sections, function(key, element) {

        var section = $(element);
        if (section[0].dataset.scene !== gotoScene) {
            section.trigger('notviewing');
        } else {
            section.trigger('viewing');
            toggleArrow(current);
        };
    });
}

function toggleArrow(key) {
    if (first) {
        $('#prevSceneLeft').addClass('invisible');
        first = false;
    }
    else {
        $('#prevSceneLeft').removeClass('invisible');
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
        $('#nextSceneRight').html("<a href='#'><i class='arrow-icon icon ion-md-home'></i></a>");
    }
    else {
        $('#nextSceneRight').html("<a href='#'><i class='arrow-icon icon ion-md-arrow-forward'></i></a>");
    }
}
