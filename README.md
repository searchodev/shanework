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

Two configuration files can be modified under ``conf`` directory.

  - ``db.json`` which holds the database connection info.
  - ``scrapper.json`` used to configure the scrapper using [CSS Selector] or specified as JSON.


### Scheduler Configuration

  ``schedule.json`` stores the information to automate the running of the scapper at specified schedule.

  Schduler uses cron format as follows:

  *    *    *    *    *    *
  ┬    ┬    ┬    ┬    ┬    ┬
  │    │    │    │    │    |
  │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
  │    │    │    │    └───── month (1 - 12)
  │    │    │    └────────── day of month (1 - 31)
  │    │    └─────────────── hour (0 - 23)
  │    └──────────────────── minute (0 - 59)
  └───────────────────────── second (0 - 59, OPTIONAL)

  The example below will run the fabfurnish every Saturday at 8:05

  ```sh
  {"job":"fabfurnish", "schedule": "5 8 * * 6"}
  ```



Under ``conf\sources`` directory you need to add your sources configuration together with their category mapping.


   [CSS Selector]: <http://www.w3schools.com/cssref/css_selectors.asp>
   [See]: <http://blog.teamtreehouse.com/install-node-js-npm-windows>


### Running the Application

Run ``node app.js <source> `` on your terminal.
