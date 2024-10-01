import {WeatherData} from '../../types';
import {getWeatherByCity, getWeatherByCoordinates} from '../../service/weatherService';

const mockWeatherData: WeatherData = {
	request: {
		type: 'City',
		query: 'London',
		language: 'en',
		unit: 'm',
	},
	location: {
		name: 'London',
		country: 'United Kingdom',
		region: 'England',
		lat: '51.52',
		lon: '-0.11',
		timezone_id: 'Europe/London',
		localtime: '2023-10-01 12:00',
		localtime_epoch: 1601577600,
		utc_offset: '1.0',
	},
	current: {
		observation_time: '12:00 PM',
		temperature: 18,
		weather_code: 113,
		weather_icons: ['https://example.com/icon.png'],
		weather_descriptions: ['Sunny'],
		wind_speed: 10,
		wind_degree: 180,
		wind_dir: 'S',
		pressure: 1024,
		precip: 0.0,
		humidity: 60,
		cloudcover: 0,
		feelslike: 18,
		uv_index: 5,
		visibility: 10,
		is_day: 'yes',
	},
	error: undefined,
};

describe('weatherService', () => {
	beforeEach(() => {
		// Reset all mocks before each test
		jest.clearAllMocks();
	});

	describe('getWeatherByCity', () => {
		it('fetches weather data by city successfully', async () => {
			// Mock fetch to return successful weather data
			global.fetch = jest.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockWeatherData),
				} as Response)
			);

			const data = await getWeatherByCity('London');
			expect(data).toEqual(mockWeatherData);
			expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_WEATHERSTACK_API_URL}?access_key=${process.env.REACT_APP_WEATHERSTACKS_TOKEN}&query=London`);
		});

		it('throws an error when API URL or API key is missing', async () => {
			// Temporarily unset environment variables
			const oldApiUrl = process.env.REACT_APP_WEATHERSTACK_API_URL;
			const oldApiKey = process.env.REACT_APP_WEATHERSTACKS_TOKEN;
			process.env.REACT_APP_WEATHERSTACK_API_URL = '';
			process.env.REACT_APP_WEATHERSTACKS_TOKEN = '';

			await expect(getWeatherByCity('London')).rejects.toThrow('API URL or API key is missing in the environment variables');

			// Restore environment variables
			process.env.REACT_APP_WEATHERSTACK_API_URL = oldApiUrl;
			process.env.REACT_APP_WEATHERSTACKS_TOKEN = oldApiKey;
		});

		it('throws an error for a failed network request', async () => {
			// Mock fetch to return a failed response
			global.fetch = jest.fn(() =>
				Promise.resolve({
					ok: false,
					status: 500,
				} as Response)
			);

			await expect(getWeatherByCity('London')).rejects.toThrow('Network response was not ok. Status: 500');
		});

		it('throws an error for incomplete weather data', async () => {
			// Mock fetch to return incomplete weather data
			const incompleteData = { ...mockWeatherData, current: null };

			global.fetch = jest.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(incompleteData),
				} as Response)
			);

			await expect(getWeatherByCity('London')).rejects.toThrow('Weather data is incomplete or unavailable.');
		});
	});

	describe('getWeatherByCoordinates', () => {
		it('fetches weather data by coordinates successfully', async () => {
			// Mock fetch to return successful weather data
			global.fetch = jest.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockWeatherData),
				} as Response)
			);

			const data = await getWeatherByCoordinates(51.52, -0.11);
			expect(data).toEqual(mockWeatherData);
			expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_WEATHERSTACK_API_URL}?access_key=${process.env.REACT_APP_WEATHERSTACKS_TOKEN}&query=51.52,-0.11`);
		});

		it('throws an error for a failed network request', async () => {
			// Mock fetch to return a failed response
			global.fetch = jest.fn(() =>
				Promise.resolve({
					ok: false,
					status: 500,
				} as Response)
			);

			await expect(getWeatherByCoordinates(51.52, -0.11)).rejects.toThrow('Network response was not ok. Status: 500');
		});

		it('throws an error for incomplete weather data by coordinates', async () => {
			// Mock fetch to return incomplete weather data
			const incompleteData = { ...mockWeatherData, location: null };

			global.fetch = jest.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(incompleteData),
				} as Response)
			);

			await expect(getWeatherByCoordinates(51.52, -0.11)).rejects.toThrow('Weather data is incomplete or unavailable.');
		});
	});
});
