'use strict'

const debug = require('debug')
const log = debug('libp2p:addresses')
log.error = debug('libp2p:addresses:error')

const MultiaddrSet = require('./multiaddr-set')

/**
 * Responsible for managing known peers, as well as their addresses, protocols and metadata.
 */
class AddressManager {
  /**
   * @constructor
   * @param {object} [options]
   * @param {Array<string>} [options.listen = []] list of multiaddrs string representation to listen.
   * @param {Array<string>} [options.announce = []] list of multiaddrs string representation to announce.
   * @param {Array<string>} [options.noAnnounce = []] list of multiaddrs string representation to not announce.
   */
  constructor ({ listen = [], announce = [], noAnnounce = [] } = {}) {
    this._listen = new MultiaddrSet(listen)
    this._announce = new MultiaddrSet(announce)
    this._noAnnounce = new MultiaddrSet(noAnnounce)
  }

  /**
   * Get peer addresses to listen.
   * @return {Array<Multiaddr>}
   */
  get listen () {
    return this._listen.toArray()
  }

  /**
   * Get peer addresses to announce.
   * @return {Array<Multiaddr>}
   */
  get announce () {
    return this._listen.toArray()
      .concat(this._announce.toArray()) // Concat announce amendment
      .filter((ma) => !this._noAnnounce.has(ma)) // Remove no announce addresses
  }

  /**
   * Get peer addresses to not announce.
   * @return {Array<Multiaddr>}
   */
  get noAnnounce () {
    return this._noAnnounce.toArray()
  }

  /**
   * Replace listen multiaddrs after trying to listen the original ones by the transports.
   * This should also forward the replace side effects to the NoAnnounce sets.
   * @param {Array<Multiaddr>} newMultiaddrs
   * @return {Array<Multiaddr>}
   */
  _replaceListen (newMultiaddrs) {
    const currentListen = this._listen.toArray()

    this._listen.replace(currentListen, newMultiaddrs)
    const newListen = this._listen.toArray()

    // TODO: Update noAnnounce on replace (new Port?) or improve the filter operation in announce getter?
    // Note: noAnnounce should take into account encapsulated addresses.
    // - For example, if I add /ip4/127.0.0.1 to noAnnounce
    // - I expect addresses like /ip4/127.0.0.1/tcp/8080/ipfs/Qm to be filtered out.

    return newListen
  }
}

module.exports = AddressManager
