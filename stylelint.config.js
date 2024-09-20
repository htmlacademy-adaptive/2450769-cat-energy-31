/** @type {import('stylelint').Config} */
export default {
	"extends": `@firefoxic/stylelint-config`,
	"rules": {
		"no-unknown-custom-media": null,
	},
	"overrides": [
		{
			customSyntax: `postcss-scss`,
			files: [`**/*.scss`],
			rules: {
				"plugin/use-logical-properties-and-values": null,
				"plugin/use-logical-units": null,
				"declaration-property-value-disallowed-list": null,
				"declaration-property-value-no-unknown": null,
				"media-query-no-invalid": null,
				"at-rule-no-unknown": [
					true,
					{
						ignoreAtRules: [
							`content`,
							`debug`,
							`each`,
							`else`,
							`for`,
							`forward`,
							`if`,
							`include`,
							`mixin`,
							`use`,
							`warn`,
							`while`,
						],
					},
				],
				"function-no-unknown": [
					true,
					{
						ignoreFunctions: [
							`/^get/`,
							`if`,
						],
					},
				],
			},
		},
	],
}
