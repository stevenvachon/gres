"use strict";
const Confirm = require("prompt-confirm");
const dotenv = require("dotenv");
const isset = require("isset");
const knex = require("knex");



// TODO :: try https://npmjs.com/pgtools ?

const dropdb = async (envPath=".env") =>
{
	dotenv.config({ path:envPath });

	const host     = process.env.POSTGRES_HOST;
	const name     = process.env.POSTGRES_NAME;
	const password = process.env.POSTGRES_PASSWORD;
	const user     = process.env.POSTGRES_USER;

	if (!isset(host) || !isset(name) || !isset(password) || !isset(user))
	{
		throw new Error("Environmental variable(s) not set");
	}

	const confirm = new Confirm(
	{
		message: `Delete "${name}" database and "${user}" user?`,
		default: false
	});

	confirm.renderMessage = function()
	{
		// Omit the prefix and text formatting
		return `${this.message} `;
	};

	const confirmed = await confirm.run();

	// Move up a line and clear [the confirmation]
	process.stdout.write("\u001b[1A\u001b[2K");

	if (confirmed)
	{
		// TODO :: prompt for SUPERUSER_NAME and SUPERUSER_PASSWORD (https://github.com/brianc/node-postgres/wiki/Client#new-clientobject-config--client)

		const psql = knex({ client:"pg", connection:{ host } });

		try
		{
			await psql.raw("drop database ??", name);
			await psql.raw("drop role ??", user);
			psql.destroy();

			console.log(`Deleted "${name}" database and "${user}" user`);
		}
		catch (error)
		{
			psql.destroy();
			throw error;
		}
	}
};



module.exports = dropdb;
