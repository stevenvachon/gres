"use strict";
const dotenv = require("dotenv");
const dotenvPrompt = require("dotenv-prompt");
const isset = require("isset");
const knex = require("knex");



const createdb = async (envPath=".env", envSamplePath=".env.sample") =>
{
	const promptVarnames =
	[
		"POSTGRES_HOST",
		"POSTGRES_NAME",
		"POSTGRES_USER",
		"POSTGRES_PASSWORD"
	];

	await dotenvPrompt(envPath, envSamplePath, promptVarnames);

	// TODO :: also prompt for superuser name/password (https://github.com/brianc/node-postgres/wiki/Client#new-clientobject-config--client)

	dotenv.config({ path:envPath });

	const host     = process.env.POSTGRES_HOST;
	const name     = process.env.POSTGRES_NAME;
	const password = process.env.POSTGRES_PASSWORD;
	const user     = process.env.POSTGRES_USER;

	if (!isset(host) || !isset(name) || !isset(password) || !isset(user))
	{
		throw new Error("Environmental variable(s) not set");
	}

	// TODO :: try https://npmjs.com/pgtools ?
	const psql = knex({ client:"pg", connection:{ host } });

	try
	{
		await psql.raw("create database ??", name);

		await psql.transaction(async trx =>
		{
			// Passwords within "create user" are specifically disallowed parameters in PostgreSQL
			const query = trx.raw("create user ?? with encrypted password ?", [user, password]).toString();

			await trx.raw(query);
			await trx.raw("revoke connect on database ?? from public", name);
			await trx.raw("grant all on database ?? to ??", [name, user]);
		});

		psql.destroy();
	}
	catch (error)
	{
		psql.destroy();
		throw error;
	}
};



module.exports = createdb;
