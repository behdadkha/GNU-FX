import Axios from "axios";
import {config} from "../config";


//returns the recieved images using an array
export default async function getAllImages() {
    let imageUrls = [];
    await Axios.get(`${config.dev_server}/getImageNames`)
        .then(async (imageNames) => {

            //get all the user's images and store them in a data array
            for (let i = 0; i < imageNames.data.length; i++) {
                await Axios.get(`${config.dev_server}/getImage?imageName=${imageNames.data[i]}`, { responseType: "blob" })
                    .then((image) => {
            
                        imageUrls.push({ imageName: imageNames.data[i], url: URL.createObjectURL(image.data) });
                    
                    });
            }

        });
    return imageUrls;
}