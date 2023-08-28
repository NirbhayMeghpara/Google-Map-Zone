const pickUpInput = document.querySelector('#pickUp');
const dropOffInput = document.querySelector('#dropOff');
const searchBtn = document.querySelector('#search');
const checkBtn = document.querySelector('#checkBtn');
const startJourneyButton = document.querySelector('#startJourney');

startJourneyButton.addEventListener('click', () => {
  pickUpInput.focus();
});

// Creating Google map

let map, marker, directionsService, directionsRenderer, drawingManager, currentPolygon = null, autocompletePickUp

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  navigator.geolocation.getCurrentPosition(function (position) {

    const myCoordinate = { lat: position.coords.latitude, lng: position.coords.longitude }
    const mapOptions = {
      center: myCoordinate,
      zoom: 15,
      mapTypeId: 'roadmap'
    }

    map = new Map(document.getElementById("map"), mapOptions);

    marker = new google.maps.Marker({
      draggable: true,
      position: myCoordinate,
      map: map,
      animation: google.maps.Animation.DROP
    });

    marker.addListener('dragend', function () {
      const selectedLocation = marker.getPosition();

      // Fetching formatted address with the help of latitude and longitude
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ location: selectedLocation }, function (results, status) {
        if (status === 'OK') {
          if (results[0]) pickUpInput.value = results[0].formatted_address
          else alert('Location not found')
        }
        else alert('Error occured while fetching location')
      })
    });

    // API configuration for drawing polygon(ZONE) on google map

    drawingManager = new google.maps.drawing.DrawingManager({
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.POLYGON,
        ],
      },
    });

    drawingManager.setMap(map);

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
      if (currentPolygon) {
        // Remove the current polygon if it exists
        currentPolygon.setMap(null);
      }

      if (event.type === google.maps.drawing.OverlayType.POLYGON) {
        // Set the new polygon as the current polygon
        currentPolygon = event.overlay;
      }
    });
  })


  // Create an Autocomplete instance with the input element
  autocompletePickUp = new google.maps.places.Autocomplete(pickUpInput);


  searchBtn.addEventListener('click', function () {

    let place = autocompletePickUp.getPlace();

    if (!place.geometry) {
      alert('Entered location is not available')
      return;
    }

    // Clear previous marker
    if (marker) {
      if (marker.position == place.geometry.location) return

      marker.setMap(null);

      // Add marker to the selected location
      marker.position = place.geometry.location
      marker.animation = google.maps.Animation.DROP
      marker.setMap(map)

      // Center the map on the selected location
      map.setCenter(place.geometry.location);
      map.setZoom(15);
    }

  })

  checkBtn.addEventListener('click', () => {
    if (currentPolygon) {
      if (google.maps.geometry.poly.containsLocation(marker.getPosition(), currentPolygon)) {
        alert('Yes, Your entered location belongs to drawn zone.');
      }
      else alert('Sorry! Entered location doesn’t belong to drawn zone.');
    }
    else {
      alert('Please draw a polygon')
    }
  })
}
