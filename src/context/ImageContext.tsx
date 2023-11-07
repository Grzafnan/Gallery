import { Dispatch, ReactNode, createContext, useContext, useEffect, useReducer, } from 'react';
import { actionTypes } from '../state/actionTypes';
import { IState, imageReducer, initialState } from '../state/imageReducer';

interface ImageContextProps {
  state: IState;
  disPatch: Dispatch<any>;
}

const IMAGE_CONTEXT = createContext<ImageContextProps | undefined>(undefined);

interface ImageProviderProps {
  children: ReactNode
}


const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
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
        console.log("err", err);
        disPatch({ type: actionTypes.FETCHING_ERROR })
      })
  }, []);


  const value: ImageContextProps = {
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
  if (!context) {
    throw new Error('useImages must be used within an ImageProvider');
  }

  return context;
}

export default ImageProvider;