# Scrapper

### Getting Started
Scrapper is based on Node.js and can easily be configured to scrapped for website by editing configuration file.
### Installation

Clone the repository from GitHub
```sh
$ git clone https://github.com/searchodev/shanework scrapper
```
Install the Node modules

```sh
$ npm install
```

### Configuration

Three configuration files can be modified under ``conf/`` directory.

  - ``db.json`` which holds the database connection info.
  - ``scrapper.json`` used to configure the scrapper using [CSS Selector].
  - ``sources.json`` all the web sources which need to be scrapped.


   [CSS Selector]: <http://www.w3schools.com/cssref/css_selectors.asp>


### Running the Application

Run ``node app.js`` on your terminal.
