
// Layer Styling
const data_route_style = {
  "color": '#706d93', // $rhythm
  "weight": 5,
  "opacity": 0.7,
	"lineCap": 'round',
	"dashArray": "0.7 12"
};

const data_ports = {
  "color": '#209488',
  "weight": 2,
  "fillColor": "#209488",
  "opacity": 0.7,
  "fillOpacity": 0.7
}

// Setup leaflet layers
var layers = {
  carto_positron: {
    layer: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    })
  },
  stamen_toner_bg: {
    layer: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.{ext}', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 20,
      ext: 'png'
    })
  },
  stamen_terrain: {
    layer: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 20,
      ext: 'png'
    })
  },
  esri_world: {
    layer: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    })
  },
  data_points: {
    layer: L.geoJson.ajax('./data/points.geojson'),
  },
  data_route: {
    layer: L.geoJson.ajax('./data/route.geojson', {
      style: data_route_style
    }),
  },
  weserkorrektion: {
    layer: L.tileLayer('./data/05_port_construction/Weserkorrektion_tiles/{z}/{x}/{y}.png', {
      tms: true,
      opacity: 0.8,
      attribution: ""
    })
  },
  data_ports_1882: {
    layer: L.geoJson.ajax('./data/04_ueberseehafenbecken/ports_1882+4326.geojson', {
      style: data_ports
    }),
  },
  data_ports_1884: {
    layer: L.geoJson.ajax('./data/04_ueberseehafenbecken/ports_1884+4326.geojson', {
      style: data_ports
    }),
  },
  data_ports_1914: {
    layer: L.geoJson.ajax('./data/04_ueberseehafenbecken/ports_1914+4326.geojson', {
      style: data_ports
    }),
  },
};

// Setup Scenes/Chapters
var scenes = {
  overview: {
    lat: 53.09460389460539,
    lng: 8.771724700927736,
    zoom: 16,
    layers: [layers.data_route, layers.data_points],
    name: "Overview"
  },
  scene1: {
    lat: 53.09460389460539,
    lng: 8.771724700927736,
    zoom: 16,
    layers: [layers.data_route, layers.data_points],
    name: "Introduction"
  },
  scene2: {
    lat: 53.3057,
    lng: 8.7362,
    zoom: 10,
    layers: [layers.esri_world, layers.weserkorrektion],
    name: "River Conservancy",
  },
  scene3: {
    lat: 53.11952960361747,
    lng: 8.729152679443361,
    zoom: 14,
    layers: [layers.esri_world, layers.weserkorrektion],
    name: "Durchstich der Langen Bucht",
  },
  scene4: {
    lat: 53.098778508646554,
    lng: 8.764278888702394,
    zoom: 16,
    layers: [layers.data_ports_1882],
    name: "Harbor Basins (1882)",
  },
  scene5: {
    lat: 53.1036097321532,
    lng: 8.758850097656252,
    zoom: 15,
    layers: [layers.data_ports_1884],
    name: "Harbor Basins (1884)",
  },
  scene6: {
    lat: 53.098778508646554,
    lng: 8.764278888702394,
    zoom: 15,
    layers: [layers.data_ports_1914],
    name: "Harbor Basins (1914)",
  }
};

// Create Map
var createMap = function() {
  var map = L.map($('.storymap-map')[0], {
    zoomControl: false
  }).setView([53.09460389460539, 8.771724700927736], 15);

  console.log('storymap.js createMap');
  // L.tileLayer('http://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}@2x.png').addTo(map);
  return map;
}

$('#storymap').storymap({
  scenes: scenes,
  baselayer: layers.carto_positron,
  legend: true,
  navbar: false,
  loader: true,
  flyto: true,
  dragging: true,
  credits: "<i class='icon ion-md-build' style='font-size: 10px;'></i> with <i class='icon ion-md-heart' style='color: red; font-size: 10px;'></i> from Bo Zhao",
  scalebar: true,
  scrolldown: false,
  progressline: true,
  zoomControl: true,
  createMap: createMap,
});

// Sidemenu Toggle
$('#dismiss, .overlay').on('click', function () {
            // hide sidebar
            $('#sidebar').removeClass('active');
            $('.overlay').removeClass('active');
        });

$('#sidebarCollapse').click(function() {
  $('#sidebar').toggleClass('active');
	$('.overlay').addClass('active');
});

// Content Toggle
function toggleIcon(e) {
  $("#contentCollapse")
    .find(".icon")
    .toggleClass('ion-md-arrow-dropup ion-md-arrow-dropdown');
}

$('.section-content').on('hidden.bs.collapse', toggleIcon);
$('.section-content').on('show.bs.collapse', toggleIcon);
