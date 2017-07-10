"use strict";
const EOL = require("os").EOL;
const escapeStringRegexp = require("escape-string-regexp");
const {expect} = require("chai");
const {outputFile, readFile, remove} = require("fs-extra");
const {PassThrough} = require("stream");
const suppose = require("suppose");



// TODO :: https://github.com/jprichardson/node-suppose/pull/31
const clean = str =>
{
	return new RegExp(`^\s*${escapeStringRegexp(str)}\s*`, "m");
};



const createdb = expects =>
{
	return new Promise((resolve, reject) =>
	{
		const stream = new PassThrough()
		//.on("data", chunk => console.log(chunk.toString());

		const supposing = suppose("node", ["test/helpers/createdb"], { debug:stream, stripAnsi:true });

		expects.forEach(expected => supposing.when(clean(expected.condition)).respond(expected.response));

		supposing
		.once("error", error => reject(error))
		.end(code => resolve());
	});
};



const emptyPrompts = () =>
{
	it("throws if a prompt is left empty (#1)", function()
	{
		return createdb(
		[
			{ condition:"? Value for POSTGRES_HOST ()", response:"\n" },
			{ condition:"? Value for POSTGRES_NAME ()", response:"fake-database\n" },
			{ condition:"? Value for POSTGRES_USER ()", response:"fake-user\n" },
			{ condition:"? Value for POSTGRES_PASSWORD ()", response:"fake-password\n" }
		])
		.catch(error => error)
		.then(error =>
		{
			expect(error).to.be.an("error").with.property("message").that.matches(/^Error: Environmental variable\(s\) not set/);
		});
	});

	it("throws if a prompt is left empty (#2)", function()
	{
		return createdb(
		[
			{ condition:"? Value for POSTGRES_HOST ()", response:"fake-host\n" },
			{ condition:"? Value for POSTGRES_NAME ()", response:"\n" },
			{ condition:"? Value for POSTGRES_USER ()", response:"fake-user\n" },
			{ condition:"? Value for POSTGRES_PASSWORD ()", response:"fake-password\n" }
		])
		.catch(error => error)
		.then(error =>
		{
			expect(error).to.be.an("error").with.property("message").that.matches(/^Error: Environmental variable\(s\) not set/);
		});
	});

	it("throws if a prompt is left empty (#3)", function()
	{
		return createdb(
		[
			{ condition:"? Value for POSTGRES_HOST ()", response:"fake-host\n" },
			{ condition:"? Value for POSTGRES_NAME ()", response:"fake-database\n" },
			{ condition:"? Value for POSTGRES_USER ()", response:"\n" },
			{ condition:"? Value for POSTGRES_PASSWORD ()", response:"fake-password\n" }
		])
		.catch(error => error)
		.then(error =>
		{
			expect(error).to.be.an("error").with.property("message").that.matches(/^Error: Environmental variable\(s\) not set/);
		});
	});

	it("throws if a prompt is left empty (#4)", function()
	{
		return createdb(
		[
			{ condition:"? Value for POSTGRES_HOST ()", response:"fake-host\n" },
			{ condition:"? Value for POSTGRES_NAME ()", response:"fake-database\n" },
			{ condition:"? Value for POSTGRES_USER ()", response:"fake-user\n" },
			{ condition:"? Value for POSTGRES_PASSWORD ()", response:"\n" }
		])
		.catch(error => error)
		.then(error =>
		{
			expect(error).to.be.an("error").with.property("message").that.matches(/^Error: Environmental variable\(s\) not set/);
		});
	});

	it("throws if all prompts are left empty", function()
	{
		return createdb(
		[
			{ condition:"? Value for POSTGRES_HOST ()", response:"\n" },
			{ condition:"? Value for POSTGRES_NAME ()", response:"\n" },
			{ condition:"? Value for POSTGRES_USER ()", response:"\n" },
			{ condition:"? Value for POSTGRES_PASSWORD ()", response:"\n" }
		])
		.catch(error => error)
		.then(error =>
		{
			expect(error).to.be.an("error").with.property("message").that.matches(/^Error: Environmental variable\(s\) not set/);
		});
	});
};



const promptsAndWrites = () =>
{
	it("prompts and writes an .env file", function()
	{
		return createdb(
		[
			{ condition:"? Value for POSTGRES_HOST ()", response:"fake-host\n" },
			{ condition:"? Value for POSTGRES_NAME ()", response:"fake-database\n" },
			{ condition:"? Value for POSTGRES_USER ()", response:"fake-user\n" },
			{ condition:"? Value for POSTGRES_PASSWORD ()", response:"fake-password\n" }
		])
		.catch(error => error)
		.then(error =>
		{
			// Vague npmjs.com/pg error stemming from fake credentials
			expect(error).to.be.an("error").with.property("message").that.does.not.match(/^Error: Environmental variable\(s\) not set/);

			return readFile(".env", "utf8");
		})
		.then(contents =>
		{
			let expected = "";

			expected += `POSTGRES_HOST=fake-host${EOL}`;
			expected += `POSTGRES_NAME=fake-database${EOL}`;
			expected += `POSTGRES_USER=fake-user${EOL}`;
			expected += `POSTGRES_PASSWORD=fake-password${EOL}`;

			expect(contents).to.equal(expected);
		});
	});
};



describe("createdb", function()
{
	afterEach(() => Promise.all([ remove(".env"), remove(".env.sample") ]));



	describe("with no .env files", function()
	{
		promptsAndWrites();
		emptyPrompts();
	});



	describe("with empty .env.sample file", function()
	{
		beforeEach(() =>
		{
			let contents = "";
			contents += `POSTGRES_HOST=${EOL}`;
			contents += `POSTGRES_NAME=${EOL}`;
			contents += `POSTGRES_USER=${EOL}`;
			contents += `POSTGRES_PASSWORD=${EOL}`;

			return outputFile(".env.sample", contents);
		});



		promptsAndWrites();
		emptyPrompts();
	});
});
