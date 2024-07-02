/** @type {import('stylelint').Config} */
export default {
	"extends": `@firefoxic/stylelint-config`,
	"rules": {
		"declaration-property-value-no-unknown": [
			true,
			{
				typesSyntax: {
					color: `| oklch( [ <percentage> | <number> | none] [ <percentage> | <number> | none] [ <hue> | none] [ / [<alpha-value> | none] ]? )`,
				},
			},
		],
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
