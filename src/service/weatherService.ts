import { WeatherData } from '../types';

export const getWeatherByCity = async (city: string): Promise<WeatherData | { success: false, message: string }> => {
	const apiUrl = process.env.REACT_APP_WEATHERSTACK_API_URL;
	const apiKey = process.env.REACT_APP_WEATHERSTACKS_TOKEN;

	if (!apiUrl || !apiKey) {
		return { success: false, message: 'API URL or API key is missing in the environment variables' };
	}

	try {
		const response = await fetch(`${apiUrl}?access_key=${apiKey}&query=${city}`);

		if (!response.ok) {
			return { success: false, message: `Network response was not ok. Status: ${response.status}` };
		}

		const data: WeatherData = await response.json();

		if (data.error) {
			return { success: false, message: data.error.info || 'Error fetching weather data.' };
		}

		if (!data.current || !data.location) {
			return { success: false, message: 'Weather data is incomplete or unavailable.' };
		}

		return data;
	} catch (error: any) {
		return { success: false, message: 'Something went wrong while fetching weather data.' };
	}
};

export const getWeatherByCoordinates = async (
	lat: number,
	lon: number
): Promise<WeatherData | { success: false, message: string }> => {
	const apiUrl = process.env.REACT_APP_WEATHERSTACK_API_URL;
	const apiKey = process.env.REACT_APP_WEATHERSTACKS_TOKEN;

	if (!apiUrl || !apiKey) {
		return { success: false, message: 'API URL or API key is missing in the environment variables' };
	}

	try {
		const api = `${apiUrl}?access_key=${apiKey}&query=${lat},${lon}`;
		const response = await fetch(api);

		if (!response.ok) {
			return { success: false, message: `Network response was not ok. Status: ${response.status}` };
		}

		const data: WeatherData = await response.json();

		if (data.error) {
			return { success: false, message: data.error.info || 'Error fetching weather data.' };
		}

		if (!data.current || !data.location) {
			return { success: false, message: 'Weather data is incomplete or unavailable.' };
		}

		return data;
	} catch (error: any) {
		return { success: false, message: 'Something went wrong while fetching weather data.' };
	}
};
