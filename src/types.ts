export interface Database {
	users: {
		[key: string]: User;
	};
}

export interface User {
	bal: number;
	name: string;
	lastDaily: number;
}
