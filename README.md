# WEB | RTC
## Proof Of Concept

Room based video conference application based on WebRTC peer-to-peer connections using socket.io.

STUN server is using Google's public STUN server:

* STUN stun.l.google.com:19302

As well as twilio's public UDP stun server:

* stun:global.stun.twilio.com:3478?transport=udp


Replace as needed.

These STUN servers are used for hole-punching an accessible route back a client that is to be connected to another client.

A TURN server is used for excessive traversals around NAT settings in network environments where STUN servers are not able to hole-punch successfully through the network, in order to obtain a useful path between clients.

## Room Service

The trailing "/path" is the room_service logic dividing users into context based channels / rooms.
This logic can be used to better session base the client connectivity and allows for a limit to the number of active clients, as well as it allows us to limit and control the room creation and usage logic.

The current version as of 26/06/2018 works as intended as a fully operational proof-of-concept.



### NOTES
This project builds a docker image also found at:

https://hub.docker.com/r/null4bl3/web-rtc/

```
docker pull null4bl3/web-rtc

docker run -p 3000:3000 null4bl3/web-rtc
```

Hardened networks WILL block the STUN server attempts to hole-punch back into the network leaving the clients unable to connect to each other using the hardened network.

Client side will warn you that onaddstream is deprecated and you should use ontrack instead. This API change have been noted, but not implemented in this POC, as it is a breaking change and does now supply the same stream type that this example was set up to use. In production, this issue is fairly crucial to fix.
