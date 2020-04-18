'use strict'

const errCode = require('err-code')

const multiaddr = require('multiaddr')

const { codes } = require('../errors')

/**
 * Multiaddr Set.
 * Since JavaScript doesn't let you overload the compare in Set()..
 */
class MultiaddrSet {
  /**
   * @constructor
   * @param {Array<string>} addresses addresses to store.
   */
  constructor (addresses = []) {
    this._multiaddrs = addresses.map(a => multiaddr(a))
  }

  get size () {
    return this._multiaddrs.length
  }

  /**
   * Add multiaddr to the set.
   * @param {Multiaddr} ma
   */
  add (ma) {
    if (!multiaddr.isMultiaddr(ma)) {
      throw errCode(new Error('Invalid multiaddr provided'), codes.ERR_INVALID_MULTIADDR)
    }

    if (!this.has(ma)) {
      this._multiaddrs.push(ma)
    }
  }

  /**
   * Get array of multiaddrs.
   * @return {Array<Multiaddr>}
   */
  toArray () {
    return this._multiaddrs.slice()
  }

  forEach (fn) {
    return this._multiaddrs.forEach(fn)
  }

  /**
   * Has provided multiaddr.
   * @param {Multiaddr} ma
   * @return {boolean}
   */
  has (ma) {
    return this._multiaddrs.some((m) => m.equals(ma))
  }

  delete (ma) {
    this._multiaddrs.some((m, i) => {
      if (m.equals(ma)) {
        this._multiaddrs.splice(i, 1)
        return true
      }
    })
  }

  /**
   * Replace given multiaddrs (if existing) by fresh ones
   * @param {Array<Multiaddr>} existing
   * @param {Array<Multiaddr>} fresh
   */
  replace (existing, fresh) {
    existing.forEach((m) => this.delete(m))
    fresh.forEach((m) => this.add(m))
  }

  /**
   * Clear set,
   */
  clear () {
    this._multiaddrs = []
  }
}

module.exports = MultiaddrSet
