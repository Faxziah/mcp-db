# MCP-сервер выполнения запросов к БД

Это MCP-сервер, предназначенный для выполнения SQL-запросов к базе данных PostgreSQL.

## Возможности

-   Выполняет произвольные SQL-запросы, полученные через HTTP POST-запросы.
-   Подключается к базе данных PostgreSQL, работающей в Docker-контейнере, используя `docker exec`.
-   Все параметры выполнения (данные для подключения к базе данных и флаги безопасности) передаются как переменные окружения при запуске сервера.

## Запуск mcp-сервера

1.
```
   "mcp-db": {
      "command": "bash",
      "args": [
        "-c",
        "cd ./mcp && DB_CONTAINER_NAME=\"my_posgres\" DB_USER=\"user\" DB_NAME=\"swap_master\" ALLOW_INSERT=\"false\" ALLOW_UPDATE=\"false\" ALLOW_DELETE=\"false\" npm start"
      ]
    }
```

2. 
```npm start```

## Переменные Окружения
    -   `DB_CONTAINER_NAME`: Имя вашего Docker-контейнера PostgreSQL (например, `my_posgres`).
    -   `DB_USER`: Пользователь PostgreSQL (например, `user`).
    -   `DB_NAME`: Имя базы данных (например, `swap_master`).
    -   `ALLOW_INSERT`: Установите в `true` для разрешения операций INSERT, `false` в противном случае (по умолчанию: `false`).
    -   `ALLOW_UPDATE`: Установите в `true` для разрешения операций UPDATE, `false` в противном случае (по умолчанию: `false`).
    -   `ALLOW_DELETE`: Установите в `true` для разрешения операций DELETE, `false` в противном случае (по умолчанию: `false`).

    Эти переменные должны быть установлены в окружении, где запускается сервер.

## Использование

После запуска сервера вы можете отправлять SQL-запросы на конечную точку `/execute-sql`.

### Формат тела запроса:

```json
{
  "query": "ВАШ_SQL_ЗАПРОС_ЗДЕСЬ"
}
```

### Пример использования `curl`:

Для выполнения `SELECT` запроса:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"query": "SELECT * FROM contracts;"}' http://localhost:3002/execute-sql
```

Для выполнения `INSERT` запроса (убедитесь, что флаг `ALLOW_INSERT` установлен в `true` при запуске сервера):

```bash
curl -X POST -H "Content-Type: application/json" -d '{"query": "INSERT INTO your_table (column1) VALUES ('value1');"}' http://localhost:3002/execute-sql
```

Аналогично для операций `UPDATE` и `DELETE`, вы должны установить `ALLOW_UPDATE` или `ALLOW_DELETE` в `true` соответственно при запуске сервера.

Сервер вернет JSON-объект, содержащий `result` SQL-запроса или `error`, если запрос не удался.

## Структура Проекта

-   `mcp-db.js`: Основной файл приложения сервера.
-   `package.json`: Определяет метаданные и зависимости проекта. 