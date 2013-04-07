# node-dir-backup

This module aims to encapsulate a backup/restore system for an individual
directory that is completely node-based (no shell commands) so it can easily
be cross-platform.

    npm install dir-backup

The export is a single constructor function:

    var Backup = require("dir-backup");


## High-Level Overview

Each instance represents a source/destination pair, the `source` is the managed
directory, the one you wish to keep backed-up. The `destination` is the directory
that houses the backup archives. Each archive is stored in the `destination`
directory with a name that can be parsed by `Date.parse()`, in the future this
will be customizable.


## API Documentation

### Backup(src, dest)

**Arguments**

 * `src` - The location to be managed (ie: backed-up and restored)
 * `dest` - The location for the backup archives

### Backup#source

Absolute path of the directory that you wish to backup/restore.

### Backup#destination

Absolute path of the directory that will house the backup archives

### Backup.list(callback)

This returns a list of all the available backups (represented as simple `Date`
objects)

**Arguments**

 * `callback` - Arguments provided:
    * `err` Error object (if relevent)
    * `list` - `Array` of `Date` objects for each available backup

### Backup.clear(callback)

This empties the destination of all backups

**Arguments**

 * `callback` - Arguments provided:
    * `err` Error object (if relevent)

### Backup#backup(callback)

This runs a backup of the `source` directory, adding a new archive to the `destination` directory.

**Arguments**

 * `callback` - Arguments provided:
    * `err` Error object (if relevent)
    * `timestamp` - `Date` object representing actual backup

### Backup#restore(timestamp, callback)

This restores the `source` directory (after destroying completely) from a specified
backup in the `destination` directory.

**Arguments**

 * `timestamp` - Can be provided as `Date`, `String` (parseable by `Date.parse`) or `Number` (equal to `Date#getTime()`)
 * `callback` - Arguments provided:
    * `err` Error object (if relevent)

### Backup#remove(timestamp, callback)

This removes a specific backup archive from the `destination` directory.

**Arguments**

 * `timestamp` - Can be provided as `Date`, `String` (parseable by `Date.parse`) or `Number` (equal to `Date#getTime()`)
 * `callback` - Arguments provided:
    * `err` Error object (if relevent)

### Backup#exists(timestamp, callback)

This removes a specific backup archive from the `destination` directory.

**Arguments**

 * `timestamp` - Can be provided as `Date`, `String` (parseable by `Date.parse`) or `Number` (equal to `Date#getTime()`)
 * `callback` - Arguments provided:
    * `exists` - `Boolean` reflecting the existence of the specified archive/backup

### Backup#file(location)

This returns a path to a file in the `destination` directory, largely internal
for the backup/restore operations.

**Arguments**

 * `location` - Relative path to file in the `destination` directory

**Returns** `String`
