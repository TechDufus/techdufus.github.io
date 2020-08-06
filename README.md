# { Personal } Jekyll Theme
![Build Status](https://travis-ci.org/le4ker/personal-jekyll-theme.svg?branch=master)
![license](https://img.shields.io/badge/license-MIT-blue.svg?link=https://github.com/matthewjdegarmo/matthewjdegarmo.github.io/LICENSE)

{ matthewjdegarmo } is my responsive Jekyll themed Blog / Portfolio, about me :wink:

You can see it in action [here](https://matthewjdegarmo.github.io)!

<img src="/img/site-mobile.mov.gif" height="480">


## How to run locally

First, you need to install jekyll and the dependencies of { matthewjdegarmo } by running:

```shell
./scripts/install
```

Then, you can build and serve your website by simply running:

```shell
./scripts/serve-production
```

To serve across lan (requires su to forward the port 4000 over lan):

```shell
./scripts/serve-lan-production
```

### Docker

Run using Docker:

```
docker run --rm -it -p 4000:4000 -v "$PWD:/srv/jekyll" jekyll/jekyll jekyll serve --watch --host "0.0.0.0" --config _config.yml,_config.dev.yml
```

Run using Docker with Docker Compose:
```
docker-compose up
```
