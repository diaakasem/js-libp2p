# Address Manager

The Address manager is responsible for keeping an updated register of the peer's addresses. It includes 3 different types of Addresses: `Listen Addresses`, `Announce Addresses` and `No Announce Addresses`.

These Addresses should be specified in your libp2p [configuration](../../doc/CONFIGURATION.md) when you create your node.

## Listen Addresses

A libp2p node should have a set of listen addresses, which will be used by libp2p underlying transports to listen for dials from other nodes in the network.

Before a libp2p node starts, a set of listen addresses should be provided to the AddressManager, so that when the node is started, the libp2p transports can use them to listen for connections. Accordingly, listen addresses should be specified through the libp2p configuration, in order to have the `AddressManager` created with them.

It is important pointing out that libp2p accepts to listen on addresses that intend to rely on any available local port. In this context, once a transport selects a port to listen, the listen addresses will need to be updated. For example tcp may replace `/ip4/0.0.0.0/tcp/0` with something like `/ip4/0.0.0.0/tcp/8989`.

## Announce Addresses

In some scenarios, a libp2p node will need to announce addresses that it is not listening on. In other words, Announce Addresses are an amendment to the Listen Addresses that aim to enable other nodes to achieve connectivity to this node.

Scenarios for Announce Addresses include:
- when you setup a libp2p node in your private network at home, but you need to announce your public IP Address to the outside world;
- when you want to announce a DNS address, which maps to your public IP Address.

## No Announce Addresses

While we need to add Announce Addresses to enable peers' connectivity, we can also not announce addresses that will not be reachable. This way, No Announce Addresses should be specified so that they are not announced by the peer as addresses that other peers can use to dial it.

As stated into the Listen Addresses section, Listen Addresses might get modified after libp2p transports get in action and use them to listen for new connections. This way, No Announce Addresses should also take into account these changes so that they can be matched when No Announce Addresses are being filtered out.

## Implementation

Once a libp2p node is started, the Transport Manager component will gather the addresses that the configured libp2p transports should use to listen on. As soon as this node has its transports listening, the Transport Manager should replace the listen addresses with the updated list.

After the transports being started, other libp2p components/subsystems will kickoff, namely the Identify Service and the DHT. Both of them will announce the node addresses to the other peers in the network and should gather these addresses from the Address Manager.

## Future Considerations

### Dynamic address modifications 

In a future iteration, we can enable these addresses to be modified in runtime. For this, the Address Manager should be responsible for notifying interested subsystems of these changes, through an Event Emitter.

#### Modify Listen Addresses

While adding new addresses to listen on runtime is a feasible operation, removing one listen address might have bad implications for the node, since all the connections using that listen address will be closed. With this in mind and taking also into consideration the lack of good use cases for removing listen addresses, the Address Manager API only allows libp2p users to add new Listen Addresses on runtime.

Every time a new listen address is added, the Address Manager should emit an event with the new multiaddrs to listen. The Transport Manager should listen to this events and act accordingly.

#### Modify Announce Addresses

When the announce addresses are modified, the Address Manager should emit an event so that other subsystems can act accordingly. For example, libp2p identify service should use the libp2p push protocol to inform other peers about these changes.
