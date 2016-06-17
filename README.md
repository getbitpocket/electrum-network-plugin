# Cordova Plugin for accessing Electrum network servers

Electrum network protocol documentation can be found here: [http://docs.electrum.org/en/latest/protocol.html](http://docs.electrum.org/en/latest/protocol.html)

## Installation

 - Add the Plugin to your Cordova project: `cordova plugin add https://github.com/getbitpocket/electrum-network-plugin`
 - Inside the `index.html` of your Cordova project add the script: `<script type="text/javascript" src="electrum-network-plugin.js"></script>` (A better solution might be found in the future, which makes this obsolete, however for now it is problematic to automatically add browserified js files)

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

`gulp build`

## Running Unit Tests

`npm install`

`gulp test`

## Running Integration Tests

 - Running the `./prepare-integration-tests.sh` will add a sibling folder and running respective tests
 - Arguments for script `$1: run or emulate` or `$2: platform` e.g. `./prepare-integration-tests.sh run android`

