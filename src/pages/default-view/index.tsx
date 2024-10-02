import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, CircleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getWeatherByCity, getWeatherByCoordinates } from '../../service/weatherService';
import { WeatherData } from '../../types';

const largestCities: string[] = [
	'Tokyo', 'Delhi', 'Shanghai', 'São Paulo', 'Mexico City',
	'Cairo', 'Dhaka', 'Mumbai', 'Beijing', 'Osaka',
	'Karachi', 'Chongqing', 'Istanbul', 'Buenos Aires', 'Kolkata',
];

const getWeatherIcon = (description: string | undefined): JSX.Element => {
	const lowerDesc = description?.toLowerCase() || '';
	if (lowerDesc.includes('sun') || lowerDesc.includes('clear')) return <Sun className="w-8 h-8 text-yellow-400" />;
	if (lowerDesc.includes('rain')) return <CloudRain className="w-8 h-8 text-blue-400" />;
	if (lowerDesc.includes('snow')) return <CloudSnow className="w-8 h-8 text-gray-200" />;
	if (lowerDesc.includes('thunder') || lowerDesc.includes('lightning')) return <CloudLightning className="w-8 h-8 text-yellow-500" />;
	if (lowerDesc.includes('wind')) return <Wind className="w-8 h-8 text-gray-400" />;
	return <Cloud className="w-8 h-8 text-gray-400" />;
};

const DefaultView: React.FC = () => {
	const [cities, setCities] = useState<string[]>(largestCities);
	const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
	const [currentLocationWeather, setCurrentLocationWeather] = useState<WeatherData | null>(null);
	const [searchedCityWeather, setSearchedCityWeather] = useState<WeatherData | null>(null); // To hold the searched city's weather
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState<string | undefined>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [showLargestCities, setShowLargestCities] = useState<boolean>(true);
	const navigate = useNavigate();

	// Helper function to reset toast and update it
	const notifyLoading = () => toast.loading('Fetching weather data...', { toastId: 'weather-toast' });
	const notifySuccess = (message: string) => toast.update('weather-toast', { render: message, type: 'success', isLoading: false, autoClose: 2000 });
	const notifyError = (message: string) => toast.update('weather-toast', { render: message, type: 'error', isLoading: false, autoClose: 2000 });

	const fetchWeatherDataForCities = useCallback(async () => {
		setLoading(true);
		notifyLoading();

		try {
			const weatherPromises = cities.map((city) => getWeatherByCity(city));
			const weatherResponses = await Promise.all(weatherPromises);

			// Filter the responses based on the success flag
			const validWeatherData = weatherResponses.filter((response) => !('success' in response && !response.success)) as WeatherData[];

			setWeatherData(validWeatherData);
			localStorage.setItem('weatherData', JSON.stringify(validWeatherData));
			notifySuccess('Weather data loaded successfully.');
		} catch (error: any) {
			notifyError('Failed to fetch weather data.');
			setError('Failed to fetch weather data.');
		} finally {
			setLoading(false);
		}
	}, [cities]);

	const fetchCurrentLocationWeather = useCallback(async () => {
		setLoading(true);
		notifyLoading();

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(async (position) => {
				const { latitude, longitude } = position.coords;
				try {
					const weather = await getWeatherByCoordinates(latitude, longitude);

					if ('success' in weather && !weather.success) {
						notifyError(weather.message);
						setError(weather.message);
					} else {
						setCurrentLocationWeather(weather as WeatherData);
						notifySuccess(`Weather data for your location: ${(weather as WeatherData).location?.name} loaded.`);
					}
				} catch (error) {
					notifyError('Failed to fetch weather data for your location.');
					setError('Failed to fetch weather data for your location.');
				} finally {
					setLoading(false);
				}
			});
		} else {
			notifyError('Geolocation is not supported by this browser.');
			setLoading(false);
		}
	}, []);

	const handleSearchCity = async () => {
		if (searchTerm) {
			setLoading(true);
			notifyLoading();
			try {
				const newCityWeather = await getWeatherByCity(searchTerm);

				if ('success' in newCityWeather && !newCityWeather.success) {
					notifyError(newCityWeather.message);
					setError(newCityWeather.message);
				} else {
					setSearchedCityWeather(newCityWeather as WeatherData); // Show only the searched city's weather
					setSearchTerm('');
					notifySuccess(`Weather data for ${(newCityWeather as WeatherData).location?.name} loaded.`);
				}
			} catch (error: any) {
				notifyError('City not found.');
				setError('City not found.');
			} finally {
				setLoading(false);
			}
		}
	};

	// Handle the first loading for either current location or largest cities
	useEffect(() => {
		if (showLargestCities) {
			// Reset search data when switching to largest cities
			setSearchTerm('');
			setSearchedCityWeather(null);
			fetchWeatherDataForCities();
		} else {
			fetchCurrentLocationWeather();
		}
	}, [showLargestCities, fetchWeatherDataForCities, fetchCurrentLocationWeather]);

	const handleRemoveCity = (city: string | undefined) => {
		if (!city) return;
		setCities((prevCities) => prevCities.filter((c) => c !== city));
		setWeatherData((prevData) => prevData.filter((w) => w.location?.name !== city));
	};

	const handleCityClick = (city: string | undefined) => {
		if (city) {
			navigate(`/city/${city}`);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6 text-center text-white">Weather Information</h1>
			<ToastContainer />

			<div className="mb-4">
				<input
					type="text"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="Search city"
					className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
				/>
				<button
					onClick={handleSearchCity}
					className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100 transition duration-150 ease-in-out"
				>
					Search City
				</button>
			</div>

			{loading && (
				<div className="flex flex-col items-center justify-center h-64">
					<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mb-4"></div>
					<p className="text-xl text-white font-semibold">Fetching weather data...</p>
					<p className="pt-3 text-gray-500">Please wait a moment while we retrieve the latest data for you.</p>
				</div>
			)}

			{!loading && searchedCityWeather && (
				<div className="text-center">
					<div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer">
						<div className="px-4 py-5 sm:p-6">
							<h3 className="text-lg leading-6 font-medium text-gray-900">
								{searchedCityWeather.location?.name || 'Unknown Location'}
							</h3>
							<div className="mt-2 flex items-center justify-between">
								<div className="text-3xl font-semibold text-gray-700">
									{searchedCityWeather.current?.temperature ?? 'N/A'}°C
								</div>
								{getWeatherIcon(searchedCityWeather.current?.weather_descriptions?.[0])}
							</div>
							<p className="mt-1 text-sm text-gray-500">
								{searchedCityWeather.current?.weather_descriptions?.join(', ') || 'No description available'}
							</p>
						</div>
					</div>
				</div>
			)}

			{!loading && !searchedCityWeather && currentLocationWeather && !showLargestCities && (
				<div className="text-center">
					<div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer">
						<div className="px-4 py-5 sm:p-6">
							<h3 className="text-lg leading-6 font-medium text-gray-900">
								{currentLocationWeather.location?.name || 'Unknown Location'}
							</h3>
							<div className="mt-2 flex items-center justify-between">
								<div className="text-3xl font-semibold text-gray-700">
									{currentLocationWeather.current?.temperature ?? 'N/A'}°C
								</div>
								{getWeatherIcon(currentLocationWeather.current?.weather_descriptions?.[0])}
							</div>
							<p className="mt-1 text-sm text-gray-500">
								{currentLocationWeather.current?.weather_descriptions?.join(', ') || 'No description available'}
							</p>
						</div>
					</div>
				</div>
			)}

			{!loading && showLargestCities && weatherData.length > 0 && (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
					{weatherData
						.sort((a, b) => a.location?.name?.localeCompare(b.location?.name || '') || 0)
						.map((data, index) => (
							<div
								key={index}
								className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
								onClick={() => handleCityClick(data.location?.name)}
							>
								<div className="px-4 py-5 sm:p-6">
									<h3 className="text-lg leading-6 font-medium text-gray-900">
										{data.location?.name || 'Unknown'}
									</h3>
									<div className="mt-2 flex items-center justify-between">
										<div className="text-3xl font-semibold text-gray-700">
											{data.current?.temperature ?? 'N/A'}°C
										</div>
										{getWeatherIcon(data.current?.weather_descriptions?.[0])}
									</div>
									<p className="mt-1 text-sm text-gray-500">
										{data.current?.weather_descriptions?.join(', ') || 'No description available'}
									</p>
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleRemoveCity(data.location?.name);
										}}
										className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
									>
										Remove
									</button>
								</div>
							</div>
						))}
				</div>
			)}

			{!loading && !searchedCityWeather && !currentLocationWeather && weatherData.length === 0 && (
				<div className="flex flex-col items-center justify-center h-64">
					<div className="text-red-500 mb-4">
						<CircleAlert className="h-24 w-24" />
					</div>
					<p className="text-xl text-white font-semibold">No weather data found.</p>
					<p className="pt-3 text-gray-500">Try searching for a different city or check your internet connection.</p>
				</div>
			)}

			{/* The two buttons for switching */}
			{!loading && (
				<div className="mt-6 flex justify-center space-x-4">
					{showLargestCities ? (
						<button
							onClick={() => setShowLargestCities(false)}
							className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
						>
							Show Current Location Weather
						</button>
					) : (
						<button
							onClick={() => setShowLargestCities(true)}
							className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 ease-in-out"
						>
							Show Largest Cities Weather
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default DefaultView;
