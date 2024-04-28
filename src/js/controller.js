import model from "./model";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class Workout {
  id = (Date.now() + "").slice(-10);
  date = new Date();

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}
class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = "cycling";

  constructor(coords, distance, duration, elevationGarin) {
    super(coords, distance, duration);
    this.elevationGarin = elevationGarin;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class App {
  #map;
  #mapEvent;
  #mapZoomLevel = 13;
  #workouts = [];

  constructor() {
    // 1)
    this._getPostition(); // work as init (when page load)
    // 10) get data when submit
    form.addEventListener("submit", this._newWorkout.bind(this));
    // 8) when change select
    inputType.addEventListener("change", this._toggleElevationField);
    // 18) when click on list item move map to point
    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
    // 20) when load page, if there's data render it on map
    this._getLocalStorage();
  }

  _getPostition() {
    // 2) get location (go to _loadMap)
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        console.error(`Couldn't get your location`);
      }
    );
  }

  _loadMap(postion) {
    // 3) descrabe data
    const { latitude, longitude } = postion.coords;

    // 4) must L.map("${here you use class or id of html elemnt}").setView(location, viewForth)
    this.#map = L.map("map").setView([latitude, longitude], this.#mapZoomLevel);

    // 5) tileLayer API: is the design of the map and his tiles
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // 6) when click on map = run function (go to _showForm)
    this.#map.on("click", this._showForm.bind(this));

    // when there's data in localStorage = set point
    this.#workouts.forEach((work) => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    // 7) show form
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";

    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => {
      form.style.display = "grid";
    }, 1000);
  }

  _toggleElevationField() {
    // 9) hide input, show the other
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    e.preventDefault();

    // 11) store data to use in method
    const type = inputType.value,
      distance = +inputDistance.value,
      duration = +inputDuration.value,
      cadence = inputCadence.value ? +inputCadence.value : 1,
      elevation = inputElevation.value ? +inputCadence.value : 1;
    let workout;

    // 12) store location
    const { lat, lng } = this.#mapEvent.latlng;

    const ifGaurd = [distance, duration, cadence, elevation].every(
      (val) => typeof val === "number" && val >= 0
    );
    if (!ifGaurd) return alert("Inputs have to be positive numbers!");

    // 13) when User select the workout create object
    if (type === "cycling") {
      workout = new Cycling([lat, lng], distance, duration, elevation);
      this.#workouts.push(workout);
    } else {
      workout = new Running([lat, lng], distance, duration, cadence);
      this.#workouts.push(workout);
    }

    // 14) render marks on map
    this._renderWorkoutMarker(workout);

    // 15) render workouts on list
    this._renderWorkout(workout);

    // 16) Add to localStorage
    this._setLocalStorage();

    // 17) clear input fields + hide form
    this._hideForm();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          // 13.1) style popup (point)
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.name === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    const markup = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${
            workout.type === "running"
              ? workout.pace.toFixed(1)
              : workout.speed.toFixed(1)
          }</span>
          <span class="workout__unit">${
            workout.type === "running" ? "min/km" : "km/h"
          }</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === "running" ? "🦶🏼" : "⛰"
          }</span>
          <span class="workout__value">${
            workout.type === "running"
              ? workout.cadence
              : workout.elevationGarin
          }</span>
          <span class="workout__unit">${
            workout.type === "running" ? "spm" : "m"
          }</span>
        </div>
      </li>
    `;

    form.insertAdjacentHTML("afterend", markup);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest(".workout");
    if (!workoutEl) return;

    const workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workouts"));
    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach((work) => {
      this._renderWorkout(work);
    });
  }

  reset() {
    localStorage.removeItem("workouts");
    location.reload();
  }
}
const app = new App();
