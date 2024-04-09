# Папка для векторных иконок

Сюда нужно класть svg-файлы иконок. Все они будут оптимизированы при запуске команды `pnpm optimize:icons`.


```shell
└── source/
	└── icons/
		├── tg.svg
		├── vk.svg
		└── yt.svg
```

Группы однотипных иконок можно объединять в подпапки:


```shell
└── source/
	└── icons/
		├── social/
		│   ├── tg.svg
		│   ├── vk.svg
		│   └── yt.svg
		└── gift.svg
```

Находящиеся здесь иконки при сборке станут одним спрайтом:

```shell
└── build/
	└── icons/                  # папка для спрайта
		└── stack.svg           # спрайт
```

## Пример подключения иконки

В файле БЭМ-блока путь должен быть валидным для исходников (как подсказывает редактор):

```scss
.search {
	&::before {
		content: "";
		width: 44px;
		height: 44px;
		display: block;
		background: #444444;
		mask-image: url("../../icons/search.svg");
	}
}
```

Сборка сама исправит этот путь на валидный для билда путь до фрагмента стек-спрайта:

```css
.search::before {
	content: "";
	width: 44px;
	height: 44px;
	display: block;
	background: #444444;
	mask-image: url("../icons/stack.svg#search");
}
```
