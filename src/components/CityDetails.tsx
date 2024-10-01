import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getWeatherByCity } from '../service/weatherService';
import { WeatherData } from '../types';

const CityDetails: React.FC = () => {
	const { city } = useParams<{ city: string }>(); // Get city from URL params
	const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
	const [notes, setNotes] = useState<string>('');
	const [savedNotes, setSavedNotes] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false); // Loading state added

	// Helper function to save data to local storage
	const saveToLocalStorage = (key: string, value: any) => {
		localStorage.setItem(key, JSON.stringify(value));
	};

	// Helper function to retrieve data from local storage
	const getFromLocalStorage = (key: string) => {
		const value = localStorage.getItem(key);
		return value ? JSON.parse(value) : null;
	};

	const notifyLoading = () => toast.loading('Fetching weather data...');
	const notifySuccess = (message: string) =>
		toast.update('Fetching weather data...', {
			render: message,
			type: 'success',
			isLoading: false,
			autoClose: 2000,
		});
	const notifyError = (message: string) =>
		toast.update('Fetching weather data...', {
			render: message,
			type: 'error',
			isLoading: false,
			autoClose: 2000,
		});

	const fetchWeather = useCallback(async () => {
		if (city) {
			notifyLoading()
			setLoading(true);
			try {
				if (navigator.onLine) {
					const data = await getWeatherByCity(city);
					setWeatherData(data);
					saveToLocalStorage(`weather-${city}`, data);
					notifySuccess(`Weather data for ${city} loaded successfully.`);
				} else {
					const savedWeather = getFromLocalStorage(`weather-${city}`);
					if (savedWeather) {
						setWeatherData(savedWeather);
						notifySuccess(`Loaded weather data for ${city} from cache.`);
					} else {
						setError('No internet connection and no weather data available.');
						notifyError('No internet connection and no weather data available.');
					}
				}
			} catch (err) {
				setError('Error fetching weather data');
				notifyError('Error fetching weather data');
			} finally {
				setLoading(false);
			}
		}
	}, [city]);

	useEffect(() => {
		const savedNotes = getFromLocalStorage(`notes-${city}`);
		if (savedNotes) {
			setSavedNotes(savedNotes);
		}

		fetchWeather();
	}, [fetchWeather, city]);

	const handleSaveNotes = () => {
		setSavedNotes(notes);
		saveToLocalStorage(`notes-${city}`, notes);
		toast.success('Notes saved successfully!');
	};

	const handleEditNotes = () => {
		setNotes(savedNotes || '');
		setSavedNotes(null);
	};

	const handleDeleteNotes = () => {
		setNotes('');
		setSavedNotes(null);
		localStorage.removeItem(`notes-${city}`);
		toast.success('Notes deleted successfully!');
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex flex-col items-center justify-center h-64">
					<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mb-4"></div>
					<p className="text-xl text-gray-600">Fetching weather data for {city}...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="bg-red-100 text-red-700 p-4 rounded">
					<h2 className="text-lg font-semibold">Error</h2>
					<p>{error}</p>
				</div>
			</div>
		);
	}

	if (!weatherData) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center text-gray-600">Loading weather data for {city}...</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<ToastContainer />
			<h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
				Weather Details for {city}
			</h1>
			<div className="bg-white rounded-lg shadow-md overflow-hidden">
				<div className="px-4 py-5 sm:p-6">
					<h3 className="text-lg leading-6 font-medium text-gray-900">
						{weatherData.location?.name || 'Unknown Location'}
					</h3>
					<div className="mt-2">
						<div className="text-3xl font-semibold text-gray-700">
							{weatherData.current?.temperature ?? 'N/A'}°C
						</div>
						<p className="text-sm text-gray-500">
							{weatherData.current?.weather_descriptions?.join(', ') ||
								'No description available'}
						</p>
					</div>
				</div>
				<div className="px-4 py-5">
					<h3 className="text-lg font-medium text-gray-900">Notes</h3>
					{savedNotes ? (
						<div className="mt-2">
							<p>{savedNotes}</p>
							<button onClick={handleEditNotes} className="mr-2 text-blue-600">
								Edit
							</button>
							<button onClick={handleDeleteNotes} className="text-red-600">
								Delete
							</button>
						</div>
					) : (
						<div className="mt-2">
							<textarea
							  value={notes}
							  onChange={(e) => setNotes(e.target.value)}
							  placeholder="Add notes here"
							  className="w-full h-24 p-2 border border-gray-300 rounded"
							/>
							<button
								onClick={handleSaveNotes}
								className="mt-2 px-3 py-2 bg-green-600 text-white rounded"
							>
								Save Notes
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CityDetails;
