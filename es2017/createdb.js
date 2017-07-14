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
		"POSTGRES_PORT",
		"POSTGRES_NAME",
		"POSTGRES_USER",
		"POSTGRES_PASSWORD"
	];

	await dotenvPrompt(envPath, envSamplePath, promptVarnames);

	// TODO :: also prompt for superuser name/password (https://github.com/brianc/node-postgres/wiki/Client#new-clientobject-config--client)

	dotenv.config({ path:envPath });

	const database = process.env.POSTGRES_NAME;
	const host     = process.env.POSTGRES_HOST;
	const password = process.env.POSTGRES_PASSWORD;
	const port     = process.env.POSTGRES_PORT;
	const user     = process.env.POSTGRES_USER;

	if (!isset(host) || !isset(database) || !isset(password) || !isset(user))
	{
		throw new Error("Environmental variable(s) not set");
	}

	const psql = knex({ client:"pg", connection:{ host, port } });

	try
	{
		await psql.raw("create database ??", database);

		await psql.transaction(async trx =>
		{
			// Passwords within "create user" are specifically disallowed parameters in PostgreSQL
			const query = trx.raw("create user ?? with encrypted password ?", [user, password]).toString();

			await trx.raw(query);
			await trx.raw("revoke connect on database ?? from public", database);
			await trx.raw("grant all on database ?? to ??", [database, user]);
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
