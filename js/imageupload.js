/**
 * @Author: John Isaacs <john>
 * @Date:   28-Feb-172017
 * @Filename: images.js
* @Last modified by:   john
* @Last modified time: 05-Mar-172017
 */
 document.getElementById('files').addEventListener('change', handleFileSelect, false);
 $("#badge-submit").prop('disabled', true);
 var storageRef = firebase.storage().ref();
 function handleFileSelect(evt) {
   console.log("here");
       evt.stopPropagation();
       evt.preventDefault();
       var file = evt.target.files[0];
       // Create the file metadata
       var metadata = {
           contentType: 'image/jpeg'
       };
      //  // Push to child path.
      //  // [START oncomplete]
      //  storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
      //    console.log('Uploaded', snapshot.totalBytes, 'bytes.');
      //    console.log(snapshot.metadata);
      //    var url = snapshot.downloadURL;
      //    console.log('File available at', url);
      //    downloadURL =url;
      //    // [START_EXCLUDE]
      //    //document.getElementById('linkbox').innerHTML = '<a href="' +  url + '">Click For File</a>';
      //    // [END_EXCLUDE]
      //  }).catch(function(error) {
      //    // [START onfailure]
      //    console.error('Upload failed:', error);
      //    // [END onfailure]
      //  });
      //  // [END oncomplete]

      // Upload file and metadata to the object 'images/mountains.jpg'
      var uploadTask = storageRef.child('images/' + file.name).put(file, metadata);

      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
          function(snapshot) {
              // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
              var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              $("#badge-submit").text('Upload is ' + progress + '% done');
              console.log('Upload is ' + progress + '% done');
              switch (snapshot.state) {
                  case firebase.storage.TaskState.PAUSED: // or 'paused'
                      console.log('Upload is paused');
                      break;
                  case firebase.storage.TaskState.RUNNING: // or 'running'
                      console.log('Upload is running');
                      break;
              }
          },
          function(error) {
              switch (error.code) {
                  case 'storage/unauthorized':
                      // User doesn't have permission to access the object
                      break;

                  case 'storage/canceled':
                      // User canceled the upload
                      break;

                  case 'storage/unknown':
                          // Unknown error occurred, inspect error.serverResponse
                          break;
              }
          },
          function() {
              // Upload completed successfully, now we can get the download URL
              downloadURL = uploadTask.snapshot.downloadURL;
              $("#badge-submit").text('Save');
              $("#badge-submit").prop('disabled', false);

          });
     }

     var downloadURL;
     var storageRef = firebase.storage().ref();


     function imageupload(file) {





     }
