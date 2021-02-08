//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const { assert } = require('chai');
//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('Purge', () => {
    beforeEach((done) => {
        //Before each test we empty the database in your case
        done();
    });
    /*
     * Test the /POST route
     */
    describe('/POST purge', () => {
        it('test purge without session', (done) => {
            chai.request(server)
                .post('/purge/templatename')
                //.send()
                .end((err, res) => {
                    var data={Error:"",Data:"",Status:0,Message:""}
                    try{
                        data=JSON.parse(res.text)
                        console.log("data test return:",data)
                    }catch(e){                        
                        data.Error=e.message
                    }

                    data.Status.should.be.equal(0)//will test later
                    //data.should.have.property("Error").eql("Session not found")
                    done();
                });
        });
    });
});