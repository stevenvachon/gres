"use strict";
const editEnv = require("edit-dotenv");
const Enquirer = require("enquirer");
const isset = require("isset");
const knex = require("knex");
const {outputFile, readFile}= require("fs-extra");
const {parse:parseEnv} = require("dotenv");



// TODO :: try https://npmjs.com/pgtools ?

const createdb = async (envPath=".env", envSamplePath=".env.sample") =>
{
	const envs = await Promise.all(
	[
		readEnv(envPath),
		readEnv(envSamplePath)
	]);

	const envString = envs[0] || envs[1];
	const env = await parseEnv(envString);
	const changes = await prompts(env);

	if (Object.keys(changes).length > 0)
	{
		Object.assign(env, changes);

		await outputFile(envPath, editEnv(envString, changes));
	}
	else if (envString === envs[1])
	{
		// Duplicate the sample
		await outputFile(envPath, envString);
	}

	await db(env);
};



const db = async env =>
{
	const host     = env.POSTGRES_HOST;
	const name     = env.POSTGRES_NAME;
	const password = env.POSTGRES_PASSWORD;
	const port     = env.POSTGRES_PORT;
	const user     = env.POSTGRES_USER;

	if (!isset(host) || !isset(name) || !isset(password) || !isset(user))
	{
		throw new Error("Environmental variable(s) not set");
	}

	const psql = knex({ client:"pg", connection:{ host, port } });

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



const prompts = async env =>
{
	const enquirer = new Enquirer();

	const promptVars =
	[
		"POSTGRES_HOST",
		"POSTGRES_PORT",
		"POSTGRES_NAME",
		"POSTGRES_USER",
		"POSTGRES_PASSWORD"
	];

	// TODO :: also prompt for SUPERUSER_NAME and SUPERUSER_PASSWORD (https://github.com/brianc/node-postgres/wiki/Client#new-clientobject-config--client)

	const questions = promptVars.map(varname => enquirer.question(
	{
		name: varname,
		message: `Value for ${varname}`,
		default: isset(env[varname]) ? env[varname] : ""
	}));

	const answers = await enquirer.ask(questions);

	return Object.keys(answers).reduce((result, varname) =>
	{
		if (varname in env && answers[varname]===env[varname])
		{
			delete answers[varname];
		}

		return result;
	}, answers);
};



const readEnv = async path =>
{
	try
	{
		return await readFile(path, "utf8");
	}
	catch (error)
	{
		if (error.code === "ENOENT")
		{
			return "";
		}
		else
		{
			throw error;
		}
	}
};



module.exports = createdb;
