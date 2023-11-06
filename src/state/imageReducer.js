import { actionTypes } from "./actionTypes";

// Initial state for the reducer
export const initialState = {
  loading: false,
  error: false,
  refresh: false,
  images: [],
  selectedImages: [],
};

// Reducer function
export const imageReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.FETCHING_START:
      return {
        ...state,
        loading: true,
        error: false
      }
    case actionTypes.FETCHING_SUCCESS:
      return {
        ...state,
        loading: false,
        images: action.payload,
        error: false
      }
    case actionTypes.SELECT_IMAGE:
      // eslint-disable-next-line no-case-declarations
      const { index, isSelected } = action.payload;
      return {
        ...state,
        selectedImages: isSelected
          ? [...state.selectedImages, state.images[index]]
          : state.selectedImages.filter((image) => image !== state.images[index]),
      };
    case actionTypes.DELETE_SELECTED_IMAGES:
      return {
        ...state,
        images: state.images.filter((image) => !state.selectedImages.includes(image)),
        selectedImages: [],
      };
    case actionTypes.SET_IMAGES:
      // Update images state with the data received in the payload
      return { ...state, images: action.payload };
    case actionTypes.UPLOAD_IMAGE:
      // Handle image upload response
      return {
        ...state,
        images: [...state.images, action.payload],
      };
    case actionTypes.IS_REFRESH:
      return {
        ...state,
        refresh: action.payload
      }
    case actionTypes.FETCHING_ERROR:
      return {
        ...state,
        loading: false,
        error: true
      }
    default:
      return state;
  }
};