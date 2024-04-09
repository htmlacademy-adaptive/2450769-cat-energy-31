# Папка для фавиконок

Здесь должны находиться все необходимые варианты фавиконок, кроме `favicon.ico` и вебманифеста, которые должны быть в `source/`.

```shell
└── source/
	└── favicons/
		├── favicon-180.png   # для старых iPhone
		├── favicon-192.png
		├── favicon-512.png
		└── favicon.svg
```

Для их генерации сюда нужно положить svg-фавиконку и запустить команду `pnpm optimize:favicons`.

Кроме этих файлов также будут сгенерированы ещё два: `favicon.ico` и `favicon.webmanifest` — их нужно переместить в `source/` (то есть в корень исходников), переименовать манифест в `site.webmanifest` или `manifest.webmanifest`.
