const http = require('http');
const { exec } = require('child_process');

const DB_CONTAINER_NAME = process.env.DB_CONTAINER_NAME;
const DB_USER = process.env.DB_USER;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD = process.env.DB_PASSWORD || '';

const ALLOW_INSERT = process.env.ALLOW_INSERT === 'true';
const ALLOW_UPDATE = process.env.ALLOW_UPDATE === 'true';
const ALLOW_DELETE = process.env.ALLOW_DELETE === 'true';

const PORT = process.env.PORT || 3002;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/execute-sql') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      let data;
      try {
        data = JSON.parse(body);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON payload.');
        return;
      }

      const { query } = data;

      if (!query) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('SQL query is required.');
        return;
      }

      const normalizedQuery = query.trim().toUpperCase();

      if (normalizedQuery.startsWith('INSERT') && !ALLOW_INSERT) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('INSERT operations are not allowed.');
        return;
      }

      if (normalizedQuery.startsWith('UPDATE') && !ALLOW_UPDATE) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('UPDATE operations are not allowed.');
        return;
      }

      if (normalizedQuery.startsWith('DELETE') && !ALLOW_DELETE) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('DELETE operations are not allowed.');
        return;
      }

      const command = `docker exec ${DB_CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -c "${query}"`;
      const fullCommand = DB_PASSWORD ? `docker exec -e PGPASSWORD=${DB_PASSWORD} ${DB_CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -c "${query}"` : command;

      exec(fullCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: stderr }));
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result: stdout }));
      });
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`MCP SQL Executor server listening on port ${PORT}`);
}); 