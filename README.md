# Scrapper

### Getting Started
Scrapper is based on Node.js and can easily be configured to scrapped for website by editing configuration file.
### Installation

1. Make sure you have Node.js and NPM installed. [See] instructions on how to install on Windows.

2. Clone the repository from GitHub
  ```sh
  $ git clone https://github.com/searchodev/shanework scrapper
  ```
3. Go to the directory where you clone the repository and Install the Node modules

```sh
$ cd scrapper
$ npm install
```

### Configuration

Three configuration files can be modified under ``conf/`` directory.

  - ``db.json`` which holds the database connection info.
  - ``scrapper.json`` used to configure the scrapper using [CSS Selector].
  - ``sources.json`` all the web sources which need to be scrapped.


   [CSS Selector]: <http://www.w3schools.com/cssref/css_selectors.asp>
   [See]: <http://blog.teamtreehouse.com/install-node-js-npm-windows>


### Running the Application

Run ``node app.js`` on your terminal.
