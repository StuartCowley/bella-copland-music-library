const { expect } = require('chai');
const request = require('supertest');
const getDb = require('../src/services/db');
const app = require('../src/app');

describe('read album', () => {
  let db;
  let albums;

  beforeEach(async () => {
    db = await getDb();

    const [{ insertId }] = await db.query('INSERT INTO Artist (name, genre) VALUES(?, ?)', [
        'Taylor Swift',
        'Country',
      ])

    await Promise.all([
      db.query('INSERT INTO Album (name, genre, year, artistId) VALUES(?, ?, ?, ?)', [
        'X',
        'Pop',
        2010,
        insertId
      ]),
    db.query('INSERT INTO Album (name, genre, year, artistId) VALUES(?, ?, ?, ?)', [
        'Complicated',
        'Indie Rock',
        2005,
        insertId
      ]),
    ]);

    [albums] = await db.query('SELECT * from Album');
  });

  afterEach(async () => {
    await db.query('DELETE FROM Album');
    await db.close();
  });

  describe('/album', () => {
    describe('GET', () => {
      it('returns all album records in the database', async () => {
        const res = await request(app).get('/album').send();

        expect(res.status).to.equal(201);
        expect(res.body.length).to.equal(2);

        res.body.forEach((albumRecord) => {
          const expected = albums.find((a) => a.id === albumRecord.id);

          expect(albumRecord).to.deep.equal(expected);
        });
      });
    });
  });

  describe('/album/:albumId', () => {
    describe('GET', () => {
      it('returns a single album with the correct id', async () => {
        const expected = albums[0];
        const res = await request(app).get(`/album/${expected.id}`).send();

        expect(res.status).to.equal(201);
        expect(res.body).to.deep.equal(expected);
      });

      it('returns a 404 if the artist is not in the database', async () => {
        const res = await request(app).get('/album/999999').send();

        expect(res.status).to.equal(404);
      });
    });
  });
});