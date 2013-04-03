var fs     = require("fs"),
    path   = require("path"),
    fa     = require("fa"),
    targz  = require("tar.gz"),
    wrench = require("wrench");

function getDate(input) {
    if (input instanceof Date) {
        return input;
    } else if (typeof input === "string") {
        return new Date(Date.parse(input));
    } else if (typeof input === "number") {
        return new Date(input);
    } else {
        return false;
    }
}

function Backup(src, dest) {
    this.source = src;
    this.destination = dest;
    this.extension = ".tar.gz";
}

Backup.prototype.list = function (callback) {
    callback = callback.bind(this);
    var backup = this;

    fs.readdir(this.destination, function (err, list) {
        if (err) return callback(err);

        var dates = list.map(function (file) {
            return getDate(path.basename(file, backup.extension));
        });

        callback(null, dates);
    });
};

Backup.prototype.clear = function (callback) {
    var backup = this;

    this.list(function (err, list) {
        if (err) return callback(err);

        fa.each(list, this.remove.bind(this), callback.bind(backup));
    });
};

Backup.prototype.backup = function (callback) {
    var input  = this.source,
        date   = new Date(Date.parse(new Date())),
        output = this.file(date);

    callback = callback.bind(this);

    (new targz()).compress(input, output, function (err) {
        if (err) return callback(err);

        callback(null, date);
    });
};

Backup.prototype.restore = function (date, callback) {
    var input = this.file(date),
        output = this.source;

    callback = callback.bind(this);

    wrench.rmdirRecursive(output, function (err) {
        if (err) return callback(err);

        (new targz()).extract(input, path.dirname(output), callback.bind(this));
    });
};

Backup.prototype.remove = function (date, callback) {
    fs.unlink(this.file(date), callback.bind(this));
};

Backup.prototype.exists = function (date, callback) {
    fs.exists(this.file(date), callback.bind(this));
};

Backup.prototype.file = function (date) {
    date = getDate(date);
    return path.join(this.destination, date.toString() + this.extension);
};

module.exports = Backup;
