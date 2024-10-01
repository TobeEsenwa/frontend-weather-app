import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders DefaultView component on root path "/"', () => {
	// Use MemoryRouter to simulate navigation to the root path
	render(
		<MemoryRouter initialEntries={['/']}>
			<App />
		</MemoryRouter>
	);

	// Check if the DefaultView content is present (modify this based on what DefaultView renders)
	const defaultViewElement = screen.getByText(/Weather Information/i);
	expect(defaultViewElement).toBeInTheDocument();
});

test('renders CityDetails component on "/city/:city" path', () => {
	// Use MemoryRouter to simulate navigation to a city path
	render(
		<MemoryRouter initialEntries={['/city/London']}>
			<App />
		</MemoryRouter>
	);

	// Check if CityDetails content is present (modify this based on what CityDetails renders)
	const cityDetailsElement = screen.getByText(/Weather Details for London/i);
	expect(cityDetailsElement).toBeInTheDocument();
});
