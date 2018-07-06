
function getMediaStream(constraints, mediaContainer){
  
  
}

  console.log("Ding dong");
  if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
   const constraints = {
     video: true,
     audio: true
   };
   const video = document.getElementById('myStream');
   function successfulStreamGet(stream){
     video.srcObject = stream;
   };
   function unsuccessfulStreamGet(error){
     console.error('Unexpected error encountered: ', error);
   };
    navigator.mediaDevices.getUserMedia(constraints).then(successfulStreamGet).catch(unsuccessfulStreamGet);
  } else {
    console.log("Error: getUserMedia() is not supported by your browser.")
};
