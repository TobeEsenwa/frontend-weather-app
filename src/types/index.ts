export interface WeatherData {
	request?: RequestData;
	location?: LocationData;
	current?: CurrentWeatherData;
	error?: APIError;
}

export interface RequestData {
	type?: string;
	query?: string;
	language?: string;
	unit?: string;
}

export interface LocationData {
	name?: string;
	country?: string;
	region?: string;
	lat?: string;
	lon?: string;
	timezone_id?: string;
	localtime?: string;
	localtime_epoch?: number;
	utc_offset?: string;
}

export interface CurrentWeatherData {
	observation_time?: string;
	temperature?: number;
	weather_code?: number;
	weather_icons?: string[];
	weather_descriptions?: string[];
	wind_speed?: number;
	wind_degree?: number;
	wind_dir?: string;
	pressure?: number;
	precip?: number;
	humidity?: number;
	cloudcover?: number;
	feelslike?: number;
	uv_index?: number;
	visibility?: number;
	is_day?: string;
}

export interface APIError {
	code?: number;
	type?: string;
	info?: string;
}
