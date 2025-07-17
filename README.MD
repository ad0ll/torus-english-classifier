# Torus English Classifier

This repository contains a simple API to detect if a given text is in English.

## Typescript API

The TypeScript code for the API is located in the `typescript/` directory.

### Limitations

The typescript implementation uses franc-min and is a stand-in for a later rust implemnentation that will use lingua and whatlang for stronger detection.

franc-min struggles with very short texts, for example: "これは英語だろうか" will come back at "und" (undetermined) despite being japanese. To work around this, we have a defaultOnUndetermined flag that defaults to false, which may eat up some of the false positives but will ensure that the content that is classified is in English.

### Usage

Once the service is running (e.g., via `docker-compose up`), you can use the following cURL commands to test the API. The service will be available at `http://localhost:3012`.

#### Single text detection

To check a single string of text:

```bash
curl -X POST http://localhost:3012/is-english \
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
curl -X POST http://localhost:3012/is-english \
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
curl -X POST http://localhost:3012/is-english-batch \
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


### Other Tests

`curl -X POST -H "Content-Type: application/json" -d '{"text": "this is an english sentence"}' http://localhost:3012/is-english`

`curl -X POST -H "Content-Type: application/json" -d '{"text": "this is an english sentence"}' https://real-trump.fun/language-detection/is-english`

`curl -X POST -H "Content-Type: application/json" -d '{"texts": [{"text": "this is an english sentence"}, {"text": "ceci est une phrase en français"}]}' http://localhost:3012/is-english-batch`

`curl -X POST -H "Content-Type: application/json" -d '{"texts": [{"text": "this is an english sentence"}, {"text": "ceci est une phrase en français"}]}' https://real-trump.fun/language-detection/is-english-batch`

`curl -X POST localhost:3000/is-english -H "Content-Type: application/json" -d '{"text": "赤字に苦しんでいた従業員１７人の企業の株価が、わずか１年あまりで約１００倍に跳ね上がり、大きな話題を呼んでいる。", "defaultOnUndetermined": true}'`
