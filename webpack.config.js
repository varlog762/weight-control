const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin'); // Подключаем плагин для работы с HTML.
// Плагин для удаления папки dist от устаревших сборок.
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
// Копирует указанные ассеты из src в dist без обработки.
const CopyWebpackPlugin = require('copy-webpack-plugin');
// Позволяет сохранять стили в отдельные файлы.
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// Позволяет минифицировать css.
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
// Позволяет минифицировать js.
const TerserWebpackPlugin = require('terser-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

// Проверяет производится ли сборка в режиме разработки.
const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const plugins = () => {
    const base = [
        new HTMLWebpackPlugin({ // Плагин для обработки HTML.
            inject: 'body', // Указываем, чтобы скрипты вставлялись в тег <body>
            template: './index.html', // Указываем откуда брать HTML.
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CleanWebpackPlugin(),
        // Копирует указанные ассеты из src в dist без обработки.
        new CopyWebpackPlugin({
            patterns: [{
                    from: 'icons/*.svg',
                    to: 'icons/[name][ext]',
                },
                {
                    from: 'img/slider/*.jpg',
                    to: 'img/slider/[name][ext]',
                },
                {
                    from: 'img/tabs/*.jpg',
                    to: 'img/tabs/[name][ext]',
                },
                {
                    from: '*.php',
                    to: '[name][ext]',
                },
            ]
        }),
        new MiniCssExtractPlugin({
            filename: 'css/styles.css',
        })
    ];
    
    if (isProd) {
        base.push(new BundleAnalyzerPlugin());
    }

    return base;
}

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }

    if (isProd) {
        config.minimizer = [
            new TerserWebpackPlugin(),
            new CssMinimizerPlugin()
        ]
    }

    return config;
};

const filename = (ext) => isDev ? `[name].${ext}` : `[name].[hash].${ext}`;

module.exports = {
    // context - говорит вебпаку, что все исходники лежат в папке src (src нужно удалить из остальных путей).
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: './js/main.js',
    // Если в приложении присутствует несколько скриптов (чанков) в разных точках
    // (например script.js в body и analytics.js в head)
    // {
    //  main: './src/assets/js/script.js',
    //  any: './путь ко второму файлу (например скрипта для аналитики)'
    // },
    output: {
        //[name] - бандлы будут создаваться с именем оригинального entry.
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist')
    },
    optimization: optimization(),
    // Необходимо установить webpack-dev-server.
    devServer: {
        port: 8080,
        hot: isDev,
    },
    devtool: isDev ? 'source-map' : false,
    plugins: plugins(),
    module: { // Модули позволяют Вебпаку работать с неизвестными для него типами файлов (например CSS).
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                // Как только Вебпак встречает .css, то он должен использовать лоудер указанный в use.
                /* normaleze.css устанавливается с помощью npm в dedependencies, а позже импортируется 
                в css/scss с помощью @import "~normalize.css"; */
                test: /\.css$/,
                // Вебпак идет справа налево: сначала он пропустит все через css-loader, затем через style-loader.
                // css-loader - позволяет Вебпаку понимать css (импортировать и т.п.).
                //style-loader - добавляет обработанные стили в блок HEAD index.html.
                use: [ /* 'style-loader' */ MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.s[ac]ss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            },
            {
                test: /\.less$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
            },
            // Обработка шрифтов.
            // {
            //     test: /\.(woff|woff2|eot|ttf|otf)$/,
            //     use: [{
            //         loader: 'file-loader',
            //         options: {
            //             outputPath: 'assets/fonts', // Конечная папка для сохранения файлов
            //             name: '[name][ext]', // Формат имени выходного файла
            //         },
            //     }, ],
            // },
            // {
            //     test: /\.png$/,
            //     type: 'asset/resource',
            //     generator: {
            //         filename: 'assets/images/[name][ext]',
            //     },
            // },
            // Обработка .xml, если нужно просто скопировать файлы в dist и сохранить ссылки на них.
            // Так же необходиом импортнуть .xml файл в entry (т.е. script.js и т.п.).
            // {
            //     test: /\.xml$/,
            //     type: 'asset/resource',
            //     generator: {
            //         filename: 'assets/xml/[name][ext]',
            //     },
            // },
            // Обработка .xml, если нужно скопировать содержимое как строки.
            // Так же необходиом импортнуть .xml файл в entry (т.е. script.js и т.п.).
            // {
            //     test: /\.xml$/,
            //     type: 'asset/source',
            //     generator: {
            //         filename: 'assets/xml/[name][ext]',
            //     },
            // },
            // Обработка .csv, нужно установить лоудер и papaparse!!!, далее импортировать csv в entry.
            // {
            //     test: /\.csv$/,
            //     use: [
            //         'csv-loader'
            //     ]
            // }
        ]
    }
}