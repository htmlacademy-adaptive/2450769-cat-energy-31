# Папка для изображений

Сюда нужно класть:

1. контентные `svg` (не иконки), например логотип.
2. растровые `png` (или `jpg`) изображения двойной плотности пикселей (но без с суффикса плотности).

Запуск команды `pnpm optimize:images` оптимизирует все svg-изображения, а для каждого растрового изображения создаст:

* равноразмерную копию в формате `avif` с суффиксом `@2x`,
* равноразмерную копию в формате `webp` с суффиксом `@2x`,
* уменьшенную в 2 раза копию в формате `avif` с суффиксом `@1x`.
* уменьшенную в 2 раза копию в формате `webp` с суффиксом `@1x`.

После чего растровые оригиналы удаляются автоматически, чтобы повторный запуск для новых изображений не генерировал заново уже имеющиеся файлы.

Пример результата работы команды для двух файлов — `logo.svg` и `hero.png`:

```shell
└── source/
	└── images/
		├── hero@1x.avif
		├── hero@1x.webp
		├── hero@2x.avif
		├── hero@2x.webp
		└── logo.svg
```

Отсюда файлы изображений при продакшен-сборке без изменений попадают в `build/images/`:

```shell
└── build/
	└── images/
		├── hero@1x.avif
		├── hero@1x.webp
		├── hero@2x.avif
		├── hero@2x.webp
		└── logo.svg
```

При дев-сборке изображения не копируются в `build/images/`, сервер их забирает из `source/images/`

## Пример подключения фонового изображения

В стилевом файле БЭМ-блока пути должны быть валидными для исходников (как подсказывает редактор):

```scss
.hero {
	background-image:
		image-set(
			url("../../images/hero@1x.avif") 1x type("image/avif"),
			url("../../images/hero@2x.avif") 2x type("image/avif"),
			url("../../images/hero@1x.webp") 1x type("image/webp"),
			url("../../images/hero@2x.webp") 2x type("image/webp")
		);
}
```

Сборка сама исправит эти пути на валидные для билда:

```css
.hero {
	background-image:
		image-set(
			url("../images/hero@1x.avif") 1x type("image/avif"),
			url("../images/hero@2x.avif") 2x type("image/avif"),
			url("../images/hero@1x.webp") 1x type("image/webp"),
			url("../images/hero@2x.webp") 2x type("image/webp")
		);
}
```
