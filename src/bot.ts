import { Bolt } from 'bolt-chat.js';
import { User } from './types';
import { config } from 'dotenv';
import db from './db';

config();

const boltConfig = {
	host: process.env.ip,
	port: 3300,
	username: 'Jordan Belfort',
};

const hour = 60 * 60;
const day = hour * 24;

const bolt = new Bolt(boltConfig);
(async () => {
	// Connect
	await bolt.connect(() => {
		console.log('connected!');
	});

	// Message handler obviously
	bolt.on('msg', async (data) => {
		const username = data.msg.user.nick;
		const query = `users.${username}`;

		if (!db.get(query)) {
			db.set(query, {
				bal: 0,
				name: username,
				lastDaily: 0,
			});
		}

		const user: User = db.get(query);
		switch (data.msg.body) {
			case '!bal': {
				bolt.message.send(`Balance: ${user.bal}`);
				break;
			}
			case '!daily': {
				const diff = (Date.now() - (user.lastDaily || 0)) / 1e3;
				console.log(diff);

				if (diff > day) {
					user.bal += 1000;
					user.lastDaily = Date.now();
					db.set(query, user);
					bolt.message.send(`Ok is goed je balans is nu ${user.bal}`);
				} else {
					const remaining = Date.now() - (user.lastDaily || 0);
					const remainingSeconds = day - remaining / 1e3;
					const mins = remainingSeconds / 60;
					const hrs = mins / 60;

					const hourString = Math.floor(hrs * 100) / 100;
					bolt.message.send(`Ff wachten verdorie, nog ${hourString} uur of zo`);
				}

				break;
			}
			case '!top': {
				const users: {
					[key: string]: User;
				} = db.get('users');

				for (let user of Object.values(users).sort((a, b) => a.bal - b.bal)) {
					bolt.message.send(`${user.name}: ${user.bal}`);
					await sleep(100);
				}

				break;
			}
			default: {
				if (data.msg.body.startsWith('!rob ')) {
					const findName = data.msg.body.slice(5).trim();
					console.log(findName);

					const robbingUser: User = db.get(`users.${findName}`);
					if (robbingUser) {
						if (robbingUser.bal < 500) {
							bolt.message.send(
								`die mogool ${findName} heeft veel te weinig stacks LOL! 😂`
							);
						} else {
							const toSteal = Math.min(
								Math.floor(Math.random() * robbingUser.bal),
								1e3
							);

							if (Math.random() < 0.5) {
								bolt.message.send(
									`Ok je gaat ff ${findName} bestelen ik zie het al: je pikt ${toSteal} stacks`
								);
								user.bal += toSteal;
								robbingUser.bal -= toSteal;
							} else {
								const toSteal = Math.min(
									Math.floor(Math.random() * user.bal),
									1e3
								);
								bolt.message.send(
									`LOL EPIC FAIL! ${findName} heeft je gepakt: je geeft ze ${toSteal} stacks`
								);
								robbingUser.bal += toSteal;
								user.bal -= toSteal;
							}

							db.set(query, user);
							db.set(`users.${findName}`, robbingUser);
						}
					} else {
						bolt.message.send(`Die wappie ${findName} kan nie gevonden worden`);
					}
				}
				break;
			}
		}
	});
})();

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export default bolt;
