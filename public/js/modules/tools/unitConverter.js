export function convertUnit(value, fromUnit, toUnit) {
	const conversions = {
		// Conversioni esistenti per lunghezza
		'meters_centimeters': 100,
		'centimeters_meters': 0.01,
		'meters_kilometers': 0.001,
		'kilometers_meters': 1000,
		'centimeters_kilometers': 0.00001,
		'kilometers_centimeters': 100000,

		// Nuove conversioni per miglia
		'miles_kilometers': 1.60934,
		'kilometers_miles': 0.621371,
		'miles_meters': 1609.34,
		'meters_miles': 0.000621371,

		// Conversioni per volume
		'liters_milliliters': 1000,
		'milliliters_liters': 0.001,
		'liters_centiliters': 100,
		'centiliters_liters': 0.01,
		'liters_deciliters': 10,
		'deciliters_liters': 0.1,
		'liters_hectoliters': 0.01,
		'hectoliters_liters': 100
	};

	const conversionKey = `${fromUnit}_${toUnit}`;
	const conversionRate = conversions[conversionKey];

	if (conversionRate === undefined) {
		throw new Error('Conversione non supportata');
	}

	return value * conversionRate;
}