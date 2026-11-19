"use strict";

const crypto = require('crypto');

// Passwords are never stored: only a scrypt hash with a random salt
function hash(password) {
    const salt = crypto.randomBytes(16);
    const derived = crypto.scryptSync(String(password), salt, 32);
    return { hash: derived.toString('hex'), salt: salt.toString('hex') };
}

function verify(password, hashHex, saltHex) {
    if (!hashHex || !saltHex) {
        return false;
    }
    const expected = Buffer.from(hashHex, 'hex');
    const derived = crypto.scryptSync(String(password), Buffer.from(saltHex, 'hex'), expected.length);
    return crypto.timingSafeEqual(derived, expected);
}

// Failed attempts are slowed down: 5 wrong passwords in a row lock the prompt for 30 seconds
function createThrottle() {
    let failures = 0;
    let blockedUntil = 0;
    return {
        waitSeconds() {
            return Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000));
        },
        fail() {
            failures++;
            if (failures >= 5) {
                failures = 0;
                blockedUntil = Date.now() + 30000;
            }
        },
        reset() {
            failures = 0;
            blockedUntil = 0;
        }
    };
}

module.exports = { hash, verify, createThrottle };
