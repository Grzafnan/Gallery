import update from "immutability-helper";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { useCallback, useEffect, useState } from "react";
import Image from "./Image";
import axios from "axios";

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, isLoading] = useState(false);

  useEffect(() => {
    isLoading(true);
    const fetchDataFromApi = async () => {
      try {
        const result = await axios(`${import.meta.env.VITE_API_URL}/images`);
        if (result?.data?.success) {
          setImages(result?.data?.data);
          isLoading(false);
        }
      } catch (error) {
        // Handle error if needed
      } finally {
        isLoading(false);
      }
    };

    fetchDataFromApi();
  }, []);

  const handleDelete = () => {
    // Remove selected images from the state
    const updatedImages = images?.filter(
      (image) => !selectedImages.includes(image)
    );
    setImages(updatedImages);
    // Clear selected images
    setSelectedImages([]);
  };

  const handleImageSelect = (index, isSelected) => {
    const updatedSelectedImages = isSelected
      ? [...selectedImages, images[index]]
      : selectedImages?.filter((image) => image !== images[index]);
    setSelectedImages(updatedSelectedImages);
  };

  const findImage = useCallback(
    (id) => {
      const image = images.filter((img) => `${img._id}` === id)[0];
      return {
        image,
        index: images.indexOf(image),
      };
    },
    [images]
  );

  const moveImageCard = useCallback(
    (id, atIndex) => {
      const { image, index } = findImage(id);
      setImages(
        update(images, {
          $splice: [
            [index, 1],
            [atIndex, 0, image],
          ],
        })
      );
    },
    [findImage, images, setImages]
  );

  const getImageSelectText = () => {
    switch (selectedImages.length) {
      case 0:
        return "";
      case 1:
        return "1 file selected";
      default:
        return `${selectedImages.length} files selected`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className=" container bg-white mx-auto rounded-md">
        {selectedImages?.length > 0 ? (
          <div className="bg-white flex justify-between items-center py-[.9rem] px-6 mt-6 rounded-t-md border-b ">
            <h3 className="text-lg">{getImageSelectText()}</h3>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white font-medium px-4 py-1.5 border border-red-500 hover:bg-white hover:border-red-500 hover:text-red-500 rounded-md transition-all delay-75 ease-linear"
            >
              Delete
            </button>
          </div>
        ) : (
          <h1 className="bg-white text-xl font-medium py-5 px-6 mt-6 rounded-t-md border-b">
            Gallery
          </h1>
        )}
        <div className="bg-white grid grid-cols-2 gap-4 py-4 px-6  md:grid-cols-4 lg:grid-cols-5 mb-10 rounded-b-md">
          {images?.length > 0 &&
            images?.map((image, index) => (
              <Image
                key={image?._id}
                id={image?._id}
                image={image?.url}
                imageAlt={image?.alt}
                index={index}
                moveImageCard={moveImageCard}
                onImageSelect={handleImageSelect}
                findImage={findImage}
              />
            ))}
          <input type="file" className="w-full h-full border rounded-md" />
        </div>
      </div>
    </DndProvider>
  );
};

export default ImageGallery;
