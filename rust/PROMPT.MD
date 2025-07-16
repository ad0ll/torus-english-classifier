For now we'll serve it over a rocket REST API.

I want you to closely emulate the content we have in index.ts, which is a Hono server using the franc-min library, except I want you to support whatlang (<https://github.com/greyblake/whatlang-rs/>) and Lingua as tools <https://github.com/pemistahl/lingua-rs> , use ["lingua"] as the default. The struct and types of the inputs and outputs are the same.

Build a Dockerfile to run it. Add an entry to @docker-compose.yml to run it on port 3013. 