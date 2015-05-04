/**
 *
 * A JQUERY SMAP LATLON PICKER
 * version 1.0
 *
 * Supports multiple maps. Works on touchscreen. Easy to customize markup and CSS.
 * 
 * Object style stucture inherited from GMAP LATLON PICKER
 * 
 * by Zdeněk Rohlíček
 * zdenek.rohlicek@aira.cz
 *
 */
(function ($) {

// for ie9 doesn't support debug console >>>
  if (!window.console)
    window.console = {};
  if (!window.console.log)
    window.console.log = function () {
    };
// ^^^

  $.fn.sMapsLatLonPicker = (function () {

    var _self = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // PARAMETERS (MODIFY THIS PART) //////////////////////////////////////////////////////////////
    _self.params = {
      defLat: 0,
      defLng: 0,
      defZoom: 1,
      queryLocationNameWhenLatLngChanges: true,
      queryElevationWhenLatLngChanges: true,
      mapOptions: {
        minZoom: 5
      },
      strings: {
        markerText: "Drag this Marker",
        error_empty_field: "Couldn't find coordinates for this place",
        error_no_results: "Couldn't find coordinates for this place"
      }
    };
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // VARIABLES USED BY THE FUNCTION (DON'T MODIFY THIS PART) ////////////////////////////////////
    _self.vars = {
      ID: null,
      LATLNG: null,
      map: null,
      markerLayer: null,
      marker: null,
      geocoder: null
    };
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // PRIVATE FUNCTIONS FOR MANIPULATING DATA ////////////////////////////////////////////////////
    var setPosition = function (position) {
      _self.vars.marker.setCoords(position);
      _self.vars.map.setCenter(position);
//      console.log(position);

      $(_self.vars.cssID + ".sllpZoom").val(_self.vars.map.getZoom());
      $(_self.vars.cssID + ".sllpLongitude").val(position.x);
      $(_self.vars.cssID + ".sllpLatitude").val(position.y);
//
//		$(_self.vars.cssID).trigger("location_changed", $(_self.vars.cssID));
//
      //passing geocoder result to function
      if (_self.params.queryLocationNameWhenLatLngChanges) {
        new SMap.Geocoder.Reverse(position, getLocationName);
      }
//		if (_self.params.queryElevationWhenLatLngChanges) {
//			getElevation(position);
//		}
    };
    // for reverse geocoding
    var getLocationName = function (geocoder) {
      var results = geocoder.getResults();
//      console.log(results);
      $(_self.vars.cssID + ".sllpSearchField").val(results.label);
    };
    // search function
    var geocoderSearch = function (value) {
      new SMap.Geocoder(value, performSearch);
    };
    var performSearch = function (geocoder) {
      if (!geocoder.getResults()[0].results.length) {
        alert("Tohle neznáme.");
        return;
      }
      var vysledky = geocoder.getResults()[0].results;
      //fill array with geo
      var data = [];
      while (vysledky.length) {
        var item = vysledky.shift();
        data.push(item);
      }
      console.log(data);
      $(_self.vars.cssID + ".sllpZoom").val(12);
      _self.vars.map.setZoom(parseInt($(_self.vars.cssID + ".sllpZoom").val()));
      setPosition(data[0].coords);
    };
    // error function
    var displayError = function (message) {
//          alert(message);
    };
    //change marker icon
    var setMarkerIcon = function (color) {
      if (color === '' || color === null) {
        color = 'red';
      }
      var c = 'http://maps.google.com/mapfiles/ms/icons/' + color + '-dot.png';
      _self.vars.marker.setURL(c);
    };
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // PUBLIC FUNCTIONS  //////////////////////////////////////////////////////////////////////////
    var publicfunc = {
      // INITIALIZE MAP ON DIV //////////////////////////////////////////////////////////////////
      init: function (object) {
        console.DEBUG = 1;
        if (!$(object).attr("id")) {
          if ($(object).attr("name")) {
            $(object).attr("id", $(object).attr("name"));
          } else {
            $(object).attr("id", "_MAP_" + Math.ceil(Math.random() * 10000));
          }
        }

        _self.vars.ID = $(object).attr("id");
        _self.vars.cssID = "#" + _self.vars.ID + " ";
        _self.params.defLat = $(_self.vars.cssID + ".sllpLatitude").val() ? $(_self.vars.cssID + ".sllpLatitude").val() : _self.params.defLat;
//            _self.params.defLat = parseFloat(_self.params.defLat);
        _self.params.defLng = $(_self.vars.cssID + ".sllpLongitude").val() ? $(_self.vars.cssID + ".sllpLongitude").val() : _self.params.defLng;
//            _self.params.defLng = parseFloat(_self.params.defLng);
        _self.params.defZoom = $(_self.vars.cssID + ".sllpZoom").val() ? $(_self.vars.cssID + ".sllpZoom").val() : _self.params.defZoom;
//            _self.params.defZoom = parseFloat(_self.params.defZoom);
        _self.vars.LATLNG = SMap.Coords.fromWGS84(_self.params.defLng, _self.params.defLat);
        _self.vars.MAPOPTIONS = _self.params.mapOptions;
        _self.vars.MAPOPTIONS.zoom = _self.params.defZoom;
        _self.vars.MAPOPTIONS.center = _self.vars.LATLNG;

        //create map
        _self.vars.map = new SMap($(_self.vars.cssID + ".sllpMap").get(0), _self.vars.LATLNG, _self.params.defZoom, _self.params.mapOptions);
        _self.vars.map.addDefaultLayer(SMap.DEF_BASE).enable();

        //set mouse controls to prevent default dblclick
        var mouse = new SMap.Control.Mouse(SMap.MOUSE_PAN | SMap.MOUSE_WHEEL); /* Ovládání myší */
        _self.vars.map.addControl(mouse);
        
        //set zoom and compass
        var o = {title: "Posun mapy"};
        var c = new SMap.Control.Compass(o);
        _self.vars.map.addControl(c, {right: "8px", top: "50px"});
        _self.vars.map.addControl(new SMap.Control.Zoom({title: "Zoom"}, {showZoomMenu: false}), {right: "8px", top: "9px"});


        //marker layer
        _self.vars.markerLayer = new SMap.Layer.Marker();
        _self.vars.map.addLayer(_self.vars.markerLayer).enable();

        //marker code
        _self.vars.marker = new SMap.Marker(_self.vars.LATLNG, null, {anchor: {left: 20, bottom: 20}});
        _self.vars.marker.decorate(SMap.Marker.Feature.Draggable);

        //set default marker color
        setMarkerIcon($(_self.vars.cssID + ".sllpColor option:selected").val());
        _self.vars.markerLayer.addMarker(_self.vars.marker);

        //signals handling
        var signals = _self.vars.map.getSignals();
        // Set position on doubleclick
        signals.addListener(window, 'map-click', function (event) {//solve double click
//          var coords = SMap.Coords.fromEvent(event.data.event, _self.vars.map);
//          setPosition(coords.toWGS84());
        });

        // Set mouse icon on marker start
        signals.addListener(window, 'marker-drag-start', function (event) {
          var node = event.target.getContainer();
          node[SMap.LAYER_MARKER].style.cursor = "move";
        });

        // Set position on marker move
        signals.addListener(window, 'marker-drag-stop', function (event) {
          //set icon to its default style
          var node = event.target.getContainer();
          node[SMap.LAYER_MARKER].style.cursor = "";
          
          var coords = SMap.Coords.fromEvent(event.data.event, _self.vars.map);
          setPosition(coords);
        });

        // Set zoom feld's value when user changes zoom on the map
        signals.addListener(window, 'zoom-stop', function (event) {
          $(_self.vars.cssID + ".sllpZoom").val(_self.vars.map.getZoom());
//          $(_self.vars.cssID).trigger("location_changed", $(_self.vars.cssID));
        });
        
        //@todo solve double
//        document.getElementById(_self.vars.ID).addEventListener('dblclick', function (event) {
//          var coords = SMap.Coords.fromEvent(event.data.event, _self.vars.map);
//          setPosition(coords);
//        });
//			 Update location and zoom values based on input field's value
        $(_self.vars.cssID + ".sllpUpdateButton").bind("click", function () {
          var lat = $(_self.vars.cssID + ".sllpLatitude").val();
          var lng = $(_self.vars.cssID + ".sllpLongitude").val();
          var latlng = SMap.Coords.fromWGS84(lng, lat);
          _self.vars.map.setZoom(parseInt($(_self.vars.cssID + ".sllpZoom").val()));
          setPosition(latlng);
        });

        // Search function by search button
        $(_self.vars.cssID + ".sllpSearchButton").bind("click", function () {
          geocoderSearch($(_self.vars.cssID + ".sllpSearchField").val(), false);
        });

        // Marker color function triggered by sllpColor onchange
        $(_self.vars.cssID + ".sllpColor").bind("change", function () {
          var color = this.value;
          setMarkerIcon(color);
        });
      }

    };

    return publicfunc;
  });
}(jQuery));
jQuery(document).ready(function ($) {
  $('.sllpLatlonPicker').each(function () {
    $(document).sMapsLatLonPicker().init($(this));
  });
});