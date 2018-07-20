Peer-to-Peer Video Chat
=================

# Usage:

When the user visits the site and grants permission to use their webcam and microphone, they are able to pick a room name and connect with one other user. They are able to chat via text, and send their webcam and audio input/microphone to each other.

## Known Issues/Planned Updates:

* Data Sanitization needs to be implemented on all user input. 
* Video Streaming needs to be implemented
* Channels/rooms need to be implemented. Users' sockets should be added to the channel with name 'room'
* Disconnections/reconnections need to remove/add the user's username to the user list, respectively
* userArrays need to be implemented into server.js to allow user, room, and socket id to be tied together.