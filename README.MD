# Torus English Classifier

This repository contains a simple API to detect if a given text is in English.

## Typescript API

The TypeScript code for the API is located in the `typescript/` directory.

### Usage

Once the service is running (e.g., via `docker-compose up`), you can use the following cURL commands to test the API. The service will be available at `http://localhost:3016`.

#### Single text detection

To check a single string of text:

```bash
curl -X POST http://localhost:3016/is-english \
-H "Content-Type: application/json" \
-d '{
  "text": "this is a test in english"
}'
```

Expected response:

```json
{
  "isEnglish": true
}
```

To check a non-English text:

```bash
curl -X POST http://localhost:3016/is-english \
-H "Content-Type: application/json" \
-d '{
  "text": "esto es una prueba en español"
}'
```

Expected response:

```json
{
  "isEnglish": false
}
```

#### Batch text detection

To check a batch of texts:

```bash
curl -X POST http://localhost:3016/is-english-batch \
-H "Content-Type: application/json" \
-d '{
  "texts": [
    { "text": "this is a test in english" },
    { "text": "esto es una prueba en español" },
    { "text": "this is another test" }
  ]
}'
```

Expected response:

```json
[
  {
    "text": "this is a test in english",
    "isEnglish": true
  },
  {
    "text": "esto es una prueba en español",
    "isEnglish": false
  },
  {
    "text": "this is another test",
    "isEnglish": true
  }
]
```
