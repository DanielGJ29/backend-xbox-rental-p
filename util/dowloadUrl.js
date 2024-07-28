const { ref, getDownloadURL } = require("firebase/storage");

const { storage } = require("./firebase");

const getUrl = async (storageUrl) => {
  let imgDownloadUrl;

  const imgUrl = storageUrl;
  // Create a storage reference from our storage service
  const imgRef = ref(storage, imgUrl);
  // Get the download URL
  imgDownloadUrl = await getDownloadURL(imgRef)
    .then((url) => {
      // Insert url into an <img> tag to "download"
      return url;
    })
    .catch((error) => {
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
        case "storage/object-not-found":
          // File doesn't exist
          console.log("File doesn't exist");
          return null;
        case "storage/unauthorized":
          // User doesn't have permission to access the object
          console.log("User doesn't have permission to access the object");
          break;
        case "storage/canceled":
          // User canceled the upload
          console.log("User canceled the upload");
          break;

        // ...

        case "storage/unknown":
          // Unknown error occurred, inspect the server response
          break;
      }
    });

  return imgDownloadUrl;
};

module.exports = { getUrl };
