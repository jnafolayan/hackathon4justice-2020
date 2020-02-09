window.addEventListener("load", onload);

function onload() {
  const manager = new CCTVManager( document.querySelector(".app") );
  initPeer(manager);
}

function initPeer(manager) {
  const params = new URLSearchParams(location.search);
  
  const peerId = makeId(params.get("id"));
  const peer = new Peer(peerId, {
    host: "localhost",
    port: 9000,
    path: "/"
  });

  peer.on("connection", conn => {
    conn.on("data", data => {
      console.log("received: ", data);
    });
  });

  peer.on("call", call => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        console.log("Call answered")
        call.answer(stream);
        call.on("stream", remote => {
          manager.addVideo(remote);
        });
      });
  });

  // connect if not hq
  if (params.get("hq")) {
    // connect( makeId(params.get("hq")) );
    call( makeId(params.get("hq")) );
  }

  function connect(id) {
    const conn = peer.connect(id);
  
    conn.on("open", () => {
      conn.send("Hello, I'm " + peerId);
    });
  }

  function call(id) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        const call = peer.call(id, stream);
        call.on("stream", remote => {
          // console.log(remote);
        }, console.error);
      });
  }

  function makeId(id) {
    return id;
  }
}
