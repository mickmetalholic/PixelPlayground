## ADDED Requirements

### Requirement: Every HTTP request is logged with method, path, status, and duration
The backend SHALL log each incoming HTTP request after the response is sent, including the HTTP method, request path, response status code, and elapsed duration in milliseconds.

#### Scenario: Successful request is logged
- **WHEN** a client sends a GET request to `/steam/games?q=zelda` that returns 200
- **THEN** the server outputs a log line containing `GET`, `/steam/games?q=zelda`, `200`, and a duration in milliseconds

#### Scenario: Failed request is logged
- **WHEN** a client sends a POST request to `/langgraph/chat` with an invalid body that returns 400
- **THEN** the server outputs a log line containing `POST`, `/langgraph/chat`, `400`, and a duration in milliseconds

#### Scenario: Log output uses NestJS Logger
- **WHEN** any request is processed
- **THEN** the log message is emitted via the `Logger` class from `@nestjs/common` with the context label `RequestLogger`
