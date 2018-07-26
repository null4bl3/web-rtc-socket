(() => {
  /** @type {SocketIOClient.Socket} */
  console.log("RUNNING");
  const socket = io.connect(window.location.origin);
  const local_video = document.querySelector(".local_video");
  const remote_video = document.querySelector(".remote_video");
  const peer_connections = {};
  let room = !location.pathname.substring(1) ? "home" : location.pathname.substring(1);
  let getUserMediaAttempts = 5;
  let gettingUserMedia = false;

  /** @type {RTCConfiguration} */
  const config = {
    canTrickleIceCandidates: true,
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302"
      },
      {
        urls: "stun:global.stun.twilio.com:3478?transport=udp"
      }
    ]
  };
  console.log("USING CONFIG: ", config);

  /** @type {MediaStreamConstraints} */
  const constraints = {
    audio: true,
    video: { facingMode: "user" }
  };

  socket.on("full", room => {
    alert("Room " + room + " is full");
  });

  socket.on("bye", id => {
    handleRemoteHangup(id);
  });

  if (room && !!room) {
    console.log("JOINED ROOM: ", room);
    socket.emit("join", room);
  }

  window.onunload = window.onbeforeunload = () => {
    socket.close();
  };

  socket.on("ready", id => {
    console.log("socket ready");
    if (!(local_video instanceof HTMLVideoElement) || !local_video.srcObject) {
      return;
    }
    const peer_connection = new RTCPeerConnection(config);
    console.log("Broadcaster peer_connection: ", peer_connection);
    peer_connections[id] = peer_connection;
    if (local_video instanceof HTMLVideoElement) {
      peer_connection.addStream(local_video.srcObject);
    }
    peer_connection
      .createOffer()
      .then(sdp => peer_connection.setLocalDescription(sdp))
      .then(() => {
        socket.emit("offer", id, peer_connection.localDescription);
      });
    peer_connection.onaddstream = event => handleRemoteStreamAdded(event.stream, id);
    peer_connection.onicecandidate = event => {
      if (event.candidate) {
        socket.emit("candidate", id, event.candidate);
      }
    };
  });

  socket.on("offer", (id, description) => {
    console.log("IN SOCKET OFFER");
    const peer_connection = new RTCPeerConnection(config);
    // currentLocalDescription
    console.log("Offer recipient peer_connection: ", peer_connection);
    peer_connections[id] = peer_connection;
    if (local_video instanceof HTMLVideoElement) {
      peer_connection.addStream(local_video.srcObject);
    }
    peer_connection
      .setRemoteDescription(description)
      .then(() => peer_connection.createAnswer())
      .then(sdp => peer_connection.setLocalDescription(sdp))
      .then(() => {
        socket.emit("answer", id, peer_connection.localDescription);
      });
    peer_connection.onaddstream = event => handleRemoteStreamAdded(event.stream, id);
    peer_connection.onicecandidate = event => {
      if (event.candidate) {
        socket.emit("candidate", id, event.candidate);
      }
    };
  });

  socket.on("candidate", (id, candidate) => {
    peer_connections[id]
      .addIceCandidate(new RTCIceCandidate(candidate))
      .catch(e => console.error(e));
  });

  socket.on("answer", (id, description) => {
    peer_connections[id].setRemoteDescription(description);
  });

  let getUserMediaSuccess = stream => {
    gettingUserMedia = false;
    if (local_video instanceof HTMLVideoElement) {
      !local_video.srcObject && (local_video.srcObject = stream);
    }
    console.log("EMITTING SOCKET READY");
    socket.emit("ready");
  };

  let handleRemoteStreamAdded = (stream, id) => {
    const remoteVideo = document.createElement("video");
    remoteVideo.srcObject = stream;
    remoteVideo.setAttribute("id", id.replace(/[^a-zA-Z]+/g, "").toLowerCase());
    remoteVideo.setAttribute("playsinline", "true");
    remoteVideo.setAttribute("autoplay", "true");
    remote_video.appendChild(remoteVideo);
    if (remote_video.querySelectorAll("video").length === 1) {
      remote_video.setAttribute("class", "one remote_video");
    } else {
      remote_video.setAttribute("class", "remote_video");
    }
  };

  let getUserMediaError = error => {
    console.error(error);
    gettingUserMedia = false;
    --getUserMediaAttempts > 0 && setTimeout(getUserMediaDevices, 1000);
  };

  let getUserMediaDevices = () => {
    if (local_video instanceof HTMLVideoElement) {
      if (local_video.srcObject) {
        getUserMediaSuccess(local_video.srcObject);
      } else if (!gettingUserMedia && !local_video.srcObject) {
        gettingUserMedia = true;
        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(getUserMediaSuccess)
          .catch(getUserMediaError);
      }
    }
  };

  let handleRemoteHangup = id => {
    peer_connections[id] && peer_connections[id].close();
    delete peer_connections[id];
    document.querySelector("#" + id.replace(/[^a-zA-Z]+/g, "").toLowerCase()).remove();
    if (remote_video.querySelectorAll("video").length === 1) {
      remote_video.setAttribute("class", "one remote_video");
    } else {
      remote_video.setAttribute("class", "remote_video");
    }
  };

  getUserMediaDevices();
})();
