/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useReducer, } from 'react';
import { actionTypes } from '../state/actionTypes';
import { imageReducer, initialState } from '../state/imageReducer';


const IMAGE_CONTEXT = createContext();

const ImageProvider = ({ children }) => {
  const [state, disPatch] = useReducer(imageReducer, initialState)

  useEffect(() => {
    disPatch({ type: actionTypes.FETCHING_START })
    fetch('images.json')
      .then(res => res.json())
      .then(data =>
        disPatch({ type: actionTypes.FETCHING_SUCCESS, payload: data })
      )
      // eslint-disable-next-line no-unused-vars
      .catch(err => {
        disPatch({ type: actionTypes.FETCHING_ERROR })
      })
  }, []);


  const value = {
    state,
    disPatch
  }

  return (
    <IMAGE_CONTEXT.Provider value={value}>
      {children}
    </IMAGE_CONTEXT.Provider>
  );
};

export const useImages = () => {
  const context = useContext(IMAGE_CONTEXT);
  return context;
}

export default ImageProvider;