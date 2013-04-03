var fs     = require("fs"),
    path   = require("path"),
    async  = require("async"),
    expect = require("expect.js"),
    wrench = require("wrench"),
    Backup = require("../lib/Backup"),
    src    = path.join(__dirname, "src"),
    dest   = path.join(__dirname, "dest");

function initializeSourceFiles(backup, done) {
    backup.clear(function (err) {
        if (err) return done(err);

        async.forEach([
            [ "a.txt", "ABC" ],
            [ "b.log", "123" ]
        ], function (file, done) {
            fs.writeFile(path.join(backup.source, file[0]), file[1], done);
        }, done);
    });
}

describe("Backup", function () {
    var backup = new Backup(src, dest);

    before(function (done) {
        async.forEach([ src, dest ], fs.mkdir, done);
    });

    after(function (done) {
        async.forEach([ src, dest ], wrench.rmdirRecursive, done);
    });

    describe(".constructor", function () {
        it("should initialize the source property", function () {
            expect(backup).to.have.property("source", src);
        });

        it("should initialize the destination property", function () {
            expect(backup).to.have.property("destination", dest);
        });
    });

    describe("#list()", function () {
        after(function (done) {
            backup.clear(done);
        });

        it("should give an empty array when no restoration points available", function (done) {
            backup.list(function (err, list) {
                if (err) return done(err);

                expect(list).to.be.an(Array);
                done();
            });
        });

        it("should return a list of date objects", function (done) {
            backup.backup(function (err, date) {
                if (err) return done(err);

                backup.list(function (err, list) {
                    if (err) return done(err);

                    expect(list[0].getTime()).to.equal(date.getTime());
                    done();
                });
            });
        });

        it("should run callback in context of the backup object", function (done) {
            backup.list(function (err) {
                if (err) return done(err);

                expect(this).to.equal(backup);
                done();
            });
        });
    });

    describe("#backup()", function () {
        before(function (done) {
            initializeSourceFiles(backup, done);
        });

        after(function (done) {
            backup.clear(done);
        });

        it("should create a new archive file", function (done) {
            backup.backup(function (err, date) {
                if (err) return done(err);

                fs.exists(path.join(dest, date.getTime() + ".tar.gz"), function (exists) {
                    expect(exists).to.be.true;
                    done();
                });
            });
        });

        it("should run callback in context of the backup object", function (done) {
            backup.backup(function (err) {
                if (err) return done(err);

                expect(this).to.equal(backup);
                done();
            });
        });
    });

    describe("#restore()", function () {
        beforeEach(function (done) {
            initializeSourceFiles(backup, done);
        });

        after(function (done) {
            backup.clear(done);
        });

        it("should restore the files as they were before the backup", function (done) {
            async.waterfall([
                function (done) {
                    fs.writeFile(path.join(src, "c.txt"), "Hello World", done);
                },
                function (done) {
                    fs.unlink(path.join(src, "a.txt"), done);
                },
                function (done) {
                    backup.backup(done);
                },
                function (date, done) {
                    backup.restore(date, done);
                },
                function (done) {
                    fs.exists(path.join(src, "a.txt"), function (exists) {
                        expect(exists).to.be.false;
                        done();
                    });
                },
                function (done) {
                    fs.readFile(path.join(src, "c.txt"), "utf8", function (err, contents) {
                        if (err) return done(err);

                        expect(contents).to.equal("Hello World");
                        done();
                    });
                }
            ], done);
        });

        it("should accept a number instead of a date object", function (done) {
            backup.backup(function (err, date) {
                backup.restore(date.getTime(), done);
            });
        });

        it("should accept a string instead of a date object", function (done) {
            backup.backup(function (err, date) {
                backup.restore(date.toString(), done);
            });
        });

        it("should run callback in context of the backup object", function (done) {
            async.waterfall([
                function (done) {
                    backup.backup(done);
                },
                function (date, done) {
                    backup.restore(date, function (err) {
                        if (err) return done(err);

                        expect(this).to.equal(backup);
                        done();
                    });
                }
            ], done);
        });
    });

    describe("#remove()", function () {
        beforeEach(function (done) {
            var task = this;

            backup.backup(function (err, date) {
                if (err) return done(err);

                task.date = date;
                done();
            });
        });

        it("should remove the target restore point", function (done) {
            var date = this.date;

            async.waterfall([
                function (done) {
                    backup.remove(date, done);
                },
                function (done) {
                    backup.list(done);
                },
                function (list, done) {
                    expect(list).to.have.length(0);
                    done();
                }
            ], done);
        });

        it("should run callback in context of the backup object", function (done) {
            backup.remove(new Date(), function () {
                expect(this).to.equal(backup);
                done();
            });
        });
    });

    describe("#exists()", function () {
        beforeEach(function (done) {
            var task = this;
            backup.backup(function (err, date) {
                if (err) return done(err);

                task.date = date;
                done();
            });
        });

        it("should check for a restore point with the given date object", function (done) {
            backup.exists(this.date, function (exists) {
                expect(exists).to.be.true;
                done();
            });
        });

        it("should run callback in context of the backup object", function (done) {
            backup.exists(this.date, function () {
                expect(this).to.equal(backup);
                done();
            });
        });
    });

    describe("#clear()", function () {
        before(function (done) {
            backup.backup(done);
        });

        it("should clear out all the restore points", function (done) {
            backup.clear(function (err) {
                if (err) return done(err);

                fs.readdir(dest, function (err, list) {
                    if (err) return done(err);

                    expect(list).to.be.empty();
                    done();
                });
            });
        });

        it("should run callback in context of the backup object", function (done) {
            backup.clear(function () {
                expect(this).to.equal(backup);
                done();
            });
        });
    });
});
