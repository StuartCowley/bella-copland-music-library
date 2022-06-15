const { expect } = require('chai');
const request = require('supertest');
const getDb = require('../src/services/db');
const app = require('../src/app');

describe('delete artist', () => {
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

  describe('/album/:albumId', () => {
    describe('DELETE', () => {
      it('deletes a single album with the correct id', async () => {
        const album = albums[0];
        const res = await request(app).delete(`/album/${album.id}`).send();

        expect(res.status).to.equal(200);

        const [
          [deletedAlbumRecord],
        ] = await db.query('SELECT * FROM Album WHERE id = ?', [album.id]);

        expect(!!deletedAlbumRecord).to.be.false;
      });

      it('returns a 404 if the album is not in the database', async () => {
        const res = await request(app).delete('/album/999999').send();

        expect(res.status).to.equal(404);
      });
    });
  });
});