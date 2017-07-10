"use strict";
const dropdb = require("../../dropdb");



dropdb().catch(error =>
{
	console.error(error);

	process.exitCode = 1;
});
