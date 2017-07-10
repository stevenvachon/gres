"use strict";
const createdb = require("../../createdb");



createdb().catch(error =>
{
	console.error(error);

	process.exitCode = 1;
});
