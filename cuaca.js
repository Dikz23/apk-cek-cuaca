const API_KEY = '7a2a9a72e5bc609ed5a40df913f94730';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';


const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const weatherIcon = document.getElementById('weather-icon');
const temp = document.getElementById('temp');
const weatherDesc = document.getElementById('weather-desc');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const visibility = document.getElementById('visibility');
const forecastCards = document.getElementById('forecast-cards');
const weatherIcons = {
    '01d': 'fas fa-sun',
    '01n': 'fas fa-moon',
    '02d': 'fas fa-cloud-sun',
    '02n': 'fas fa-cloud-moon',
    '03d': 'fas fa-cloud',
    '03n': 'fas fa-cloud',
    '04d': 'fas fa-cloud-meatball',
    '04n': 'fas fa-cloud-meatball',
    '09d': 'fas fa-cloud-rain',
    '09n': 'fas fa-cloud-rain',
    '10d': 'fas fa-cloud-sun-rain',
    '10n': 'fas fa-cloud-moon-rain',
    '11d': 'fas fa-bolt',
    '11n': 'fas fa-bolt',
    '13d': 'fas fa-snowflake',
    '13n': 'fas fa-snowflake',
    '50d': 'fas fa-smog',
    '50n': 'fas fa-smog'
};


document.addEventListener('DOMContentLoaded', () => {
    updateCurrentDate();

    searchBtn.addEventListener('click', searchWeather);
    locationBtn.addEventListener('click', getLocationWeather);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchWeather();
    });

    fetchWeather('Jakarta');
});


function updateCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    currentDate.textContent = today.toLocaleDateString('id-ID', options);
}

function searchWeather() {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
        cityInput.value = '';
    } else {
        alert('Silakan masukkan nama kota');
    }
}


function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            (error) => {
                alert('Gagal mendapatkan lokasi: ' + error.message);
            }
        );
    } else {
        alert('Geolocation tidak didukung oleh browser Anda');
    }
}

async function fetchWeather(city) {
    try {
        showLoading(true);

        const response = await fetch('BASE_URL } / weather ? q = ${ city } & units=metric & appid=${ API_KEY } & lang=id');
        if (!response.ok) throw new Error('Kota tidak ditemukan');

        const data = await response.json();
        displayCurrentWeather(data);

        fetchForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
        alert(error.message);
        showLoading(false);
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        showLoading(true);

        const response = await fetch('${BASE_URL}/ weather ? lat =$ {lat} & lon=${lon} & units=metric & appid=${ API_KEY } & lang=id');
        if (!response.ok) throw new Error('Gagal mendapatkan data cuaca');

        const data = await response.json();
        displayCurrentWeather(data);
        fetchForecast(lat, lon);
    } catch (error) {
        alert(error.message);
        showLoading(false);
    }
}


async function fetchForecast(lat, lon) {
    try {
        const response = await fetch('${BASE_URL} / forecast ? lat = ${ lat } & lon=${ lon } & units=metric & appid=${ API_KEY } & lang=id');
        if (!response.ok) throw new Error('Gagal mendapatkan prakiraan cuaca');

        const data = await response.json();
        displayForecast(data);
        showLoading(false);
    } catch (error) {
        alert(error.message);
        showLoading(false);
    }
}

function displayCurrentWeather(data) {
    cityName.textContent = '${ data.name }, ${ data.sys.country }';

    const iconCode = data.weather[0].icon;
    weatherIcon.innerHTML = <i class="${weatherIcons[iconCode] || 'fas fa-question'}"></i>;

    temp.textContent = Math.round(data.main.temp);
    weatherDesc.textContent = data.weather[0].description;
    feelsLike.textContent = Math.round(data.main.feels_like);
    humidity.textContent = data.main.humidity;
    wind.textContent = Math.round(data.wind.speed * 3.6);
    visibility.textContent = (data.visibility / 1000).toFixed(1);
}


function displayForecast(data) {
    const dailyForecast = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('id-ID', { weekday: 'short' });

        if (!dailyForecast[day]) {
            dailyForecast[day] = {
                temp_min: item.main.temp_min,
                temp_max: item.main.temp_max,
                icon: item.weather[0].icon,
                description: item.weather[0].description
            };
        } else {
            if (item.main.temp_min < dailyForecast[day].temp_min) {
                dailyForecast[day].temp_min = item.main.temp_min;
            }
            if (item.main.temp_max > dailyForecast[day].temp_max) {
                dailyForecast[day].temp_max = item.main.temp_max;
            }
        }
    });

    forecastCards.innerHTML = '';
    const days = Object.keys(dailyForecast);

    const today = new Date().toLocaleDateString('id-ID', { weekday: 'short' });
    const startIndex = days.indexOf(today) + 1;
    const forecastDays = days.slice(startIndex, startIndex + 5);

    forecastDays.forEach(day => {
        const forecast = dailyForecast[day];
        const iconClass = weatherIcons[forecast.icon] || 'fas fa-question';

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-day">${day}</div>
            <div class="forecast-icon"><i class="${iconClass}"></i></div>
            <div class="forecast-temp">
                <span>${Math.round(forecast.temp_max)}°</span>
                <span>${Math.round(forecast.temp_min)}°</span>
            </div>
        `;

        forecastCards.appendChild(card);
    });
}

function showLoading(loading) {
    const elements = [
        cityName, temp, weatherDesc, feelsLike,
        humidity, wind, visibility
    ];

    elements.forEach(el => {
        if (loading) {
            el.classList.add('loading');
        } else {
            el.classList.remove('loading');
        }
    });

    if (loading) {
        forecastCards.innerHTML = '<div class="loading" style="width: 100%; height: 120px;"></div>';
    }
}