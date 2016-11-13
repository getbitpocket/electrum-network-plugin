# Cordova Plugin for accessing Electrum network servers

Electrum network protocol documentation can be found here: [http://docs.electrum.org/en/latest/protocol.html](http://docs.electrum.org/en/latest/protocol.html)

## Installation

 - Add the Plugin to your Cordova project: `cordova plugin add https://github.com/getbitpocket/electrum-network-plugin`
 - Depending on the Promise support of your target environment (http://caniuse.com/#feat=promises), the [es6-shim](https://github.com/paulmillr/es6-shim) javascript library might be included

## Quick Examples

### Example: Init Network, discover peers and send a request to a random network peer

```javascript

var networkDiscovery = new electrum.NetworkDiscovery();
networkDiscovery.init();

networkDiscovery.on('peers:discovered', function() {
    
    networkDiscovery.sendRandomRequest({ "id": 1, "method":"blockchain.address.get_balance", "params":["1NS17iag9jJgTHD1VXjvLCEnZuQ3rJDE9L"] });
    
    networkDiscovery.on('peers:response', function(response) {
        console.log(response);
    });
    
});

```

### Example: Connect to a peer and send a request

```javascript

var peer = new electrum.Peer('some.electrum.server.com', 50002);
peer.connect();

peer.on('connected', function() {
    
    peer.sendRequest({ "id": 1, "method":"blockchain.address.get_balance", "params":["1NS17iag9jJgTHD1VXjvLCEnZuQ3rJDE9L"] });
    
    peer.on('response', function(response) {
        console.log(response);
    });
    
});

```

## Build Project

`npm install`

`npm run build`

## Running Unit Tests

`npm install`

`npm test`

## Running Integration Tests

 - `npm install`
 - `npm run integration -- run android` or `npm run integration -- run ios` for testing on real devices
 - `npm run integration -- emulate android` or `npm run integration -- emulate ios` for testing on emulator

## Roadmap

 - This plugin should also work with altcoins, which support electrum
 - Observable (rx.js) rather of Promise for Requests
