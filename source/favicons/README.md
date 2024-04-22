# Папка для фавиконок

Здесь должны находиться все необходимые варианты фавиконок, кроме `favicon.ico` и вебманифеста, которые должны быть в `source/`.

```shell
└── source/
	└── favicons/
		├── favicon-180.png   # для старых iPhone
		├── favicon-192.png
		├── favicon-192.webp
		├── favicon-512.png
		├── favicon-512.webp
		└── favicon.svg
```

Для их генерации сюда нужно положить svg-файлы фавиконкок из макета (`touch.svg`, `32.svg` и если есть `16.svg`) и запустить команду `pnpm optimize:favicons`. Подробности в [Workflow.md](./Workflow.md#Фавиконки).
