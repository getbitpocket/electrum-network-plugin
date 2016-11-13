exports.defineAutoTests = function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

    describe('testing messaging a server', function() {
        
        var connectToRandomPeer = function(network, success) {
            var peer = network.getPeer();                
            peer.connect();
            
            peer.once('connected', function() {
                success(peer);
            });
            
            peer.once('error', function() {
                console.error("cannot connect to peer, try another peer");
                connectToRandomPeer(network, success);
            });           
        };
        
        it('init electrum network', function(done) {
                       
            var network = new electrum.NetworkDiscovery();     
            network.init();
            
            network.on('peers:discovered', function() {                
                var peers = network.getActivePeers();
                expect(peers.length).toBeGreaterThan(5);                
                done();
            });
            
            network.on('peers:error', function() {
                fail("No peer responded");
                done();
            });
                                            
        });

        it('connect to random peer after discovery', function(done) {
            var network = new electrum.NetworkDiscovery();     
            network.init();
            
            network.on('peers:discovered', function() {                
                connectToRandomPeer(network, function(peer) {
                    expect(peer.getNetworkStatus()).toEqual('connected');    

                    peer.on('disconnected', function() {
                        done();
                    });

                    peer.disconnect();      
                });                               
            });
            
        });
        
        it('send random request', function(done) {
            var network   = new electrum.NetworkDiscovery() ,
                requestId = (Math.random() * 10000000).toFixed(0);
            
            network.init();
            
            network.on('peers:discovered', function() {                            
                network.sendRandomRequest({
                    "id": requestId,
                    "method": "blockchain.address.get_history",
                    "params": ["14oDPV9v5MQGs1cYTdGT6vRJDdaZ15ih6W"] 
                });                              
            });
            
            network.on('peers:response', function(response) {   
                expect(response.id).toEqual(requestId);
                expect(response.result.length).toBeGreaterThan(10);                                
                done();
            });
            
        });
                
        it('connect to non existent peer port', function(done) {
            var peer = new electrum.Peer('electrum.online',50008);            
            peer.connect();
            
            peer.on('error', function(e) {                
                expect(e).toBeLessThan(0);
                done();
            });            
        });

        it('retrieve connected peer', function(done) {
            var network = new electrum.NetworkDiscovery();
            network.init();
                     
            network.on('peers:connected', function(peer) {
                expect(peer.getNetworkStatus()).toEqual('connected');

                peer.on('disconnected', function() {
                    done();
                });

                peer.disconnect();
            });
            
            network.on('peers:discovered', function() {
                network.getConnectedPeer();      
            });                       
            
        });

        it('try connecting to a peer securely', function(done) {
            var peer = new electrum.Peer('electrum.trouth.net',50002, true);            
            peer.connect();
            
            peer.on('connected', function() {                
                expect(true).toBe(true);
                done();
            });     

            peer.on('error', function() {
                fail("Cannot securely connect to peer");
                done();
            })
        });
                
    });
    
}