process.env.NODE_ENV = "test";

import { UserModel } from "../models/user.js";
import { PostModel } from "../models/post.js";

import chai from "chai";
import chaiHttp from "chai-http";

import app from "../index.js";
import { getAccessToken } from "../middleware/auth.js";

chai.use(chaiHttp);

chai.should();

describe("Test APIs", () => {
  describe("/POST Authenticate User", () => {
    it("it should return Error without password", (done) => {
      chai
        .request(app)
        .post("/api/authenticate")
        .send({ email: "user1@test.com" })
        .end((err, res) => {
          res.body.should.be.a("object");
          res.body.should.have.status(500);
          res.body.should.have.property("err_msg");
          done();
        });
    });

    it("it should return Error (pass wrong password)", (done) => {
      chai
        .request(app)
        .post("/api/authenticate")
        .send({ email: "user1@test.com", password: "TEST" })
        .end((err, res) => {
          res.body.should.be.a("object");
          res.body.should.have.status(400);
          res.body.should.have.property("err_msg").eql("Invalid Credentials");
          done();
        });
    });

    it("it should return token", (done) => {
      chai
        .request(app)
        .post("/api/authenticate")
        .send({ email: "user1@test.com", password: "test@123" })
        .end((err, res) => {
          res.body.should.be.a("object");
          res.body.should.have.status(200);
          res.body.should.have.property("msg").eql("Login Successfully");
          done();
        });
    });
  });

  describe("/POST follow user", () => {
    it("it should return Error (without auth token)", (done) => {
      UserModel.find({}, { _id: 1 })
        .lean()
        .then((users) => {
          chai
            .request(app)
            .post(`/api/follow/${users[0]._id}`)
            .end((err, res) => {
              res.body.should.be.a("object");
              res.body.should.have.status(400);
              res.body.should.have
                .property("err_msg")
                .eql("Please Login first.");
              done();
            });
        });
    });
  });

  it("it should Success on follow User", (done) => {
    UserModel.find({}, { _id: 1 })
      .lean()
      .then((users) => {
        getAccessToken(users[0]._id).then((token) => {
          chai
            .request(app)
            .post(`/api/follow/${users[1]._id}`)
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
              res.body.should.be.a("object");
              res.body.should.have.status(200);
              res.body.should.have.property("msg").eql("Followed");
              done();
            });
        });
      });
  });
});
