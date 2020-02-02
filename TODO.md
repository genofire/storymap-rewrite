# TODO: storymap-rewrite

- [X] Build Sidebar Content dynamically
- [X] Leaflet.pattern integration
- [X] Transparency Slider (on Rasterlayers)
- [X] Fix Collapse Icon on Navbar
- [X] Geolocation Bounds
- [X] Add Custom Attribution Field
- [x] Fix Sidebar Scene Selection
- [x] Browser History
- [x] Stations should start w/ Text collapsed
- [x] fixed OpacityControl

## Audio
- [ ] Audio Playback
- [ ] Navigation für Audio: 15 Sek vor/zurückspringen
- [ ] Tonsignal bei Erreichen der Station

- [ ] Remove IconToggle on empty Sections
- [ ] ProgressLine on Map (VectorPath)
- [ ] Gallery, where to show images?
- [ ] Fix Icon Issue on Transparency Slider (??)
- [ ] fix issues with long titles on small Screens

- [ ] decide what should happen on first and last scene (how to navigate)
- [ ] do not scroll section when scrolling sidebar

## Nice-To-Have
- [ ] Nummerierte CircleMarker: https://github.com/w8r/leaflet-labeled-circle
- [ ] package as APP


### Geolocation Testing

- open `about:config`
- change value of `geo.wifi.uri`

#### Firefox Default

``` javascript
https://location.services.mozilla.com/v1/geolocate?key=%MOZILLA_API_KEY%
```

#### Überseetor (out of bounds)

```javascript
data:application/json,{"location": {"lat": 53.095061318063934, "lng": 8.772915601730347}, "accuracy": 270.0}
```

#### Überseetor (in bounds)

```javascript
data:application/json,{"location": {"lat": 53.09422055711675, "lng": 8.771351873874664}, "accuracy": 270.0}
```

#### Fabrikenufer

```javascript
data:application/json,{"location": {"lat": 53.09797808356111, "lng": 8.774028718471527}, "accuracy": 270.0}
```
