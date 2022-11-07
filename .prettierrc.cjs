module.exports = {
    trailingComma: 'es5',
    tabWidth: 4,
    semi: false,
    singleQuote: true,
    quoteProps: 'as-needed',
    bracketSpacing: true,
    bracketSameLine: true,
    arrowParens: 'always',
    overrides: [
        {
            files: ['**/*.yaml', '**/*.yml'],
            options: {
                tabWidth: 2,
            },
        },
    ],
}
