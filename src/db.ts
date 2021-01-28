// Imports
import jipdb from 'jipdb';
import { Database } from './types';

// Set up db
const dbDefaults: Database = {
	users: {},
};
const db = new jipdb('data.json', dbDefaults);

// Export DB
export default db;
