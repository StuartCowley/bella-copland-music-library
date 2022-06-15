const { expect } = require('chai');
const request = require('supertest');
const getDb = require('../src/services/db');
const app = require('../src/app');


describe('create album', () => {
    let db;
    let artists; 
 
    beforeEach(async () => {
        db = await getDb();
 
       [artists] = await db.query('SELECT * from Artist');
    });
 
    afterEach(async () => {
      await db.query('DELETE FROM Album');
      await db.close();
    });
 
    describe('/album', () => {
      describe('POST', () => {
        it('creates a new album in the database', async () => {
 
         if(artists[0]) {
          const res = await request(app).post('/artist/1/album').send({
            name: 'Red',
            genre: 'Country',
            year: 2000,
          });
 
          expect(res.status).to.equal(201);
 
          const [[albumEntries]] = await db.query(
            `SELECT * FROM Album WHERE name = 'Red'`
          );
 
          expect(albumEntries.name).to.equal('Red');
          expect(albumEntries.genre).to.equal('Country');
          expect(albumEntries.year).to.equal(2000);
          expect(albumEntries.artistId).to.equal(1);
 
         }
        });
      });
    });
  });