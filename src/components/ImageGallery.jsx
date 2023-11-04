import update from "immutability-helper";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { useCallback, useEffect, useState } from "react";
import Image from "./Image";
import { GrGallery } from "react-icons/gr";

const ImageGallery = () => {
  // State for storing images
  const [images, setImages] = useState([]);
  // State for storing selected images
  const [selectedImages, setSelectedImages] = useState([]);
  // State for loading indicator
  const [loading, isLoading] = useState(false);

  // Fetch images from API on component mount
  useEffect(() => {
    // Show loading indicator
    isLoading(true);

    // Fetch data from API
    const fetchImages = async () => {
      try {
        const result = await fetch(`images.json`);
        const data = await result.json();

        // Check if data is available
        if (data?.length > 0) {
          setImages(data);
          isLoading(false); // Hide loading indicator on successful fetch
        }
      } catch (error) {
        // Handle error if needed
        console.log("Error fetching images:", error);
        isLoading(false); // Hide loading indicator on error
      }
    };

    fetchImages();
  }, []);

  // Delete selected images
  const handleDelete = () => {
    // Remove selected images from the state
    const updatedImages = images?.filter(
      (image) => !selectedImages.includes(image)
    );
    setImages(updatedImages);
    // Clear selected images
    setSelectedImages([]);
  };

  // Handle image selection
  const handleImageSelect = (index, isSelected) => {
    const updatedSelectedImages = isSelected
      ? [...selectedImages, images[index]]
      : selectedImages?.filter((image) => image !== images[index]);
    setSelectedImages(updatedSelectedImages);
  };

  // Find image by ID using memoized callback
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

  // Move image card using memoized callback
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

  // Get text based on the number of selected images
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

  // Loading Start while fetching data
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl font-semibold">
        <div className="w-6 h-6 border-4 border-dashed rounded-full animate-spin dark:border-violet-600 mr-2"></div>
        Loading...
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      {!loading && images?.length > 0 && (
        <section className="container bg-white mx-auto rounded-md">
          {selectedImages?.length > 0 ? (
            // Selected images display
            <div className="flex justify-between items-center py-[.9rem] px-6 border-b ">
              <h3 className="text-lg font-medium">{getImageSelectText()}</h3>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white font-medium px-4 py-1.5 border border-red-500 hover:bg-white hover:border-red-500 hover:text-red-500 rounded-md transition-all delay-75 ease-linear"
              >
                Delete {selectedImages?.length > 1 ? "files" : "file"}
              </button>
            </div>
          ) : (
            // Gallery header
            <h1 className="text-xl font-medium py-5 px-6  border-b">Gallery</h1>
          )}
          {/* Image grid */}
          <div className="grid grid-cols-2 gap-4 py-4 px-6  md:grid-cols-4 lg:grid-cols-5 rounded-b-md overflow-auto">
            {images?.map((image, index) => (
              // Individual image component
              <Image
                key={image?._id}
                id={image?._id}
                url={image?.url}
                imageAlt={image?.alt}
                index={index}
                moveImageCard={moveImageCard}
                onImageSelect={handleImageSelect}
                findImage={findImage}
              />
            ))}
            {/* Add Images button */}
            <label
              htmlFor="files"
              className="w-full h-32 md:h-full flex flex-col justify-center items-center space-y-2 cursor-pointer border-2 border-dashed rounded-md text-black"
            >
              <span className="text-xl">
                <GrGallery />
              </span>
              <span>Add Images</span>
              <input type="file" id="files" className="hidden" />
            </label>
          </div>
        </section>
      )}
    </DndProvider>
  );
};

export default ImageGallery;
