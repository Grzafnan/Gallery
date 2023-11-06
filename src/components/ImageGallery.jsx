/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-case-declarations */
import update from 'immutability-helper';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import Image from './Image';
import { GrGallery } from 'react-icons/gr';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from './Loader';
import { useImages } from '../context/ImageContext';
import { actionTypes } from '../state/actionTypes';

/**
 * ImageGallery Component
 * 
 * @component
 * 
 * Represents a gallery of images with drag-and-drop, upload, and delete functionalities.
 */
const ImageGallery = () => {
  // Accessing the image context for state management
  const { state, disPatch } = useImages();
  const { images, selectedImages, loading, error, refresh } = state;

  /**
   * Handles the upload of an image file.
   * 
   * @param {FileList} files - The selected image files.
   */
  const handleUploadImage = async (files) => {
    try {
      // Set refresh state to true before uploading
      disPatch({ type: actionTypes.IS_REFRESH, payload: true });

      // Create FormData and append the selected file
      const formData = new FormData();
      formData.append('image', files[0]);

      // Make the API request to upload the image
      const response = await axios.post(
        'https://api.imgbb.com/1/upload?key=199be7191b070f135985de4adcce0a6f',
        formData
      );

      // Check if the upload was successful
      if (response?.data?.data?.id) {
        const { id, display_url, title } = response?.data?.data;

        // Dispatch action to update images state with the uploaded image
        disPatch({
          type: actionTypes.UPLOAD_IMAGE,
          payload: {
            id,
            _id: id,
            url: display_url,
            alt: title,
          },
        });

        // Display success toast message
        toast.success('Image uploaded successfully!', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 8000,
        });
      } else {
        // Handle the error
        console.error('Error uploading image:', response.statusText);
      }
    } catch (error) {
      // Log error and display error toast message
      console.error('Error uploading image:', error);
      toast.error('Error uploading image', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 8000,
      });
    } finally {
      // Set refresh state to false after the upload or an error
      disPatch({ type: actionTypes.IS_REFRESH, payload: false });
    }
  };

  /**
   * Handles the deletion of selected images.
   */
  const handleDelete = () => {
    // Dispatch action to delete selected images
    disPatch({ type: actionTypes.DELETE_SELECTED_IMAGES });
  };

  /**
   * Finds an image by its ID.
   * 
   * @param {string} id - The unique identifier of the image.
   * @returns {Object} - An object containing the found image and its index.
   */
  const findImage = (id) => {
    const image = images.find((img) => `${img._id}` === id);
    return {
      image,
      index: images.indexOf(image),
    };
  };

  /**
   * Moves an image card within the gallery.
   * 
   * @param {string} id - The unique identifier of the image.
   * @param {number} atIndex - The index to move the image card to.
   */
  const moveImageCard = (id, atIndex) => {
    const { image, index } = findImage(id);

    // Dispatch action to update images state with the moved image
    const data = update(images, {
      $splice: [
        [index, 1],
        [atIndex, 0, image],
      ],
    });

    disPatch({
      type: actionTypes.SET_IMAGES,
      payload: data,
    });
  };

  /**
   * Generates text based on the number of selected images.
   * 
   * @returns {string} - The text indicating the number of selected images.
   */
  const getImageSelectText = () => {
    switch (selectedImages.length) {
      case 0:
        return '';
      case 1:
        return '1 file selected';
      default:
        return `${selectedImages.length} files selected`;
    }
  };

  // Content rendering based on loading and error states
  let content;

  if (loading) {
    content = (
      <div className="min-h-[60vh] flex justify-center items-start mt-4">
        <Loader />
      </div>
    );
  }

  if (error) {
    content = (
      <div className="min-h-[60vh] flex justify-center items-start mt-4">
        <h1 className="text-red-600">Something went wrong!</h1>
      </div>
    );
  }

  if (error && !loading) {
    content = (
      <div className="min-h-[60vh] flex justify-center items-start text-xl font-semibold mt-5">
        <h1 className="text-red-600">Something went wrong!</h1>
      </div>
    );
  }

  if (!loading && !error && images.length <= 0) {
    content = (
      <div className="min-h-[60vh] flex justify-center items-start text-xl font-semibold">
        <p>Nothing to show. Products are empty!</p>
      </div>
    );
  }

  if (!loading && !error && images.length > 0) {
    content = (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 py-4 px-6 rounded-b-md overflow-y-auto">
        {/* Display image cards */}
        {images.map((image, index) => (
          <Image
            key={image?._id}
            id={image?._id}
            url={image?.url}
            imageAlt={image?.alt}
            index={index}
            moveImageCard={moveImageCard}
            findImage={findImage}
          />
        ))}

        {/* Add Images button */}
        <label
          htmlFor="files"
          title="Upload Image"
          className={`w-full h-full flex flex-col justify-center items-center space-y-2 py-4 px-0.5 md:px-0 md:py-0 cursor-pointer border-2 border-gray-300 hover:border-gray-500 border-dashed rounded-md text-black hover:text-gray-600 transition-all ease-in duration-300`}
        >
          <span className="md:text-xl">
            <GrGallery />
          </span>
          <span className="text-xs md:text-base">Add Images</span>
          <input
            type="file"
            id="files"
            onChange={(e) => handleUploadImage(e.target.files)}
            className="hidden"
          />
        </label>
      </div>
    );
  }

  // Render the component with DndProvider for drag and drop functionality
  return (
    <DndProvider backend={HTML5Backend}>
      <section className="container bg-gray-100 mx-auto rounded-md p-4 shadow-lg">
        {/* Display selection and delete buttons when images are selected */}
        {selectedImages.length && images.length > 0 ? (
          <div className="flex justify-between items-center py-[.9rem] px-6 border rounded-md">
            <h3 className="text-lg font-medium">{getImageSelectText()}</h3>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white font-medium px-4 py-1.5 border border-red-500 hover:bg-white hover:border-red-500 hover:text-red-500 rounded-md transition-all duration-300 ease-in"
            >
              Delete {selectedImages.length > 1 ? 'files' : 'file'}
            </button>
          </div>
        ) : (
          // Display gallery title when no images are selected
          <h1 className="text-xl font-medium py-5 px-6 bg-white border-b shadow-md rounded-md">
            Gallery
          </h1>
        )}

        {/* Display loader or content based on refresh state */}
        {refresh ? (
          <div className="min-h-[60vh] flex justify-center items-start mt-4">
            <Loader />
          </div>
        ) : (
          <>
            {content}
          </>
        )}
      </section>
    </DndProvider>
  );
};

export default ImageGallery;