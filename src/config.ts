export class Config extends null {
	public static get isDevelopment() {
		return process.env.DEVELOPMENT === 'true';
	}

	public static get isDebug() {
		return process.env.DEBUG === 'true';
	}

	public static get bot() {
		return {
			token: process.env.BOT_TOKEN,
			activityMessage: process.env.BOT_ACTIVITY_MESSAGE,
			owners: process.env.BOT_OWNERS?.split(','),
			testingGuilds: process.env.BOT_TESTING_GUILDS?.split(',') ?? undefined
		};
	}

	public static get database() {
		return {
			postgres: {
				host: process.env.PG_HOST,
				port: Number(process.env.PG_PORT),
				user: process.env.PG_USER,
				password: process.env.PG_PASSWORD,
				database: process.env.PG_DATABASE
			}
		};
	}
}
