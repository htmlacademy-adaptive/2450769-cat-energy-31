import { default as firefoxicEslintConfig, globals } from "@firefoxic/eslint-config"

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		ignores: [`build/`],
	},
	{
		ignores: [`source/`],
		languageOptions: {
			globals: {
				...globals.nodeBuiltin,
			},
		},
	},
	{
		files: [`source/**/*.js`],
		languageOptions: {
			globals: {
				...globals.browser,
			},
		},
	},
	...firefoxicEslintConfig,
]
