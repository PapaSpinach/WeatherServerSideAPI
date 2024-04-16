const apiKey = '392185c79e31dd3a6f83ede544985030';

$(function () {
  $('#search-btn').click(onSearch);
});

function onSearch() {
  // Get city input
  const city = $('#search').val();

  // Get weather data from openweather api
  getCoordinatesForCity(city)
    .then((coordinates) => {
      return get5DayForecast(coordinates.lat, coordinates.lon);
    })
    .then((result) => {
      const currentDay = result.list[0];

      displayCurrentDayWeather({
        cityName: city,
        date: currentDay.dt_txt,
        iconCode: currentDay.weather[0].icon,
        temperature: currentDay.main.temp,
        wind: currentDay.wind.speed,
        humidity: currentDay.main.humidity,
      });

      const nextFiveDays = result.list.slice(1, 6);

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
  return fetch(
    `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=6&units=imperial&appid=${apiKey}`
  ).then((res) => res.json());
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
