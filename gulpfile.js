import { env } from 'node:process'
import { error } from 'node:console'
import { link, readFile, rm, stat } from 'node:fs/promises'

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
const SRC = `./source`
const DIST = `./build/`
const ROOT_STATIC_PATHS = [
	`/favicon.ico`,
	`/manifest.webmanifest`,
]
const ROOT_SHARED_PATHS = [
	`/favicons/**/*.{svg,png,webp}`,
	`/fonts/**/*.woff2`,
	`/images/**/*.{svg,avif,webp}`,
	`/vendor/**/*`,
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
	const data = await readJsonFile(`${SRC}/data.json`)

	data.project.root = getProjectRoot()

	return src(`${SRC}/pages/**/*.{html,njk}`, { base: SRC })
		.pipe(plumber(plumberOptions))
		.pipe(nunjucksCompile(data))
		.pipe(htmlmin({ collapseWhitespace: !IS_DEVELOPMENT }))
		.pipe(rename((path) => {
			path.dirname = path.dirname.replace(`pages`, ``)
		}))
		.pipe(dest(DIST))
		.pipe(server.stream())
}

export function lintBem () {
	return src(`${DIST}/**/*.html`)
		.pipe(bemlinter())
}

export function processStyles () {
	const context = { IS_DEVELOPMENT }

	return src(`${SRC}/styles/*.scss`, { sourcemaps: IS_DEVELOPMENT })
		.pipe(plumber(plumberOptions))
		.pipe(postcss(context))
		.pipe(rename({ extname: `.css` }))
		.pipe(dest(`${DIST}/styles`, { sourcemaps: IS_DEVELOPMENT }))
		.pipe(server.stream())
}

export function processScripts () {
	const gulpEsbuild = createGulpEsbuild({ incremental: IS_DEVELOPMENT })

	return src(`${SRC}/scripts/*.js`)
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
		.pipe(dest(`${DIST}/scripts`))
		.pipe(server.stream())
}

export function createStack () {
	return src(`${SRC}/icons/**/*.svg`)
		.pipe(stacksvg())
		.pipe(dest(`${DIST}/icons`))
}

export async function linkRootStatic () {
	for (let filePath of ROOT_STATIC_PATHS) {
		try {
			await stat(`${SRC}${filePath}`)
		} catch {
			continue
		}
		await link(`${SRC}${filePath}`, `${DIST}${filePath}`)
	}
}

export async function copyShared () {
	const shared = ROOT_SHARED_PATHS
		.map((path) => `${SRC}${path}`)

	shared.push(`!${SRC}/**/*.md`)

	return src(shared, { base: SRC })
		.pipe(dest(DIST))
}

export function startServer () {
	const serveStatic = ROOT_SHARED_PATHS
		.map((path) => {
			const route = path.replace(/(\/\*\*\/.*$)|\/$/, ``)
			const dir = `${SRC}${route}`

			return { route, dir }
		})

	server.init({
		server: {
			baseDir: DIST,
		},
		serveStatic,
		cors: true,
		notify: false,
		ui: false,
	}, (err, bs) => {
		bs.addMiddleware(`*`, async (req, res) => {
			res.write(await readFile(`${DIST}/404.html`))
			res.end()
		})
	})

	const sharedPaths = ROOT_SHARED_PATHS.map((PATH) => `${SRC}${PATH}`)
	const staticPaths = ROOT_STATIC_PATHS.map((PATH) => `${SRC}${PATH}`)

	watch(`${SRC}/**/*.{html,njk}`, series(processMarkup))
	watch(`${SRC}/**/*.scss`, series(processStyles))
	watch(`${SRC}/**/*.js`, series(processScripts))
	watch(`${SRC}/icons/**/*.svg`, series(createStack, reloadServer))
	watch(sharedPaths, series(reloadServer))
	watch(staticPaths, series(reloadServer))
}

function reloadServer () {
	return server.reload()
}

async function removeBuild () {
	await rm(DIST, {
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
	linkRootStatic,
	IS_DEVELOPMENT ? startServer : copyShared,
)
