const apiKey = '392185c79e31dd3a6f83ede544985030';

$(function () {
  $('#search-btn').click(onSearchFromInput);

  displaySearchHistory();
});

function onSearchFromInput() {
  const city = $('#search').val();

  saveSearch(city);

  displaySearchHistory();

  fetchAndDisplayWeather(city);
}

function onClickSearchHistoryBtn() {
  const button = this;
  const city = $(button).text();
  fetchAndDisplayWeather(city);
}

function fetchAndDisplayWeather(city) {
  // Get weather data from openweather api
  getCoordinatesForCity(city)
    .then((coordinates) => {
      return get5DayForecast(coordinates.lat, coordinates.lon);
    })
    .then((list) => {
      const currentDay = list[0];

      displayCurrentDayWeather({
        cityName: city,
        date: currentDay.dt_txt,
        iconCode: currentDay.weather[0].icon,
        temperature: currentDay.main.temp,
        wind: currentDay.wind.speed,
        humidity: currentDay.main.humidity,
      });

      const nextFiveDays = list.slice(1, 6);

      for (let i = 0; i < nextFiveDays.length; i++) {
        const dayData = nextFiveDays[i];

        displayForecastCard(
          {
            date: dayData.dt_txt,
            iconCode: dayData.weather[0].icon,
            temperature: dayData.main.temp,
            wind: dayData.wind.speed,
            humidity: dayData.main.humidity,
          },
          i
        );
      }

      $('#search-results').removeClass('hidden');
    });
}

function getCoordinatesForCity(city) {
  return fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
  )
    .then((res) => res.json())
    .then((data) => {
      const result = data[0];
      return { lat: result.lat, lon: result.lon };
    });
}

function get5DayForecast(lat, lon) {
  const today = dayjs();

  // The weather api returns results in 3 hour blocks, but we only want one result per day.
  // So we will make an array of the next six days, and when we get the results
  // we'll go over the next six days and find the first item that has the same date as the day we're looking
  // at and use that as the weather data for that day.
  const nextSixDays = [
    today,
    today.add(1, 'day'),
    today.add(2, 'day'),
    today.add(3, 'day'),
    today.add(4, 'day'),
    today.add(5, 'day'),
  ];

  return fetch(
    `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
  )
    .then((res) => res.json())
    .then((data) => {
      const list = data.list;

      const dataForNextSixDays = [];

      for (let i = 0; i < nextSixDays.length; i++) {
        const currentDay = nextSixDays[i];
        const item = list.find((weather) =>
        dayjs.unix(weather.dt).isSame(currentDay, 'day')
        );
        dataForNextSixDays.push(item);
      }

      return dataForNextSixDays;
    });
}

// Data is an object with cityName, date, iconCode, temperature, wind, humidity
function displayCurrentDayWeather(data) {
  const weatherElement = $('#current-day-weather');

  weatherElement.find('.city-name').text(data.cityName);

  const formattedDate = dayjs(data.date).format('MM/DD/YYYY');

  weatherElement.find('.date').text('(' + formattedDate + ')');

  weatherElement.find('.icon').attr('src', createIconUrl(data.iconCode));

  weatherElement.find('.temp').text(data.temperature + '°F');
  weatherElement.find('.wind').text(data.wind + ' MPH');
  weatherElement.find('.humidity').text(data.humidity + '%');
}

// Data is an object with date, iconCode, temperature, wind, humidity
function displayForecastCard(data, index) {
  const weatherElement = $('#forecast-card-' + index);

  const formattedDate = dayjs(data.date).format('MM/DD/YYYY');

  weatherElement.find('.date').text(formattedDate);

  weatherElement.find('.icon').attr('src', createIconUrl(data.iconCode));

  weatherElement.find('.temp').text(data.temperature + '°F');
  weatherElement.find('.wind').text(data.wind + ' MPH');
  weatherElement.find('.humidity').text(data.humidity + '%');
}

function createIconUrl(icon) {
  return 'https://openweathermap.org/img/wn/' + icon + '.png';
}

function displaySearchHistory() {
  const savedSearches = getSavedSearches();

  const searchElement = $('#search-history');

  searchElement.empty();

  for (let i = 0; i < savedSearches.length; i++) {
    const city = savedSearches[i];

    const searchItem = $(
      '<button class="search-history-item btn">' + city + '</button>'
    );

    searchElement.append(searchItem);
  }

  // Set up the event listeners here
  $('.search-history-item').click(onClickSearchHistoryBtn);
}

function saveSearch(city) {
  const currentSearches = getSavedSearches();

  currentSearches.push(city);

  localStorage.setItem('searches', JSON.stringify(currentSearches));
}

function getSavedSearches() {
  const value = localStorage.getItem('searches');

  if (value === null) {
    return [];
  }

  return JSON.parse(value);
}
