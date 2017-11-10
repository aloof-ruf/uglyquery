const sqlite3 = require('sqlite3').verbose();

const Handler = require('../../../src/express/Handler');

const db = new sqlite3.Database('./test.db');

function addTwo(args) {
  return args.num1 + args.num2;
}

function getUserHandler(args) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const insert = db.prepare('INSERT INTO employees VALUES (?, ?)');

      insert.run(args.name, args.birthdate);

      insert.finalize(resolve);
    });
  });
}

function saveUserHandler(args) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const insert = db.prepare('INSERT INTO employees VALUES (?, ?)');

      insert.run(args.name, args.birthdate);

      insert.finalize(resolve);
    });
  });
}

function filterEvenBirthdate(args) {
  return Promise.resolve().then(() => args.users.filter(item => item.birthdate % 2 === 0));
}

function filterOddBirthdate(args) {
  return Promise.resolve().then(() => args.users.filter(item => item.birthdate % 2 === 1));
}

function sortByUserName(args) {
  return Promise.resolve()
  .then(() => {
    args.users.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    return args.users;
  });
}

function throwError() {
  return Promise.reject(new Error('Intentional error'));
}

module.exports = {
  handlers: [
    new Handler('addTwo', addTwo),

    new Handler('getUser', getUserHandler),
    new Handler('saveUser', saveUserHandler),

    new Handler('filterEvenBirthdate', filterEvenBirthdate),
    new Handler('filterOddBirthdate', filterOddBirthdate),
    new Handler('sortByUserName', sortByUserName),

    new Handler('throwError', throwError)
  ]
};
