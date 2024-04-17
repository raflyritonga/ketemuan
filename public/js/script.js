let gmaps
const maxAdditionFields = 3;
let additionFieldCount = 0;
let addressList = [];
let markers = [];
let circleArea;
let places = [];

// MAP INITIALIZATION
function initMap() {
     gmaps = new google.maps.Map(document.getElementById("map-container"), {
          center: { lat: -6.175152329951264, lng: 106.82709455360339 },
          zoom: 15,
          mapId: "9af12a7e9e3d996e"
     });
}

// ADDING MARKER
const addMarker = async (lat, lng, title, map = gmaps) => {
     const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
     let marker
     const markerIcons = [
          'marker1.png',
          'marker2.png',
          'marker3.png',
          'marker4.png',
          'marker5.png'
     ];
     const randomIndex = Math.floor(Math.random() * markerIcons.length);
     const randomIcon = markerIcons[randomIndex];

     const addressIcon = {
          url: `images/markers/${randomIcon}`,
          scaledSize: new google.maps.Size(35, 35),
     };

     let markerIcon = document.createElement("img");
     markerIcon.src = addressIcon.url;
     markerIcon.width = addressIcon.scaledSize.width;
     markerIcon.height = addressIcon.scaledSize.height;

     if (title != "Titik Tengah") {
          marker = new AdvancedMarkerElement({
               position: { lat: lat, lng: lng },
               map: map,
               title: title,
               content: markerIcon
          });
     } else if (title === "Titik Tengah") {
          marker = new AdvancedMarkerElement({
               position: { lat: lat, lng: lng },
               map: map,
               title: title,
          });
          const markerPosition = new google.maps.LatLng(marker.position.lat, marker.position.lng)
          map.setCenter(markerPosition, 12);
     }

     markers.push(marker);
     return marker;
}

function clearMarkers() {
     markers.forEach(marker => marker.setMap(null));
     markers = [];
}

// AUTOCOMPLETING PLACES
function initializePlaceAutocomplete() {
     var addressInputs = document.querySelectorAll("#pac-input");
     var options = {
          componentRestrictions: { country: "ID" }
     };

     for (let i = 0; i < addressInputs.length; i++) {
          let input = addressInputs[i];
          let autocomplete = new google.maps.places.Autocomplete(input, options);
          autocomplete.bindTo("bounds", gmaps);
          autocomplete.addListener("place_changed", function () {
               try {
                    let place = autocomplete.getPlace();
                    if (place && place.geometry) {
                         let latLng = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
                         addressList.push({
                              name: place.formatted_address,
                              lat: latLng.lat(),
                              lng: latLng.lng()
                         });
                    } else {
                         console.error("Invalid place or geometry:", place);
                    }
               } catch (error) {
                    console.error("Error retrieving place information:", error);
               }
          });
     }
}

// CHECKING 
function checkingAddress() {
     if (addressList.length < 2) {
          alert("Alamat yang kamu masukkan tidak valid");
          clearFields();
     }

     findMidpoint(addressList).then(() => {
          clearFields();
          addressList = [];
     });
}

function clearFields() {
     const inputFields = document.querySelectorAll("#pac-input");
     inputFields.forEach(inputField => inputField.value = "");
}

async function findMidpoint(coordinates) {
     clearMarkers();
     removeCircleArea();
     coordinates.forEach(coordinate => addMarker(coordinate.lat, coordinate.lng, coordinate.name));

     let totalLat = 0;
     let totalLng = 0;
     coordinates.forEach(coordinates => {
          totalLat += coordinates.lat;
          totalLng += coordinates.lng;
     });
     const avgLat = totalLat / coordinates.length;
     const avgLng = totalLng / coordinates.length;
     const midpoint = new google.maps.LatLng(avgLat, avgLng);

     drawCircleArea(midpoint)

     findPlaces(midpoint).then(() => places = [])

     await addMarker(midpoint.lat(), midpoint.lng(), "Titik Tengah");
}

function drawCircleArea(midpoint) {
     circleArea = new google.maps.Circle({
          strokeColor: "#6fabce",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#6fabce",
          fillOpacity: 0.35,
          map: gmaps,
          center: midpoint,
          radius: 500
     });
     return circleArea;
}

function removeCircleArea() {
     if (circleArea) {
          circleArea.setMap(null);
          circleArea = null;
     }
}

async function findPlaces(midpoint) {
     const service = new google.maps.places.PlacesService(gmaps);

     const request = {
          location: midpoint,
          radius: 500,
          types: [
               'cafe',
               'amusement_park',
               'coffee_shop',
               'shopping_mall',
               'park',
               'restaurant',
               'book_store',
               'bar',
               'market',
               'night_club',
               'aquarium',
               'national_park'
          ],
          language: 'id'
     };

     service.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
               places = results.filter(place => place.rating && place.rating >= 4 && place.photos != null);
               displayPlaces(places);
          } else {
               console.error("Error fetching places:", status);
          }
     });
}

function displayPlaces(places) {
     document.getElementById("placeTitle").style.display = "block";
     const container = document.getElementById('places-container'); // Assuming you have a container with id 'places-container'

     container.querySelector('.row-cols-md-2').innerHTML = '';

     places.forEach(place => {
          // Create card column
          const colDiv = document.createElement('div');
          colDiv.classList.add('col');

          // Create card
          const cardDiv = document.createElement('div');
          cardDiv.classList.add('card', 'h-100');

          // Create card content row
          const cardContentRow = document.createElement('div');
          cardContentRow.classList.add('row', 'g-0');

          // Create image column
          const imgColDiv = document.createElement('div');
          imgColDiv.classList.add('col-md-4');

          // Create image element
          const imgElement = document.createElement('img');
          if (place.photos && place.photos.length > 0) {
               const photoUrl = place.photos[0].getUrl({ maxWidth: 1000, maxHeight: 100 });
               imgElement.src = photoUrl;
          }

          imgElement.classList.add('img-fluid', 'rounded-start');
          imgElement.alt = 'Gambar Tempat';
          imgColDiv.appendChild(imgElement);

          // Create details column
          const detailsColDiv = document.createElement('div');
          detailsColDiv.classList.add('col-md-8');

          // Create card body
          const cardBodyDiv = document.createElement('div');
          cardBodyDiv.classList.add('card-body');

          // Add title
          const titleElement = document.createElement('h5');
          titleElement.classList.add('card-title');
          titleElement.textContent = place.name;
          cardBodyDiv.appendChild(titleElement);

          // Add subtitle
          const subtitleElement = document.createElement('p');
          subtitleElement.classList.add('card-subtitle');
          subtitleElement.innerHTML = `
            ${place.types[0].replace(/_/g, ' ')}<br>
            Rating: ${place.rating || 'N/A'}`; // Convert underscore to space
          cardBodyDiv.appendChild(subtitleElement);

          // Add map link
          const mapAnchor = document.createElement('a');
          mapAnchor.classList.add('text-muted');
          mapAnchor.textContent = 'Lihat di Google Map';
          mapAnchor.href = `https://www.google.com/maps/search/?api=1&query=${place.name}&query_place_id=${place.place_id}`;
          mapAnchor.target = '_blank';
          const mapElement = document.createElement('p');
          mapElement.classList.add('card-text');
          mapElement.appendChild(mapAnchor);
          cardBodyDiv.appendChild(mapElement);

          // Append image column and details column to card content row
          cardContentRow.appendChild(imgColDiv);
          cardContentRow.appendChild(detailsColDiv);

          // Append card content row to card
          cardDiv.appendChild(cardContentRow);

          // Append card body to card
          cardDiv.appendChild(cardBodyDiv);

          // Append card to column
          colDiv.appendChild(cardDiv);

          // Append column to container
          container.querySelector('.row-cols-md-2').appendChild(colDiv);
     });
}

// FORM
const submitButton = document.getElementById("submitButton");
submitButton.addEventListener("click", checkingAddress);

const addMoreButton = document.getElementById("addMore");
addMoreButton.addEventListener("click", addNewField);

function addNewField() {
     if (additionFieldCount < maxAdditionFields) {
          const adressContainer = document.getElementById("adressContainer");

          const newDiv = document.createElement("div");
          newDiv.className = "mb-3";

          const newLabel = document.createElement("label");
          newLabel.className = "form-label";
          newLabel.textContent = "Alamat Temanmu";

          const inputContainer = document.createElement("div");
          inputContainer.className = "d-flex align-items-center justify-content-between";

          const newInput = document.createElement("input");
          newInput.type = "text";
          newInput.className = "form-control";
          newInput.id = "pac-input";
          newInput.name = "address";
          newInput.required = true;

          const removeButton = document.createElement("button");
          removeButton.textContent = "Hapus";
          removeButton.className = "btn btn-danger ml-3";
          removeButton.type = "button";
          removeButton.onclick = () => {
               newDiv.remove();
               additionFieldCount--;
               if (additionFieldCount < maxAdditionFields) {
                    addMoreButton.style.display = "inline-block";
               }
          };

          inputContainer.appendChild(newInput);
          inputContainer.appendChild(removeButton);
          newDiv.appendChild(newLabel);
          newDiv.appendChild(inputContainer);

          adressContainer.appendChild(newDiv);

          additionFieldCount++;
          if (additionFieldCount >= maxAdditionFields) {
               addMoreButton.style.display = "none";
          }
     }
     initializePlaceAutocomplete();
}

document.addEventListener("DOMContentLoaded", () => {
     initializePlaceAutocomplete();
});
