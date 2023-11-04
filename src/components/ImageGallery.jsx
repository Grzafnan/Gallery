import { useReducer, useEffect } from 'react';
import update from 'immutability-helper';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import Image from './Image';
import { GrGallery } from 'react-icons/gr';

// Define actions
const IS_LOADING = 'IS_LOADING';
const SET_IMAGES = 'SET_IMAGES';
const SELECT_IMAGE = 'SELECT_IMAGE';
const DELETE_SELECTED_IMAGES = 'DELETE_SELECTED_IMAGES';

// Reducer function
const imageReducer = (state, action) => {
  switch (action.type) {
    case IS_LOADING:
      // Set loading state based on the action payload
      return { ...state, loading: action.payload };
    case SET_IMAGES:
      // Update images state with the data received in the payload
      return { ...state, images: action.payload };
    case SELECT_IMAGE:
      // Update selectedImages state based on the payload
      return { ...state, selectedImages: action.payload };
    case DELETE_SELECTED_IMAGES:
      // Remove selected images from the images state and clear selectedImages
      return {
        ...state,
        images: state.images.filter((image) => !state.selectedImages.includes(image)),
        selectedImages: [],
      };
    default:
      return state;
  }
};

const ImageGallery = () => {
  // Initial state for the reducer
  const initialState = {
    images: [],
    selectedImages: [],
    loading: false,
  };

  // Use reducer with the defined reducer function and initial state
  const [state, dispatch] = useReducer(imageReducer, initialState);

  // useEffect to fetch data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Set loading to true before fetching data
        dispatch({ type: IS_LOADING, payload: true });
        const result = await fetch('images.json');
        const data = await result.json();
        if (data?.length > 0) {
          // Update images state with fetched data
          dispatch({ type: SET_IMAGES, payload: data });
        }
      } catch (error) {
        // Log error and set loading to false in case of an error
        console.error('Error fetching images:', error);
      } finally {
        // Set loading to false after data is fetched or an error occurs
        dispatch({ type: IS_LOADING, payload: false });
      }
    };

    // Call the fetch data function
    fetchData();
  }, [dispatch]);

  // Function to handle deleting selected images
  const handleDelete = () => {
    // Dispatch the action to delete selected images
    dispatch({ type: DELETE_SELECTED_IMAGES });
  };

  // Function to handle image selection
  const handleImageSelect = (index, isSelected) => {
    const updatedSelectedImages = isSelected
      ? [...state.selectedImages, state.images[index]]
      : state.selectedImages.filter((image) => image !== state.images[index]);
    // Dispatch the action to update selected images
    dispatch({ type: SELECT_IMAGE, payload: updatedSelectedImages });
  };

  // Function to find an image by ID
  const findImage = (id) => {
    const image = state.images.find((img) => `${img._id}` === id);
    return {
      image,
      index: state.images.indexOf(image),
    };
  };

  // Function to move an image card
  const moveImageCard = (id, atIndex) => {
    const { image, index } = findImage(id);
    // Dispatch the action to update images state with the moved image
    dispatch({
      type: SET_IMAGES,
      payload: update(state.images, {
        $splice: [
          [index, 1],
          [atIndex, 0, image],
        ],
      }),
    });
  };

  // Function to get text based on the number of selected images
  const getImageSelectText = () => {
    switch (state.selectedImages.length) {
      case 0:
        return '';
      case 1:
        return '1 file selected';
      default:
        return `${state.selectedImages.length} files selected`;
    }
  };

  // Conditional rendering based on loading state
  if (state.loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl font-semibold">
        <div className="w-6 h-6 border-4 border-dashed rounded-full animate-spin dark:border-violet-600 mr-2"></div>
        Loading...
      </div>
    );
  }

  // Render the component with DndProvider for drag and drop functionality
  return (
    <DndProvider backend={HTML5Backend}>
      {!state.loading && state.images.length > 0 && (
        <section className="container bg-white mx-auto rounded-md">
          {state.selectedImages.length > 0 ? (
            // Display when there are selected images
            <div className="flex justify-between items-center py-[.9rem] px-6 border-b ">
              <h3 className="text-lg font-medium">{getImageSelectText()}</h3>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white font-medium px-4 py-1.5 border border-red-500 hover:bg-white hover:border-red-500 hover:text-red-500 rounded-md transition-all delay-75 ease-linear"
              >
                Delete {state.selectedImages.length > 1 ? 'files' : 'file'}
              </button>
            </div>
          ) : (
            // Display when there are no selected images
            <h1 className="text-xl font-medium py-5 px-6  border-b">Gallery</h1>
          )}
          {/* Image grid */}
          <div className="grid grid-cols-2 gap-4 py-4 px-6  md:grid-cols-4 lg:grid-cols-5 rounded-b-md overflow-auto">
            {state.images.map((image, index) => (
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
