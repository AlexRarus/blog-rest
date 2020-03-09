# blog-res-api

### получение списка пользователей

path: `/api/users`

method: `GET`

params:

`{
	query?: {
	 filter?: {
		 firstName?: string,
		 firstName?: string,
		 patronymic?: string,
		 login?: string,
		 email?: string
  	},
 	offset?: number,
 	offsetStep?: number
 }
}`

response:
`
[
	{
		id: string,
		login: string,
		email: string,
		firstName: string,
		lastName: string,
		patronymic: string,
		avatar: string,
		patronymic: string,
		registrationDate: string,
		role: string,
		admin: boolean
	}
]
`


### Получение пользователя по id
path: `/api/users/:id`

method: `GET | PUT | DELETE`

params:

`{
	id: string
}`

response:
`
	{
		id: string,
		login: string,
		email: string,
		firstName: string,
		lastName: string,
		patronymic: string,
		avatar: string,
		patronymic: string,
		registrationDate: string,
		role: string,
		admin: boolean
	}
`

### Аутентификация пользователя
path: `/api/users/auth/`

method: `GET`

params: `-`

response:
`
	{
		id: string,
		login: string,
		email: string,
		firstName: string,
		lastName: string,
		patronymic: string,
		avatar: string,
		patronymic: string,
		registrationDate: string,
		role: string,
		admin: boolean
	}
`


### Проверка аутентификации пользователя
path: `/api/users/check-auth/`

method: `GET`

params: `-`

response: `true | false`

### Проверка наличия админских прав
path: `/api/users/admin-access/`

method: `GET`

params: `-`

response: `status: 200 | 403`

### Авторизация
path: `/api/users/signin`

method `POST`

params:
`{
	login: string,
	password: string
}`

response:
`
{
	{
		id: string,
		login: string,
		email: string,
		firstName: string,
		lastName: string,
		patronymic: string,
		avatar: string,
		patronymic: string,
		registrationDate: string,
		role: string,
		admin: boolean
	}
}
`

### Регистрация
path: `/api/users/signup/`

method: `POST`

params:
`{
	login: string,
	email: string,
	firstName: string,
	lastName: string,
	password: string
}`

response:
`
{
	{
		id: string,
		login: string,
		email: string,
		firstName: string,
		lastName: string,
		patronymic: string,
		avatar: string,
		patronymic: string,
		registrationDate: string,
		role: string,
		admin: boolean
	}
}
`

### Выход
path: `/api/users/signout/`

method: `GET`

params: `-`

response: `{ success: true }`

### Проверка существования пользователя
path: `/api/users/check-exists/`

method: `POST`

### Изменение пароля пользователя
path: `/api/users/change/password/`

method: `PUT`

params: `-`

response: `{ exists: boolean }`

### Получение списка постов
path: `/api/posts/`

method: `GET`

params:
`{
	query?: {
		authorId?: string
		search: string,
		sort: 'best' | 'popular' | 'new'
		offset?: number,
		offsetStep?: number
	 }
}`

response:
`
[
	{
		id,
		title,
		content,
		authorId,
		date,
		views,
		author,
		likes,
		dislikes,
		viewsCount,
		likesCount,
		dislikesCount,
		rating
	}
]
`

### Получение списка избранных постов
path: `/api/posts/favourite/`

method: `GET`

params:
`{
	query?: {
		authorId?: string
		search: string,
		offset?: number,
		offsetStep?: number
	 }
}`

response:
`
[
	{
		id,
		title,
		content,
		authorId,
		date,
		views,
		author,
		likes,
		dislikes,
		viewsCount,
		likesCount,
		dislikesCount,
		rating
	}
]
`

### Создание поста
path: `/api/posts/`

method: `POST`

params:
`
{
	title: string,
	content: string
}
`

response:
`
	{
		id,
		title,
		content,
		authorId,
		date,
		views,
		author,
		likes,
		dislikes,
		viewsCount,
		likesCount,
		dislikesCount,
		rating
	}
`

### Получение поста
path: `/api/posts/:id`

method: `GET`

params:
`
	id: string
`

response:
`
	{
		id,
		title,
		content,
		authorId,
		date,
		views,
		author,
		likes,
		dislikes,
		viewsCount,
		likesCount,
		dislikesCount,
		rating
	}
`

### Удаление поста
path: `/api/posts/:id`

method: `DELETE`

params:
`
	id: string
`

response:
`
	{
		id: string,
		removed: 'success'
	}
`

### Изменение поста
path: `/api/posts/:id`

method: `PUT`

params:
`
	id: string
	data: {
		title: string,
		content: string
	}
`

response:
`
	{
		id,
		title,
		content,
		authorId,
		date,
		views,
		author,
		likes,
		dislikes,
		viewsCount,
		likesCount,
		dislikesCount,
		rating
	}
`

### Добавление лайка посту
path: `/api/posts/like/:id`

method: `PUT`

params:
`
	id: string;
`

response:
`
	{
		id,
		title,
		content,
		authorId,
		date,
		views,
		author,
		likes,
		dislikes,
		viewsCount,
		likesCount,
		dislikesCount,
		rating
	}
`

### Добавление дизлайка посту
path: `/api/posts/dislike/:id`

method: `PUT`

params:
`
	id: string;
`

response:
`
	{
		id,
		title,
		content,
		authorId,
		date,
		views,
		author,
		likes,
		dislikes,
		viewsCount,
		likesCount,
		dislikesCount,
		rating
	}
`
