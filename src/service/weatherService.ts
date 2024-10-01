import {WeatherData} from '../types';

const apiUrl = process.env.REACT_APP_WEATHERSTACK_API_URL;
const apiKey = process.env.REACT_APP_WEATHERSTACKS_TOKEN;

export const getWeatherByCity = async (city: string): Promise<WeatherData> => {
	if (!apiUrl || !apiKey) {
		throw new Error('API URL or API key is missing in the environment variables');
	}

	try {
		const response = await fetch(`${apiUrl}?access_key=${apiKey}&query=${city}`);

		if (!response.ok) {
			throw new Error(`Network response was not ok. Status: ${response.status}`);
		}

		const data: WeatherData = await response.json();

		if (data.error) {
			throw new Error(data.error.info || 'Error fetching weather data.');
		}

		if (!data.current || !data.location) {
			throw new Error('Weather data is incomplete or unavailable.');
		}

		return data;
	} catch (error) {
		console.error('Error fetching weather data:', error);
		throw new Error('Something went wrong while fetching weather data.');
	}
};

export const getWeatherByCoordinates = async (lat: number, lon: number): Promise<WeatherData> => {
	if (!apiUrl || !apiKey) {
		throw new Error('API URL or API key is missing in the environment variables');
	}

	try {
		const api = `${apiUrl}?access_key=${apiKey}&query=${lat},${lon}`;
		const response = await fetch(api);

		if (!response.ok) {
			throw new Error(`Network response was not ok. Status: ${response.status}`);
		}

		const data: WeatherData = await response.json();

		if (data.error) {
			throw new Error(data.error.info || 'Error fetching weather data.');
		}

		if (!data.current || !data.location) {
			throw new Error('Weather data is incomplete or unavailable.');
		}

		return data;
	} catch (error) {
		console.error('Error fetching weather data:', error);
		throw new Error('Something went wrong while fetching weather data.');
	}
};
