import React from 'react';
import {Route, Routes} from 'react-router-dom';
import DefaultView from './pages/default-view/index';
import CityDetails from './components/CityDetails';

function App() {
	return (
		<Routes>
			<Route
				path="/"
				element={<DefaultView />}
			/>
			<Route
				path="/city/:city"
				element={<CityDetails />}
			/>
		</Routes>
	);
}

export default App;
