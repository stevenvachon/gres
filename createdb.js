"use strict";
const semver = require("semver");



if (semver.satisfies(process.version, ">= 8"))
{
	module.exports = require("./es2017/createdb");
}
else
{
	require("babel-core/register");
	require("babel-polyfill");
	module.exports = require("./es2015/createdb");
}
