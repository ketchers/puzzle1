var msg = {};



onmessage = function (e) {
    var data = e.data;
    var Node = data['Node'];
    var nbrMap = data['nbrMap'];
    var puzSize = data['puzSize'];
    msg['backTrackMap'] = bfs(Node);
    postMessage(msg);


    function bfs(Node) {
        var count = 0;
        var cur = 0;
        var dt = 0;
        var nodeQueue = [Node];
        var backTrackMap = {}; // To find solution
        backTrackMap[Node] = null; // Just the start node traces back to null

        // Repeatdly remove the first node from the queue
        while (cur != nodeQueue.length) {
            count++;

            if (count % 1000 == 0) {


                msg['debug'] = "<br>Time: " + dt + " milis<br>Queue.length: " + nodeQueue.length + "<br>cur: " + cur + "<br>Map.size: " + Object.keys(backTrackMap).length;
                dt = 0;

                msg['count'] = count;
                postMessage(msg);
            }

            var t0 = performance.now();
            Node = nodeQueue[cur];
            nodeQueue[cur] = null;
            cur += 1;
            if (nodeQueue.length - cur < 3 / 4 * nodeQueue.length && nodeQueue.length > 1024) {
                var tmp = nodeQueue.slice(cur, nodeQueue.length);
                nodeQueue = tmp;
                cur = 0;
            }
            // Node = nodeQueue.shift(); // In first pass this is just the start node.
            dt += performance.now() - t0;


            // Check if we are done
            if (ckNode(Node)) {
                return backTrackMap;
            }

            //Enqueue neighbors
            var zeroIdx = Node.indexOf(0);
            var nbrs = nbrMap[zeroIdx];

            for (var i = 0; i < nbrs.length; i++) {
                var k = nbrs[i];
                var tmpNode = nodeswap(Node, zeroIdx, k);

                if (!(tmpNode in backTrackMap)) {
                    backTrackMap[tmpNode] = Node;
                    nodeQueue.push(tmpNode);
                } else { // Already in backTrack
                    // console.log(newNode + " is already in backTrackMap");
                }

            }
        }
    }

    function ckNode(node) {
        for (var i = 0; i < node.length; i++) {
            if (node[i] != i)
                return false;
        }
        return true;
    }

    function nodeswap(a, i, j) {
        var b = a.slice(0, a.length);
        var tmp = b[i];
        b[i] = b[j];
        b[j] = tmp;
        return b;
    }
}