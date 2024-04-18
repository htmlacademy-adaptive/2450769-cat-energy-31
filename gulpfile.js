import { env } from 'node:process'
import { error } from 'node:console'
import { readFile, rm } from 'node:fs/promises'

import bemlinter from 'gulp-html-bemlinter'
import browserslistToEsbuild from 'browserslist-to-esbuild'
import { createGulpEsbuild } from 'gulp-esbuild'
import htmlmin from 'gulp-htmlmin'
import { nunjucksCompile } from "gulp-nunjucks"
import plumber from 'gulp-plumber'
import postcss from 'gulp-postcss'
import rename from 'gulp-rename'
import server from 'browser-sync'
import { stacksvg } from 'gulp-stacksvg'
import { dest, parallel, series, src, watch } from 'gulp'

const IS_DEVELOPMENT = env.NODE_ENV !== `production`
const PATH_TO_SOURCE = `./source/`
const PATH_TO_DIST = `./build/`
const PATH_TO_DATA = `${PATH_TO_SOURCE}data.json`
const PATHS_TO_STATIC = [
	`${PATH_TO_SOURCE}*.ico`,
	`${PATH_TO_SOURCE}*.webmanifest`,
	`${PATH_TO_SOURCE}favicons/**/*.{svg,png,webp}`,
	`${PATH_TO_SOURCE}fonts/**/*.woff2`,
	`${PATH_TO_SOURCE}images/**/*`,
	`${PATH_TO_SOURCE}vendor/**/*`,
	`!${PATH_TO_SOURCE}**/README.md`,
]

async function readJsonFile (path) {
	const file = await readFile(path)

	return JSON.parse(file)
}

const plumberOptions = {
	errorHandler (err) {
		error(err.message)
		this.emit(`end`)
	},
}

export function getProjectRoot () {
	if (!env.CI || !env.REPO_NAME) return ``

	if (!env.PR_NUMBER) return `/${env.REPO_NAME}`

	return `/${env.REPO_NAME}/${env.PR_NUMBER}`
}

export async function processMarkup () {
	const data = await readJsonFile(PATH_TO_DATA)

	data.project.root = getProjectRoot()

	return src(`${PATH_TO_SOURCE}pages/**/*.njk`, { base: PATH_TO_SOURCE })
		.pipe(plumber(plumberOptions))
		.pipe(nunjucksCompile(data))
		.pipe(htmlmin({ collapseWhitespace: !IS_DEVELOPMENT }))
		.pipe(rename((path) => {
			path.dirname = path.dirname.replace(`pages`, ``)
		}))
		.pipe(dest(PATH_TO_DIST))
		.pipe(server.stream())
}

export function lintBem () {
	return src(`${PATH_TO_DIST}**/*.html`)
		.pipe(bemlinter())
}

export function processStyles () {
	const context = { IS_DEVELOPMENT }

	return src(`${PATH_TO_SOURCE}styles/*.scss`, { sourcemaps: IS_DEVELOPMENT })
		.pipe(plumber(plumberOptions))
		.pipe(postcss(context))
		.pipe(rename({ extname: `.css` }))
		.pipe(dest(`${PATH_TO_DIST}styles`, { sourcemaps: IS_DEVELOPMENT }))
		.pipe(server.stream())
}

export function processScripts () {
	const gulpEsbuild = createGulpEsbuild({ incremental: IS_DEVELOPMENT })

	return src(`${PATH_TO_SOURCE}scripts/*.js`)
		.pipe(plumber(plumberOptions))
		.pipe(gulpEsbuild({
			bundle: true,
			format: `esm`,
			// splitting: true,
			platform: `browser`,
			minify: !IS_DEVELOPMENT,
			sourcemap: IS_DEVELOPMENT,
			target: browserslistToEsbuild(),
		}))
		.pipe(dest(`${PATH_TO_DIST}scripts`))
		.pipe(server.stream())
}

export function createStack () {
	return src(`${PATH_TO_SOURCE}icons/**/*.svg`)
		.pipe(stacksvg())
		.pipe(dest(`${PATH_TO_DIST}icons`))
}

export function copyStatic () {
	return src(PATHS_TO_STATIC, { base: PATH_TO_SOURCE })
		.pipe(dest(PATH_TO_DIST))
}

export function startServer () {
	const serveStatic = PATHS_TO_STATIC
		.filter((path) => path.startsWith(`!`) === false)
		.map((path) => {
			const dir = path.replace(/(\/\*\*\/.*$)|\/$/, ``)
			const route = dir.replace(PATH_TO_SOURCE, `/`)

			return { route, dir }
		})

	server.init({
		server: {
			baseDir: PATH_TO_DIST,
		},
		serveStatic,
		cors: true,
		notify: false,
		ui: false,
	}, (err, bs) => {
		bs.addMiddleware(`*`, async (req, res) => {
			res.write(await readFile(`${PATH_TO_DIST}404/index.html`))
			res.end()
		})
	})

	watch(`${PATH_TO_SOURCE}**/*.njk`, series(processMarkup))
	watch(`${PATH_TO_SOURCE}**/*.scss`, series(processStyles))
	watch(`${PATH_TO_SOURCE}**/*.js`, series(processScripts))
	watch(`${PATH_TO_SOURCE}icons/**/*.svg`, series(createStack, reload))
	watch(PATHS_TO_STATIC, series(reload))
}

async function reload () {
	await server.reload()
}

export async function removeBuild () {
	await rm(PATH_TO_DIST, {
		force: true,
		recursive: true,
	})
}

export default series(
	removeBuild,
	parallel(
		processMarkup,
		processStyles,
		processScripts,
		createStack,
	),
	IS_DEVELOPMENT ? startServer : copyStatic,
)
