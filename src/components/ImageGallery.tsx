import { ChangeEvent } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from './Loader';
import { useImages } from '../context/ImageContext';
import { actionTypes } from '../state/actionTypes';
import { IImage } from '../types/globalTypes';
import RenderContent from './RenderContent';

const ImageGallery = () => {
  // Accessing the image context for state management
  const { state, disPatch } = useImages();
  const { images, selectedImages, loading, error, refresh } = state;

  /**
   * Handles the upload of an image file.
   * 
   * @param {ChangeEvent<HTMLInputElement>} e - The input change event containing the selected image files.
   */
  const handleUploadImage = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    try {
      // Set refresh state to true before uploading
      disPatch({ type: actionTypes.IS_REFRESH, payload: true });

      const files = e.target.files;
      if (files && files.length > 0) {
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
          toast.error('Error uploading image', {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 8000,
          });
        }
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
    toast.success(`${selectedImages?.length > 1 ? selectedImages?.length : " "} Image${selectedImages?.length > 1 ? "s" : " "} Deleted successfully!`, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 1500,
    });
  };

  /**
   * Finds an image by its ID.
   * 
   * @param {string} id - The unique identifier of the image.
   * @returns {Object} - An object containing the found image and its index.
   */
  const findImage = (id: string): { image: IImage; index: number } => {
    const image = images.find((img: IImage) => `${img._id}` === id);

    if (image) {
      return {
        image,
        index: images.indexOf(image),
      };
    } else {
      // Handle the case where the image is not found
      throw new Error(`Image with ID ${id} not found`);
    }
  };

  /**
   * Moves an image card within the gallery.
   * 
   * @param {string} id - The unique identifier of the image.
   * @param {number} atIndex - The index to move the image card to.
   */
  const moveImageCard = (id: string, atIndex: number) => {
    const { image, index } = findImage(id);
    // Create a new array with the moved image
    const newImages = [...images];
    newImages.splice(index, 1);
    newImages.splice(atIndex, 0, image);

    // Dispatch action to update images state with the moved image
    disPatch({
      type: actionTypes.SET_IMAGES,
      payload: newImages,
    });
  };

  /**
   * Gets the text indicating the number of selected images.
   * 
   * @returns {string} - The text indicating the number of selected images.
   */
  const getImageSelectText = (): string => {
    switch (selectedImages.length) {
      case 0:
        return '';
      case 1:
        return '1 file selected';
      default:
        return `${selectedImages.length} files selected`;
    }
  };

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
            {/* RenderContent component for displaying content based on loading and error states */}
            <RenderContent
              loading={loading}
              error={error}
              images={images}
              moveImageCard={moveImageCard}
              findImage={findImage}
              handleUploadImage={handleUploadImage}
            />
          </>
        )}
      </section>
    </DndProvider>
  );
};

export default ImageGallery;
