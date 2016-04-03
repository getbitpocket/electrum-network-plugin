exports.defineAutoTests = function() {

    describe('testing messaging a server', function() {
        
        var connectToRandomPeer = function(network, success) {
            var peer = network.getPeer();                
            peer.connect();
            
            peer.on('connected', function() {
                success(peer);
            });
            
            peer.on('error', function() {
                console.error("cannot connect to peer");
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
                    done();
                });                               
            });
            
        });
        
        it('send random request', function(done) {
            var network = new electrum.NetworkDiscovery();     
            network.init();
            
            network.on('peers:discovered', function() {                
                network.sendRandomRequest({
                    "id": 1,
                    "method": "blockchain.address.get_history",
                    "params": ["1NS17iag9jJgTHD1VXjvLCEnZuQ3rJDE9L"] 
                });                              
            });
            
            network.on('peers:response', function(response) {   
                expect(response.id).toBe(1);
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
                
    });
    
}