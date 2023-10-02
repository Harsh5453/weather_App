// state
let currCity = "Delhi";
let units = "metric";

// Selectors
let city = document.querySelector(".weather__city");
let datetime = document.querySelector(".weather__datetime");
let weather__forecast = document.querySelector('.weather__forecast');
let weather__temperature = document.querySelector(".weather__temperature");
let weather__icon = document.querySelector(".weather__icon");
let weather__minmax = document.querySelector(".weather__minmax");
let weather__realfeel = document.querySelector('.weather__realfeel');
let weather__humidity = document.querySelector('.weather__humidity');
let weather__wind = document.querySelector('.weather__wind');
let weather__pressure = document.querySelector('.weather__pressure');
let aqi_value = document.querySelector('.aqi-value'); // Add this line

// search
document.querySelector(".weather__search").addEventListener('submit', e => {
    let search = document.querySelector(".weather__searchform");
    // prevent default action
    e.preventDefault();
    // change current city
    currCity = search.value;
    // get weather forecast 
    getWeather();
    getAQI(); // Call the getAQI function when the city is changed
    // clear form
    search.value = ""
})

// units
document.querySelector(".weather_unit_celsius").addEventListener('click', () => {
    if(units !== "metric"){
        // change to metric
        units = "metric"
        // get weather forecast 
        getWeather()
    }
})

document.querySelector(".weather_unit_farenheit").addEventListener('click', () => {
    if(units !== "imperial"){
        // change to imperial
        units = "imperial"
        // get weather forecast 
        getWeather()
    }
})

function convertTimeStamp(timestamp, timezone){
    const convertTimezone = timezone / 3600; // convert seconds to hours 

    const date = new Date(timestamp * 1000);
    
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZone: `Etc/GMT${convertTimezone >= 0 ? "-" : "+"}${Math.abs(convertTimezone)}`,
        hour12: true,
    }
    return date.toLocaleString("en-US", options)
}

// convert country code to name
function convertCountryCode(country){
    let regionNames = new Intl.DisplayNames(["en"], {type: "region"});
    return regionNames.of(country)
}

// Function to get 5-day forecast
// Function to get 5-day forecast
function getFiveDayForecast() {
    const API_KEY = '64f60853740a1ee3ba20d0fb595c97d5';

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${currCity}&appid=${API_KEY}&units=${units}`)
        .then((res) => res.json())
        .then((data) => {
            const currentDate = new Date();
            const forecastContainer = document.querySelector('.forecast__days');

            forecastContainer.innerHTML = ''; // Clear previous forecast data

            // Filter forecast data for the next 5 different days, excluding the current day
            const filteredData = [];
            data.list.forEach((dayData) => {
                const forecastDate = new Date(dayData.dt * 1000);
                const forecastDay = forecastDate.getDate();
                if (
                    forecastDay !== currentDate.getDate() &&
                    !filteredData.some((item) => item.getDate() === forecastDay) &&
                    filteredData.length < 5 &&
                    forecastDate > currentDate
                ) {
                    filteredData.push(forecastDate);
                }
            });

            // Display forecast for each of the next 5 different days
            filteredData.forEach((forecastDate) => {
                const forecastDayElement = document.createElement('div');
                forecastDayElement.classList.add('forecast__day');

                const dayNameElement = document.createElement('p');
                dayNameElement.textContent = forecastDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                });

                const filteredDayData = data.list.filter((dayData) => {
                    const day = new Date(dayData.dt * 1000);
                    return day.getDate() === forecastDate.getDate();
                });

                if (filteredDayData.length > 0) {
                    const dayData = filteredDayData[0];

                    const iconElement = document.createElement('img');
                    iconElement.src = `http://openweathermap.org/img/wn/${dayData.weather[0].icon}.png`;
                    iconElement.alt = 'Weather Icon';

                    const temperatureElement = document.createElement('p');
                    temperatureElement.textContent = `Temperature: ${dayData.main.temp.toFixed()}°`;

                    const humidityElement = document.createElement('p');
                    humidityElement.textContent = `Humidity: ${dayData.main.humidity}%`;

                    const windElement = document.createElement('p');
                    windElement.textContent = `Wind: ${dayData.wind.speed.toFixed()} ${units === 'imperial' ? 'mph' : 'm/s'}`;

                    const weatherElement = document.createElement('p');
                    weatherElement.textContent = `Weather: ${dayData.weather[0].description}`;

                    forecastDayElement.appendChild(dayNameElement);
                    forecastDayElement.appendChild(iconElement);
                    forecastDayElement.appendChild(temperatureElement);
                    forecastDayElement.appendChild(humidityElement);
                    forecastDayElement.appendChild(windElement);
                    forecastDayElement.appendChild(weatherElement);

                    forecastContainer.appendChild(forecastDayElement);
                }
            });
        })
        .catch((error) => {
            console.error('Error fetching 5-day forecast data:', error);
        });
}

// Call getFiveDayForecast initially
getFiveDayForecast();



function updateWeather(data) {
    city.innerHTML = `${data.name}, ${convertCountryCode(data.sys.country)}`;
    weather__forecast.innerHTML = `<p>${data.weather[0].main}`;
    weather__temperature.innerHTML = `${data.main.temp.toFixed()}&#176`;
    weather__icon.innerHTML = `<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" />`;
    weather__minmax.innerHTML = `<p>Min: ${data.main.temp_min.toFixed()}&#176</p><p>Max: ${data.main.temp_max.toFixed()}&#176</p>`;
    weather__realfeel.innerHTML = `${data.main.feels_like.toFixed()}&#176`;
    weather__humidity.innerHTML = `${data.main.humidity}%`;
    weather__wind.innerHTML = `${data.wind.speed} ${units === "imperial" ? "mph" : "m/s"}`;
    weather__pressure.innerHTML = `${data.main.pressure} hPa`;
}

function getWeather(){
    const API_KEY = '64f60853740a1ee3ba20d0fb595c97d5';

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${currCity}&appid=${API_KEY}&units=${units}`)
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            updateWeather(data); // Update weather data in the UI
            updateCurrentTime(); // Update the current time when weather data is updated
        })
        .catch((error) => {
            console.error('Error fetching weather data:', error);
        });
}

// Function to fetch AQI data
function getAQI() {
    const AQI_API_KEY = '64f60853740a1ee3ba20d0fb595c97d5'; // Replace with your AirVisual API key

    fetch(`https://api.airvisual.com/v2/city?city=${currCity}&state=&country=&key=${AQI_API_KEY}`)
        .then((response) => response.json())
        .then((data) => {
            const aqi = data.data.current.pollution.aqius; // AQI value

            // Display the AQI value in the UI
            aqi_value.textContent = aqi;
        })
        .catch((error) => {
            console.error('Error fetching AQI data:', error);
        });
}
// Function to compare weather between two cities
function compareWeather() {
    const firstCity = document.getElementById("firstCity").value;
    const secondCity = document.getElementById("secondCity").value;
    const comparisonResult = document.getElementById("comparisonResult");

    if (!firstCity || !secondCity) {
        comparisonResult.textContent = "Please enter both cities to compare.";
        return;
    }

    const API_KEY = '64f60853740a1ee3ba20d0fb595c97d5';

    // Fetch weather data for the first city
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${firstCity}&appid=${API_KEY}&units=metric`)
        .then((res) => res.json())
        .then((data1) => {
            // Fetch weather data for the second city
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${secondCity}&appid=${API_KEY}&units=metric`)
                .then((res) => res.json())
                .then((data2) => {
                    // Display weather comparison
                    comparisonResult.innerHTML = `<p>${firstCity} vs ${secondCity}</p>` +
                        `<p>${firstCity} - Temperature: ${data1.main.temp.toFixed()}°C, Weather: ${data1.weather[0].description}</p>` +
                        `<p>${secondCity} - Temperature: ${data2.main.temp.toFixed()}°C, Weather: ${data2.weather[0].description}</p>`;
                })
                .catch((error) => {
                    console.error('Error fetching weather data for the second city:', error);
                });
        })
        .catch((error) => {
            console.error('Error fetching weather data for the first city:', error);
        });
}

// Add a click event listener to the compare button
document.getElementById("compareButton").addEventListener('click', compareWeather);

function updateCurrentTime() {
    const currentTime = new Date();
    const timeOptions = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short',
    };
    const formattedTime = currentTime.toLocaleTimeString('en-US', timeOptions);

    // Display the current time in your HTML element
    datetime.innerHTML = `Updated at ${formattedTime}`;
}

// Call updateCurrentTime initially
updateCurrentTime();

// Set up an interval to update the current time every second (1000 milliseconds)
setInterval(updateCurrentTime, 1000);

// Trigger the initial weather update when the page loads
document.addEventListener('DOMContentLoaded', () => {
    getWeather();
    getAQI(); // Fetch AQI data on page load
});
