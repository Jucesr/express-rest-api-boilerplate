const request = require('supertest');
require('iconv-lite').encodingExists('foo');
const app = require('../index')
   
describe('POST', () => {

    it('should create a new user', (done) => {

        let new_user = {
            username: 'julio',
            email: 'julio@hotmail.com',
            password: 'mypassword',
        }
    
        request(app)
        .post('/user')
        .send(new_user)
        .expect(200)
        .expect( (res) =>{
            expect(res.body.token).toBeDefined();
            expect(res.body.email).toBe(new_user.email);
        })
        .end( done )
    });
    
    it('should not create an user with invalid email', (done) => {
    
        let new_user = {
            username: 'julio',
            email: 'myvalidemailexample.com',
            password: 'mypassword',
        }
    
        request(app)
        .post('/user')
        .send(new_user)
        .expect(400)
        .end(done);
    });

});

