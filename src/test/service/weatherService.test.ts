import fetchMock from 'jest-fetch-mock';
import {getWeatherByCity, getWeatherByCoordinates} from '../../service/weatherService';

// Enable fetch mock
fetchMock.enableMocks();

beforeEach(() => {
	// Reset mocks and ensure environment variables are set
	fetchMock.resetMocks();
	process.env.REACT_APP_WEATHERSTACK_API_URL = 'https://api.weatherstack.com/current';
	process.env.REACT_APP_WEATHERSTACKS_TOKEN = 'test_api_key';
});

describe('getWeatherByCity', () => {
	it('should return weather data when API call is successful', async () => {
		// Mock a successful response
		fetchMock.mockResponseOnce(
			JSON.stringify({
				current: { temperature: 25 },
				location: { name: 'Test City' }
			})
		);

		const result = await getWeatherByCity('Test City');

		// Check that the returned data is correct
		expect('success' in result).toBe(false); // It should not have a "success" key, meaning it's a success
		expect(result).toHaveProperty('location.name', 'Test City');
		expect(result).toHaveProperty('current.temperature', 25);
		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch).toHaveBeenCalledWith(
			'https://api.weatherstack.com/current?access_key=test_api_key&query=Test City'
		);
	});

	it('should return an error when API call fails with a 500 status', async () => {
		// Mock a failed response with 500 status
		fetchMock.mockResponseOnce('', { status: 500 });

		const result = await getWeatherByCity('Test City');

		// Check that the error is returned correctly
		expect(result).toEqual({
			success: false,
			message: 'Network response was not ok. Status: 500',
		});
	});

	it('should return an error if API key or URL is missing', async () => {
		delete process.env.REACT_APP_WEATHERSTACK_API_URL; // Remove URL to simulate missing environment variable

		const result = await getWeatherByCity('Test City');

		// Check that the error message is returned due to missing environment variables
		expect(result).toEqual({
			success: false,
			message: 'API URL or API key is missing in the environment variables',
		});
	});

	it('should return an error if weather data is incomplete', async () => {
		// Mock a response with missing "current" or "location"
		fetchMock.mockResponseOnce(
			JSON.stringify({
				location: {},
			})
		);

		const result = await getWeatherByCity('Test City');

		// Check that the error is returned correctly
		expect(result).toEqual({
			success: false,
			message: 'Weather data is incomplete or unavailable.',
		});
	});
});

describe('getWeatherByCoordinates', () => {
	it('should return weather data when API call is successful', async () => {
		// Mock a successful response
		fetchMock.mockResponseOnce(
			JSON.stringify({
				current: { temperature: 30 },
				location: { name: 'Test Location' }
			})
		);

		const result = await getWeatherByCoordinates(10.123, 20.456);

		// Check that the returned data is correct
		expect('success' in result).toBe(false); // It should not have a "success" key, meaning it's a success
		expect(result).toHaveProperty('location.name', 'Test Location');
		expect(result).toHaveProperty('current.temperature', 30);
		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch).toHaveBeenCalledWith(
			'https://api.weatherstack.com/current?access_key=test_api_key&query=10.123,20.456'
		);
	});

	it('should return an error when API call fails with a 404 status', async () => {
		// Mock a failed response with 404 status
		fetchMock.mockResponseOnce('', { status: 404 });

		const result = await getWeatherByCoordinates(10.123, 20.456);

		// Check that the error is returned correctly
		expect(result).toEqual({
			success: false,
			message: 'Network response was not ok. Status: 404',
		});
	});

	it('should return an error if API key or URL is missing', async () => {
		delete process.env.REACT_APP_WEATHERSTACKS_TOKEN; // Remove token to simulate missing environment variable

		const result = await getWeatherByCoordinates(10.123, 20.456);

		// Check that the error message is returned due to missing environment variables
		expect(result).toEqual({
			success: false,
			message: 'API URL or API key is missing in the environment variables',
		});
	});

	it('should return an error if weather data is incomplete', async () => {
		// Mock a response with missing "current" or "location"
		fetchMock.mockResponseOnce(
			JSON.stringify({
				location: {},
			})
		);

		const result = await getWeatherByCoordinates(10.123, 20.456);

		// Check that the error is returned correctly
		expect(result).toEqual({
			success: false,
			message: 'Weather data is incomplete or unavailable.',
		});
	});
});
